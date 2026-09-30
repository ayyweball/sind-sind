// Retry Policy with Exponential Backoff and Full Jitter for Amazon SP-API

export class RetryPolicy {
  constructor({
    maxRetries = 3,
    initialDelayMs = 500,
    maxDelayMs = 10000,
    backoffFactor = 2.0
  } = {}) {
    this.maxRetries = maxRetries;
    this.initialDelayMs = initialDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.backoffFactor = backoffFactor;
  }

  isRetryable(error) {
    if (!error) return false;
    const status = error.status || error.statusCode || (error.response && error.response.status);
    // 429 Too Many Requests, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout
    if ([429, 500, 502, 503, 504].includes(status)) {
      return true;
    }
    // Network connectivity / socket timeouts
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return true;
    }
    return false;
  }

  calculateDelay(attempt) {
    const exponential = this.initialDelayMs * Math.pow(this.backoffFactor, attempt);
    const capped = Math.min(this.maxDelayMs, exponential);
    // Full jitter between 0 and capped delay
    return Math.floor(Math.random() * capped);
  }

  async execute(operation, contextName = 'SP-API Call') {
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === this.maxRetries || !this.isRetryable(error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export const defaultRetryPolicy = new RetryPolicy();
