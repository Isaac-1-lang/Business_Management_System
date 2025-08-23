/**
 * REDIS CONNECTION - Caching, Sessions, and Real-time Features
 * 
 * This file handles the Redis connection for:
 * - Session storage
 * - Caching frequently accessed data
 * - Real-time notification delivery
 * - Background job queues
 * - Rate limiting
 * 
 * FEATURES:
 * - Redis connection with error handling
 * - Connection pooling and reconnection
 * - Environment-based configuration
 * - Health check and monitoring
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
  enable_offline_queue: false,
  max_attempts: 10
};

// Create Redis client
const redisClient = createClient(redisConfig);

// Redis event handlers
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

redisClient.on('end', () => {
  console.log('🔄 Redis client disconnected');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('✅ Redis connection established successfully.');
    
    // Test connection with ping
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis ping successful');
    }
    
    return redisClient;
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error);
    throw error;
  }
}

// Close Redis connection
export async function closeRedis() {
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
    throw error;
  }
}

// Get Redis client instance
export function getRedisClient() {
  return redisClient;
}

// Redis utility functions
export class RedisService {
  // Set key with expiration
  static async set(key, value, expireSeconds = null) {
    try {
      if (expireSeconds) {
        await redisClient.setEx(key, expireSeconds, JSON.stringify(value));
      } else {
        await redisClient.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  // Get key value
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  // Delete key
  static async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  // Check if key exists
  static async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // Set expiration for existing key
  static async expire(key, seconds) {
    try {
      await redisClient.expire(key, seconds);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }

  // Get time to live for key
  static async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }

  // Increment counter
  static async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error);
      return null;
    }
  }

  // Decrement counter
  static async decr(key) {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Redis decr error:', error);
      return null;
    }
  }

  // Add to set
  static async sadd(key, ...members) {
    try {
      return await redisClient.sAdd(key, members);
    } catch (error) {
      console.error('Redis sadd error:', error);
      return 0;
    }
  }

  // Get set members
  static async smembers(key) {
    try {
      return await redisClient.sMembers(key);
    } catch (error) {
      console.error('Redis smembers error:', error);
      return [];
    }
  }

  // Remove from set
  static async srem(key, ...members) {
    try {
      return await redisClient.sRem(key, members);
    } catch (error) {
      console.error('Redis srem error:', error);
      return 0;
    }
  }

  // Publish to channel
  static async publish(channel, message) {
    try {
      return await redisClient.publish(channel, JSON.stringify(message));
    } catch (error) {
      console.error('Redis publish error:', error);
      return 0;
    }
  }

  // Subscribe to channel
  static async subscribe(channel, callback) {
    try {
      const subscriber = redisClient.duplicate();
      await subscriber.connect();
      await subscriber.subscribe(channel, (message) => {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          callback(message);
        }
      });
      return subscriber;
    } catch (error) {
      console.error('Redis subscribe error:', error);
      return null;
    }
  }
}

// Export Redis client and service
export default redisClient;
