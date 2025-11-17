const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { ensureChrome } = require("../utils/ensureChrome");

const currencySymbols = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "ر.س",
  TRY: "₺",
  EGP: "ج.م",
};

const sanitize = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

class SalaryReceiptService {
  static async generateSalaryReceipt({
    employee,
    salary,
    period,
    bonuses,
    preparedBy,
  }) {
    let browser;

    try {
      await ensureChrome();
      const launchOptions = {
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
        timeout: 180000,
      };

      try {
        browser = await puppeteer.launch(launchOptions);
      } catch (error) {
        browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      }

      const page = await browser.newPage();
      const html = this.getReceiptHtml({
        employee,
        salary,
        period,
        bonuses,
        preparedBy,
      });

      await page.setContent(html, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 90000,
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "1cm",
          bottom: "1.2cm",
          left: "1.2cm",
          right: "1.2cm",
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 10px; color: #0f172a; width: 100%; text-align: center;">
            Rahalatek Travel • Salary Receipt
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 9px; color: #64748b; width: 100%; text-align: center;">
            Page <span class="pageNumber"></span> of <span class="totalPages"></span>
          </div>
        `,
      });

      return pdf;
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          console.error("Failed to close puppeteer browser:", error);
        }
      }
    }
  }

  static getReceiptHtml({ employee, salary, period, bonuses, preparedBy }) {
    const monthLabel = new Date(period.year, period.month, 1).toLocaleString(
      "en-US",
      { month: "long", year: "numeric" }
    );
    const symbol = currencySymbols[salary.currency] || salary.currency || "";
    const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalCompensation = salary.amount + totalBonus;

    const logoPath = path.join(__dirname, "../../client/dist/Logolight.png");
    let logoBase64 = "";
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      }
    } catch (error) {
      console.error("Failed to load logo for salary receipt:", error);
    }

    const bonusRows =
      bonuses.length > 0
        ? bonuses
            .map(
              (bonus) => `
              <tr>
                <td>${sanitize(bonus.note || "Bonus")}</td>
                <td>${symbol}${bonus.amount.toFixed(2)}</td>
                <td>${formatDate(bonus.updatedAt || bonus.createdAt)}</td>
              </tr>
            `
            )
            .join("")
        : `
          <tr>
            <td colspan="3" style="text-align:center; color:#94a3b8; padding:12px 0;">
              No bonuses recorded for this period
            </td>
          </tr>
        `;

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Salary Receipt - ${sanitize(employee.name)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 24px;
        color: #0f172a;
        background: #ffffff;
      }
      .watermark {
        position: fixed;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.1;
        width: 400px;
        height: auto;
        pointer-events: none;
        z-index: -1;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .logo img {
        height: 48px;
      }
      .title {
        font-size: 28px;
        font-weight: 700;
      }
      .period-badge {
        padding: 8px 16px;
        background: #e0f2fe;
        color: #0369a1;
        border-radius: 999px;
        font-weight: 600;
        font-size: 14px;
      }
      .card {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 18px;
      }
      .card h3 {
        margin-top: 0;
        font-size: 16px;
        text-transform: uppercase;
        color: #475569;
        letter-spacing: 0.08em;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }
      .info-item {
        background: #f8fafc;
        border-radius: 12px;
        padding: 12px;
      }
      .info-label {
        font-size: 12px;
        text-transform: uppercase;
        color: #94a3b8;
        letter-spacing: 0.14em;
        margin-bottom: 4px;
      }
      .info-value {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
      }
      .contact-row {
        margin-top: 10px;
        padding: 10px 12px;
        background: #f8fafc;
        border-radius: 12px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }
      .contact-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: #94a3b8;
        font-weight: 600;
      }
      .contact-value {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        word-break: break-all;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      table thead {
        background: #0f172a;
        color: #fff;
      }
      table th, table td {
        padding: 12px;
        border: 1px solid #e2e8f0;
        text-align: left;
      }
      table tbody tr:nth-child(odd) {
        background: #f8fafc;
      }
      .total-card {
        text-align: right;
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
      }
      .footer {
        margin-top: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: #475569;
      }
      .signature {
        margin-top: 24px;
        padding-top: 16px;
      }
      .signature span {
        display: block;
      }
    </style>
  </head>
  <body>
    ${
      logoBase64
        ? `<img src="${logoBase64}" alt="Rahalatek Logo" class="watermark" />`
        : ""
    }
    <div class="header">
      <div class="logo">
        ${
          logoBase64
            ? `<img src="${logoBase64}" alt="Rahalatek Logo" />`
            : "<h2>Rahalatek Travel</h2>"
        }
      </div>
      <div class="title">Salary Receipt</div>
      <div class="period-badge">${monthLabel}</div>
    </div>

    <div class="card">
      <h3>Employee Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Employee</div>
          <div class="info-value">${sanitize(employee.name)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Role</div>
          <div class="info-value">${sanitize(employee.role || "Employee")}</div>
        </div>
      </div>
      <div class="contact-row">
        <span class="contact-label">Email</span>
        <span class="contact-value">${sanitize(employee.email || "N/A")}</span>
      </div>
    </div>

    <div class="card">
      <h3>Salary Summary</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Base Salary</div>
          <div class="info-value">${symbol}${salary.amount.toFixed(2)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Bonuses</div>
          <div class="info-value">${symbol}${totalBonus.toFixed(2)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Compensation</div>
          <div class="info-value">${symbol}${totalCompensation.toFixed(2)}</div>
        </div>
      </div>
      ${
        salary.notes
          ? `<p style="margin-top:12px; font-size:13px; color:#475569;"><strong>Notes:</strong> ${sanitize(
              salary.notes
            )}</p>`
          : ""
      }
    </div>

    <div class="card">
      <h3>Bonuses</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Awarded</th>
          </tr>
        </thead>
        <tbody>
          ${bonusRows}
        </tbody>
      </table>
    </div>

    <div class="card total-card">
      Total for ${monthLabel}: <span style="color:#16a34a">${symbol}${totalCompensation.toFixed(
      2
    )}</span>
    </div>

    <div class="footer">
      <div>
        Prepared by: <strong>${sanitize(preparedBy.name)}</strong><br/>
        ${sanitize(preparedBy.email || "")}
      </div>
      <div class="signature">
        <span>______________________________</span>
        <span>Authorized Signature</span>
      </div>
    </div>
  </body>
</html>
    `;
  }
}

module.exports = SalaryReceiptService;
