// Token Bucket Rate Limiter for Amazon SP-API Usage Plans
import { RATE_LIMIT_PROFILES } from '../../../src/lib/marketplace/constants.js';

export class TokenBucket {
  constructor({ rate = 1.0, burst = 10, name = 'default' }) {
    this.name = name;
    this.rate = rate; // Tokens replenished per second
    this.burst = burst; // Maximum token capacity
    this.tokens = burst;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.burst, this.tokens + elapsedSeconds * this.rate);
    this.lastRefill = now;
  }

  tryConsume(count = 1) {
    this.refill();
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }

  getWaitTimeMs(count = 1) {
    this.refill();
    if (this.tokens >= count) return 0;
    const missingTokens = count - this.tokens;
    return Math.ceil((missingTokens / this.rate) * 1000);
  }
}

export class RateLimitManager {
  constructor() {
    this.buckets = new Map();
  }

  getBucket(apiKey) {
    if (!this.buckets.has(apiKey)) {
      const profile = RATE_LIMIT_PROFILES[apiKey] || { rate: 1.0, burst: 10, name: apiKey };
      this.buckets.set(apiKey, new TokenBucket(profile));
    }
    return this.buckets.get(apiKey);
  }

  async acquire(apiKey, count = 1) {
    const bucket = this.getBucket(apiKey);
    const waitTime = bucket.getWaitTimeMs(count);

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 5000)));
    }

    return bucket.tryConsume(count);
  }

  getStatus() {
    const status = {};
    for (const [key, bucket] of this.buckets.entries()) {
      bucket.refill();
      status[key] = {
        name: bucket.name,
        availableTokens: Number(bucket.tokens.toFixed(2)),
        burstCapacity: bucket.burst,
        refillRatePerSec: bucket.rate
      };
    }
    return status;
  }
}

export const rateLimitManager = new RateLimitManager();
