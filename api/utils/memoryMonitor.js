// Memory monitoring utility for production

const logMemoryUsage = () => {
    const used = process.memoryUsage();
    const formatMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    console.log('📊 Memory Usage:', {
        rss: `${formatMB(used.rss)} MB (Total memory)`,
        heapUsed: `${formatMB(used.heapUsed)} MB (Heap used)`,
        heapTotal: `${formatMB(used.heapTotal)} MB (Heap total)`,
        external: `${formatMB(used.external)} MB (C++ objects)`,
    });
    
    // Warn if memory usage is high
    const heapUsedMB = formatMB(used.heapUsed);
    if (heapUsedMB > 400) {
        console.warn(`⚠️ High memory usage detected: ${heapUsedMB} MB`);
    }
};

// Monitor memory every 5 minutes in production
const startMemoryMonitoring = () => {
    if (process.env.NODE_ENV === 'production') {
        console.log('🔍 Starting memory monitoring...');
        
        // Log immediately
        logMemoryUsage();
        
        // Then every 5 minutes
        setInterval(logMemoryUsage, 5 * 60 * 1000);
        
        // Force garbage collection every 10 minutes if available
        if (global.gc) {
            setInterval(() => {
                console.log('🗑️ Running garbage collection...');
                global.gc();
                logMemoryUsage();
            }, 10 * 60 * 1000);
        }
    }
};

module.exports = { logMemoryUsage, startMemoryMonitoring };

