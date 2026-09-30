import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { initialDemoData } from '../data/demoStore.js';
import {
  calculateWarehouseUtilization,
  calculateWarehouseEconomics,
  calculateStoreWarehouseEconomics,
  calculateFulfilmentEconomics,
  calculateDeliveryPerformance,
  calculateShippingLanes,
  calculateFulfilmentReturnAnalysis,
  calculateSKUOperations,
  detectOperationsFindings,
  calculateStoreEconomics,
  calculateSKUEconomics,
  compareSKUChannels,
  calculatePriceEconomics,
  calculateCashExposureWaterfall
} from './economics.js';
import {
  WAREHOUSE_CONFIGS,
  OPERATIONS_THRESHOLDS,
  DATA_QUALITY
} from './economicRules.js';

describe('Operations & Fulfilment Economics Engine (Phase 9)', () => {
  const demoData = initialDemoData;
  const sampleProduct = demoData.products[0]; // Classic Leather Sneaker
  const sampleWarehouse = demoData.warehouses ? demoData.warehouses[0] : WAREHOUSE_CONFIGS.WH_BOM;
  const sampleOrder = demoData.orders[0];

  it('1. Warehouse capacity utilization: computes storage capacity, units on-hand, and headroom', () => {
    const util = calculateWarehouseUtilization(sampleWarehouse, demoData);
    assert.ok(util, 'Utilization object should be returned');
    assert.equal(util.warehouseId, 'WH-BOM');
    assert.equal(util.capacityUnits, 2500);
    assert.ok(util.currentUnits > 0, 'Current units should be greater than 0');
    assert.ok(util.capacityUtilizationPct > 0 && util.capacityUtilizationPct < 100);
    assert.equal(util.capacityHeadroomUnits, util.capacityUnits - util.currentUnits);
    assert.equal(util.provenance.capacityUnits, DATA_QUALITY.DEMO_ASSUMPTION);
    assert.equal(util.provenance.capacityUtilizationPct, DATA_QUALITY.CALCULATED);
  });

  it('2. Processing utilization: computes daily order volume vs rated capacity throughput', () => {
    const util = calculateWarehouseUtilization(sampleWarehouse, demoData);
    assert.ok(util.dailyProcessingCapacity > 0, 'Daily processing capacity should be present');
    assert.ok(util.dailyDispatchedVolume >= 0, 'Daily dispatched volume should be calculated');
    assert.ok(util.processingUtilizationPct >= 0, 'Processing utilization % should be calculated');
  });

  it('3. Inventory by warehouse: aggregates multi-facility inventory correctly', () => {
    const storeWh = calculateStoreWarehouseEconomics(demoData);
    assert.ok(storeWh.warehouseCount >= 3, 'Network should include at least 3 warehouses');
    assert.ok(storeWh.totalCapacityUnits > 5000, 'Total capacity units should aggregate network');
    assert.ok(storeWh.totalStoredUnits > 0, 'Total stored units should be positive');
    assert.ok(storeWh.blendedCapacityUtilizationPct > 0);
  });

  it('4. Fulfilment economics: itemizes pick/pack, shipping, packaging, and overhead per order', () => {
    const fe = calculateFulfilmentEconomics(sampleOrder, demoData);
    assert.ok(fe, 'Order fulfilment economics should be calculated');
    assert.equal(fe.orderId, sampleOrder.id);
    assert.ok(fe.pickPackCost > 0, 'Pick and pack cost should be calculated');
    assert.ok(fe.forwardShippingCost > 0, 'Forward shipping cost should be calculated');
    assert.ok(fe.packagingCost > 0, 'Packaging cost should be calculated');
    assert.ok(fe.facilityOverhead > 0, 'Facility overhead should be calculated');
    assert.equal(fe.totalFulfilmentCost, fe.pickPackCost + fe.forwardShippingCost + fe.packagingCost + fe.facilityOverhead);
    assert.ok(fe.contributionAfterFulfilment !== undefined);
  });

  it('5. Warehouse economics: computes orders processed, total facility costs, and avg transit', () => {
    const we = calculateWarehouseEconomics(sampleWarehouse, demoData);
    assert.ok(we, 'Warehouse economics should be computed');
    assert.ok(we.ordersProcessed > 0, 'Orders processed should be calculated');
    assert.ok(we.totalFacilityFulfilmentCost > 0, 'Total facility cost should be positive');
    assert.ok(we.costPerOrder > 0, 'Cost per order should be computed');
    assert.ok(we.avgTransitDays > 0, 'Average transit days should be positive');
    assert.ok(we.onTimeDeliveryPct >= 0 && we.onTimeDeliveryPct <= 100);
  });

  it('6. Delivery performance: computes dispatch time, transit time, and total delivery cycle', () => {
    const dp = calculateDeliveryPerformance(demoData);
    assert.ok(dp.totalEvents > 0, 'Total fulfillment events should be calculated');
    assert.ok(dp.avgDispatchDays > 0, 'Avg dispatch days should be positive');
    assert.ok(dp.avgTransitDays > 0, 'Avg transit days should be positive');
    assert.equal(dp.avgTotalDeliveryDays, dp.avgDispatchDays + dp.avgTransitDays);
    assert.equal(dp.targetTransitDays, OPERATIONS_THRESHOLDS.targetTransitDays);
  });

  it('7. SLA variance: measures difference between actual transit and target benchmark', () => {
    const dp = calculateDeliveryPerformance(demoData);
    const expectedVariance = dp.avgTransitDays - dp.targetTransitDays;
    assert.ok(Math.abs(dp.slaVarianceDays - expectedVariance) < 0.001);
  });

  it('8. On-time percentage: calculates on-time shipments against delayed order threshold', () => {
    const dp = calculateDeliveryPerformance(demoData);
    assert.ok(dp.onTimePct >= 0 && dp.onTimePct <= 100);
    assert.ok(dp.totalEvents > 0);
    assert.ok(dp.deliveredCount + dp.inTransitCount <= dp.totalEvents);
  });

  it('9. Shipping lanes analysis: aggregates orders, transit days, SLA variance, and cost by corridor', () => {
    const lanes = calculateShippingLanes(demoData);
    assert.ok(Array.isArray(lanes), 'Lanes should be an array');
    assert.ok(lanes.length > 0, 'Lanes should contain routes');
    const firstLane = lanes[0];
    assert.ok(firstLane.lane.includes('→'), 'Lane name should format Origin → Destination');
    assert.ok(firstLane.orders > 0, 'Lane order volume should be positive');
    assert.ok(firstLane.avgTransitDays > 0, 'Avg transit days should be positive');
    assert.ok(firstLane.avgShippingCost > 0, 'Avg shipping cost should be positive');
    assert.ok(firstLane.onTimePct >= 0 && firstLane.onTimePct <= 100);
  });

  it('10. Shipping cost economics: computes forward shipping cost without double-counting', () => {
    const storeWh = calculateStoreWarehouseEconomics(demoData);
    assert.ok(storeWh.totalShippingCost > 0, 'Total shipping cost should be positive');
    assert.ok(storeWh.totalFulfilmentCost > storeWh.totalShippingCost, 'Fulfilment cost includes pick/pack and overhead');
  });

  it('11. Fulfilment-driven return analysis: evaluates return rate on delayed vs on-time shipments', () => {
    const returnCorr = calculateFulfilmentReturnAnalysis(demoData);
    assert.ok(returnCorr, 'Return correlation object should be returned');
    assert.ok(returnCorr.totalReturns > 0, 'Total returns evaluated should be positive');
    assert.ok(returnCorr.delayedReturnRatePct >= 0);
    assert.ok(returnCorr.onTimeReturnRatePct >= 0);
    assert.ok(returnCorr.observationNote.length > 0);
  });

  it('12. Supplier operational performance: captures lead-time defaults and status in demo dataset', () => {
    assert.ok(demoData.suppliers.length >= 4, 'Demo suppliers should be present');
    const supplier = demoData.suppliers[0];
    assert.ok(supplier.leadTimeDays > 0, 'Lead time days should be specified');
    assert.ok(supplier.paymentTerms, 'Payment terms should be specified');
  });

  it('13. Purchase order operational status: captures production pipeline statuses', () => {
    assert.ok(demoData.purchaseOrders.length >= 4, 'Purchase orders should be present');
    const confirmedPO = demoData.purchaseOrders.find(po => po.status === 'CONFIRMED');
    const inTransitPO = demoData.purchaseOrders.find(po => po.status === 'IN_TRANSIT');
    assert.ok(confirmedPO, 'Confirmed PO should exist in dataset');
    assert.ok(inTransitPO, 'In-transit PO should exist in dataset');
  });

  it('14. SKU operations dossier: integrates warehouse location, fulfillment cost, transit, and SLA', () => {
    const skuOps = calculateSKUOperations(sampleProduct, demoData);
    assert.ok(skuOps, 'SKU operations should be calculated');
    assert.equal(skuOps.sku, sampleProduct.sku);
    assert.ok(skuOps.primaryWarehouse.length > 0, 'Primary warehouse should be assigned');
    assert.ok(skuOps.totalFulfilmentCostPerUnit > 0, 'Unit fulfilment cost should be positive');
    assert.ok(skuOps.avgTransitDays > 0, 'Avg transit days should be positive');
    assert.ok(skuOps.onTimePct >= 0 && skuOps.onTimePct <= 100);
  });

  it('15. Operational findings: detects prioritized operating findings with Phase 4 labels', () => {
    const findings = detectOperationsFindings(demoData);
    assert.ok(Array.isArray(findings), 'Findings should be an array');
    assert.ok(findings.length > 0, 'At least 1 operational finding should be detected');
    
    findings.forEach(f => {
      assert.ok(f.id.startsWith('FIND-OPS-'), 'Finding ID should follow naming convention');
      assert.equal(f.domain, 'OPERATIONS');
      assert.ok(['IMMEDIATE ATTENTION', 'REVIEW REQUIRED', 'MONITOR', 'OBSERVATION'].includes(f.priorityLabel));
      assert.ok(f.title.length > 0, 'Finding must have a title');
      assert.ok(f.summary.length > 0, 'Finding must have a summary');
      assert.ok(Array.isArray(f.evidence) && f.evidence.length > 0, 'Finding must provide evidence');
      assert.ok(f.whyItMatters.length > 0, 'Finding must explain economic implication');
      assert.ok(f.recommendedAction.length > 0, 'Finding must recommend management lever');
      assert.ok(f.actionRoute.length > 0, 'Finding must have action route');
    });
  });

  it('16. Missing data handling: handles empty or null events safely', () => {
    const emptyData = { products: [sampleProduct], inventory: [], orders: [], fulfillmentEvents: [], returns: [] };
    const dp = calculateDeliveryPerformance(emptyData);
    assert.equal(dp.totalEvents, 0);
    assert.equal(dp.onTimePct, 100);

    const storeWh = calculateStoreWarehouseEconomics(emptyData);
    assert.ok(storeWh.warehouseCount >= 3);
    assert.equal(storeWh.totalOrdersProcessed, 0);

    const findings = detectOperationsFindings(emptyData);
    assert.ok(Array.isArray(findings));
  });

  it('17. Provenance metadata: attaches Observed, Calculated, and Demo Assumption provenance tags', () => {
    const util = calculateWarehouseUtilization(sampleWarehouse, demoData);
    assert.equal(util.provenance.capacityUnits, DATA_QUALITY.DEMO_ASSUMPTION);
    assert.equal(util.provenance.capacityUtilizationPct, DATA_QUALITY.CALCULATED);

    const we = calculateWarehouseEconomics(sampleWarehouse, demoData);
    assert.equal(we.provenance.avgTransitDays, DATA_QUALITY.OBSERVED);
    assert.equal(we.provenance.slaVarianceDays, DATA_QUALITY.CALCULATED);
  });

  it('18. Configured assumptions tagging: verifies SLA benchmarks carry Demo Assumption notes', () => {
    const dp = calculateDeliveryPerformance(demoData);
    assert.equal(dp.provenance.targetTransitDays, DATA_QUALITY.DEMO_ASSUMPTION);
  });

  it('19. Regression protection: Phase 5 Unit Economics pass without deviation', () => {
    const storeEco = calculateStoreEconomics(demoData);
    const skuEco = calculateSKUEconomics(sampleProduct, demoData);
    assert.ok(storeEco.realizedRevenue > 0);
    assert.ok(storeEco.trueContribution > 0);
    assert.ok(skuEco.realizedRevenue > 0);
    assert.ok(skuEco.costToServe.totalCostToServe > 0);
    assert.ok(skuEco.trueContribution !== undefined);
  });

  it('20. Regression protection: Phase 6 Marketplace Economics and Phase 7 Pricing pass without deviation', () => {
    const channelComp = compareSKUChannels(sampleProduct, demoData);
    const pricing = calculatePriceEconomics(sampleProduct, demoData);
    assert.ok(channelComp.profiles.length === 5);
    assert.ok(pricing.unitRealizedPrice > 0);
  });

  it('21. Regression protection: Phase 8 Working Capital & Cash Exposure pass without deviation', () => {
    const waterfall = calculateCashExposureWaterfall(demoData);
    assert.ok(waterfall.estimatedNetCashExposure > 0);
    assert.ok(waterfall.waterfallSteps.length === 7);
  });
});
