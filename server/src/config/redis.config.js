// src/config/redis.config.js
const Redis = require('ioredis');

class CacheService {
    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD || null,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        this.client.on('connect', () => {
            console.log('Redis connected successfully');
        });

        this.client.on('error', (error) => {
            console.error('Redis connection error:', error);
        });
    }

    async set(key, value, expires = 3600) {
        try {
            const stringValue = JSON.stringify(value);
            await this.client.setex(key, expires, stringValue);
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error('Redis del error:', error);
        }
    }
}

const initializeRedis = () => {
    return new CacheService();
};

module.exports = { initializeRedis, CacheService };