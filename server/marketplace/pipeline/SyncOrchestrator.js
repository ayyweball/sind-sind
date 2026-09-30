// Marketplace Sync Orchestration Workflow
import { SellerCentralAdapter } from '../providers/SellerCentralAdapter.js';
import { VendorCentralAdapter } from '../providers/VendorCentralAdapter.js';
import { RawIngestionValidator } from './RawIngestionValidator.js';
import { AmazonDataNormalizer } from './AmazonDataNormalizer.js';
import { DataReconciliationEngine } from './DataReconciliationEngine.js';
import { marketplaceStore } from '../store/MarketplaceStore.js';
import { auditLogger } from '../security/AuditLogger.js';
import { CONNECTION_STATUS, ACCOUNT_TYPES } from '../../../src/lib/marketplace/constants.js';

export class SyncOrchestrator {
  constructor() {
    this.sellerAdapter = new SellerCentralAdapter();
    this.vendorAdapter = new VendorCentralAdapter();
  }

  async runSync({ organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in' }) {
    const startTime = Date.now();
    const connection = marketplaceStore.getConnection(organizationId, marketplaceAccountId);
    const account = marketplaceStore.getAccount(marketplaceAccountId);

    if (!connection) {
      throw new Error(`Connection not found for organization ${organizationId} and account ${marketplaceAccountId}`);
    }

    connection.status = CONNECTION_STATUS.SYNCING;
    marketplaceStore.saveConnection(connection);

    auditLogger.log({
      organizationId,
      marketplaceAccountId,
      action: 'SYNC_STARTED',
      status: 'SUCCESS',
      details: { accountType: account?.accountType }
    });

    const syncResult = {
      jobId: `job_${Date.now()}`,
      organizationId,
      marketplaceAccountId,
      accountType: account?.accountType || ACCOUNT_TYPES.SELLER_CENTRAL,
      ordersSynced: 0,
      orderItemsSynced: 0,
      inventoryPositionsSynced: 0,
      financialEventsSynced: 0,
      reconciliation: null,
      errors: [],
      status: 'SUCCESS'
    };

    try {
      if (account?.accountType === ACCOUNT_TYPES.VENDOR_CENTRAL) {
        // Vendor Central 1P Sync
        const rawPOs = await this.vendorAdapter.getPurchaseOrders({ organizationId, marketplaceAccountId });
        const canonicalPOs = [];
        for (const po of rawPOs) {
          const validation = RawIngestionValidator.validateOrder(po);
          if (validation.valid) {
            canonicalPOs.push(AmazonDataNormalizer.normalizeVendorPurchaseOrder(po, { organizationId, marketplaceAccountId }));
          } else {
            syncResult.errors.push({ type: 'PO_VALIDATION_ERROR', errors: validation.errors });
          }
        }
        marketplaceStore.saveOrders(organizationId, canonicalPOs);
        syncResult.ordersSynced = canonicalPOs.length;
      } else {
        // Seller Central 3P Sync
        // 1. Fetch & Normalize Orders
        const rawOrders = await this.sellerAdapter.getOrders({ organizationId, marketplaceAccountId });
        const canonicalOrders = [];
        for (const rawOrder of rawOrders) {
          const validation = RawIngestionValidator.validateOrder(rawOrder);
          if (validation.valid) {
            canonicalOrders.push(AmazonDataNormalizer.normalizeOrder(rawOrder, { organizationId, marketplaceAccountId }));
          } else {
            syncResult.errors.push({ type: 'ORDER_VALIDATION_ERROR', errors: validation.errors });
          }
        }
        marketplaceStore.saveOrders(organizationId, canonicalOrders);
        syncResult.ordersSynced = canonicalOrders.length;

        // 2. Fetch & Normalize Inventory
        const rawInventory = await this.sellerAdapter.getInventorySummaries({ organizationId, marketplaceAccountId });
        const canonicalInventory = [];
        for (const rawInv of rawInventory) {
          const validation = RawIngestionValidator.validateInventory(rawInv);
          if (validation.valid) {
            canonicalInventory.push(AmazonDataNormalizer.normalizeInventorySummary(rawInv, { organizationId, marketplaceAccountId }));
          } else {
            syncResult.errors.push({ type: 'INVENTORY_VALIDATION_ERROR', errors: validation.errors });
          }
        }
        marketplaceStore.saveInventory(organizationId, canonicalInventory);
        syncResult.inventoryPositionsSynced = canonicalInventory.length;

        // 3. Fetch & Normalize Financial Events
        const rawFinances = await this.sellerAdapter.getFinancialEvents({ organizationId, marketplaceAccountId });
        const canonicalEvents = AmazonDataNormalizer.normalizeFinancialEvents(rawFinances, { organizationId, marketplaceAccountId });
        marketplaceStore.saveFinances(organizationId, canonicalEvents);
        syncResult.financialEventsSynced = canonicalEvents.length;

        // 4. Run Reconciliation
        syncResult.reconciliation = DataReconciliationEngine.reconcileOrdersWithFinances(
          canonicalOrders,
          canonicalEvents
        );
        syncResult.inventoryReconciliation = DataReconciliationEngine.reconcileInventory(canonicalInventory);
      }

      connection.status = CONNECTION_STATUS.SYNC_COMPLETE;
      connection.lastSyncTimestamp = new Date().toISOString();
      connection.lastSyncStatus = 'SUCCESS';
      connection.syncErrors = syncResult.errors;
      marketplaceStore.saveConnection(connection);

      const durationMs = Date.now() - startTime;
      auditLogger.log({
        organizationId,
        marketplaceAccountId,
        action: 'SYNC_COMPLETED',
        status: 'SUCCESS',
        details: {
          durationMs,
          ordersSynced: syncResult.ordersSynced,
          inventoryPositionsSynced: syncResult.inventoryPositionsSynced,
          financialEventsSynced: syncResult.financialEventsSynced
        }
      });

      return syncResult;
    } catch (error) {
      connection.status = CONNECTION_STATUS.ERROR;
      connection.lastSyncStatus = 'FAILED';
      connection.syncErrors = [{ message: error.message, stack: error.stack }];
      marketplaceStore.saveConnection(connection);

      auditLogger.log({
        organizationId,
        marketplaceAccountId,
        action: 'SYNC_FAILED',
        status: 'FAILED',
        details: { error: error.message }
      });

      throw error;
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
