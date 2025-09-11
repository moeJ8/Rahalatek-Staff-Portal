# Universal Puppeteer Deployment Guide

## 🌍 Universal PDF Generation Solution

This guide provides a **universal solution** that works on **all modern hosting platforms** including Render, Heroku, Vercel, Railway, DigitalOcean, AWS, and more.

## 🚀 Quick Setup

The system now automatically:
1. **Detects your platform** (Render, Heroku, etc.)
2. **Installs Chrome** during deployment
3. **Finds the best Chrome executable** path
4. **Uses optimized settings** for your platform

## Production Requirements for PDF Generation

### 1. Chrome Dependencies (Linux/Ubuntu)
If deploying to a Linux server, ensure Chrome dependencies are installed:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```

### 2. Environment Variables

Set the following environment variables in your production environment:

```bash
# Optional: Custom Chrome executable path
CHROME_BIN=/usr/bin/google-chrome

# Node environment
NODE_ENV=production

# Memory limit (if needed)
NODE_OPTIONS="--max-old-space-size=4096"
```

### 3. Docker Configuration (if using Docker)

If deploying with Docker, use a base image that includes Chrome:

```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set environment variable
ENV CHROME_BIN=/usr/bin/google-chrome-stable
```

### 4. Memory Considerations

PDF generation is memory-intensive. Ensure your server has:
- At least 2GB RAM available
- Swap space configured if needed
- Process memory limits set appropriately

### 5. Troubleshooting Common Issues

1. **"Failed to launch Chrome"**: Missing Chrome dependencies
2. **"Protocol error"**: Memory/resource constraints
3. **Timeout errors**: Increase timeout values or reduce PDF complexity
4. **Permission errors**: Ensure proper file system permissions

### 6. Testing the Fix

After deployment, test PDF generation by:
1. Logging into the admin panel
2. Going to Financial Reports tab
3. Clicking "Download PDF"
4. Check server logs for any error messages

### 7. Platform-Specific Configuration

#### Heroku
```bash
# Add buildpack for Chrome dependencies
heroku buildpacks:add jontewks/puppeteer
# OR
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-chrome-for-testing
```

#### Render
```bash
# Set environment variables in Render dashboard:
NODE_ENV=production
CHROME_BIN=/usr/bin/chromium-browser
```

#### Railway/DigitalOcean/AWS
```bash
# Install Chrome in your Dockerfile or deployment script
apt-get install -y chromium-browser
export CHROME_BIN=/usr/bin/chromium-browser
```

#### Vercel
```bash
# Add to vercel.json:
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### 8. Debugging Steps

1. **Check server logs** for specific error messages
2. **Verify Chrome installation**: `which google-chrome` or `which chromium-browser`
3. **Test minimal Puppeteer script**:
   ```javascript
   const puppeteer = require('puppeteer');
   (async () => {
     const browser = await puppeteer.launch({
       headless: true,
       args: ['--no-sandbox', '--disable-setuid-sandbox']
     });
     const page = await browser.newPage();
     await page.goto('https://example.com');
     await browser.close();
     console.log('Success!');
   })();
   ```

### 9. Alternative Solutions

If Puppeteer continues to fail, consider:
1. Using a PDF generation service (like Puppeteer as a Service)
2. Moving PDF generation to a separate microservice
3. Using a different PDF library (like jsPDF with html2canvas)
4. Using headless Chrome as a service (Chrome Remote Interface)
