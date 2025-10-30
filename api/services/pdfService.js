const puppeteer = require('puppeteer');
const EmailService = require('./emailService');
const fs = require('fs');
const path = require('path');
const { ensureChrome } = require('../utils/ensureChrome');

class PDFService {
    
    /**
     * Get the best Chrome executable path for current platform
     */
    static findChromeExecutable() {
        const platform = process.platform;
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Priority list of Chrome executable paths
        const chromePaths = [
            // Environment variable override
            process.env.CHROME_BIN,
            process.env.PUPPETEER_EXECUTABLE_PATH,
            
            // Render-specific paths (highest priority)
            '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome',
            '/opt/render/.cache/puppeteer/chrome/linux-130.0.6723.58/chrome-linux64/chrome',
            '/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.82/chrome-linux64/chrome',
            
            // Puppeteer cache locations
            path.join(process.env.HOME || process.cwd(), '.cache', 'puppeteer', 'chrome'),
            path.join('/opt/render/.cache/puppeteer', 'chrome'),
            path.join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium'),
            
            // Linux system paths
            ...(platform === 'linux' ? [
                '/usr/bin/google-chrome-stable',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium',
                '/opt/google/chrome/chrome',
                '/snap/bin/chromium'
            ] : []),
            
            // macOS paths  
            ...(platform === 'darwin' ? [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Chromium.app/Contents/MacOS/Chromium'
            ] : []),
            
            // Windows paths
            ...(platform === 'win32' ? [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ] : [])
        ].filter(Boolean); // Remove null/undefined values
        
        // Find the first existing executable
        for (const chromePath of chromePaths) {
            try {
                // Handle wildcard paths for Render
                if (chromePath.includes('linux-*')) {
                    const basePath = '/opt/render/.cache/puppeteer/chrome';
                    if (fs.existsSync(basePath)) {
                        const versions = fs.readdirSync(basePath);
                        for (const version of versions) {
                            if (version.startsWith('linux-')) {
                                const chromeLinuxPath = path.join(basePath, version);
                                if (fs.existsSync(chromeLinuxPath)) {
                                    const chromeSubdirs = fs.readdirSync(chromeLinuxPath);
                                    for (const subdir of chromeSubdirs) {
                                        if (subdir.startsWith('chrome-linux')) {
                                            const chromeBinary = path.join(chromeLinuxPath, subdir, 'chrome');
                                            if (fs.existsSync(chromeBinary)) {
                                                console.log(`✅ Found Chrome at: ${chromeBinary}`);
                                                return chromeBinary;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if (fs.existsSync(chromePath)) {
                    console.log(`✅ Found Chrome at: ${chromePath}`);
                    return chromePath;
                }
            } catch (err) {
                // Continue checking
            }
        }
        
        console.log('⚠️  No Chrome executable found, using Puppeteer default');
        return null;
    }
    
    /**
     * Get universal launch options for all platforms
     */
    static getLaunchOptions() {
        const isProduction = process.env.NODE_ENV === 'production';
        const platform = process.platform;
        
        // Base options that work everywhere
        const baseOptions = {
            headless: 'new', // Use new headless mode
            timeout: 120000,
            devtools: false,
            defaultViewport: { width: 1280, height: 800 }
        };
        
        // Universal args that work on all platforms
        const universalArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ];
        
        // Production-specific args
        const productionArgs = isProduction ? [
            '--single-process',
            '--no-zygote',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor,TranslateUI',
            '--memory-pressure-off',
            '--max-old-space-size=4096'
        ] : [];
        
        const launchOptions = {
            ...baseOptions,
            args: [...universalArgs, ...productionArgs]
        };
        
        // Set executable path if found
        const chromePath = this.findChromeExecutable();
        if (chromePath) {
            launchOptions.executablePath = chromePath;
        }
        
        return launchOptions;
    }
    
    /**
     * Generate PDF from monthly financial summary data
     */
    static async generateFinancialSummaryPDF(summaryData, user) {
        let browser;
        try {
            console.log('🖨️ Starting PDF generation for financial summary...');
            console.log('Environment:', process.env.NODE_ENV || 'development');
            console.log('Platform:', process.platform);
            
            // Ensure Chrome is installed (fallback safety check)
            await ensureChrome();
            
            // Get universal launch options
            const launchOptions = this.getLaunchOptions();
            console.log('Launching Puppeteer with options:', {
                ...launchOptions,
                executablePath: launchOptions.executablePath ? '✅ Custom path' : '⚙️ Default'
            });
            
            // Launch browser with retry logic
            try {
                browser = await puppeteer.launch(launchOptions);
                console.log('✅ Puppeteer browser launched successfully');
            } catch (launchError) {
                console.error('❌ Primary launch failed:', launchError.message);
                
                // Fallback: minimal configuration
                console.log('🔄 Attempting minimal fallback configuration...');
                const fallbackOptions = {
                    headless: 'new',
                    timeout: 180000,
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                };
                
                browser = await puppeteer.launch(fallbackOptions);
                console.log('✅ Fallback configuration successful');
            }
            
            const page = await browser.newPage();
            
            // Modern browser configuration
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9'
            });
            
            // Get the HTML content from EmailService
            console.log('📧 Getting HTML template from EmailService...');
            let htmlContent;
            try {
                htmlContent = EmailService.getMonthlyFinancialSummaryTemplate(user, summaryData);
                console.log('✅ HTML template retrieved, length:', htmlContent?.length || 0);
            } catch (templateError) {
                console.error('❌ Error getting HTML template:', templateError);
                throw new Error(`Failed to generate HTML template: ${templateError.message}`);
            }
            
            // Enhance HTML for PDF (add print styles and better formatting)
            console.log('🎨 Enhancing HTML for PDF...');
            let pdfHtml;
            try {
                pdfHtml = this.enhanceHtmlForPDF(htmlContent, summaryData);
                console.log('✅ HTML enhanced for PDF');
            } catch (enhanceError) {
                console.error('❌ Error enhancing HTML:', enhanceError);
                throw new Error(`Failed to enhance HTML for PDF: ${enhanceError.message}`);
            }
            
            // Set content with modern options
            console.log('📄 Setting page content...');
            try {
                await page.setContent(pdfHtml, { 
                    waitUntil: ['domcontentloaded', 'networkidle2'],
                    timeout: 90000 
                });
                
                // Wait for fonts and images to load
                await page.evaluate(() => {
                    return Promise.all([
                        document.fonts.ready,
                        ...Array.from(document.images).map(img => {
                            if (img.complete) return Promise.resolve();
                            return new Promise(resolve => {
                                img.onload = img.onerror = resolve;
                            });
                        })
                    ]);
                });
                
                console.log('✅ Page content and resources loaded successfully');
            } catch (contentError) {
                console.error('❌ Error setting page content:', contentError);
                throw new Error(`Failed to set page content: ${contentError.message}`);
            }
            
            // Generate PDF with modern options
            console.log('🖨️ Generating PDF...');
            let pdf;
            try {
                pdf = await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    preferCSSPageSize: false,
                    margin: {
                        top: '1cm',
                        bottom: '1cm', 
                        left: '1cm',
                        right: '1cm'
                    },
                    displayHeaderFooter: true,
                    headerTemplate: `
                        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0; padding: 0;">
                            <span style="font-weight: bold;">Rahalatek - Monthly Financial Summary</span>
                        </div>
                    `,
                    footerTemplate: `
                        <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0; padding: 0;">
                            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> - Generated on ${new Date().toLocaleDateString()}</span>
                        </div>
                    `,
                    timeout: 90000,
                    tagged: true, // Generate tagged PDF for accessibility
                    omitBackground: false
                });
                console.log('✅ PDF generated successfully, size:', pdf?.length || 0, 'bytes');
            } catch (pdfError) {
                console.error('❌ Error generating PDF:', pdfError);
                throw new Error(`Failed to generate PDF: ${pdfError.message}`);
            }
            
            console.log('✅ PDF generated successfully');
            return pdf;
            
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            console.error('Error stack:', error.stack);
            
            // More specific error handling
            if (error.message.includes('Failed to launch')) {
                throw new Error('PDF generation failed: Chrome browser could not be launched. Please check server configuration.');
            } else if (error.message.includes('timeout')) {
                throw new Error('PDF generation failed: Operation timed out. Please try again.');
            } else {
                throw new Error(`PDF generation failed: ${error.message}`);
            }
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch (closeError) {
                    console.error('Error closing browser:', closeError);
                }
            }
        }
    }

    /**
     * Generate PDF for weekly WhatsApp clicks report per author
     */
    static async generateWeeklyWhatsappClicksPDF(reportData, user) {
        let browser;
        try {
            await ensureChrome();
            const launchOptions = this.getLaunchOptions();
            try {
                browser = await puppeteer.launch(launchOptions);
            } catch (e) {
                browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            }

            const page = await browser.newPage();

            // Build minimal, clean HTML for the report
            const { week, author, weeklyPosts, top10 } = reportData;
            const title = `Weekly WhatsApp Clicks Report`;
            const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 24px; color: #111827; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    .sub { color: #6b7280; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { padding: 10px 8px; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; text-align: left; }
    tr:nth-child(even){ background:#fafafa }
    .totals { margin-top: 16px; font-weight: 700; }
  </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="sub">Author: ${author?.username || author?.name || 'Unknown'} • Week: ${week.start} → ${week.end}</div>
    <h2>This Week's Click Activity</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Weekly Clicks</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${weeklyPosts.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${(p.title || '').toString().replace(/</g, '&lt;')}</td>
            <td>${p.slug}</td>
            <td>${p.status}</td>
            <td>${p.weeklyClicks || 0}</td>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">Total weekly clicks: ${weeklyPosts.reduce((s,p)=>s+(p.weeklyClicks||0),0)}</div>

    <h2 style="margin-top:28px;">Top 10 Posts (All-Time)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>All-Time Clicks</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${top10.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${(p.title || '').toString().replace(/</g, '&lt;')}</td>
            <td>${p.slug}</td>
            <td>${p.status}</td>
            <td>${p.whatsappClicks || 0}</td>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </body>
</html>`;

            await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 60000 });
            const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '1.25cm', bottom: '1.25cm', left: '1.25cm', right: '1.25cm' } });
            return pdf;
        } finally {
            if (browser) { try { await browser.close(); } catch {} }
        }
    }

    /**
     * Generate PDF for weekly WhatsApp clicks report for ALL authors (admin/CM)
     */
    static async generateWeeklyWhatsappClicksAllAuthorsPDF(reportData) {
        let browser;
        try {
            await ensureChrome();
            const launchOptions = this.getLaunchOptions();
            try {
                browser = await puppeteer.launch(launchOptions);
            } catch (e) {
                browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            }
            const page = await browser.newPage();

            const { week, posts, weeklyPosts, top10 } = reportData;
            const title = `Weekly WhatsApp Clicks Report — All Authors`;
            const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 24px; color: #111827; }
    h1 { font-size: 24px; margin: 0 0 8px; }
    .sub { color: #6b7280; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { padding: 10px 8px; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; text-align: left; }
    tr:nth-child(even){ background:#fafafa }
    .totals { margin-top: 16px; font-weight: 700; }
  </style>
  </head>
  <body>
    <h1>${title}</h1>
    <div class="sub">Week: ${week.start} → ${week.end}</div>
    <h2>This Week's Click Activity</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Author</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Weekly Clicks</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${weeklyPosts.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${(p.authorName || '').toString().replace(/</g, '&lt;')}</td>
            <td>${(p.title || '').toString().replace(/</g, '&lt;')}</td>
            <td>${p.slug}</td>
            <td>${p.status}</td>
            <td>${p.weeklyClicks || 0}</td>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">Total posts: ${weeklyPosts.length} • Total weekly clicks: ${weeklyPosts.reduce((s,p)=>s+(p.weeklyClicks||0),0)}</div>

    <h2 style="margin-top:28px;">Top 10 Posts (All-Time)</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Author</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>All-Time Clicks</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        ${top10.map((p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${(p.authorName || '').toString().replace(/</g, '&lt;')}</td>
            <td>${(p.title || '').toString().replace(/</g, '&lt;')}</td>
            <td>${p.slug}</td>
            <td>${p.status}</td>
            <td>${p.whatsappClicks || 0}</td>
            <td>${new Date(p.createdAt).toLocaleDateString()}</td>
            <td>${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </body>
</html>`;

            await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle2'], timeout: 60000 });
            const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '1.25cm', bottom: '1.25cm', left: '1.25cm', right: '1.25cm' } });
            return pdf;
        } finally {
            if (browser) { try { await browser.close(); } catch {} }
        }
    }
    
    /**
     * Enhance HTML content for better PDF rendering
     */
    static enhanceHtmlForPDF(htmlContent, summaryData) {
        const { period } = summaryData;
        
        // Remove all emojis from the content for PDF
        let processedHtml = htmlContent;
        
        // Remove all emojis (Unicode emoji range)
        processedHtml = processedHtml.replace(/[\u{1F000}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '');
        
        // Remove specific common emojis that might not be caught by Unicode ranges
        const specificEmojis = ['📊', '💰', '🔥', '📈', '💼', '📋', '💵', '📄', '🎯', '🏢', '💳', '🎫', '📌'];
        specificEmojis.forEach(emoji => {
            const regex = new RegExp(emoji, 'g');
            processedHtml = processedHtml.replace(regex, '');
        });
        
        // Remove the specific duplicate heading from email template and clean any remaining emojis
        processedHtml = processedHtml.replace(/<div class="header">[\s\S]*?<h1>[\s\S]*?Monthly Financial Summary[\s\S]*?<\/h1>[\s\S]*?<p>[\s\S]*?Report<\/p>[\s\S]*?<\/div>/gi, '');
        processedHtml = processedHtml.replace(/<h1>[\s\S]*?Monthly Financial Summary[\s\S]*?<\/h1>/gi, '');
        processedHtml = processedHtml.replace(/Monthly Financial Summary(?=[\s\S]*?Report)/gi, '');
        
        // Clean up any remaining emoji patterns and extra spaces
        processedHtml = processedHtml.replace(/\s+/g, ' '); // Normalize whitespace
        processedHtml = processedHtml.replace(/^\s+|\s+$/gm, ''); // Trim lines
        
        // Add PDF-specific styles and remove email-specific elements
        const enhancedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Financial Summary - ${period.monthName} ${period.year}</title>
    <style>
        /* Professional PDF styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 30px;
            color: #1f2937;
            line-height: 1.6;
            background: #ffffff;
        }
        
      
        
        .pdf-header {
            text-align: center;
            margin-bottom: 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 32px 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .pdf-header h1 {
            color: #0f172a;
            margin: 0 0 16px 0;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        
        .pdf-header .period {
            color: #334155;
            font-size: 20px;
            font-weight: 500;
            margin: 12px 0;
        }
        
        .pdf-header .generated {
            color: #64748b;
            font-size: 14px;
            font-weight: 400;
            margin-top: 16px;
        }
        
        .pdf-header .company-info {
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            color: #475569;
            font-size: 12px;
        }
        
        /* Remove email-specific elements */
        .email-wrapper,
        .email-header,
        .email-footer {
            display: none !important;
        }
        
        /* Enhance tables for PDF */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }
        
        th, td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            text-align: left;
        }
        
        th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .summary-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            text-align: center;
        }
        
        .summary-card h3 {
            margin: 0 0 8px 0;
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .summary-card .value {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        
        .highlight {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
        }
        
        /* Professional Content Styling */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        th {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            font-weight: 600;
            padding: 16px 12px;
            text-align: left;
            font-size: 14px;
            letter-spacing: 0.5px;
        }
        
        td {
            padding: 14px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            color: #374151;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        tr:hover {
            background: #f1f5f9;
        }
        
        /* Section Headers */
        h2, h3 {
            color: #1e40af;
            font-weight: 600;
            margin: 32px 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        h2 {
            font-size: 24px;
        }
        
        h3 {
            font-size: 18px;
        }
        
        /* Stats Cards */
        .metric-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 4px;
        }
        
        .metric-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
        }
        
        /* Print optimization */
        @page {
            margin: 2cm 1.5cm;
            @top-center {
                content: "Rahalatek Financial Report";
                font-size: 10px;
                color: #64748b;
            }
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .pdf-header {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-header">
        <h1>Monthly Financial Summary</h1>
        <div class="period">${period.monthName} ${period.year}</div>
        <div class="generated">Generated on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</div>
        <div class="company-info">
            <strong>Rahalatek</strong> • Financial Analytics Department<br>
            Confidential Business Report
        </div>
    </div>
    
    ${processedHtml.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*?<\/html>/, '')}
</body>
</html>`;
        
        return enhancedHtml;
    }
}

module.exports = PDFService;
