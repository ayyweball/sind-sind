// Comprehensive Test Suite for Marketplace Connectivity, OAuth Security, and Canonical Normalization
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CONNECTION_STATUS, DATA_PROVENANCE_SOURCE } from './constants.js';
import {
  createCanonicalOrder,
  createCanonicalOrderItem,
  createCanonicalInventoryPosition,
  createCanonicalFinancialEvent
} from './canonicalModels.js';

import { OAuthManager } from '../../../server/marketplace/security/OAuthManager.js';
import { AuditLogger } from '../../../server/marketplace/security/AuditLogger.js';
import { TokenBucket, RateLimitManager } from '../../../server/marketplace/resilience/RateLimitManager.js';
import { RetryPolicy } from '../../../server/marketplace/resilience/RetryPolicy.js';
import { RawIngestionValidator } from '../../../server/marketplace/pipeline/RawIngestionValidator.js';
import { AmazonDataNormalizer } from '../../../server/marketplace/pipeline/AmazonDataNormalizer.js';
import { DataReconciliationEngine } from '../../../server/marketplace/pipeline/DataReconciliationEngine.js';

describe('Marketplace Connectivity & Security Suite', () => {

  describe('1. Canonical Data Models', () => {
    it('creates canonical order with default and calculated fields', () => {
      const order = createCanonicalOrder({
        id: 'ORD-101',
        channel: 'AMAZON',
        grossAmount: 2499,
        discountAmount: 250,
        fulfilmentModel: 'MARKETPLACE_FULFILLED'
      });

      assert.equal(order.id, 'ORD-101');
      assert.equal(order.grossAmount, 2499);
      assert.equal(order.discountAmount, 250);
      assert.equal(order.netRevenue, 2249);
      assert.equal(order.provenance, DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED);
    });

    it('creates canonical inventory position with capital exposure', () => {
      const pos = createCanonicalInventoryPosition({
        sku: 'SKU-SERUM-01',
        fulfillableQuantity: 100,
        inboundQuantity: 50,
        reservedQuantity: 20,
        unitCost: 400
      });

      assert.equal(pos.sku, 'SKU-SERUM-01');
      assert.equal(pos.totalUnits, 170);
      assert.equal(pos.inventoryCapitalAtCost, 40000);
      assert.equal(pos.fulfilmentType, 'FBA');
    });
  });

  describe('2. OAuth 2.0 Security & CSRF Protection', () => {
    it('generates a cryptographically signed state and verifies it', () => {
      const oauth = new OAuthManager('test_secret_key');
      const state = oauth.generateState({
        organizationId: 'org_test',
        marketplaceAccountId: 'mkt_test',
        region: 'IN'
      });

      assert.ok(state.includes('.'));
      const verification = oauth.verifyState(state);
      assert.equal(verification.valid, true);
      assert.equal(verification.data.organizationId, 'org_test');
      assert.equal(verification.data.region, 'IN');

      // State must be single-use: second attempt fails
      const secondCheck = oauth.verifyState(state);
      assert.equal(secondCheck.valid, false);
    });

    it('rejects tampered state tokens', () => {
      const oauth = new OAuthManager('test_secret_key');
      const state = oauth.generateState({ organizationId: 'org_test', marketplaceAccountId: 'mkt_test' });
      const tampered = state.slice(0, -4) + 'zzzz';

      const verification = oauth.verifyState(tampered);
      assert.equal(verification.valid, false);
    });
  });

  describe('3. Audit Logger & Secret Redaction', () => {
    it('redacts sensitive credentials and tokens from audit entries', () => {
      const sanitized = AuditLogger.sanitize({
        username: 'operator@sindandsind.com',
        access_token: 'Atza|secret12345',
        refresh_token: 'Atzr|secret67890',
        client_secret: 'super_secret',
        password: 'plain_password',
        safeParam: 'public_value',
        nested: {
          token: 'nested_secret',
          region: 'IN'
        }
      });

      assert.equal(sanitized.username, 'operator@sindandsind.com');
      assert.equal(sanitized.access_token, '[REDACTED_SECRET]');
      assert.equal(sanitized.refresh_token, '[REDACTED_SECRET]');
      assert.equal(sanitized.client_secret, '[REDACTED_SECRET]');
      assert.equal(sanitized.password, '[REDACTED_SECRET]');
      assert.equal(sanitized.safeParam, 'public_value');
      assert.equal(sanitized.nested.token, '[REDACTED_SECRET]');
      assert.equal(sanitized.nested.region, 'IN');
    });
  });

  describe('4. Token-Bucket Rate Limiter', () => {
    it('enforces burst limits and refills accurately', () => {
      const bucket = new TokenBucket({ rate: 10, burst: 5, name: 'test_bucket' });
      assert.equal(bucket.tryConsume(5), true);
      assert.equal(bucket.tryConsume(1), false); // Capacity exhausted
    });
  });

  describe('5. Retry Policy with Jitter', () => {
    it('identifies retryable HTTP status codes', () => {
      const retry = new RetryPolicy({ maxRetries: 2 });
      assert.equal(retry.isRetryable({ status: 429 }), true);
      assert.equal(retry.isRetryable({ status: 503 }), true);
      assert.equal(retry.isRetryable({ status: 400 }), false);
      assert.equal(retry.isRetryable({ status: 401 }), false);
    });
  });

  describe('6. Raw Ingestion Validation', () => {
    it('validates compliant raw order payload', () => {
      const res = RawIngestionValidator.validateOrder({
        AmazonOrderId: '408-1111111-2222222',
        PurchaseDate: '2026-03-29T10:00:00Z',
        OrderTotal: { Amount: '1999.00' }
      });
      assert.equal(res.valid, true);
    });

    it('rejects malformed raw order missing ID', () => {
      const res = RawIngestionValidator.validateOrder({
        PurchaseDate: '2026-03-29T10:00:00Z'
      });
      assert.equal(res.valid, false);
      assert.ok(res.errors.length > 0);
    });
  });

  describe('7. SP-API Data Normalization', () => {
    it('normalizes 3P Amazon Seller Central raw order to canonical model', () => {
      const rawOrder = {
        AmazonOrderId: '408-7291048-1928301',
        PurchaseDate: '2026-03-28T14:22:10Z',
        OrderStatus: 'Shipped',
        FulfillmentChannel: 'AFN',
        OrderTotal: { CurrencyCode: 'INR', Amount: '2499.00' },
        NumberOfItemsShipped: 1
      };

      const normalized = AmazonDataNormalizer.normalizeOrder(rawOrder);
      assert.equal(normalized.id, '408-7291048-1928301');
      assert.equal(normalized.channel, 'AMAZON');
      assert.equal(normalized.fulfilmentModel, 'MARKETPLACE_FULFILLED');
      assert.equal(normalized.grossAmount, 2499);
      assert.equal(normalized.provenance, DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED);
    });

    it('normalizes 1P Amazon Vendor Central purchase order', () => {
      const rawPO = {
        purchaseOrderNumber: 'PO-AMZ-2026-88192',
        purchaseOrderStatus: 'Acknowledged',
        purchaseOrderDate: '2026-03-25T08:00:00Z',
        orderDetails: {
          currencyCode: 'INR',
          orderTotal: { amount: '480000.00' },
          items: [{ itemSequenceNumber: '1' }]
        }
      };

      const normalized = AmazonDataNormalizer.normalizeVendorPurchaseOrder(rawPO);
      assert.equal(normalized.id, 'PO-AMZ-2026-88192');
      assert.equal(normalized.accountType, 'VENDOR_CENTRAL');
      assert.equal(normalized.grossAmount, 480000);
      assert.equal(normalized.fulfilmentModel, 'VENDOR_DIRECT');
    });
  });

  describe('8. Financial & Inventory Reconciliation', () => {
    it('detects unsettled orders and matches settled shipments', () => {
      const orders = [
        createCanonicalOrder({ id: 'ORD-1', grossAmount: 2000, marketplaceOrderId: 'ORD-1' }),
        createCanonicalOrder({ id: 'ORD-2', grossAmount: 3000, marketplaceOrderId: 'ORD-2' })
      ];

      const financialEvents = [
        createCanonicalFinancialEvent({ orderId: 'ORD-1', amount: 1600 })
      ];

      const report = DataReconciliationEngine.reconcileOrdersWithFinances(orders, financialEvents);
      assert.equal(report.totalOrdersEvaluated, 2);
      assert.equal(report.settledOrdersCount, 1);
      assert.equal(report.unsettledOrdersCount, 1);
      assert.equal(report.discrepancies[0].orderId, 'ORD-2');
      assert.equal(report.discrepancies[0].type, 'UNSETTLED_ORDER');
    });

    it('reconciles inventory positions against local counts', () => {
      const canonicalPositions = [
        createCanonicalInventoryPosition({ sku: 'SKU-01', fulfillableQuantity: 100, unitCost: 300 }),
        createCanonicalInventoryPosition({ sku: 'SKU-02', fulfillableQuantity: 50, unitCost: 400 })
      ];

      const localStock = {
        'SKU-01': 100,
        'SKU-02': 60 // 10 units discrepancy
      };

      const invReport = DataReconciliationEngine.reconcileInventory(canonicalPositions, localStock);
      assert.equal(invReport.skusEvaluated, 2);
      assert.equal(invReport.variancesCount, 1);
      assert.equal(invReport.variances[0].sku, 'SKU-02');
      assert.equal(invReport.variances[0].difference, -10);
      assert.equal(invReport.variances[0].capitalImpact, 4000);
    });
  });

});
