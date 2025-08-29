/**
 * IN-MEMORY STORE (Redis temporarily disabled)
 *
 * This module provides the same interface as the previous Redis-based
 * implementation but uses an in-memory Map so the rest of the codebase
 * can remain unchanged while Redis is removed.
 */

import EventEmitter from 'events';

const inMemoryStore = new Map();
const emitter = new EventEmitter();

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

// No-op connect/close functions to keep server bootstrap intact
export async function connectRedis() {
  console.log('[Redis disabled] Using in-memory store');
  return null;
}

export async function closeRedis() {
  return null;
}

export function getRedisClient() {
  return null;
}

export class RedisService {
  static async set(key, value, expireSeconds = null) {
    const record = {
      value,
      expiresAt: expireSeconds ? nowSeconds() + expireSeconds : null
    };
    inMemoryStore.set(key, record);
    return true;
  }

  static async get(key) {
    const record = inMemoryStore.get(key);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt <= nowSeconds()) {
      inMemoryStore.delete(key);
      return null;
    }
    return record.value;
  }

  static async del(key) {
    inMemoryStore.delete(key);
    return true;
  }

  static async exists(key) {
    const val = await this.get(key);
    return !!val;
  }

  static async expire(key, seconds) {
    const record = inMemoryStore.get(key);
    if (!record) return false;
    record.expiresAt = nowSeconds() + seconds;
    inMemoryStore.set(key, record);
    return true;
  }

  static async ttl(key) {
    const record = inMemoryStore.get(key);
    if (!record || !record.expiresAt) return -1;
    const ttl = record.expiresAt - nowSeconds();
    return ttl > 0 ? ttl : -1;
  }

  static async incr(key) {
    const current = (await this.get(key)) ?? 0;
    const next = Number(current) + 1;
    await this.set(key, next);
    return next;
  }

  static async decr(key) {
    const current = (await this.get(key)) ?? 0;
    const next = Number(current) - 1;
    await this.set(key, next);
    return next;
  }

  static async sadd(key, ...members) {
    const set = new Set((await this.get(key)) ?? []);
    let added = 0;
    members.forEach(m => {
      if (!set.has(m)) {
        set.add(m);
        added += 1;
      }
    });
    await this.set(key, Array.from(set));
    return added;
  }

  static async smembers(key) {
    return (await this.get(key)) ?? [];
  }

  static async srem(key, ...members) {
    const set = new Set((await this.get(key)) ?? []);
    let removed = 0;
    members.forEach(m => {
      if (set.delete(m)) removed += 1;
    });
    await this.set(key, Array.from(set));
    return removed;
  }

  static async publish(channel, message) {
    emitter.emit(channel, message);
    return 1;
  }

  static async subscribe(channel, callback) {
    const handler = (msg) => callback(msg);
    emitter.on(channel, handler);
    return {
      unsubscribe: () => emitter.off(channel, handler)
    };
  }
}

export default null;
