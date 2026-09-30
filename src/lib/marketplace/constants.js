// Centralized Constants for Marketplace Connectivity & SP-API Integration

export const CONNECTION_STATUS = {
  NOT_CONNECTED: 'NOT_CONNECTED',
  AUTHORIZATION_PENDING: 'AUTHORIZATION_PENDING',
  CONNECTED: 'CONNECTED',
  SYNCING: 'SYNCING',
  SYNC_COMPLETE: 'SYNC_COMPLETE',
  SYNC_PARTIAL: 'SYNC_PARTIAL',
  AUTHORIZATION_EXPIRING: 'AUTHORIZATION_EXPIRING',
  AUTHORIZATION_EXPIRED: 'AUTHORIZATION_EXPIRED',
  REAUTH_REQUIRED: 'REAUTH_REQUIRED',
  ERROR: 'ERROR',
  DISCONNECTED: 'DISCONNECTED'
};

export const ACCOUNT_TYPES = {
  SELLER_CENTRAL: 'SELLER_CENTRAL',
  VENDOR_CENTRAL: 'VENDOR_CENTRAL'
};

export const MARKETPLACE_REGIONS = {
  IN: {
    id: 'A21TJRUUN4KGV',
    name: 'India',
    currency: 'INR',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
    authEndpoint: 'https://sellercentral.amazon.in/apps/authorize/consent'
  },
  NA: {
    id: 'ATVPDKIKX0DER',
    name: 'North America (US)',
    currency: 'USD',
    endpoint: 'https://sellingpartnerapi-na.amazon.com',
    authEndpoint: 'https://sellercentral.amazon.com/apps/authorize/consent'
  },
  EU: {
    id: 'A1F83G8C2ARO7P',
    name: 'Europe (UK)',
    currency: 'GBP',
    endpoint: 'https://sellingpartnerapi-eu.amazon.com',
    authEndpoint: 'https://sellercentral-europe.amazon.com/apps/authorize/consent'
  },
  FE: {
    id: 'A1VC38T7YXB528',
    name: 'Far East (Japan)',
    currency: 'JPY',
    endpoint: 'https://sellingpartnerapi-fe.amazon.com',
    authEndpoint: 'https://sellercentral.amazon.co.jp/apps/authorize/consent'
  }
};

export const SPAPI_ROLES = {
  SELLER: {
    PRICING: 'pricing',
    ORDERS: 'orders',
    FINANCES: 'finances',
    INVENTORY: 'inventory',
    REPORTS: 'reports'
  },
  VENDOR: {
    DIRECT_FULFILLMENT: 'vendor_direct_fulfillment',
    ORDERS: 'vendor_orders',
    PAYMENTS: 'vendor_payments',
    INVENTORY: 'vendor_inventory'
  }
};

export const DATA_PROVENANCE_SOURCE = {
  AMAZON_OBSERVED: 'Amazon Observed Data',
  SHOPIFY_OBSERVED: 'Shopify Observed Data',
  CALCULATED: 'Calculated Value',
  CONFIGURED_ASSUMPTION: 'Configured Demo Assumption',
  UNAVAILABLE: 'Unavailable Data'
};

export const RATE_LIMIT_PROFILES = {
  ORDERS_API: { rate: 0.5, burst: 15, name: 'Orders API' },
  FINANCES_API: { rate: 0.5, burst: 30, name: 'Finances API' },
  INVENTORY_API: { rate: 2.0, burst: 40, name: 'FBA Inventory API' },
  REPORTS_API: { rate: 0.0222, burst: 10, name: 'Reports API' },
  PRODUCT_FEES_API: { rate: 1.0, burst: 20, name: 'Product Fees API' }
};
