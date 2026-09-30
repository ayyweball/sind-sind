// Multi-Tenant Audit Logger with Automatic Secret Redaction

const SENSITIVE_KEYS = new Set([
  'access_token',
  'refresh_token',
  'client_secret',
  'secret',
  'password',
  'authorization',
  'lwa_token',
  'token',
  'spapi_oauth_code',
  'code',
  'api_key'
]);

export class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
  }

  static sanitize(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => AuditLogger.sanitize(item));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED_SECRET]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = AuditLogger.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  log({
    organizationId,
    marketplaceAccountId = null,
    action,
    status = 'SUCCESS',
    details = {},
    actor = 'SYSTEM'
  }) {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId,
      marketplaceAccountId,
      action,
      status, // SUCCESS | FAILED | WARN | BLOCKED
      details: AuditLogger.sanitize(details),
      actor,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    return entry;
  }

  getByTenant(organizationId, limit = 50) {
    return this.logs
      .filter(l => l.organizationId === organizationId)
      .slice(0, limit);
  }

  getAll(limit = 100) {
    return this.logs.slice(0, limit);
  }
}

export const auditLogger = new AuditLogger();
