// Express API Routes for Marketplace Data Connectivity
import express from 'express';
import { oauthManager } from '../marketplace/security/OAuthManager.js';
import { auditLogger } from '../marketplace/security/AuditLogger.js';
import { rateLimitManager } from '../marketplace/resilience/RateLimitManager.js';
import { marketplaceStore } from '../marketplace/store/MarketplaceStore.js';
import { syncOrchestrator } from '../marketplace/pipeline/SyncOrchestrator.js';
import { DataReconciliationEngine } from '../marketplace/pipeline/DataReconciliationEngine.js';
import { CONNECTION_STATUS } from '../../src/lib/marketplace/constants.js';

const router = express.Router();

// Middleware to extract tenant context (defaulting to demo org for seamless operator experience)
function getTenantContext(req) {
  const organizationId = req.headers['x-organization-id'] || req.query.orgId || 'org_atelier';
  const marketplaceAccountId = req.headers['x-marketplace-account-id'] || req.query.accountId || 'mkt_amazon_in';
  return { organizationId, marketplaceAccountId };
}

// 1. Get Integration & Connection Status Overview
router.get('/status', (req, res) => {
  const { organizationId } = getTenantContext(req);
  const organization = marketplaceStore.getOrganization(organizationId);
  const accounts = marketplaceStore.getAccounts(organizationId);

  const accountStatuses = accounts.map(acc => {
    const conn = marketplaceStore.getConnection(organizationId, acc.id);
    const tokenStatus = oauthManager.getTokenStatus(conn?.id || `conn_${organizationId}_${acc.id}`);
    
    return {
      account: acc,
      connection: conn ? conn.toSafeJSON() : null,
      tokenHealth: tokenStatus
    };
  });

  const rateLimits = rateLimitManager.getStatus();

  res.json({
    success: true,
    organization,
    accounts: accountStatuses,
    rateLimits,
    serverTimestamp: new Date().toISOString()
  });
});

// 2. Generate Amazon OAuth Authorization URL
router.post('/amazon/auth-url', (req, res) => {
  const { organizationId, marketplaceAccountId } = getTenantContext(req);
  const { region = 'IN', isVendor = false } = req.body;

  try {
    const authData = oauthManager.getAuthorizationUrl({
      organizationId,
      marketplaceAccountId,
      region,
      isVendor
    });

    res.json({
      success: true,
      ...authData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Handle Amazon OAuth Callback & Code Exchange
router.post('/amazon/callback', async (req, res) => {
  const { code, state, sellingPartnerId } = req.body;

  if (!code || !state) {
    return res.status(400).json({ success: false, error: 'Missing code or state parameter' });
  }

  try {
    const exchangeResult = await oauthManager.exchangeAuthCode({
      code,
      state,
      sellingPartnerId
    });

    // Update connection status in store
    const verification = oauthManager.verifyState ? { valid: true } : { valid: true };
    // Fetch and update connection
    const parts = Buffer.from(state.split('.')[0], 'base64url').toString('utf8').split(':');
    const orgId = parts[0] || 'org_atelier';
    const accId = parts[1] || 'mkt_amazon_in';

    const conn = marketplaceStore.getConnection(orgId, accId);
    if (conn) {
      conn.status = CONNECTION_STATUS.CONNECTED;
      conn.updatedAt = new Date().toISOString();
      marketplaceStore.saveConnection(conn);
    }

    const account = marketplaceStore.getAccount(accId);
    if (account) {
      account.status = CONNECTION_STATUS.CONNECTED;
      account.sellerPartnerId = exchangeResult.sellingPartnerId;
      account.updatedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      ...exchangeResult
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Trigger Data Sync Pipeline
router.post('/sync', async (req, res) => {
  const { organizationId, marketplaceAccountId } = getTenantContext(req);
  const targetAccountId = req.body.marketplaceAccountId || marketplaceAccountId;

  try {
    const syncResult = await syncOrchestrator.runSync({
      organizationId,
      marketplaceAccountId: targetAccountId
    });

    res.json({
      success: true,
      syncResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Get Financial & Inventory Reconciliation Report
router.get('/reconciliation', (req, res) => {
  const { organizationId } = getTenantContext(req);
  const orders = marketplaceStore.getOrders(organizationId);
  const finances = marketplaceStore.getFinances(organizationId);
  const inventory = marketplaceStore.getInventory(organizationId);

  const orderReconciliation = DataReconciliationEngine.reconcileOrdersWithFinances(orders, finances);
  const inventoryReconciliation = DataReconciliationEngine.reconcileInventory(inventory);

  res.json({
    success: true,
    organizationId,
    timestamp: new Date().toISOString(),
    orderReconciliation,
    inventoryReconciliation
  });
});

// 6. Disconnect Marketplace Account
router.post('/disconnect', (req, res) => {
  const { organizationId, marketplaceAccountId } = getTenantContext(req);
  const targetAccountId = req.body.marketplaceAccountId || marketplaceAccountId;

  const conn = marketplaceStore.getConnection(organizationId, targetAccountId);
  if (conn) {
    conn.status = CONNECTION_STATUS.NOT_CONNECTED;
    conn.lastSyncStatus = null;
    conn.updatedAt = new Date().toISOString();
    marketplaceStore.saveConnection(conn);
    oauthManager.revokeToken(conn.id);
  }

  const account = marketplaceStore.getAccount(targetAccountId);
  if (account) {
    account.status = CONNECTION_STATUS.NOT_CONNECTED;
    account.updatedAt = new Date().toISOString();
  }

  auditLogger.log({
    organizationId,
    marketplaceAccountId: targetAccountId,
    action: 'MARKETPLACE_DISCONNECTED',
    status: 'SUCCESS',
    details: { accountId: targetAccountId }
  });

  res.json({
    success: true,
    status: CONNECTION_STATUS.NOT_CONNECTED
  });
});

// 7. Get Tenant Audit Logs (Sanitized)
router.get('/audit-logs', (req, res) => {
  const { organizationId } = getTenantContext(req);
  const limit = parseInt(req.query.limit, 10) || 50;
  const logs = auditLogger.getByTenant(organizationId, limit);

  res.json({
    success: true,
    logs
  });
});

export default router;
