import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSKUEconomics, calculateStoreEconomics, calculateContributionWaterfall } from './economics.js';
import { DEFAULT_ECONOMIC_ASSUMPTIONS, COST_BASIS, DATA_QUALITY } from './economicRules.js';
import { initialDemoData } from '../data/demoStore.js';

describe('Economic Engine — Deterministic Unit & Store Economics', () => {

  const sampleProduct = {
    id: 'PROD-001',
    sku: 'TEST-SKU-01',
    name: 'Test Oxford Shirt',
    category: 'Apparel',
    price: 3000,
    cost: 1000
  };

  const sampleData = {
    orders: [
      { id: 'ORD-101', date: '2026-09-01', total: 2700 },
      { id: 'ORD-102', date: '2026-09-02', total: 2700 }
    ],
    orderItems: [
      { id: 'ITEM-1', orderId: 'ORD-101', productId: 'PROD-001', quantity: 1, unitPrice: 3000, discount: 300, netRevenue: 2700, cogs: 1000 },
      { id: 'ITEM-2', orderId: 'ORD-102', productId: 'PROD-001', quantity: 1, unitPrice: 3000, discount: 300, netRevenue: 2700, cogs: 1000 }
    ],
    adSpend: [
      { id: 'AD-1', date: '2026-09-01', productId: 'PROD-001', spend: 600, attributedOrders: 2, attributedRevenue: 5400 }
    ],
    returns: [
      { id: 'RET-1', orderId: 'ORD-102', productId: 'PROD-001', date: '2026-09-05', reason: 'Sizing Variance', refundAmount: 2700 }
    ]
  };

  it('1. Gross profit calculation: correctly calculates Realized Revenue minus COGS', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    assert.equal(skuEco.realizedRevenue, 5400);
    assert.equal(skuEco.totalCogs, 2000);
    assert.equal(skuEco.grossProfit, 3400);
  });

  it('2. Gross margin % calculation: correctly computes gross profit share of realized revenue', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    const expectedGrossMarginPct = (3400 / 5400) * 100;
    assert.equal(skuEco.grossMarginPct.toFixed(2), expectedGrossMarginPct.toFixed(2));
  });

  it('3. Marketplace fee calculation: applies configured commission rate and order fee', () => {
    const customAssumptions = { marketplaceCommissionPct: 5.0, marketplaceFixedFeePerOrder: 10.0 };
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData, customAssumptions);
    // 5% of 5400 = 270 + 2 orders * 10 = 20 -> 290
    assert.equal(skuEco.costToServe.marketplaceFees, 290);
  });

  it('4. Shipping calculation: computes outbound forward courier cost per order', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData, { forwardShippingCostPerOrder: 100.0 });
    // 2 orders * 100 = 200
    assert.equal(skuEco.costToServe.forwardShippingCost, 200);
  });

  it('5. Packaging calculation: computes bespoke unit packaging cost per unit sold', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData, { packagingCostPerUnit: 35.0 });
    // 2 units * 35 = 70
    assert.equal(skuEco.costToServe.packagingCost, 70);
  });

  it('6. Advertising allocation: captures exact attributed ad spend', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    assert.equal(skuEco.costToServe.advertisingCost, 600);
    assert.equal(skuEco.unitEconomics.unitAdCost, 300); // 600 / 2 units
  });

  it('7. Return cost calculation: includes refund exposure + reverse courier + restocking fee', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData, {
      reverseLogisticsPerReturn: 140.0,
      returnRestockingPerReturn: 60.0
    });
    // 1 return: refund exposure (2700), return friction = reverse freight (140) + restocking (60) = 200
    assert.equal(skuEco.costToServe.refundTotal, 2700);
    assert.equal(skuEco.costToServe.reverseLogisticsCost, 140);
    assert.equal(skuEco.costToServe.returnRestockingCost, 60);
    assert.equal(skuEco.costToServe.returnFrictionCost, 200);
  });

  it('8. Cost-to-serve: sums all variable operating and fulfillment components transparently', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    const cts = skuEco.costToServe;
    const manualSum = cts.marketplaceFees + cts.paymentFees + cts.forwardShippingCost +
      cts.packagingCost + cts.advertisingCost + cts.returnFrictionCost + cts.otherVariableCost;
    assert.equal(cts.totalCostToServe, manualSum);
    assert.equal(cts.costToServePct.toFixed(2), ((manualSum / 5400) * 100).toFixed(2));
  });

  it('9. Contribution: computes True Contribution (Gross Profit - Total Cost-to-Serve)', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    const expectedContribution = skuEco.grossProfit - skuEco.costToServe.totalCostToServe;
    assert.equal(skuEco.trueContribution, expectedContribution);
    assert.equal(skuEco.contributionBeforeAds, skuEco.grossProfit - (skuEco.costToServe.totalCostToServe - skuEco.costToServe.advertisingCost));
  });

  it('10. Contribution margin %: computes contribution value as % of realized revenue', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    const expectedCM = (skuEco.trueContribution / skuEco.realizedRevenue) * 100;
    assert.equal(skuEco.trueContributionMarginPct.toFixed(2), expectedCM.toFixed(2));
  });

  it('11. Zero / missing cost handling: gracefully handles products with zero orders, ads, or returns', () => {
    const zeroProduct = { id: 'PROD-ZERO', sku: 'ZERO-SKU', name: 'Zero Product', price: 2000, cost: 800 };
    const emptyData = { orders: [], orderItems: [], adSpend: [], returns: [] };
    const skuEco = calculateSKUEconomics(zeroProduct, emptyData);

    assert.equal(skuEco.unitsSold, 0);
    assert.equal(skuEco.realizedRevenue, 0);
    assert.equal(skuEco.grossProfit, 0);
    assert.equal(skuEco.grossMarginPct, 0);
    assert.equal(skuEco.trueContribution, 0);
    assert.equal(skuEco.trueContributionMarginPct, 0);
    assert.equal(skuEco.costToServe.totalCostToServe, 0);
  });

  it('12. Discount handling: explicitly distinguishes list price vs discounts vs realized selling price', () => {
    const skuEco = calculateSKUEconomics(sampleProduct, sampleData);
    assert.equal(skuEco.listPrice, 3000);
    assert.equal(skuEco.grossListRevenue, 6000); // 3000 * 2
    assert.equal(skuEco.totalDiscounts, 600); // 300 * 2
    assert.equal(skuEco.discountPct, 10.0); // 600 / 6000 * 100
    assert.equal(skuEco.realizedRevenue, 5400); // 6000 - 600
    assert.equal(skuEco.avgSellingPrice, 2700); // 5400 / 2
  });

  it('13. Multiple SKUs: correctly aggregates store-wide economics across entire Atelier & Co. catalog', () => {
    const storeEco = calculateStoreEconomics(initialDemoData);
    assert.ok(storeEco);
    assert.equal(storeEco.skuEconomicsList.length, 10);
    assert.ok(storeEco.realizedRevenue > 0);
    assert.ok(storeEco.totalUnitsSold > 0);
    assert.ok(storeEco.totalCostToServe > 0);
    assert.ok(storeEco.trueContribution > 0);
    assert.ok(storeEco.costDrivers.length >= 7);
  });

  it('14. Contribution Waterfall: generates unbroken multi-step vertical waterfall structure', () => {
    const storeEco = calculateStoreEconomics(initialDemoData);
    const waterfall = calculateContributionWaterfall(storeEco);
    assert.ok(waterfall.length >= 10);
    assert.equal(waterfall[0].step, 'Gross List Revenue');
    assert.equal(waterfall[waterfall.length - 1].step, '(=) True Contribution Value');
  });

  it('15. Demo assumption labelling: validates that non-observed fields are tagged as Configured Demo Assumptions', () => {
    const storeEco = calculateStoreEconomics(initialDemoData);
    const mktDriver = storeEco.costDrivers.find(d => d.id === 'MARKETPLACE_FEES');
    const cogsDriver = storeEco.costDrivers.find(d => d.id === 'COGS');
    const adDriver = storeEco.costDrivers.find(d => d.id === 'ADVERTISING');

    assert.equal(mktDriver.source, DATA_QUALITY.DEMO_ASSUMPTION);
    assert.equal(cogsDriver.source, DATA_QUALITY.OBSERVED);
    assert.equal(adDriver.source, DATA_QUALITY.OBSERVED);
  });
});
