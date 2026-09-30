// Multi-Tenant In-Memory Marketplace Store
import { Organization, MarketplaceAccount, MarketplaceConnection } from '../models/tenantModels.js';
import { CONNECTION_STATUS, ACCOUNT_TYPES } from '../../../src/lib/marketplace/constants.js';

export class MarketplaceStore {
  constructor() {
    this.organizations = new Map();
    this.accounts = new Map();
    this.connections = new Map();
    this.canonicalOrders = new Map(); // organizationId -> array of orders
    this.canonicalInventory = new Map(); // organizationId -> array of inventory positions
    this.canonicalFinances = new Map(); // organizationId -> array of financial events
    this.syncJobs = new Map();

    this.initializeDefaults();
  }

  initializeDefaults() {
    // Default demo organization
    const org = new Organization({
      id: 'org_atelier',
      name: 'Atelier & Co.',
      legalEntityName: 'Atelier Brand Holdings Pvt Ltd',
      country: 'IN',
      baseCurrency: 'INR'
    });
    this.organizations.set(org.id, org);

    // Amazon Seller Central Account
    const sellerAccount = new MarketplaceAccount({
      id: 'mkt_amazon_in',
      organizationId: 'org_atelier',
      provider: 'AMAZON',
      accountType: ACCOUNT_TYPES.SELLER_CENTRAL,
      marketplaceId: 'A21TJRUUN4KGV',
      merchantId: 'A21TJRUUN4KGV',
      name: 'Amazon India (Seller Central)',
      region: 'IN',
      status: CONNECTION_STATUS.CONNECTED
    });
    this.accounts.set(sellerAccount.id, sellerAccount);

    const sellerConnection = new MarketplaceConnection({
      id: 'conn_org_atelier_mkt_amazon_in',
      organizationId: 'org_atelier',
      marketplaceAccountId: 'mkt_amazon_in',
      appId: 'amzn1.sp.solution.sind-and-sind',
      scope: ['orders', 'finances', 'inventory', 'pricing', 'reports'],
      status: CONNECTION_STATUS.CONNECTED,
      lastSyncTimestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      lastSyncStatus: 'SUCCESS'
    });
    this.connections.set(sellerConnection.id, sellerConnection);

    // Amazon Vendor Central Account (Integration Ready)
    const vendorAccount = new MarketplaceAccount({
      id: 'mkt_amazon_vendor',
      organizationId: 'org_atelier',
      provider: 'AMAZON',
      accountType: ACCOUNT_TYPES.VENDOR_CENTRAL,
      marketplaceId: 'A21TJRUUN4KGV',
      vendorCode: 'SINDV',
      name: 'Amazon India (Vendor Central 1P)',
      region: 'IN',
      status: CONNECTION_STATUS.NOT_CONNECTED
    });
    this.accounts.set(vendorAccount.id, vendorAccount);

    const vendorConnection = new MarketplaceConnection({
      id: 'conn_org_atelier_mkt_amazon_vendor',
      organizationId: 'org_atelier',
      marketplaceAccountId: 'mkt_amazon_vendor',
      appId: 'amzn1.sp.solution.sind-and-sind-vendor',
      scope: ['vendor_orders', 'vendor_payments', 'vendor_inventory', 'vendor_direct_fulfillment'],
      status: CONNECTION_STATUS.NOT_CONNECTED,
      lastSyncTimestamp: null,
      lastSyncStatus: null
    });
    this.connections.set(vendorConnection.id, vendorConnection);
  }

  getOrganization(orgId) {
    return this.organizations.get(orgId) || null;
  }

  getAccounts(organizationId) {
    return Array.from(this.accounts.values()).filter(a => a.organizationId === organizationId);
  }

  getAccount(accountId) {
    return this.accounts.get(accountId) || null;
  }

  getConnection(organizationId, marketplaceAccountId) {
    return Array.from(this.connections.values()).find(
      c => c.organizationId === organizationId && c.marketplaceAccountId === marketplaceAccountId
    ) || null;
  }

  saveConnection(connection) {
    this.connections.set(connection.id, connection);
    return connection;
  }

  saveOrders(organizationId, orders) {
    if (!this.canonicalOrders.has(organizationId)) {
      this.canonicalOrders.set(organizationId, []);
    }
    const existing = this.canonicalOrders.get(organizationId);
    const orderMap = new Map(existing.map(o => [o.id, o]));
    for (const o of orders) {
      orderMap.set(o.id, o);
    }
    this.canonicalOrders.set(organizationId, Array.from(orderMap.values()));
  }

  getOrders(organizationId) {
    return this.canonicalOrders.get(organizationId) || [];
  }

  saveInventory(organizationId, positions) {
    if (!this.canonicalInventory.has(organizationId)) {
      this.canonicalInventory.set(organizationId, []);
    }
    const existing = this.canonicalInventory.get(organizationId);
    const posMap = new Map(existing.map(p => [p.sku, p]));
    for (const p of positions) {
      posMap.set(p.sku, p);
    }
    this.canonicalInventory.set(organizationId, Array.from(posMap.values()));
  }

  getInventory(organizationId) {
    return this.canonicalInventory.get(organizationId) || [];
  }

  saveFinances(organizationId, events) {
    if (!this.canonicalFinances.has(organizationId)) {
      this.canonicalFinances.set(organizationId, []);
    }
    const existing = this.canonicalFinances.get(organizationId);
    const eventMap = new Map(existing.map(e => [e.eventId, e]));
    for (const e of events) {
      eventMap.set(e.eventId, e);
    }
    this.canonicalFinances.set(organizationId, Array.from(eventMap.values()));
  }

  getFinances(organizationId) {
    return this.canonicalFinances.get(organizationId) || [];
  }
}

export const marketplaceStore = new MarketplaceStore();
