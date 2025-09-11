#!/usr/bin/env node

/**
 * Universal Chrome Setup Script for Puppeteer
 * Works on all hosting platforms: Render, Heroku, Vercel, Railway, etc.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Chrome for Puppeteer...');

// Detect the platform
const platform = process.platform;
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';
const isHeroku = process.env.DYNO !== undefined;
const isVercel = process.env.VERCEL === '1';
const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined;

console.log(`Platform: ${platform}`);
console.log(`Production: ${isProduction}`);
console.log(`Render: ${isRender}`);
console.log(`Heroku: ${isHeroku}`);
console.log(`Vercel: ${isVercel}`);
console.log(`Railway: ${isRailway}`);

async function setupChrome() {
    try {
        // Always install Puppeteer's bundled Chrome
        console.log('📦 Installing Puppeteer bundled Chrome...');
        execSync('npx puppeteer browsers install chrome', { 
            stdio: 'inherit',
            timeout: 300000 // 5 minutes timeout
        });
        console.log('✅ Puppeteer Chrome installed successfully');

        // Platform-specific additional setup
        if (isRender) {
            console.log('🎨 Configuring for Render platform...');
            // Render-specific configuration handled in environment variables
        } else if (isHeroku) {
            console.log('🟣 Configuring for Heroku platform...');
            // Heroku needs buildpack configuration
            console.log('Note: Make sure to add the Puppeteer buildpack to your Heroku app');
        } else if (isVercel) {
            console.log('▲ Configuring for Vercel platform...');
            // Vercel handles Chrome differently
        } else if (isRailway) {
            console.log('🚂 Configuring for Railway platform...');
            // Railway-specific configuration
        }

        // Find Chrome executable paths
        const possibleChromePaths = [
            // Puppeteer cache paths
            path.join(process.env.HOME || process.cwd(), '.cache', 'puppeteer'),
            path.join('/opt/render/.cache/puppeteer'),
            path.join(process.cwd(), 'node_modules', 'puppeteer', '.local-chromium'),
            
            // System Chrome paths
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/opt/google/chrome/chrome',
            '/snap/bin/chromium',
            
            // macOS paths
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            
            // Windows paths
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ];

        console.log('🔍 Searching for Chrome executables...');
        const foundPaths = [];
        
        for (const chromePath of possibleChromePaths) {
            try {
                if (fs.existsSync(chromePath)) {
                    foundPaths.push(chromePath);
                    console.log(`✅ Found: ${chromePath}`);
                }
            } catch (err) {
                // Continue checking
            }
        }

        if (foundPaths.length === 0) {
            console.log('⚠️  No Chrome executables found in common locations');
            console.log('Puppeteer will attempt to use its bundled Chrome');
        } else {
            console.log(`🎯 Found ${foundPaths.length} Chrome executable(s)`);
        }

        console.log('✅ Chrome setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during Chrome setup:', error.message);
        
        // Don't fail the build - Puppeteer might still work
        console.log('⚠️  Chrome setup failed, but continuing with build...');
        console.log('Puppeteer will attempt to use default configuration');
    }
}

// Only run setup in production or when explicitly requested
if (isProduction || process.env.FORCE_CHROME_SETUP === 'true') {
    setupChrome();
} else {
    console.log('⏭️  Skipping Chrome setup in development mode');
    console.log('Set FORCE_CHROME_SETUP=true to force setup in development');
}
