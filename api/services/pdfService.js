const puppeteer = require('puppeteer');
const EmailService = require('./emailService');

class PDFService {
    
    /**
     * Generate PDF from monthly financial summary data
     */
    static async generateFinancialSummaryPDF(summaryData, user) {
        let browser;
        try {
            console.log('🖨️ Starting PDF generation for financial summary...');
            
            // Launch puppeteer browser with environment-specific configuration
            const isProduction = process.env.NODE_ENV === 'production';
            const launchOptions = {
                headless: true,
                timeout: 60000,
                args: isProduction ? [
                    // Production configuration - comprehensive flags for server environments
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ] : [
                    // Development configuration - minimal flags for local development
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ]
            };

            // Use custom Chrome executable if provided (for production environments)
            if (process.env.CHROME_BIN) {
                launchOptions.executablePath = process.env.CHROME_BIN;
            }

            browser = await puppeteer.launch(launchOptions);
            
            const page = await browser.newPage();
            
            // Set page configurations for better performance in production
            await page.setViewport({ width: 1280, height: 800 });
            await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Get the HTML content from EmailService
            const htmlContent = EmailService.getMonthlyFinancialSummaryTemplate(user, summaryData);
            
            // Enhance HTML for PDF (add print styles and better formatting)
            const pdfHtml = this.enhanceHtmlForPDF(htmlContent, summaryData);
            
            // Set content
            await page.setContent(pdfHtml, { waitUntil: 'networkidle0' });
            
            // Generate PDF with options
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '1cm',
                    bottom: '1cm',
                    left: '1cm',
                    right: '1cm'
                },
                displayHeaderFooter: true,
                headerTemplate: `
                    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0;">
                        <span style="font-weight: bold;">Rahalatek - Monthly Financial Summary</span>
                    </div>
                `,
                footerTemplate: `
                    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0;">
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span> - Generated on ${new Date().toLocaleDateString()}</span>
                    </div>
                `
            });
            
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
