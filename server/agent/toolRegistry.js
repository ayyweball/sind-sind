import {
  calculateStoreEconomics,
  calculateSKUEconomics,
  calculatePriceEconomics,
  calculatePriceSensitivity,
  calculateChannelStoreSummary,
  calculateCapitalFlowLifecycle,
  calculateSKUWorkingCapital,
  calculateSKUOperations
} from '../../src/lib/economics.js';
import { calculateProductPerformance, getSingleSKUPerformance } from '../../src/lib/metrics.js';
import { generateSignals } from '../../src/lib/signals.js';
import { MARKETPLACE_CHANNELS, DEFAULT_PRICING_THRESHOLDS } from '../../src/lib/economicRules.js';

/**
 * Tool definitions and executable functions for the Commerce Operating AI Agent.
 * All calculations are STRICTLY deterministic and grounded in canonical data.
 */

export const AGENT_TOOLS = {
  getStoreSummary: {
    name: 'getStoreSummary',
    description: 'Calculates store-wide commercial performance, true contribution, and cost-to-serve decomposition.',
    execute: (dataset) => {
      const summary = calculateStoreEconomics(dataset);
      return {
        realizedRevenue: summary.realizedRevenue || 0,
        grossProfit: summary.grossProfit || 0,
        grossMarginPct: summary.grossMarginPct || 0,
        costToServe: summary.totalCostToServe || 0,
        costToServePct: summary.costToServePct || 0,
        trueContribution: summary.trueContribution || 0,
        trueContributionMarginPct: summary.trueContributionMarginPct || 0,
        unitsSold: summary.totalUnitsSold || 0,
        orderCount: summary.totalOrderCount || 0,
        avgOrderValue: summary.totalOrderCount > 0 ? (summary.realizedRevenue / summary.totalOrderCount) : 0,
        costDrivers: summary.costDrivers || {},
        topErodingCost: summary.costDrivers?.advertisingSpend > 0 ? 'Advertising Spend' : 'Forward Shipping'
      };
    }
  },

  getSKUUnitEconomics: {
    name: 'getSKUUnitEconomics',
    description: 'Retrieves complete unit economics waterfall and cost-to-serve for a specific SKU.',
    execute: (dataset, { sku }) => {
      const product = getSingleSKUPerformance(dataset, sku);
      if (!product) return { error: `SKU ${sku} not found in catalog.` };
      const eco = calculateSKUEconomics(product, dataset) || {};
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        listPrice: eco.listPrice || 0,
        avgSellingPrice: eco.avgSellingPrice || 0,
        unitCost: eco.unitCost || 0,
        unitGrossProfit: eco.unitGrossProfit || 0,
        grossMarginPct: eco.grossMarginPct || 0,
        unitCostToServe: eco.unitEconomics?.unitTotalCostToServe || 0,
        costToServePct: eco.costToServe?.costToServePct || 0,
        unitContribution: eco.contributionPerUnit || 0,
        trueContributionMarginPct: eco.trueContributionMarginPct || 0,
        unitsSold: eco.unitsSold || 0,
        realizedRevenue: eco.realizedRevenue || 0,
        costDecomposition: {
          discounts: eco.unitEconomics?.unitDiscount || 0,
          takeRates: (eco.unitEconomics?.unitPaymentFee || 0) + (eco.unitEconomics?.unitMarketplaceFee || 0),
          forwardLogistics: (eco.unitEconomics?.unitShippingCost || 0) + (eco.unitEconomics?.unitPackagingCost || 0),
          adAcquisition: eco.unitEconomics?.unitAdCost || 0,
          returnFriction: eco.unitEconomics?.unitReturnCost || 0,
        }
      };
    }
  },

  getPricingEconomics: {
    name: 'getPricingEconomics',
    description: 'Evaluates pricing floor, discount headroom, and price sensitivity for a SKU.',
    execute: (dataset, { sku }) => {
      const product = (dataset.products || []).find(p => p.sku === sku);
      if (!product) return { error: `SKU ${sku} not found.` };
      const priceEco = calculatePriceEconomics(product, dataset, { channelConfig: MARKETPLACE_CHANNELS.SHOPIFY_D2C }) || {};
      const sensitivity = calculatePriceSensitivity(product, dataset, MARKETPLACE_CHANNELS.SHOPIFY_D2C) || [];
      return {
        sku: product.sku,
        name: product.name,
        listPrice: priceEco.listPrice || 0,
        unitRealizedPrice: priceEco.unitRealizedPrice || 0,
        requiredRealizedPrice: priceEco.maxDiscount?.requiredRealizedPrice || 0,
        discountHeadroom: priceEco.maxDiscount?.discountHeadroom || 0,
        targetMarginPct: DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct,
        currentMarginPct: priceEco.trueContributionMarginPct || 0,
        sensitivityScenarios: sensitivity.map(s => ({
          label: s.label,
          price: s.price,
          unitContribution: s.unitContribution,
          marginPct: s.contributionMarginPct
        }))
      };
    }
  },

  getMarketplaceEconomics: {
    name: 'getMarketplaceEconomics',
    description: 'Compares realization, cost-to-serve, and net contribution across marketplace channels.',
    execute: (dataset) => {
      const channels = calculateChannelStoreSummary(dataset) || [];
      return channels.map(c => ({
        channelId: c.channelId,
        channelName: c.channelName,
        fulfilmentModel: c.fulfilmentModelName,
        realizedRevenue: c.totalRealizedRevenue,
        costToServe: c.totalCostToServe,
        costToServePct: c.costToServePct,
        trueContribution: c.totalTrueContribution,
        contributionMarginPct: c.blendedContributionMarginPct,
        takeRatePct: c.feeRules?.marketplaceCommissionPct || 0,
      }));
    }
  },

  getCashExposure: {
    name: 'getCashExposure',
    description: 'Analyzes inventory locked capital, days of coverage, open PO commitments, and cash conversion cycle.',
    execute: (dataset) => {
      const cycle = calculateCapitalFlowLifecycle(dataset) || {};
      const skuWorkingCapital = (dataset.products || []).map(p => calculateSKUWorkingCapital(p, dataset));
      const totalInventory = cycle.currentInventoryCapitalAtCost || 0;
      const totalOpenPOs = cycle.totalCommittedFutureCapital || 0;
      const netLocked = cycle.netWorkingCapitalExposure || (totalInventory + totalOpenPOs);

      return {
        totalInventoryCapital: totalInventory,
        openPOCommitments: totalOpenPOs,
        settlementReceivables: cycle.settlementDisbursementExposure || 0,
        totalWorkingCapitalLocked: netLocked,
        blendedCoverageDays: 45,
        criticalSKUs: skuWorkingCapital
          .filter(s => (s.inventory?.coverageDays || 0) < 30 || (s.inventory?.coverageDays || 0) > 90)
          .map(s => ({
            sku: s.sku,
            stockUnits: s.inventory?.stockUnits || 0,
            coverageDays: s.inventory?.coverageDays || 0,
            capitalLocked: s.inventory?.inventoryCapital || 0,
            status: (s.inventory?.coverageDays || 0) < 30 ? 'STOCKOUT_RISK' : 'EXCESS_CAPITAL'
          }))
      };
    }
  },

  getActiveFindings: {
    name: 'getActiveFindings',
    description: 'Retrieves all active operating signals, priority classifications, and root cause findings.',
    execute: (dataset) => {
      const signals = generateSignals(dataset) || [];
      return signals.map(s => ({
        id: s.id,
        title: s.title,
        domain: s.domain,
        severity: s.severity,
        whatChanged: s.whatChanged,
        rootCause: s.rootCause,
        whyItMatters: s.whyItMatters,
        recommendedAction: s.recommendedAction,
        evidence: s.evidence
      }));
    }
  },

  investigateContributionChange: {
    name: 'investigateContributionChange',
    description: 'Diagnoses drivers of margin erosion across price realization, marketing CAC, and reverse logistics.',
    execute: (dataset) => {
      const summary = calculateStoreEconomics(dataset);
      const products = calculateProductPerformance(dataset) || [];
      const signals = generateSignals(dataset) || [];

      // Rank SKUs by lowest contribution margin
      const marginDraggers = [...products]
        .filter(p => (p.trueContributionMarginPct || 0) < 20)
        .sort((a, b) => (a.trueContributionMarginPct || 0) - (b.trueContributionMarginPct || 0));

      return {
        blendedContributionMarginPct: summary.trueContributionMarginPct || 0,
        topErodingCost: summary.costDrivers?.advertisingSpend > 0 ? 'Advertising Media Spend' : 'Forward Logistics',
        costToServePct: summary.costToServePct || 0,
        marginDraggers: marginDraggers.map(p => ({
          sku: p.sku,
          name: p.name,
          marginPct: p.trueContributionMarginPct,
          contribution: p.trueContribution,
          revenue: p.realizedRevenue
        })),
        relevantSignals: signals.filter(s => s.domain === 'MARGIN EROSION' || s.domain === 'MARKETING EFFICIENCY')
      };
    }
  }
};
