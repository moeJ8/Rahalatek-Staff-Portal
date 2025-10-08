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

// Public pages cache - Featured packages (5 minutes)
const featuredPackagesCache = {
    CACHE_KEY: 'public:packages:featured',
    CACHE_DURATION: 5 * 60, // 5 minutes

    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const cached = await client.get(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Featured packages cache get error:', error);
            return null;
        }
    },

    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 Featured packages cached in Redis for 5 minutes');
            return true;
        } catch (error) {
            console.error('Featured packages cache set error:', error);
            return false;
        }
    },

    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.del(this.CACHE_KEY);
            console.log(`🗑️ Featured packages cache cleared: ${reason}`);
            return true;
        } catch (error) {
            console.error('Featured packages cache clear error:', error);
            return false;
        }
    }
};

// Featured hotels cache (5 minutes)
const featuredHotelsCache = {
    CACHE_KEY: 'public:hotels:featured',
    CACHE_DURATION: 5 * 60,

    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const cached = await client.get(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Featured hotels cache get error:', error);
            return null;
        }
    },

    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 Featured hotels cached in Redis for 5 minutes');
            return true;
        } catch (error) {
            console.error('Featured hotels cache set error:', error);
            return false;
        }
    },

    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.del(this.CACHE_KEY);
            console.log(`🗑️ Featured hotels cache cleared: ${reason}`);
            return true;
        } catch (error) {
            console.error('Featured hotels cache clear error:', error);
            return false;
        }
    }
};

// Featured tours cache (5 minutes)
const featuredToursCache = {
    CACHE_KEY: 'public:tours:featured',
    CACHE_DURATION: 5 * 60,

    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const cached = await client.get(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Featured tours cache get error:', error);
            return null;
        }
    },

    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 Featured tours cached in Redis for 5 minutes');
            return true;
        } catch (error) {
            console.error('Featured tours cache set error:', error);
            return false;
        }
    },

    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.del(this.CACHE_KEY);
            console.log(`🗑️ Featured tours cache cleared: ${reason}`);
            return true;
        } catch (error) {
            console.error('Featured tours cache clear error:', error);
            return false;
        }
    }
};

// Public package details cache (10 minutes - changes less frequently)
const packageDetailsCache = {
    getCacheKey(slug) {
        return `public:package:${slug}`;
    },
    CACHE_DURATION: 10 * 60, // 10 minutes

    async get(slug) {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const key = this.getCacheKey(slug);
            const cached = await client.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Package details cache get error:', error);
            return null;
        }
    },

    async set(slug, data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            const key = this.getCacheKey(slug);
            await client.setEx(key, this.CACHE_DURATION, JSON.stringify(data));
            console.log(`💾 Package ${slug} cached in Redis for 10 minutes`);
            return true;
        } catch (error) {
            console.error('Package details cache set error:', error);
            return false;
        }
    },

    async clear(slug, reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            if (slug) {
                const key = this.getCacheKey(slug);
                await client.del(key);
                console.log(`🗑️ Package ${slug} cache cleared: ${reason}`);
            } else {
                // Clear all package caches
                const keys = await client.keys('public:package:*');
                if (keys.length > 0) {
                    await client.del(keys);
                    console.log(`🗑️ All package caches cleared: ${reason}`);
                }
            }
            return true;
        } catch (error) {
            console.error('Package details cache clear error:', error);
            return false;
        }
    }
};

// Hotel details cache (10 minutes)
const hotelDetailsCache = {
    getCacheKey(slug) {
        return `public:hotel:${slug}`;
    },
    CACHE_DURATION: 10 * 60,

    async get(slug) {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const key = this.getCacheKey(slug);
            const cached = await client.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Hotel details cache get error:', error);
            return null;
        }
    },

    async set(slug, data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            const key = this.getCacheKey(slug);
            await client.setEx(key, this.CACHE_DURATION, JSON.stringify(data));
            console.log(`💾 Hotel ${slug} cached in Redis for 10 minutes`);
            return true;
        } catch (error) {
            console.error('Hotel details cache set error:', error);
            return false;
        }
    },

    async clear(slug, reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            if (slug) {
                const key = this.getCacheKey(slug);
                await client.del(key);
                console.log(`🗑️ Hotel ${slug} cache cleared: ${reason}`);
            } else {
                const keys = await client.keys('public:hotel:*');
                if (keys.length > 0) {
                    await client.del(keys);
                    console.log(`🗑️ All hotel caches cleared: ${reason}`);
                }
            }
            return true;
        } catch (error) {
            console.error('Hotel details cache clear error:', error);
            return false;
        }
    }
};

// Tour details cache (10 minutes)
const tourDetailsCache = {
    getCacheKey(slug) {
        return `public:tour:${slug}`;
    },
    CACHE_DURATION: 10 * 60,

    async get(slug) {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const key = this.getCacheKey(slug);
            const cached = await client.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Tour details cache get error:', error);
            return null;
        }
    },

    async set(slug, data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            const key = this.getCacheKey(slug);
            await client.setEx(key, this.CACHE_DURATION, JSON.stringify(data));
            console.log(`💾 Tour ${slug} cached in Redis for 10 minutes`);
            return true;
        } catch (error) {
            console.error('Tour details cache set error:', error);
            return false;
        }
    },

    async clear(slug, reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            if (slug) {
                const key = this.getCacheKey(slug);
                await client.del(key);
                console.log(`🗑️ Tour ${slug} cache cleared: ${reason}`);
            } else {
                const keys = await client.keys('public:tour:*');
                if (keys.length > 0) {
                    await client.del(keys);
                    console.log(`🗑️ All tour caches cleared: ${reason}`);
                }
            }
            return true;
        } catch (error) {
            console.error('Tour details cache clear error:', error);
            return false;
        }
    }
};

// Smart cache invalidation - clears cache when data changes
const invalidateDashboardCache = async (reason = 'Data changed') => {
    return await dashboardCache.clear(reason);
};

// All hotels list cache (2 minutes - frequently accessed)
const allHotelsCache = {
    CACHE_KEY: 'public:hotels:all',
    CACHE_DURATION: 2 * 60, // 2 minutes

    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const cached = await client.get(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('All hotels cache get error:', error);
            return null;
        }
    },

    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 All hotels cached in Redis for 2 minutes');
            return true;
        } catch (error) {
            console.error('All hotels cache set error:', error);
            return false;
        }
    },

    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.del(this.CACHE_KEY);
            console.log(`🗑️ All hotels cache cleared: ${reason}`);
            return true;
        } catch (error) {
            console.error('All hotels cache clear error:', error);
            return false;
        }
    }
};

// All tours list cache (2 minutes)
const allToursCache = {
    CACHE_KEY: 'public:tours:all',
    CACHE_DURATION: 2 * 60,

    async get() {
        try {
            if (!isConnected || !client || !client.isOpen) return null;
            const cached = await client.get(this.CACHE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('All tours cache get error:', error);
            return null;
        }
    },

    async set(data) {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.setEx(this.CACHE_KEY, this.CACHE_DURATION, JSON.stringify(data));
            console.log('💾 All tours cached in Redis for 2 minutes');
            return true;
        } catch (error) {
            console.error('All tours cache set error:', error);
            return false;
        }
    },

    async clear(reason = 'Manual clear') {
        try {
            if (!isConnected || !client || !client.isOpen) return false;
            await client.del(this.CACHE_KEY);
            console.log(`🗑️ All tours cache cleared: ${reason}`);
            return true;
        } catch (error) {
            console.error('All tours cache clear error:', error);
            return false;
        }
    }
};

// Smart cache invalidation for public pages
const invalidatePublicCache = async (type, slug = null, reason = 'Data changed') => {
    console.log(`🔄 Invalidating ${type} cache: ${reason}`);
    
    switch(type) {
        case 'packages':
            await featuredPackagesCache.clear(reason);
            if (slug) await packageDetailsCache.clear(slug, reason);
            else await packageDetailsCache.clear(null, reason); // Clear all
            break;
        case 'hotels':
            await featuredHotelsCache.clear(reason);
            await allHotelsCache.clear(reason); // Also clear full list
            if (slug) await hotelDetailsCache.clear(slug, reason);
            else await hotelDetailsCache.clear(null, reason);
            break;
        case 'tours':
            await featuredToursCache.clear(reason);
            await allToursCache.clear(reason); // Also clear full list
            if (slug) await tourDetailsCache.clear(slug, reason);
            else await tourDetailsCache.clear(null, reason);
            break;
        case 'all':
            await featuredPackagesCache.clear(reason);
            await featuredHotelsCache.clear(reason);
            await featuredToursCache.clear(reason);
            await allHotelsCache.clear(reason);
            await allToursCache.clear(reason);
            await packageDetailsCache.clear(null, reason);
            await hotelDetailsCache.clear(null, reason);
            await tourDetailsCache.clear(null, reason);
            break;
    }
};

module.exports = {
    initRedis,
    dashboardCache,
    invalidateDashboardCache,
    // Public caches
    featuredPackagesCache,
    featuredHotelsCache,
    featuredToursCache,
    packageDetailsCache,
    hotelDetailsCache,
    tourDetailsCache,
    allHotelsCache,
    allToursCache,
    invalidatePublicCache
};
