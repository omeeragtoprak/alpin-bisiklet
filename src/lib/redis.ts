import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis =
    globalForRedis.redis ??
    new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        lazyConnect: true,
    });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ============================================
// CACHE HELPER FUNCTIONS
// ============================================

const DEFAULT_TTL = 60 * 5; // 5 dakika

/**
 * Cache'den veri al
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch {
        return null;
    }
}

/**
 * Cache'e veri yaz
 */
export async function setCache<T>(
    key: string,
    data: T,
    ttl: number = DEFAULT_TTL,
): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    } catch {
        // Cache hatası sessizce geçilir
    }
}

/**
 * Cache'den veri sil
 */
export async function deleteCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch {
        // Cache hatası sessizce geçilir
    }
}

/**
 * Pattern'e göre cache anahtarlarını sil
 * Örn: invalidatePattern("products:*")
 */
export async function invalidatePattern(pattern: string): Promise<void> {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        // Cache hatası sessizce geçilir
    }
}

// ============================================
// CACHE KEY CONSTANTS
// ============================================

export const CACHE_KEYS = {
    products: {
        all: "products:all",
        detail: (id: number | string) => `products:${id}`,
        slug: (slug: string) => `products:slug:${slug}`,
        featured: "products:featured",
    },
    categories: {
        all: "categories:all",
        detail: (id: number | string) => `categories:${id}`,
    },
    brands: {
        all: "brands:all",
        detail: (id: number | string) => `brands:${id}`,
    },
    banners: {
        all: "banners:all",
        active: "banners:active",
    },
    dashboard: {
        stats: "dashboard:stats",
    },
} as const;

export default redis;
