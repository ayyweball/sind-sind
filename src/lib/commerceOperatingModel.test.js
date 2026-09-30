// Test Suite for Commerce Operating Model (Sections 51 - 80)
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { initialDemoData, demoProducts } from '../data/demoStore.js';
import {
  compareMarketplaceFeeStructures,
  calculateCompetitivePriceAnalysis,
  calculateMarketplaceFit,
  calculateWarehouseDistributionEconomics,
  calculateCarrierLaneEconomics,
  calculateCapitalFlowLifecycle,
  calculateSupplierPipelineEconomics,
  detectCrossFunctionalFindings
} from './economics.js';
import { MARKETPLACE_CHANNELS } from './economicRules.js';

describe('Commerce Operating Model Suite (Sections 51 - 80)', () => {

  const heroProduct = demoProducts[0]; // Classic Leather Sneaker Noir

  describe('52. Marketplace Fee Comparison Layer', () => {
    it('calculates itemized cost-to-serve decomposition across channels without arbitrary winner badges', () => {
      const feeComp = compareMarketplaceFeeStructures(heroProduct, initialDemoData);

      assert.ok(feeComp);
      assert.equal(feeComp.sku, heroProduct.sku);
      assert.equal(feeComp.comparisons.length, 5);

      const fba = feeComp.comparisons.find(c => c.channelId === 'amazon_fba');
      const d2c = feeComp.comparisons.find(c => c.channelId === 'shopify_d2c');

      assert.ok(fba);
      assert.ok(d2c);

      // Verify itemized components are non-null numbers
      assert.ok(typeof fba.marketplaceCommission === 'number');
      assert.ok(typeof fba.shipping === 'number');
      assert.ok(typeof fba.totalCostToServe === 'number');
      assert.ok(typeof fba.trueContribution === 'number');

      // Verify pairwise trade-off explanations exist
      assert.ok(feeComp.tradeOffs.length >= 2);
      assert.ok(feeComp.tradeOffs[0].observedDifference);
      assert.ok(feeComp.tradeOffs[0].economicDriver);
      assert.ok(feeComp.tradeOffs[0].contributionImpact);
      assert.ok(feeComp.tradeOffs[0].managementImplication);
    });
  });

  describe('53 & 70. Competitive Price & Market Realization Layer', () => {
    it('distinguishes list price, realized price, required economic price, and competitive price', () => {
      const compAnalysis = calculateCompetitivePriceAnalysis(heroProduct, initialDemoData, MARKETPLACE_CHANNELS.SHOPIFY_D2C);

      assert.ok(compAnalysis);
      assert.equal(compAnalysis.sku, heroProduct.sku);
      assert.ok(compAnalysis.realizedPrice > 0);
      assert.ok(compAnalysis.requiredEconomicPrice > 0);
      assert.ok(compAnalysis.competitivePrice > 0);
      assert.ok(typeof compAnalysis.discountHeadroom === 'number');
      assert.ok(compAnalysis.diagnosis.length > 0);
      assert.ok(compAnalysis.managementLevers.length > 0);
    });
  });

  describe('54 & 80. Marketplace Fit Analytical Layer', () => {
    it('evaluates channel viability and primary constraints without ranking generalizations', () => {
      const fit = calculateMarketplaceFit(heroProduct, initialDemoData, MARKETPLACE_CHANNELS.AMAZON_FBA);

      assert.ok(fit);
      assert.equal(fit.sku, heroProduct.sku);
      assert.ok(['VIABLE', 'MARGIN_CONSTRAINED', 'SUPPLY_CONSTRAINED', 'HIGH_FIT', 'UNVIABLE'].includes(fit.viabilityStatus));
      assert.ok(['FEES', 'FULFILMENT', 'INVENTORY_AVAILABILITY', 'RETURN_FRICTION', 'COMPETITIVE_PRICE', 'NONE', 'FEE_STRUCTURE', 'FULFILMENT_COST'].includes(fit.primaryConstraint));
      assert.ok(fit.narrative.length > 0);
    });
  });

  describe('55, 56 & 71. Warehouse Distribution Economics', () => {
    it('evaluates warehouse inventory allocation vs regional destination demand', () => {
      const whEcon = calculateWarehouseDistributionEconomics(heroProduct, initialDemoData);

      assert.ok(whEcon);
      assert.ok(whEcon.totalNetworkStock > 0);
      assert.ok(whEcon.totalNetworkCapacity > 0);
      assert.ok(whEcon.warehouses.length >= 3);

      const mumbai = whEcon.warehouses.find(w => w.city === 'Mumbai');
      assert.ok(mumbai);
      assert.ok(mumbai.networkStockSharePct > 0);
      assert.ok(mumbai.regionalDemandSharePct > 0);
      assert.ok(whEcon.distributionDiagnosis.length > 0);
    });
  });

  describe('57, 58 & 59. Carrier & Shipping Lane Economics', () => {
    it('evaluates courier partners, transit times, SLA drift, freight costs, and return rates', () => {
      const carrierEcon = calculateCarrierLaneEconomics(initialDemoData);

      assert.ok(carrierEcon);
      assert.ok(carrierEcon.carriers.length >= 3);
      assert.ok(carrierEcon.economicInsight.includes('Observed correlation') || carrierEcon.economicInsight.includes('observed correlation'));

      const blueDart = carrierEcon.carriers.find(c => c.carrierName.includes('BlueDart'));
      assert.ok(blueDart);
      assert.ok(blueDart.onTimePct >= 90);
    });
  });

  describe('60, 61 & 62. Capital Flow Lifecycle & Inventory at Cost', () => {
    it('strictly values inventory at landed cost and itemizes the 7-stage capital flow chain', () => {
      const capFlow = calculateCapitalFlowLifecycle(initialDemoData);

      assert.ok(capFlow);
      assert.equal(capFlow.stages.length, 7);
      assert.ok(capFlow.currentInventoryCapitalAtCost > 0);
      assert.ok(capFlow.netWorkingCapitalExposure > 0);

      // Verify stage 3 is Inventory at Cost
      const invStage = capFlow.stages.find(s => s.stageNumber === 3);
      assert.ok(invStage);
      assert.equal(invStage.stageName, 'Inventory at Cost');
      assert.ok(invStage.description.includes('cost'));
    });
  });

  describe('63 & 64. Supplier Pipeline Economics', () => {
    it('analyzes supplier lead times, payment terms, and open PO commitments', () => {
      const supEcon = calculateSupplierPipelineEconomics(initialDemoData);

      assert.ok(supEcon);
      assert.ok(supEcon.suppliers.length > 0);
      assert.ok(supEcon.totalOpenPOs > 0);
      assert.ok(supEcon.totalCommittedValue > 0);
    });
  });

  describe('68, 69, 72, 73 & 74. Cross-Functional Operating Findings', () => {
    it('detects multi-domain findings following Evidence -> Diagnosis -> Economic Implication -> Management Lever', () => {
      const findings = detectCrossFunctionalFindings(initialDemoData);

      assert.ok(findings.length > 0);
      const first = findings[0];

      assert.ok(first.id);
      assert.ok(first.title);
      assert.ok(first.evidence.length >= 2);
      assert.ok(first.diagnosis.length > 0);
      assert.ok(first.economicImplication.length > 0);
      assert.ok(first.managementLever.length > 0);
    });
  });

});
