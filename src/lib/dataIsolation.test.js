import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { initialDemoData } from '../data/demoStore.js';
import { EMPTY_CANONICAL_DATA, TEST_001_DATASET } from './csvImporter.js';
import {
  calculateStoreEconomics,
  calculateSKUEconomics,
  calculateSKUChannelEconomics,
  calculateWarehouseDistributionEconomics,
  calculateCarrierLaneEconomics,
  calculateSupplierPipelineEconomics,
  calculateCapitalFlowLifecycle,
  detectCrossFunctionalFindings,
  compareMarketplaceFeeStructures,
  calculateCompetitivePriceAnalysis,
  calculateMarketplaceFit
} from './economics.js';
import { calculateStoreMetrics, calculateProductPerformance, calculateCatalogSummary } from './metrics.js';
import { generateSignals } from './signals.js';

describe('Data Foundation & Dynamic Mode Isolation Suite', () => {

  // =========================================================================
  // TEST A: EMPTY DATASET (NO SOURCE CONNECTED)
  // =========================================================================
  describe('Test A: Empty Dataset (No Connection / Unconnected State)', () => {
    const emptyData = EMPTY_CANONICAL_DATA;

    it('1. Store Economics returns safe zero metrics without crashing or demo leakage', () => {
      const econ = calculateStoreEconomics(emptyData);
      assert.equal(econ.realizedRevenue, 0);
      assert.equal(econ.totalUnitsSold, 0);
      assert.equal(econ.totalOrderCount, 0);
      assert.equal(econ.grossProfit, 0);
      assert.equal(econ.totalCostToServe, 0);
      assert.equal(econ.trueContribution, 0);
      assert.equal(econ.skuEconomicsList.length, 0);
    });

    it('2. Catalog summary and product performance return empty arrays', () => {
      const catalog = calculateCatalogSummary(emptyData);
      assert.equal(catalog.totalSKUs, 0);
      assert.equal(catalog.totalRevenue, 0);

      const perf = calculateProductPerformance(emptyData);
      assert.equal(perf.length, 0);
    });

    it('3. Operations & Warehouse Economics returns empty arrays without demo facilities', () => {
      const whEcon = calculateWarehouseDistributionEconomics(null, emptyData);
      assert.equal(whEcon.totalNetworkStock, 0);
      assert.equal(whEcon.warehouses.length, 0);
      assert.equal(whEcon.provenance, 'Unavailable Data');

      const carrierEcon = calculateCarrierLaneEconomics(emptyData);
      assert.equal(carrierEcon.carriers.length, 0);
      assert.equal(carrierEcon.shippingLanes.length, 0);
      assert.equal(carrierEcon.provenance, 'Unavailable Data');
    });

    it('4. Working Capital & Capital Flow returns zero exposure', () => {
      const capitalFlow = calculateCapitalFlowLifecycle(emptyData);
      assert.equal(capitalFlow.currentInventoryCapitalAtCost, 0);
      assert.equal(capitalFlow.totalCommittedFutureCapital, 0);
      assert.equal(capitalFlow.settlementDisbursementExposure || 0, 0);

      const supEcon = calculateSupplierPipelineEconomics(emptyData);
      assert.equal(supEcon.suppliers.length, 0);
      assert.equal(supEcon.totalOpenPOs, 0);
    });

    it('5. Operating Findings and Signals return zero findings on empty data', () => {
      const findings = detectCrossFunctionalFindings(emptyData);
      assert.equal(findings.length, 0);

      const signals = generateSignals(emptyData);
      assert.equal(signals.length, 0);
    });
  });

  // =========================================================================
  // TEST B: DEMO DATASET (EXPLICIT DEMO MODE)
  // =========================================================================
  describe('Test B: Explicit Demo Mode (Atelier & Co.)', () => {
    const demoData = initialDemoData;

    it('1. Demo Store computes full catalog metrics for 10 SKUs', () => {
      const econ = calculateStoreEconomics(demoData);
      assert.ok(econ.realizedRevenue > 0);
      assert.equal(econ.skuEconomicsList.length, 10);
      assert.ok(econ.trueContribution > 0);
    });

    it('2. Demo Mode produces Atelier & Co. operating findings', () => {
      const signals = generateSignals(demoData);
      assert.ok(signals.length > 0);
      const sneakerSignal = signals.find(s => s.entityId === 'LTH-SNK-001' || s.title.includes('Classic Leather Sneaker'));
      assert.ok(sneakerSignal, 'Should detect Leather Sneaker finding in Demo dataset');
    });
  });

  // =========================================================================
  // TEST C: CUSTOM IMPORTED DATASET (TEST-001)
  // =========================================================================
  describe('Test C: Custom Imported Dataset (TEST-001) with ZERO Demo Leakage', () => {
    const customData = TEST_001_DATASET;

    it('1. Calculates economics solely based on TEST-001 (10 units, ₹10,000 revenue)', () => {
      const econ = calculateStoreEconomics(customData);
      assert.equal(econ.totalUnitsSold, 10);
      assert.equal(econ.realizedRevenue, 10000);
      assert.equal(econ.skuEconomicsList.length, 1);
      assert.equal(econ.skuEconomicsList[0].sku, 'TEST-001');
    });

    it('2. Warehouse economics calculates from custom Bengaluru warehouse (500 units)', () => {
      const whEcon = calculateWarehouseDistributionEconomics(null, customData);
      assert.equal(whEcon.warehouses.length, 1);
      assert.equal(whEcon.warehouses[0].warehouseId, 'WH-TEST-01');
      assert.equal(whEcon.warehouses[0].stockUnits, 500);
      assert.equal(whEcon.totalNetworkStock, 500);
    });

    it('3. Supplier economics calculates from custom Apex Precision PO (₹40,000)', () => {
      const supEcon = calculateSupplierPipelineEconomics(customData);
      assert.equal(supEcon.suppliers.length, 1);
      assert.equal(supEcon.suppliers[0].name, 'Apex Precision Acoustics Ltd.');
      assert.equal(supEcon.totalOpenPOs, 1);
      assert.equal(supEcon.totalCommittedValue, 40000);
    });

    it('4. Strict Verification: String serialization contains zero traces of Atelier & Co.', () => {
      const econ = calculateStoreEconomics(customData);
      const whEcon = calculateWarehouseDistributionEconomics(null, customData);
      const supEcon = calculateSupplierPipelineEconomics(customData);
      const capital = calculateCapitalFlowLifecycle(customData);

      const allOutputStr = JSON.stringify({ econ, whEcon, supEcon, capital });

      // Invariants: No demo entities leaked
      assert.equal(allOutputStr.includes('Classic Leather Sneaker'), false);
      assert.equal(allOutputStr.includes('Canvas Carryall'), false);
      assert.equal(allOutputStr.includes('Wool Overcoat'), false);
      assert.equal(allOutputStr.includes('Linen Overshirt'), false);
      assert.equal(allOutputStr.includes('Heritage Mills'), false);
      assert.equal(allOutputStr.includes('Northern Leathercraft'), false);
      assert.equal(allOutputStr.includes('PO-2026-088'), false);
      assert.equal(allOutputStr.includes('WH-BOM'), false);
    });
  });

});
