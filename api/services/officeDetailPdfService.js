const Voucher = require("../models/Voucher");
const OfficePayment = require("../models/OfficePayment");
const puppeteer = require("puppeteer");
const { ensureChrome } = require("../utils/ensureChrome");
const path = require("path");
const fs = require("fs");

class OfficeDetailPdfService {
  /**
   * Generate office detail summary data based on filters
   */
  static async generateOfficeDetailData(officeName, filters) {
    try {
      console.log(
        `📊 Generating office detail for ${officeName} with filters:`,
        filters
      );

      // Get all vouchers
      const allVouchers = await Voucher.find({
        $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
      })
        .populate("createdBy", "username")
        .lean();

      console.log(`📋 Total vouchers in DB: ${allVouchers.length}`);

      // Get all office payments for this office
      const allPayments = await OfficePayment.find({
        officeName: officeName,
      })
        .populate("createdBy", "username")
        .populate("relatedVoucher", "voucherNumber clientName")
        .populate("approvedBy", "username")
        .lean();

      console.log(`💳 Total payments for ${officeName}: ${allPayments.length}`);

      // Apply filters to vouchers
      const filteredVouchers = this.applyFilters(
        allVouchers,
        officeName,
        filters
      );

      console.log(`✅ Filtered vouchers: ${filteredVouchers.length}`);

      // Separate service vouchers and client vouchers
      const { serviceVouchers, clientVouchers } = this.categorizeVouchers(
        filteredVouchers,
        officeName
      );

      console.log(
        `📊 Service vouchers: ${serviceVouchers.length}, Client vouchers: ${clientVouchers.length}`
      );

      // Calculate service breakdown
      const serviceBreakdown = this.calculateServiceBreakdown(
        serviceVouchers,
        officeName,
        allPayments
      );

      // Calculate client payments
      const { tableRows: clientPayments, summaries: clientPaymentSummaries } =
        this.calculateClientPayments(clientVouchers, allPayments);

      // Calculate totals by currency
      const totalsByCurrency = this.calculateTotalsByCurrency(
        serviceBreakdown,
        clientPaymentSummaries
      );

      return {
        officeName,
        filters,
        serviceBreakdown,
        clientPayments,
        totalsByCurrency,
        serviceVouchersCount: serviceVouchers.length,
        clientVouchersCount: clientVouchers.length,
        totalVouchersCount: serviceVouchers.length + clientVouchers.length,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("❌ Error generating office detail data:", error);
      throw error;
    }
  }

  /**
   * Apply filters to vouchers
   */
  static applyFilters(vouchers, officeName, filters) {
    return vouchers.filter((voucher) => {
      const voucherDate = new Date(voucher.createdAt);
      const voucherMonth = voucherDate.getMonth() + 1;
      const voucherYear = voucherDate.getFullYear();

      // Currency filter
      if (
        filters.currency &&
        filters.currency !== "ALL" &&
        voucher.currency !== filters.currency
      ) {
        return false;
      }

      // Year filter - check both createdAt and arrivalDate
      if (filters.year) {
        const arrivalYear = voucher.arrivalDate
          ? new Date(voucher.arrivalDate).getFullYear()
          : null;
        const matchesYear =
          voucherYear.toString() === filters.year ||
          (arrivalYear && arrivalYear.toString() === filters.year);
        if (!matchesYear) return false;
      }

      // Month filter
      if (
        filters.month &&
        Array.isArray(filters.month) &&
        filters.month.length > 0 &&
        !filters.month.includes("")
      ) {
        if (!filters.month.includes(voucherMonth.toString())) return false;
      }

      // Arrival month filter - only apply if it has actual values (not just empty string)
      if (
        filters.arrivalMonth &&
        Array.isArray(filters.arrivalMonth) &&
        filters.arrivalMonth.length > 0 &&
        !filters.arrivalMonth.includes("")
      ) {
        if (voucher.arrivalDate) {
          const arrivalDate = new Date(voucher.arrivalDate);
          const arrivalMonth = arrivalDate.getMonth() + 1;
          if (!filters.arrivalMonth.includes(arrivalMonth.toString()))
            return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Categorize vouchers into service and client vouchers
   */
  static categorizeVouchers(vouchers, officeName) {
    const serviceVouchers = [];
    const clientVouchers = [];

    console.log(
      `🔍 Categorizing ${vouchers.length} vouchers for office: ${officeName}`
    );

    vouchers.forEach((voucher) => {
      // Check if this office provided services
      const hasService = this.checkIfOfficeProvidedService(voucher, officeName);
      if (hasService) {
        serviceVouchers.push(voucher);
      }

      // Check if this is a client voucher
      if (voucher.officeName === officeName) {
        clientVouchers.push(voucher);
      }
    });

    console.log(
      `✅ Categorization complete: ${serviceVouchers.length} service, ${clientVouchers.length} client`
    );

    return { serviceVouchers, clientVouchers };
  }

  /**
   * Check if office provided any service in voucher
   */
  static checkIfOfficeProvidedService(voucher, officeName) {
    const hasHotel = voucher.hotels?.some((h) => h.officeName === officeName);
    const hasTransfer = voucher.transfers?.some(
      (t) => t.officeName === officeName
    );
    const hasFlight = voucher.flights?.some((f) => f.officeName === officeName);

    let hasTrip = false;
    if (voucher.trips && Array.isArray(voucher.trips)) {
      hasTrip = voucher.trips.some(
        (trip) =>
          trip && typeof trip === "object" && trip.officeName === officeName
      );
    }
    if (!hasTrip) {
      hasTrip = voucher.payments?.trips?.officeName === officeName;
    }

    const result = hasHotel || hasTransfer || hasTrip || hasFlight;

    // Debug: Log office name matches
    if (result || voucher.officeName === officeName) {
      console.log(
        `🎯 Voucher #${voucher.voucherNumber}: service=${result}, client=${
          voucher.officeName === officeName
        }, voucherOffice="${voucher.officeName}"`
      );
    }

    return result;
  }

  /**
   * Calculate service payments for a voucher
   */
  static calculateServicePayments(voucher, officeName) {
    const services = { hotels: 0, transfers: 0, trips: 0, flights: 0 };

    // Hotels
    if (voucher.hotels) {
      voucher.hotels.forEach((hotel) => {
        if (hotel.officeName === officeName) {
          services.hotels += parseFloat(hotel.price) || 0;
        }
      });
    }

    // Transfers
    if (voucher.transfers) {
      voucher.transfers.forEach((transfer) => {
        if (transfer.officeName === officeName) {
          services.transfers += parseFloat(transfer.price) || 0;
        }
      });
    }

    // Trips
    let tripsTotal = 0;
    if (voucher.trips && Array.isArray(voucher.trips)) {
      voucher.trips.forEach((trip) => {
        if (
          trip &&
          typeof trip === "object" &&
          trip.officeName === officeName &&
          trip.price
        ) {
          tripsTotal += parseFloat(trip.price) || 0;
        }
      });
    } else if (voucher.payments?.trips?.officeName === officeName) {
      tripsTotal = parseFloat(voucher.payments.trips.price) || 0;
    }
    services.trips = tripsTotal;

    // Flights
    if (voucher.flights) {
      voucher.flights.forEach((flight) => {
        if (flight.officeName === officeName) {
          services.flights += parseFloat(flight.price) || 0;
        }
      });
    }

    services.total =
      services.hotels + services.transfers + services.trips + services.flights;
    return services;
  }

  /**
   * Calculate service breakdown with payments
   */
  static calculateServiceBreakdown(serviceVouchers, officeName, allPayments) {
    const breakdown = [];

    serviceVouchers.forEach((voucher) => {
      const services = this.calculateServicePayments(voucher, officeName);

      // Get payments for this voucher
      const voucherPayments = allPayments.filter(
        (p) =>
          p.relatedVoucher &&
          p.relatedVoucher._id.toString() === voucher._id.toString() &&
          p.status === "approved"
      );

      // Calculate remaining
      const outgoingTotal = voucherPayments
        .filter((p) => p.type === "OUTGOING")
        .reduce((sum, p) => sum + p.amount, 0);

      const incomingTotal = voucherPayments
        .filter((p) => p.type === "INCOMING")
        .reduce((sum, p) => sum + p.amount, 0);

      const remaining = services.total - outgoingTotal + incomingTotal;

      breakdown.push({
        voucherNumber: voucher.voucherNumber,
        clientName: voucher.clientName,
        createdAt: voucher.createdAt,
        arrivalDate: voucher.arrivalDate,
        currency: voucher.currency || "USD",
        hotels: services.hotels,
        transfers: services.transfers,
        trips: services.trips,
        flights: services.flights,
        total: services.total,
        paid: outgoingTotal - incomingTotal,
        remaining: remaining,
      });
    });

    // Sort by voucher number descending (newest first) to match web page order
    breakdown.sort((a, b) => b.voucherNumber - a.voucherNumber);

    return breakdown;
  }

  /**
   * Calculate client payments with payment tracking
   */
  static calculateClientPayments(clientVouchers, allPayments) {
    const tableRows = [];
    const summaries = [];

    clientVouchers.forEach((voucher) => {
      // Get payments for this voucher
      const voucherPayments = allPayments.filter(
        (p) =>
          p.relatedVoucher &&
          p.relatedVoucher._id.toString() === voucher._id.toString() &&
          p.status === "approved"
      );

      const incomingTotal = voucherPayments
        .filter((p) => p.type === "INCOMING")
        .reduce((sum, p) => sum + p.amount, 0);

      const outgoingTotal = voucherPayments
        .filter((p) => p.type === "OUTGOING")
        .reduce((sum, p) => sum + p.amount, 0);

      const remaining = voucher.totalAmount - incomingTotal + outgoingTotal;

      summaries.push({
        voucherNumber: voucher.voucherNumber,
        currency: voucher.currency || "USD",
        totalAmount: voucher.totalAmount,
        remaining,
      });

      const sortedPayments = [...voucherPayments].sort((a, b) => {
        const dateA = new Date(
          a.paymentDate || a.approvedAt || a.createdAt
        ).getTime();
        const dateB = new Date(
          b.paymentDate || b.approvedAt || b.createdAt
        ).getTime();
        return dateA - dateB;
      });

      let runningRemaining = voucher.totalAmount;

      if (sortedPayments.length === 0) {
        tableRows.push({
          voucherNumber: voucher.voucherNumber,
          clientName: voucher.clientName,
          createdAt: voucher.createdAt,
          arrivalDate: voucher.arrivalDate,
          currency: voucher.currency || "USD",
          totalAmount: voucher.totalAmount,
          paymentAmount: 0,
          paymentDate: null,
          remaining: runningRemaining,
        });
      } else {
        sortedPayments.forEach((payment) => {
          const paymentValue =
            payment.type === "INCOMING" ? payment.amount : -payment.amount;

          runningRemaining -= paymentValue;

          tableRows.push({
            voucherNumber: voucher.voucherNumber,
            clientName: voucher.clientName,
            createdAt: voucher.createdAt,
            arrivalDate: voucher.arrivalDate,
            currency: voucher.currency || "USD",
            totalAmount: voucher.totalAmount,
            paymentAmount: paymentValue,
            paymentDate:
              payment.paymentDate || payment.approvedAt || payment.createdAt,
            remaining: runningRemaining,
          });
        });
      }
    });

    // Sort rows by voucher (desc) then payment date (asc – first payment on top)
    tableRows.sort((a, b) => {
      if (a.voucherNumber === b.voucherNumber) {
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return dateA - dateB;
      }
      return b.voucherNumber - a.voucherNumber;
    });

    return { tableRows, summaries };
  }

  /**
   * Calculate totals by currency
   */
  static calculateTotalsByCurrency(serviceBreakdown, clientPayments) {
    const totals = {};

    // Service totals
    serviceBreakdown.forEach((item) => {
      if (!totals[item.currency]) {
        totals[item.currency] = {
          serviceTotal: 0,
          serviceRemaining: 0,
          clientTotal: 0,
          clientRemaining: 0,
        };
      }
      totals[item.currency].serviceTotal += item.total;
      totals[item.currency].serviceRemaining += item.remaining;
    });

    // Client totals
    clientPayments.forEach((item) => {
      if (!totals[item.currency]) {
        totals[item.currency] = {
          serviceTotal: 0,
          serviceRemaining: 0,
          clientTotal: 0,
          clientRemaining: 0,
        };
      }
      totals[item.currency].clientTotal += item.totalAmount;
      totals[item.currency].clientRemaining += item.remaining;
    });

    return totals;
  }

  /**
   * Generate Office Detail PDF
   */
  static async generateOfficeDetailPDF(officeData, user) {
    let browser;
    try {
      console.log("🖨️ Starting PDF generation for office detail...");

      // Ensure Chrome is installed
      await ensureChrome();

      // Launch browser with production-ready options
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
        console.log("✅ Puppeteer browser launched successfully");
      } catch (launchError) {
        console.error(
          "❌ Primary launch failed, trying fallback:",
          launchError.message
        );
        browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      }

      const page = await browser.newPage();

      // Generate HTML content
      const htmlContent = this.getOfficeDetailHtmlTemplate(officeData, user);

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 90000,
      });

      // Generate PDF
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: "1cm",
          bottom: "1cm",
          left: "1cm",
          right: "1cm",
        },
        displayHeaderFooter: true,
        headerTemplate: `<div></div>`,
        footerTemplate: `
                    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0; padding: 0;">
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </div>
                `,
        timeout: 90000,
      });

      console.log("✅ PDF generated successfully");
      return pdf;
    } catch (error) {
      console.error("❌ Error generating office detail PDF:", error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error("Error closing browser:", closeError);
        }
      }
    }
  }

  /**
   * Get HTML template for office detail PDF
   */
  static getOfficeDetailHtmlTemplate(officeData, user) {
    const {
      officeName,
      filters,
      serviceBreakdown,
      clientPayments,
      totalsByCurrency,
      generatedAt,
    } = officeData;

    const currencySymbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
      SAR: "ر.س",
      TRY: "₺",
      EGP: "ج.م",
    };

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-GB");
    };

    const formatCurrency = (amount, currency) => {
      const symbol = currencySymbols[currency] || currency;
      const value = Math.abs(amount).toFixed(2);
      return amount < 0 ? `-${symbol}${value}` : `${symbol}${value}`;
    };

    // Sort currencies with USD first, EUR second, then alphabetically
    const sortCurrencies = (currencies) => {
      return currencies.sort((a, b) => {
        if (a === "USD") return -1;
        if (b === "USD") return 1;
        if (a === "EUR") return -1;
        if (b === "EUR") return 1;
        return a.localeCompare(b);
      });
    };

    // Load and convert logo to base64
    let logoBase64 = "";
    try {
      const logoPath = path.join(__dirname, "../../client/dist/Logolight.png");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      }
    } catch (err) {
      console.error("Error loading logo:", err);
      // Logo will be skipped if can't load
    }

    // Build filter chips
    const filterChips = [];
    if (filters.year) {
      filterChips.push({ label: "Year", value: filters.year });
    }
    if (
      filters.month &&
      filters.month.length > 0 &&
      !filters.month.includes("")
    ) {
      const monthNames = filters.month.map((m) =>
        new Date(2024, parseInt(m) - 1).toLocaleString("en", { month: "short" })
      );
      filterChips.push({ label: "Months", value: monthNames.join(", ") });
    }
    // Only show arrival month filter if it has actual month values (not empty string)
    if (
      filters.arrivalMonth &&
      filters.arrivalMonth.length > 0 &&
      !filters.arrivalMonth.includes("")
    ) {
      const arrivalMonthNames = filters.arrivalMonth.map((m) =>
        new Date(2024, parseInt(m) - 1).toLocaleString("en", { month: "short" })
      );
      filterChips.push({
        label: "Arrival",
        value: arrivalMonthNames.join(", "),
      });
    }
    if (filters.currency && filters.currency !== "ALL") {
      filterChips.push({ label: "Currency", value: filters.currency });
    }

    // Group service breakdown by currency
    const servicesByCurrency = {};
    serviceBreakdown.forEach((item) => {
      if (!servicesByCurrency[item.currency]) {
        servicesByCurrency[item.currency] = [];
      }
      servicesByCurrency[item.currency].push(item);
    });

    // Group client payments by currency
    const clientsByCurrency = {};
    clientPayments.forEach((item) => {
      if (!clientsByCurrency[item.currency]) {
        clientsByCurrency[item.currency] = [];
      }
      clientsByCurrency[item.currency].push(item);
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Office Detail Report - ${officeName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 20px;
            color: #111827;
            font-size: 11px;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 3px solid #1e3a8a;
        }
        .header-left {
            flex: 1;
        }
        .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 4px;
        }
        .header-right {
            text-align: right;
        }
        .office-name {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }
        .generated-info {
            color: #6b7280;
            font-size: 11px;
            margin-top: 4px;
        }
        .logo-img {
            max-width: 120px;
            height: auto;
            margin-left: 16px;
        }
        .filters { 
            background: #f3f4f6; 
            padding: 12px; 
            border-radius: 8px; 
            margin-bottom: 20px;
            font-size: 10px;
        }
        .filters strong { color: #111827; }
        .filter-info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 11px;
            color: #111827;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 20px 0 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .currency-group {
            margin-bottom: 24px;
        }
        .currency-header {
            background: #f59e0b;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 10px;
        }
        th, td {
            padding: 8px 6px;
            text-align: left;
            border: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 10px;
        }
        td {
            color: #1f2937;
        }
        tr:nth-child(even) {
            background: #fafafa;
        }
        .number { text-align: right; font-family: 'Courier New', monospace; }
        .total-row {
            font-weight: bold;
            background: #fef3c7 !important;
            color: #92400e;
        }
        .summary-cards {
            display: flex;
            justify-content: space-around;
            gap: 12px;
            margin-bottom: 20px;
        }
        .summary-card {
            flex: 1;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
        }
        .summary-card-label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .summary-card-value {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
        }
        .summary-card-value.text {
            font-size: 12px;
        }
        .summary-card.highlight {
            background: #eff6ff;
            border-color: #1e3a8a;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
        }
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 12px;
        }
        .summary-box {
            background: transparent;
            border: 2px solid #1e3a8a;
            border-left: 5px solid #1e3a8a;
            padding: 16px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .summary-box h3 {
            color: #1e3a8a;
            font-size: 14px;
            margin-bottom: 12px;
            font-weight: bold;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .summary-item:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 13px;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 2px solid #1e3a8a;
        }
        .positive { color: #16a34a; }
        .negative { color: #dc2626; }
        .footer {
            margin-top: 30px;
            padding-top: 16px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            z-index: -1;
            width: 400px;
            height: auto;
            pointer-events: none;
        }
        @media print {
            body { padding: 10px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    ${
      logoBase64
        ? `<img src="${logoBase64}" class="watermark" alt="Watermark" />`
        : ""
    }
    
    <div class="header">
        <div class="header-left">
            <div class="brand-name">Rahalatek Travel</div>
            <div class="report-title">Office Report · ${officeName}</div>
        </div>
        ${
          logoBase64
            ? `<img src="${logoBase64}" class="logo-img" alt="Rahalatek Logo" />`
            : ""
        }
    </div>
    
    ${
      filterChips.length > 0
        ? `
    <div class="filter-info">
        ${filterChips
          .map((chip) => `<strong>${chip.label}:</strong> ${chip.value}`)
          .join(" • ")}
    </div>
    `
        : ""
    }
    
    <!-- Summary Cards -->
    <div class="summary-cards">
        <div class="summary-card highlight">
            <div class="summary-card-label">Total Vouchers</div>
            <div class="summary-card-value">${
              officeData.totalVouchersCount
            }</div>
        </div>
        <div class="summary-card">
            <div class="summary-card-label">Service Vouchers</div>
            <div class="summary-card-value">${
              officeData.serviceVouchersCount
            }</div>
        </div>
        <div class="summary-card">
            <div class="summary-card-label">Client Vouchers</div>
            <div class="summary-card-value">${
              officeData.clientVouchersCount
            }</div>
        </div>
        ${
          Object.keys(totalsByCurrency).length > 0
            ? `
        <div class="summary-card">
            <div class="summary-card-label">Currencies</div>
            <div class="summary-card-value text">${sortCurrencies(
              Object.keys(totalsByCurrency)
            ).join(", ")}</div>
        </div>
        `
            : ""
        }
    </div>
    
    ${
      Object.keys(servicesByCurrency).length > 0
        ? `
    <div class="section-title">Service Breakdown</div>
    ${sortCurrencies(Object.keys(servicesByCurrency))
      .map(
        (currency) => `
        <div class="currency-group">
            <div class="currency-header">${currency} (${
          currencySymbols[currency]
        })</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Voucher #</th>
                        <th style="width: 180px;">Client</th>
                        <th style="width: 75px;">Date</th>
                        <th style="width: 75px;">Arrival</th>
                        <th style="width: 65px;" class="number">Hotels</th>
                        <th style="width: 65px;" class="number">Transfers</th>
                        <th style="width: 65px;" class="number">Trips</th>
                        <th style="width: 65px;" class="number">Flights</th>
                        <th style="width: 75px;" class="number">Total</th>
                        <th style="width: 75px;" class="number">Remaining</th>
                    </tr>
                </thead>
                <tbody>
                    ${servicesByCurrency[currency]
                      .map(
                        (item) => `
                        <tr>
                            <td>#${item.voucherNumber}</td>
                            <td>${item.clientName}</td>
                            <td>${formatDate(item.createdAt)}</td>
                            <td>${formatDate(item.arrivalDate)}</td>
                            <td class="number">${formatCurrency(
                              item.hotels,
                              currency
                            )}</td>
                            <td class="number">${formatCurrency(
                              item.transfers,
                              currency
                            )}</td>
                            <td class="number">${formatCurrency(
                              item.trips,
                              currency
                            )}</td>
                            <td class="number">${formatCurrency(
                              item.flights,
                              currency
                            )}</td>
                            <td class="number"><strong>${formatCurrency(
                              item.total,
                              currency
                            )}</strong></td>
                            <td class="number ${
                              item.remaining > 0 ? "negative" : "positive"
                            }">
                                <strong>${formatCurrency(
                                  item.remaining,
                                  currency
                                )}</strong>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                    <tr class="total-row">
                        <td colspan="8" style="text-align: right;">TOTAL:</td>
                        <td class="number">${formatCurrency(
                          servicesByCurrency[currency].reduce(
                            (sum, item) => sum + item.total,
                            0
                          ),
                          currency
                        )}</td>
                        <td class="number ${
                          servicesByCurrency[currency].reduce(
                            (sum, item) => sum + item.remaining,
                            0
                          ) > 0
                            ? "negative"
                            : "positive"
                        }">${formatCurrency(
          servicesByCurrency[currency].reduce(
            (sum, item) => sum + item.remaining,
            0
          ),
          currency
        )}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
      )
      .join("")}
    `
        : ""
    }
    
    ${
      Object.keys(clientsByCurrency).length > 0
        ? `
    <div class="section-title ${
      Object.keys(servicesByCurrency).length > 0 ? "page-break" : ""
    }">
        Client Payments
    </div>
    ${sortCurrencies(Object.keys(clientsByCurrency))
      .map((currency) => {
        const currencyTotals = totalsByCurrency[currency] || {
          clientTotal: 0,
          clientRemaining: 0,
        };
        const totalPaid =
          currencyTotals.clientTotal - currencyTotals.clientRemaining;
        return `
        <div class="currency-group">
            <div class="currency-header">${currency} (${
          currencySymbols[currency]
        })</div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 70px;">Voucher #</th>
                        <th style="width: 180px;">Client</th>
                        <th style="width: 75px;">Date</th>
                        <th style="width: 75px;">Arrival</th>
                        <th style="width: 110px;">Total Amount</th>
                        <th style="width: 90px;" class="number">Payment Date</th>
                        <th style="width: 90px;">Paid</th>
                        <th style="width: 90px;">Remaining</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientsByCurrency[currency]
                      .map(
                        (item) => `
                        <tr>
                            <td>#${item.voucherNumber}</td>
                            <td>${item.clientName}</td>
                            <td>${formatDate(item.createdAt)}</td>
                            <td>${formatDate(item.arrivalDate)}</td>
                            <td class="number">${formatCurrency(
                              item.totalAmount,
                              currency
                            )}</td>
                            <td class="number">${
                              item.paymentDate
                                ? formatDate(item.paymentDate)
                                : "—"
                            }</td>
                            <td class="number ${
                              item.paymentAmount >= 0 ? "positive" : "negative"
                            }">
                                ${formatCurrency(item.paymentAmount, currency)}
                            </td>
                            <td class="number ${
                              item.remaining > 0 ? "negative" : "positive"
                            }">
                                <strong>${formatCurrency(
                                  item.remaining,
                                  currency
                                )}</strong>
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                    <tr class="total-row">
                        <td colspan="5" style="text-align: right;">TOTAL:</td>
                        <td class="number">${formatCurrency(
                          currencyTotals.clientTotal,
                          currency
                        )}</td>
                        <td class="number ${
                          totalPaid >= 0 ? "positive" : "negative"
                        }">
                            ${formatCurrency(totalPaid, currency)}
                        </td>
                        <td class="number ${
                          currencyTotals.clientRemaining > 0
                            ? "negative"
                            : "positive"
                        }">
                            ${formatCurrency(
                              currencyTotals.clientRemaining,
                              currency
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
      })
      .join("")}
    `
        : ""
    }
    
    ${
      Object.keys(servicesByCurrency).length === 0 &&
      Object.keys(clientsByCurrency).length === 0
        ? `
    <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3 style="color: #374151; margin-bottom: 8px;">No Financial Activity</h3>
        <p>No vouchers found matching the selected filters for this office.</p>
    </div>
    `
        : ""
    }
    
    ${
      Object.keys(totalsByCurrency).length > 0
        ? `
    <div class="summary-box">
        <h3>Financial Summary by Currency</h3>
        ${sortCurrencies(Object.keys(totalsByCurrency))
          .map(
            (currency) => `
            <div style="margin-bottom: 16px;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 8px; color: #1e3a8a;">
                    ${currency} (${currencySymbols[currency]})
                </div>
                ${
                  totalsByCurrency[currency].serviceTotal > 0
                    ? `
                <div class="summary-item">
                    <span>Services Provided to Rahalatek:</span>
                    <span class="negative">${formatCurrency(
                      totalsByCurrency[currency].serviceTotal,
                      currency
                    )}</span>
                </div>
                <div class="summary-item">
                    <span>Services Remaining Balance:</span>
                    <span class="${
                      totalsByCurrency[currency].serviceRemaining > 0
                        ? "negative"
                        : "positive"
                    }">
                        ${formatCurrency(
                          totalsByCurrency[currency].serviceRemaining,
                          currency
                        )}
                    </span>
                </div>
                `
                    : ""
                }
                ${
                  totalsByCurrency[currency].clientTotal > 0
                    ? `
                <div class="summary-item">
                    <span>Client Bookings Total:</span>
                    <span class="positive">${formatCurrency(
                      totalsByCurrency[currency].clientTotal,
                      currency
                    )}</span>
                </div>
                <div class="summary-item">
                    <span>Client Remaining Balance:</span>
                    <span class="${
                      totalsByCurrency[currency].clientRemaining > 0
                        ? "negative"
                        : "positive"
                    }">
                        ${formatCurrency(
                          totalsByCurrency[currency].clientRemaining,
                          currency
                        )}
                    </span>
                </div>
                `
                    : ""
                }
                <div class="summary-item">
                    <span>Net Position:</span>
                    <span class="${
                      totalsByCurrency[currency].clientRemaining -
                        totalsByCurrency[currency].serviceRemaining >
                      0
                        ? "positive"
                        : "negative"
                    }">
                        ${formatCurrency(
                          totalsByCurrency[currency].clientRemaining -
                            totalsByCurrency[currency].serviceRemaining,
                          currency
                        )}
                    </span>
                </div>
            </div>
        `
          )
          .join("")}
    </div>
    `
        : ""
    }
    
    <div class="footer">
        <p>This report was generated by Rahalatek Travel</p>
        <p>Report generated on ${new Date(generatedAt).toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })}</p>
    </div>
</body>
</html>
        `;

    return html;
  }
}

module.exports = OfficeDetailPdfService;
