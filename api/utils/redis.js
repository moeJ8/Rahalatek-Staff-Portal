const redis = require('redis');

// Create Redis client
let client = null;
let isConnected = false;

// Initialize Redis connection
const initRedis = async () => {
    try {
        client = redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            // For local development
            url: process.env.REDIS_URL || undefined
        });

        client.on('connect', () => {
            console.log('🔗 Connected to Redis');
            isConnected = true;
        });

        client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err);
            isConnected = false;
        });

        client.on('ready', () => {
            console.log('✅ Redis Client Ready');
            isConnected = true;
        });

        client.on('end', () => {
            console.log('🔌 Redis connection closed');
            isConnected = false;
        });

        if (!client.isOpen) {
            await client.connect();
        }
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        isConnected = false;
        // Don't throw error - allow app to work without Redis
    }
};

// Dashboard cache functions
const dashboardCache = {
    CACHE_KEY: 'dashboard:analytics',
    CACHE_DURATION: 5 * 60, // 5 minutes in seconds

    // Get cached dashboard data
    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) {
                console.log('⚠️ Redis not connected, skipping cache');
                return null;
            }

            const cached = await client.get(this.CACHE_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            console.error('Redis cache get error:', error);
            return null;
        }
    },

    // Set dashboard data in cache
    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) {
                console.log('⚠️ Redis not connected, skipping cache');
                return false;
            }

            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 Dashboard data cached in Redis for 5 minutes');
            return true;
        } catch (error) {
            console.error('Redis cache set error:', error);
            return false;
        }
    },

    // Clear dashboard cache
    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) {
                console.log('⚠️ Redis not connected, skipping cache clear');
                return false;
            }

            await client.del(this.CACHE_KEY);
            console.log(`🗑️ Dashboard cache cleared from Redis: ${reason}`);
            return true;
        } catch (error) {
            console.error('Redis cache clear error:', error);
            return false;
        }
    },

    // Get cache status
    async getStatus() {
        try {
            if (!isConnected || !client || !client.isOpen) {
                return {
                    connected: false,
                    cached: false,
                    ttl: 0
                };
            }

            const exists = await client.exists(this.CACHE_KEY);
            const ttl = exists ? await client.ttl(this.CACHE_KEY) : 0;

            return {
                connected: true,
                cached: !!exists,
                ttl: ttl,
                ttlMinutes: Math.round(ttl / 60),
                cacheKey: this.CACHE_KEY
            };
        } catch (error) {
            console.error('Redis status error:', error);
            return {
                connected: false,
                cached: false,
                ttl: 0,
                error: error.message
            };
        }
    }
};

// Smart cache invalidation - clears cache when data changes
const invalidateDashboardCache = async (reason = 'Data changed') => {
    return await dashboardCache.clear(reason);
};

module.exports = {
    initRedis,
    dashboardCache,
    invalidateDashboardCache
};
