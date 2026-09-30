import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { initialDemoData } from '../data/demoStore.js';
import {
  calculateInventoryCapital,
  calculateStoreInventoryCapital,
  calculatePurchaseCommitments,
  calculateSupplierPaymentTiming,
  calculateChannelSettlementExposure,
  calculateStoreSettlementExposure,
  calculateOperatingCashFloat,
  calculateReturnCashExposure,
  calculateCashConversionExposure,
  calculateCashExposureWaterfall,
  calculateSKUWorkingCapital,
  detectWorkingCapitalFindings,
  calculateSKUEconomics,
  calculateStoreEconomics,
  compareSKUChannels,
  calculatePriceEconomics
} from './economics.js';

import {
  DATA_QUALITY,
  PAYMENT_TERMS,
  SETTLEMENT_CYCLES,
  PO_STATUS,
  SETTLEMENT_STATUS,
  WORKING_CAPITAL_THRESHOLDS,
  MARKETPLACE_CHANNELS
} from './economicRules.js';

describe('Working Capital & Cash Exposure Engine (Phase 8)', () => {
  const data = initialDemoData;
  const products = data.products;

  // 1. Inventory capital calculation at cost
  it('1. Inventory capital: strictly calculates stock units × unit COGS (never at list price or ASP)', () => {
    const woolCoat = products.find(p => p.sku === 'WOL-COAT-CAM');
    const inv = calculateInventoryCapital(woolCoat, data);

    assert.ok(inv);
    assert.equal(inv.stockUnits, 480);
    assert.equal(inv.unitCOGS, 4100);
    // 480 units * ₹4100 = ₹1,968,000 inventory capital (NOT 480 * ₹9500 = ₹4,560,000 list revenue)
    assert.equal(inv.inventoryCapital, 1968000);
    assert.notEqual(inv.inventoryCapital, 480 * woolCoat.price);
  });

  // 2. Coverage calculation
  it('2. Coverage calculation: correctly computes stockUnits / dailyVelocity', () => {
    const sneaker = products.find(p => p.sku === 'SNK-BLK-09');
    const inv = calculateInventoryCapital(sneaker, data);

    assert.ok(inv);
    assert.equal(inv.stockUnits, 98);
    assert.equal(inv.dailyVelocity, 14.8);
    assert.ok(Math.abs(inv.coverageDays - (98 / 14.8)) < 0.01);
  });

  // 3. Lead-time comparison
  it('3. Lead-time comparison: detects below lead-time coverage and excess runway', () => {
    const sneaker = products.find(p => p.sku === 'SNK-BLK-09');
    const sneakerInv = calculateInventoryCapital(sneaker, data);
    // Sneaker coverage ~6.6d is below 14d lead time
    assert.equal(sneakerInv.isBelowLeadTime, true);
    assert.equal(sneakerInv.isExcess, false);

    const woolCoat = products.find(p => p.sku === 'WOL-COAT-CAM');
    const coatInv = calculateInventoryCapital(woolCoat, data);
    // Coat coverage ~266d is well above 90d excess threshold
    assert.equal(coatInv.isExcess, true);
    assert.equal(coatInv.isBelowLeadTime, false);
  });

  // 4. Open PO commitments
  it('4. Open PO commitments: calculates open units and committed value as future commitments', () => {
    const commitments = calculatePurchaseCommitments(data);

    assert.ok(commitments);
    assert.equal(commitments.openPOCount, 3); // PO-088, PO-091, PO-095 (PO-072 is RECEIVED)
    // Units: 120 (Silk) + 80 (Coat) + 150 (Sneaker) = 350 units
    assert.equal(commitments.openUnits, 350);
    // Value: 234,000 + 328,000 + 247,500 = 809,500
    assert.equal(commitments.totalCommittedValue, 809500);
    assert.ok(commitments.openPOs.every(po => po.status !== PO_STATUS.RECEIVED));
  });

  // 5. Supplier payment timing
  it('5. Supplier payment timing: itemizes payables schedule and calculates supplier credit float', () => {
    const timing = calculateSupplierPaymentTiming(data);

    assert.ok(timing);
    assert.equal(timing.totalOutstandingPayables, 809500);
    assert.equal(timing.supplierCreditFloat, 809500);
    assert.equal(timing.payablesSchedule.length, 3);
    assert.ok(timing.payablesSchedule.some(p => p.paymentTerms === PAYMENT_TERMS.NET_45));
    assert.ok(timing.payablesSchedule.some(p => p.paymentTerms === PAYMENT_TERMS.NET_30));
  });

  // 6. Settlement exposure
  it('6. Settlement exposure: computes channel gross sales and net settlement exposure', () => {
    const amazonChannel = MARKETPLACE_CHANNELS.AMAZON_FBA;
    const exposure = calculateChannelSettlementExposure(amazonChannel, data);

    assert.ok(exposure);
    assert.equal(exposure.channelId, 'amazon_fba');
    assert.equal(exposure.grossSales, 114800);
    assert.equal(exposure.deductions, 19850);
    assert.equal(exposure.refundWithholdings, 3444);
    // Net: 114800 - 19850 - 3444 = 91506
    assert.equal(exposure.expectedNetSettlement, 91506);
    assert.equal(exposure.outstandingExposure, 91506);
  });

  // 7. Settlement deductions
  it('7. Settlement deductions: verifies expected net settlement accounts for platform take-rates', () => {
    const storeSettlement = calculateStoreSettlementExposure(data);

    assert.ok(storeSettlement);
    assert.equal(storeSettlement.totalGrossSales, 64200 + 114800 + 48600); // 227,600
    assert.equal(storeSettlement.totalExpectedNetSettlement, 62916 + 91506 + 36693); // 191,115
    assert.equal(storeSettlement.totalOutstandingSettlementExposure, 191115);
  });

  // 8. Operating cash float
  it('8. Operating cash float: aggregates advertising, shipping, and packaging requirements', () => {
    const float = calculateOperatingCashFloat(data, 28);

    assert.ok(float);
    assert.equal(float.windowDays, 28);
    assert.ok(float.adSpendOutflow > 0);
    assert.ok(float.forwardShippingOutflow > 0);
    assert.ok(float.packagingOutflow > 0);
    assert.equal(float.totalOperatingCashFloat, float.adSpendOutflow + float.forwardShippingOutflow + float.packagingOutflow + float.otherOperatingOutflow);
    assert.ok(float.dailyOperatingFloatRunRate > 0);
  });

  // 9. Return cash exposure
  it('9. Return cash exposure: captures customer refunds and reverse logistics cash drain', () => {
    const returnExp = calculateReturnCashExposure(data);

    assert.ok(returnExp);
    assert.equal(returnExp.returnCount, data.returns.length);
    assert.ok(returnExp.customerRefundOutflow > 0);
    assert.equal(returnExp.reverseLogisticsCourierOutflow, data.returns.length * 140.0);
    assert.equal(returnExp.totalReturnCashExposure, returnExp.customerRefundOutflow + returnExp.reverseLogisticsCourierOutflow);
  });

  // 10. Cash conversion exposure
  it('10. Cash conversion exposure: calculates Inventory Days + Settlement Days - Supplier Payment Days', () => {
    const silkDress = products.find(p => p.sku === 'SLK-SLP-EMR');
    const ccc = calculateCashConversionExposure(silkDress, data, MARKETPLACE_CHANNELS.SHOPIFY_D2C);

    assert.ok(ccc);
    assert.equal(ccc.label, 'Estimated Cash Conversion Exposure');
    assert.equal(ccc.settlementDays, 3); // Shopify D2C Net 3
    assert.equal(ccc.supplierPaymentDays, 30); // Studio Knitters Net 30
    assert.equal(ccc.estimatedCashConversionDays, ccc.inventoryDays + ccc.settlementDays - ccc.supplierPaymentDays);
  });

  // 11. Cash exposure waterfall
  it('11. Cash exposure waterfall: generates transparent multi-driver exposure reconciliation', () => {
    const waterfall = calculateCashExposureWaterfall(data);

    assert.ok(waterfall);
    assert.ok(waterfall.inventoryCapital > 0);
    assert.ok(waterfall.openPOCommitments > 0);
    assert.ok(waterfall.operatingCashFloat > 0);
    assert.ok(waterfall.returnCashExposure > 0);
    assert.ok(waterfall.expectedNetSettlement > 0);
    assert.ok(waterfall.supplierCreditFloat > 0);

    const calculatedNet = (waterfall.inventoryCapital + waterfall.openPOCommitments + waterfall.operatingCashFloat + waterfall.returnCashExposure)
      - (waterfall.expectedNetSettlement + waterfall.supplierCreditFloat);

    assert.equal(waterfall.estimatedNetCashExposure, calculatedNet);
    assert.equal(waterfall.waterfallSteps.length, 7);
  });

  // 12. Current vs future exposure separation
  it('12. Current vs future exposure separation: clearly separates on-hand inventory from open commitments', () => {
    const storeInv = calculateStoreInventoryCapital(data);
    const commitments = calculatePurchaseCommitments(data);

    // Current Inventory is distinct from Open POs
    assert.notEqual(storeInv.totalInventoryCapital, commitments.totalCommittedValue);
    assert.ok(storeInv.totalInventoryUnits > 0);
    assert.ok(commitments.openUnits > 0);
  });

  // 13. Supplier credit treatment
  it('13. Supplier credit treatment: correctly nets supplier credit from gross cash exposure', () => {
    const supplierTiming = calculateSupplierPaymentTiming(data);
    const waterfall = calculateCashExposureWaterfall(data);

    assert.equal(waterfall.supplierCreditFloat, supplierTiming.totalOutstandingPayables);
    // Supplier credit reduces net cash exposure
    assert.ok(waterfall.estimatedNetCashExposure < (waterfall.inventoryCapital + waterfall.openPOCommitments + waterfall.operatingCashFloat + waterfall.returnCashExposure));
  });

  // 14. Capital concentration
  it('14. Capital concentration: calculates Top 3 SKU capital share and category distribution', () => {
    const storeInv = calculateStoreInventoryCapital(data);

    assert.ok(storeInv.top3ConcentrationPct > 0 && storeInv.top3ConcentrationPct <= 100);
    assert.ok(storeInv.categoryBreakdown.length > 0);
    assert.equal(
      Math.round(storeInv.categoryBreakdown.reduce((sum, c) => sum + c.capitalSharePct, 0)),
      100
    );
  });

  // 15. SKU working capital dossier
  it('15. SKU working capital dossier: integrates unit inventory, float, commitments, and tension analysis', () => {
    const coat = products.find(p => p.sku === 'WOL-COAT-CAM');
    const skuWc = calculateSKUWorkingCapital(coat, data);

    assert.ok(skuWc);
    assert.equal(skuWc.sku, 'WOL-COAT-CAM');
    assert.equal(skuWc.inventory.stockUnits, 480);
    assert.equal(skuWc.inventory.inventoryCapital, 1968000);
    assert.equal(skuWc.openCommitments.committedValue, 328000);
    assert.ok(skuWc.tensionAnalysis.length > 0);
  });

  // 16. Working capital findings
  it('16. Working capital findings: detects prioritized operating findings with Phase 4 labels', () => {
    const findings = detectWorkingCapitalFindings(data);

    assert.ok(findings.length >= 3);
    const priorities = new Set(findings.map(f => f.priorityLabel));
    assert.ok(priorities.has('IMMEDIATE ATTENTION') || priorities.has('REVIEW REQUIRED') || priorities.has('MONITOR') || priorities.has('OBSERVATION'));
    // Ensure generic alerting terms are not used
    assert.ok(!priorities.has('CRITICAL') && !priorities.has('WARNING') && !priorities.has('ALERT'));
  });

  // 17. Missing data handling
  it('17. Missing data handling: handles empty/missing purchase orders or inventory safely', () => {
    const emptyData = { products: [products[0]], inventory: [], purchaseOrders: [], settlements: [], returns: [], orders: [], orderItems: [] };
    const inv = calculateInventoryCapital(products[0], emptyData);
    assert.equal(inv.stockUnits, 0);
    assert.equal(inv.inventoryCapital, 0);

    const commitments = calculatePurchaseCommitments(emptyData);
    assert.equal(commitments.openPOCount, 0);
    assert.equal(commitments.totalCommittedValue, 0);

    const waterfall = calculateCashExposureWaterfall(emptyData);
    assert.equal(waterfall.estimatedNetCashExposure, 0);
  });

  // 18. Provenance metadata validation
  it('18. Provenance metadata: attaches Observed, Calculated, and Demo Assumption metadata', () => {
    const inv = calculateInventoryCapital(products[0], data);
    assert.equal(inv.provenance.stockUnits, DATA_QUALITY.OBSERVED);
    assert.equal(inv.provenance.unitCOGS, DATA_QUALITY.OBSERVED);
    assert.equal(inv.provenance.inventoryCapital, DATA_QUALITY.CALCULATED);

    const supplierTiming = calculateSupplierPaymentTiming(data);
    assert.equal(supplierTiming.provenance.supplierCreditFloat, DATA_QUALITY.DEMO_ASSUMPTION);
  });

  // 19. Configured assumptions tagging
  it('19. Configured assumptions tagging: verifies all channel settlement and payment rules are tagged', () => {
    const rules = data.channelSettlementRules;
    assert.ok(rules.every(r => r.source === 'Configured Demo Assumption'));
    const suppliers = data.suppliers;
    assert.ok(suppliers.every(s => s.source === 'Configured Demo Assumption'));
  });

  // 20. Scenario / demand response disclaimer
  it('20. Scenario disclaimer: verifies cash conversion estimates carry non-GAAP operating note', () => {
    const ccc = calculateCashConversionExposure(products[0], data);
    assert.ok(ccc.disclaimer.includes('Operational estimation'));
  });

  // 21. Regression coverage for Phases 5–7
  it('21. Regression coverage: Phase 5 unit economics, Phase 6 marketplaces, and Phase 7 pricing pass without deviation', () => {
    const coat = products.find(p => p.sku === 'WOL-COAT-CAM');
    const skuEcon = calculateSKUEconomics(coat, data);
    assert.ok(skuEcon.grossProfit > 0);
    assert.ok(skuEcon.trueContribution > 0);

    const channelComparison = compareSKUChannels(coat, data);
    assert.ok(channelComparison.profiles.length >= 3);

    const priceEcon = calculatePriceEconomics(coat, data);
    assert.ok(priceEcon.unitRealizedPrice > 0);
    assert.ok(priceEcon.maxDiscount.requiredRealizedPrice > 0);
  });
});
