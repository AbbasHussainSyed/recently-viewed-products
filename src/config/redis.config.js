const Redis = require('ioredis');

const initializeRedis = () => {
    try {
        const redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        redis.on('connect', () => {
            console.log('Redis connected successfully');
        });

        redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });

        return redis;
    } catch (error) {
        console.error('Redis initialization error:', error);
        throw error;
    }
};

module.exports = { initializeRedis };