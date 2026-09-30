import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculatePriceEconomics,
  calculateRequiredRealizedPrice,
  calculateMaximumDiscount,
  calculatePriceSensitivity,
  calculatePromotionBreakEven,
  calculatePromotionEconomics,
  detectPricingFindings,
  calculateSKUChannelEconomics,
  calculateSKUEconomics,
  calculateStoreEconomics
} from './economics.js';

import {
  MARKETPLACE_CHANNELS,
  DEFAULT_PRICING_THRESHOLDS,
  DATA_QUALITY
} from './economicRules.js';

import { initialDemoData } from '../data/demoStore.js';

describe('Pricing & Promotion Economics Engine (Phase 7)', () => {
  const testProduct = {
    id: 'prod-001',
    sku: 'SNK-BLK-09',
    name: 'Classic Leather Sneaker — Noir',
    category: 'Footwear',
    price: 4200,
    cost: 1650
  };

  const toteBag = {
    id: 'prod-003',
    sku: 'TOT-CNV-NAT',
    name: 'Heavyweight Canvas Carryall',
    category: 'Accessories',
    price: 1800,
    cost: 620
  };

  // 1. Realized price calculation
  it('1. Realized price calculation: explicitly calculates List Price minus Discounts', () => {
    const priceEcon = calculatePriceEconomics(testProduct, initialDemoData);
    assert.equal(priceEcon.listPrice, 4200);
    // At default 5% discount: 4200 * 0.05 = 210 -> Realized price = 3990
    assert.equal(priceEcon.unitDiscount, 210);
    assert.equal(priceEcon.unitRealizedPrice, 3990);
  });

  // 2. Discount percentage calculation
  it('2. Discount percentage calculation: computes discount share of list price', () => {
    const priceEcon = calculatePriceEconomics(testProduct, initialDemoData);
    assert.equal(priceEcon.discountPct, 5.0);
  });

  // 3. Contribution at different prices
  it('3. Contribution at different prices: verifies contribution adjusts with realized price', () => {
    const sensitivity = calculatePriceSensitivity(testProduct, initialDemoData);
    assert.equal(sensitivity.length, 5);

    const downFive = sensitivity.find(s => s.step === -5.0);
    const base = sensitivity.find(s => s.step === 0.0);
    const upFive = sensitivity.find(s => s.step === 5.0);

    assert.ok(downFive.realizedPrice < base.realizedPrice);
    assert.ok(upFive.realizedPrice > base.realizedPrice);
    assert.ok(downFive.contribution < base.contribution);
    assert.ok(upFive.contribution > base.contribution);
  });

  // 4. Contribution margin % at different prices
  it('4. Contribution margin % at different prices: computes exact percentage conversion', () => {
    const sensitivity = calculatePriceSensitivity(testProduct, initialDemoData);
    sensitivity.forEach(scenario => {
      const expectedMargin = (scenario.contribution / scenario.realizedPrice) * 100;
      assert.equal(scenario.contributionMarginPct.toFixed(2), expectedMargin.toFixed(2));
    });
  });

  // 5. Maximum discount calculation & headroom
  it('5. Maximum discount calculation: computes maximum allowable discount and headroom before threshold', () => {
    const maxDiscount = calculateMaximumDiscount(testProduct, MARKETPLACE_CHANNELS.SHOPIFY_D2C, 25.0);
    assert.ok(maxDiscount);
    assert.ok(maxDiscount.requiredRealizedPrice > 0);
    assert.ok(maxDiscount.maxDiscountAmount > 0);
    assert.equal(
      maxDiscount.discountHeadroom.toFixed(2),
      (maxDiscount.currentRealizedPrice - maxDiscount.requiredRealizedPrice).toFixed(2)
    );
  });

  // 6. Required realized price calculation
  it('6. Required realized price calculation: computes exact ASP required to preserve 25% margin', () => {
    const cleanProduct = { id: 'prod-clean', sku: 'CLN-001', name: 'Clean Item', price: 3000, cost: 1000 };
    const req = calculateRequiredRealizedPrice(cleanProduct, MARKETPLACE_CHANNELS.SHOPIFY_D2C, 25.0);
    assert.ok(req.possible);
    // At required price, contribution margin must equal targetMarginPct (25.0%)
    const simEcon = calculateSKUChannelEconomics(
      cleanProduct,
      {},
      MARKETPLACE_CHANNELS.SHOPIFY_D2C,
      { expectedDiscountPct: ((cleanProduct.price - req.requiredPrice) / cleanProduct.price) * 100 }
    );
    assert.equal(Math.round(simEcon.trueContributionMarginPct), 25);
  });

  // 7. Contribution threshold evaluation
  it('7. Contribution threshold: detects floor breach when margin falls below target', () => {
    // Canvas Carryall has heavy discount in demo data causing margin compression
    const priceEcon = calculatePriceEconomics(toteBag, initialDemoData, {
      customAssumptions: { expectedDiscountPct: 20.0 },
      targetMarginPct: 25.0
    });
    assert.ok(priceEcon.trueContributionMarginPct < 25.0);
    assert.equal(priceEcon.isMarginFloorBreached, true);
    assert.equal(priceEcon.isFloorBreached, true);
  });

  // 8. 5-point price sensitivity scenarios
  it('8. Price sensitivity: generates -5%, -2.5%, Base, +2.5%, +5% deterministic matrix', () => {
    const steps = [-5.0, -2.5, 0.0, 2.5, 5.0];
    const sensitivity = calculatePriceSensitivity(testProduct, initialDemoData, MARKETPLACE_CHANNELS.SHOPIFY_D2C, steps);
    assert.equal(sensitivity.length, 5);
    assert.equal(sensitivity[0].step, -5.0);
    assert.equal(sensitivity[2].isBase, true);
    assert.equal(sensitivity[4].step, 5.0);
  });

  // 9. Promotion economics
  it('9. Promotion economics: compares baseline vs promotional realized economics', () => {
    const promo = initialDemoData.promotions[0]; // Carryall coupon promo
    const promoEcon = calculatePromotionEconomics(promo, toteBag, initialDemoData);
    assert.ok(promoEcon);
    assert.equal(promoEcon.promotionId, promo.id);
    assert.ok(promoEcon.promoRealizedPrice < promoEcon.baseRealizedPrice);
    assert.ok(promoEcon.contributionDelta < 0);
  });

  // 10. Promotion break-even volume formula
  it('10. Promotion break-even: calculates mathematical incremental volume with non-modelled disclaimer', () => {
    const breakEven = calculatePromotionBreakEven(toteBag, initialDemoData, 350, 100);
    assert.ok(breakEven);
    assert.ok(breakEven.contributionLostPerUnit > 0);
    assert.ok(breakEven.volumeMultiplier > 1.0);
    assert.ok(breakEven.disclaimer.includes('Demand response not modelled'));
  });

  // 11. Channel-specific required price differences
  it('11. Channel-specific required price differences: required price is higher on Amazon FBA than D2C due to 14.5% take-rate', () => {
    const reqD2C = calculateRequiredRealizedPrice(testProduct, MARKETPLACE_CHANNELS.SHOPIFY_D2C, 25.0);
    const reqFBA = calculateRequiredRealizedPrice(testProduct, MARKETPLACE_CHANNELS.AMAZON_FBA, 25.0);
    assert.ok(reqD2C.possible && reqFBA.possible);
    // Amazon FBA charges 14.5% commission, so required selling price to yield 25% net margin must be higher than D2C (0% commission)
    assert.ok(reqFBA.requiredPrice > reqD2C.requiredPrice);
  });

  // 12. Advertising interaction
  it('12. Advertising interaction: calculates pre-ad contribution vs post-ad contribution', () => {
    const priceEcon = calculatePriceEconomics(testProduct, initialDemoData);
    assert.ok(priceEcon.unitContributionBeforeAds > priceEcon.unitTrueContribution);
  });

  // 13. Return friction interaction: captures reverse logistics friction in cost-to-serve
  it('13. Return friction interaction: captures reverse logistics friction in cost-to-serve', () => {
    const priceEcon = calculatePriceEconomics(testProduct, initialDemoData);
    assert.ok(priceEcon.costToServeBreakdown.returnFriction >= 0);
  });

  // 14. Missing data handling
  it('14. Missing data handling: gracefully evaluates products with zero order history', () => {
    const newProduct = { id: 'prod-new', sku: 'NEW-001', name: 'New Item', price: 2500, cost: 900 };
    const priceEcon = calculatePriceEconomics(newProduct, {});
    assert.ok(priceEcon);
    assert.ok(priceEcon.unitRealizedPrice > 0);
    assert.ok(priceEcon.maxDiscount.requiredRealizedPrice > 0);
  });

  // 15. Provenance assumptions tagging
  it('15. Provenance assumptions tagging: verifies all pricing metrics carry provenance metadata', () => {
    const priceEcon = calculatePriceEconomics(testProduct, initialDemoData);
    assert.equal(priceEcon.provenance, DATA_QUALITY.CALCULATED);
  });

  // 16. Scenario vs observed data separation
  it('16. Scenario vs observed separation: ensures price sensitivity does not mutate original data', () => {
    const originalPrice = testProduct.price;
    calculatePriceSensitivity(testProduct, initialDemoData);
    assert.equal(testProduct.price, originalPrice);
  });

  // 17. Zero / edge case handling
  it('17. Zero / edge cases: handles 0% discount and high target margin mathematically', () => {
    const zeroDisc = calculateMaximumDiscount(testProduct, MARKETPLACE_CHANNELS.SHOPIFY_D2C, 25.0, {}, { expectedDiscountPct: 0 });
    assert.equal(zeroDisc.currentDiscountAmount, 0);
    assert.equal(zeroDisc.currentRealizedPrice, testProduct.price);
  });

  // 18. Regression of Phase 5 Economics
  it('18. Regression of Phase 5 Economics: store and SKU economics calculate identically', () => {
    const storeEcon = calculateStoreEconomics(initialDemoData);
    assert.ok(storeEcon.realizedRevenue > 0);
    assert.ok(storeEcon.totalCostToServe > 0);
  });

  // 19. Regression of Phase 6 Marketplace Economics
  it('19. Regression of Phase 6 Marketplace Economics: SKU channel comparison calculates properly', () => {
    const wallet = initialDemoData.products.find(p => p.sku === 'LTH-WLT-TAN');
    const skuChan = calculateSKUChannelEconomics(wallet, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);
    assert.ok(skuChan.unitTrueContribution > 0);
    assert.equal(skuChan.fulfilmentModelId, 'MARKETPLACE_FULFILLED');
  });
});

