const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Ensure Chrome is installed before PDF generation
 * This is a fallback for when build-time installation fails
 */
async function ensureChrome() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
        console.log('⏭️  Skipping Chrome check in development');
        return;
    }
    
    console.log('🔍 Checking if Chrome is available...');
    
    // Check if Chrome is already installed
    const chromePaths = [
        '/opt/render/.cache/puppeteer/chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser'
    ];
    
    let chromeFound = false;
    for (const chromePath of chromePaths) {
        try {
            if (fs.existsSync(chromePath)) {
                console.log(`✅ Chrome found at: ${chromePath}`);
                chromeFound = true;
                break;
            }
        } catch (err) {
            // Continue checking
        }
    }
    
    if (!chromeFound) {
        console.log('❌ Chrome not found, installing now...');
        try {
            // Create cache directory
            const cacheDir = '/opt/render/.cache/puppeteer';
            if (!fs.existsSync(cacheDir)) {
                fs.mkdirSync(cacheDir, { recursive: true });
                console.log(`📁 Created cache directory: ${cacheDir}`);
            }
            
            // Install Chrome
            console.log('📦 Installing Chrome via Puppeteer...');
            execSync(`npx puppeteer browsers install chrome --path ${cacheDir}`, {
                stdio: 'inherit',
                timeout: 300000 // 5 minutes
            });
            
            console.log('✅ Chrome installed successfully');
        } catch (installError) {
            console.error('❌ Failed to install Chrome:', installError.message);
            throw new Error('Chrome installation failed: ' + installError.message);
        }
    }
}

module.exports = { ensureChrome };
