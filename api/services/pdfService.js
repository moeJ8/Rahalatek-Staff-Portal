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
     * Enhance HTML content for better PDF rendering
     */
    static enhanceHtmlForPDF(htmlContent, summaryData) {
        const { period } = summaryData;
        
        // Add PDF-specific styles and remove email-specific elements
        const enhancedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Financial Summary - ${period.monthName} ${period.year}</title>
    <style>
        /* PDF-specific styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        
        .pdf-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        
        .pdf-header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .pdf-header .period {
            color: #6b7280;
            font-size: 18px;
            margin: 10px 0;
        }
        
        .pdf-header .generated {
            color: #9ca3af;
            font-size: 14px;
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
        
        /* Print optimization */
        @page {
            margin: 1cm;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-header">
        <h1>📊 Monthly Financial Summary</h1>
        <div class="period">${period.monthName} ${period.year}</div>
        <div class="generated">Generated on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</div>
    </div>
    
    ${htmlContent.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*?<\/html>/, '')}
</body>
</html>`;
        
        return enhancedHtml;
    }
}

module.exports = PDFService;
