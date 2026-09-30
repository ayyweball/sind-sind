// Multi-Tenant Isolation Models for Sind & Sind Marketplace Connectivity
import { CONNECTION_STATUS, ACCOUNT_TYPES } from '../../../src/lib/marketplace/constants.js';

export class Organization {
  constructor({
    id,
    name,
    legalEntityName,
    country = 'IN',
    baseCurrency = 'INR',
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.name = name;
    this.legalEntityName = legalEntityName || name;
    this.country = country;
    this.baseCurrency = baseCurrency;
    this.createdAt = createdAt;
  }
}

export class MarketplaceAccount {
  constructor({
    id,
    organizationId,
    provider = 'AMAZON',
    accountType = ACCOUNT_TYPES.SELLER_CENTRAL,
    marketplaceId = 'A21TJRUUN4KGV', // Default Amazon India
    merchantId,
    sellerPartnerId,
    vendorCode,
    name,
    region = 'IN',
    status = CONNECTION_STATUS.NOT_CONNECTED,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.organizationId = organizationId;
    this.provider = provider;
    this.accountType = accountType;
    this.marketplaceId = marketplaceId;
    this.merchantId = merchantId || null;
    this.sellerPartnerId = sellerPartnerId || null;
    this.vendorCode = vendorCode || null;
    this.name = name;
    this.region = region;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export class MarketplaceConnection {
  constructor({
    id,
    organizationId,
    marketplaceAccountId,
    appId = 'amzn1.sp.solution.sind-and-sind',
    scope = ['sellingpartnerapi::notifications', 'sellingpartnerapi::reports', 'sellingpartnerapi::finances'],
    status = CONNECTION_STATUS.NOT_CONNECTED,
    lastSyncTimestamp = null,
    lastSyncStatus = null,
    syncErrors = [],
    encryptedCredentials = {}, // Secure storage on server, never sent to client
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.organizationId = organizationId;
    this.marketplaceAccountId = marketplaceAccountId;
    this.appId = appId;
    this.scope = scope;
    this.status = status;
    this.lastSyncTimestamp = lastSyncTimestamp;
    this.lastSyncStatus = lastSyncStatus;
    this.syncErrors = syncErrors;
    this.encryptedCredentials = encryptedCredentials;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Sanitized view safe for client response - strictly excludes tokens and secrets
  toSafeJSON() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      marketplaceAccountId: this.marketplaceAccountId,
      appId: this.appId,
      scope: this.scope,
      status: this.status,
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastSyncStatus: this.lastSyncStatus,
      syncErrors: this.syncErrors,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
