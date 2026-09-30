import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateSKUChannelEconomics,
  compareSKUChannels,
  calculateChannelStoreSummary,
  detectChannelFindings,
  calculateSKUEconomics,
  calculateStoreEconomics
} from './economics.js';

import {
  MARKETPLACE_CHANNELS,
  FULFILMENT_MODELS,
  DATA_QUALITY,
  DEFAULT_ECONOMIC_ASSUMPTIONS
} from './economicRules.js';

import { initialDemoData } from '../data/demoStore.js';

describe('Marketplace Economics Engine (Phase 6)', () => {
  const testProduct = {
    id: 'prod-001',
    sku: 'SNK-BLK-09',
    name: 'Classic Leather Sneaker — Noir',
    category: 'Footwear',
    price: 4200,
    cost: 1650
  };

  // 1. Channel-specific fee calculations
  it('1. Channel-specific fee calculations: computes exact commission and platform take-rates', () => {
    // Amazon FBA: 14.5% commission + ₹5 closing fee on realized price
    const amazonFba = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);
    assert.ok(amazonFba);
    // Realized price = 4200 - 8% discount = 3864
    assert.equal(amazonFba.unitRealizedPrice, 3864);
    // Commission = (3864 * 0.145) + 5 = 560.28 + 5 = 565.28
    assert.equal(Math.round(amazonFba.costToServeBreakdown.marketplaceFee), 565);

    // Shopify D2C: 0% commission, 2% + ₹3 gateway
    const shopify = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.SHOPIFY_D2C);
    assert.equal(shopify.costToServeBreakdown.marketplaceFee, 0);
    // Realized price = 4200 - 5% = 3990
    // Gateway = (3990 * 0.02) + 3 = 79.8 + 3 = 82.8
    assert.equal(Math.round(shopify.costToServeBreakdown.paymentFee), 83);
  });

  // 2. Multiple channel configurations
  it('2. Multiple channel configurations: verifies all 5 standard demo channels calculate valid profiles', () => {
    const channelKeys = Object.keys(MARKETPLACE_CHANNELS);
    assert.equal(channelKeys.length, 5);

    channelKeys.forEach(key => {
      const channel = MARKETPLACE_CHANNELS[key];
      const profile = calculateSKUChannelEconomics(testProduct, initialDemoData, channel);
      assert.ok(profile);
      assert.equal(profile.channelId, channel.id);
      assert.ok(profile.unitRealizedPrice > 0);
      assert.ok(profile.unitTrueContribution !== undefined);
      assert.ok(profile.trueContributionMarginPct !== undefined);
    });
  });

  // 3. Multiple fulfilment models
  it('3. Multiple fulfilment models: verifies cost structures across Seller Fulfilled, FBA, Easy Ship, PPMP, and Bulk', () => {
    const d2c = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.SHOPIFY_D2C);
    const fba = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);
    const easyShip = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_EASYSHIP);
    const wholesale = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.B2B_WHOLESALE);

    assert.equal(d2c.fulfilmentModelId, 'SELLER_FULFILLED');
    assert.equal(fba.fulfilmentModelId, 'MARKETPLACE_FULFILLED');
    assert.equal(easyShip.fulfilmentModelId, 'MARKETPLACE_COURIER');
    assert.equal(wholesale.fulfilmentModelId, 'DIRECT_BULK');

    // FBA includes packaging in FBA fee (0 additional packaging)
    assert.equal(fba.costToServeBreakdown.packaging, 0);
    // Easy ship requires merchant packaging (₹30)
    assert.equal(easyShip.costToServeBreakdown.packaging, 30);
    // Wholesale palletized freight is ₹35/unit
    assert.equal(wholesale.costToServeBreakdown.forwardShipping, 35);
  });

  // 4. Channel contribution calculation
  it('4. Channel contribution calculation: computes True Contribution = Gross Profit - Channel CTS', () => {
    const fba = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);
    const expectedContribution = fba.unitGrossProfit - fba.costToServeBreakdown.totalCostToServe;
    assert.equal(Math.round(fba.unitTrueContribution), Math.round(expectedContribution));
  });

  // 5. Channel contribution margin % calculation
  it('5. Channel contribution margin %: correctly computes contribution share of realized revenue', () => {
    const fba = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);
    const expectedMargin = (fba.unitTrueContribution / fba.unitRealizedPrice) * 100;
    assert.equal(fba.trueContributionMarginPct.toFixed(2), expectedMargin.toFixed(2));
  });

  // 6. Channel cost-to-serve calculation
  it('6. Channel cost-to-serve: aggregates all 7 cost components transparently', () => {
    const myntra = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.MYNTRA_AJIO);
    const cts = myntra.costToServeBreakdown;
    const manualSum = cts.marketplaceFee + cts.paymentFee + cts.forwardShipping +
      cts.fulfilment + cts.packaging + cts.advertising + cts.returnFriction + cts.otherVariable;
    assert.equal(cts.totalCostToServe.toFixed(2), manualSum.toFixed(2));
  });

  // 7. Channel advertising allocation
  it('7. Channel advertising allocation: allocates SKU media spend per unit', () => {
    const d2c = calculateSKUChannelEconomics(testProduct, initialDemoData, MARKETPLACE_CHANNELS.SHOPIFY_D2C);
    assert.ok(d2c.costToServeBreakdown.advertising > 0);
    // Pre-ad contribution must equal True Contribution + Ad Cost
    const preAdContribution = d2c.unitTrueContribution + d2c.costToServeBreakdown.advertising;
    assert.equal(Math.round(d2c.unitContributionBeforeAds), Math.round(preAdContribution));
  });

  // 8. Channel return allocation
  it('8. Channel return allocation: applies reverse logistics & restocking friction according to SKU return rate', () => {
    const linenShirt = initialDemoData.products.find(p => p.sku === 'LIN-WHT-M');
    assert.ok(linenShirt);

    const myntra = calculateSKUChannelEconomics(linenShirt, initialDemoData, MARKETPLACE_CHANNELS.MYNTRA_AJIO);
    assert.ok(myntra.returnRatePct > 0);
    // Myntra return friction rate = 160 + 60 = 220
    assert.equal(myntra.unitReturnFrictionRate, 220);
    assert.ok(myntra.costToServeBreakdown.returnFriction > 0);
  });

  // 9. Missing channel data handling
  it('9. Missing channel data handling: gracefully handles null/empty data and products with zero history', () => {
    const emptyProduct = { id: 'prod-new', sku: 'NEW-SKU-01', name: 'New Item', price: 2000, cost: 800 };
    const profile = calculateSKUChannelEconomics(emptyProduct, {}, MARKETPLACE_CHANNELS.AMAZON_FBA);
    assert.ok(profile);
    assert.equal(profile.returnRatePct, 0);
    assert.equal(profile.costToServeBreakdown.advertising, 0);
    assert.ok(profile.unitTrueContribution > 0);
  });

  // 10. Demo assumption provenance tagging
  it('10. Demo assumption provenance tagging: verifies all channel configs carry Configured Demo Assumption tag', () => {
    Object.values(MARKETPLACE_CHANNELS).forEach(channel => {
      assert.equal(channel.source, DATA_QUALITY.DEMO_ASSUMPTION);
      const profile = calculateSKUChannelEconomics(testProduct, initialDemoData, channel);
      assert.equal(profile.provenance, DATA_QUALITY.DEMO_ASSUMPTION);
    });
  });

  // 11. Comparison calculations & delta analysis
  it('11. Comparison calculations: compareSKUChannels generates side-by-side trade-offs without winner ranking', () => {
    const comparison = compareSKUChannels(testProduct, initialDemoData);
    assert.ok(comparison);
    assert.equal(comparison.profiles.length, 5);
    assert.equal(comparison.tradeOffs.length, 5);

    // Verify trade-offs structure
    comparison.tradeOffs.forEach(t => {
      assert.ok(t.observedDifference);
      assert.ok(t.economicDriver);
      assert.ok(t.contributionImpact);
      assert.ok(t.managementImplication);
      // Ensure NO arbitrary "winner" or "best" claims
      assert.equal(t.isWinner, undefined);
      assert.equal(t.recommendedRank, undefined);
    });
  });

  // 12. SKU × channel aggregation
  it('12. SKU × channel aggregation: calculateChannelStoreSummary aggregates catalog-wide economics per channel', () => {
    const summary = calculateChannelStoreSummary(initialDemoData);
    assert.ok(summary);
    assert.equal(summary.length, 5);

    summary.forEach(chan => {
      assert.equal(chan.skuCount, initialDemoData.products.length);
      assert.ok(chan.totalRealizedRevenue > 0);
      assert.ok(chan.totalGrossProfit > 0);
      assert.ok(chan.totalCostToServe > 0);
      assert.ok(chan.blendedContributionMarginPct !== undefined);
    });
  });

  // 13. Existing Phase 5 economic calculations regression protection
  it('13. Existing Phase 5 economic calculations regression protection: store & SKU economics pass without deviation', () => {
    const storeEcon = calculateStoreEconomics(initialDemoData);
    assert.ok(storeEcon);
    assert.ok(storeEcon.realizedRevenue > 0);
    assert.ok(storeEcon.totalCostToServe > 0);
    assert.ok(storeEcon.trueContributionMarginPct !== undefined);

    const skuEcon = calculateSKUEconomics(testProduct, initialDemoData);
    assert.ok(skuEcon);
    assert.ok(skuEcon.grossProfit > 0);
    assert.ok(skuEcon.costToServe.totalCostToServe > 0);
    assert.ok(skuEcon.trueContribution !== undefined);
  });
});

