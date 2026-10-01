import {
  calculateStoreEconomics,
  calculateSKUEconomics,
  calculatePriceEconomics,
  calculatePriceSensitivity,
  calculateCompetitivePriceAnalysis,
  calculateChannelStoreSummary,
  compareSKUChannels,
  compareMarketplaceFeeStructures,
  calculateMarketplaceFit,
  calculateStoreWarehouseEconomics,
  calculateWarehouseDistributionEconomics,
  calculateDeliveryPerformance,
  calculateShippingLanes,
  calculateFulfilmentReturnAnalysis,
  calculateCarrierLaneEconomics,
  calculateSupplierPipelineEconomics,
  calculateCapitalFlowLifecycle,
  calculateStoreInventoryCapital,
  calculatePurchaseCommitments,
  calculateStoreSettlementExposure,
  calculateOperatingCashFloat,
  calculateReturnCashExposure,
  calculateCashConversionExposure,
  calculateCashExposureWaterfall,
  calculateSKUWorkingCapital,
  calculateSKUOperations,
  detectCrossFunctionalFindings,
  detectWorkingCapitalFindings,
  detectOperationsFindings
} from '../../src/lib/economics.js';
import {
  calculateProductPerformance,
  calculateCatalogSummary,
  getSingleSKUPerformance
} from '../../src/lib/metrics.js';
import { generateSignals } from '../../src/lib/signals.js';
import { MARKETPLACE_CHANNELS, DEFAULT_PRICING_THRESHOLDS } from '../../src/lib/economicRules.js';

/**
 * Formal Controlled Tool Registry for the Commerce Operating Agent.
 * All tools are strictly READ-ONLY and execute deterministic mathematical engines.
 */

export const TOOL_REGISTRY = {
  // =========================================================================
  // DOMAIN 1: COMMERCIAL & STORE SUMMARY
  // =========================================================================

  getStoreSummary: {
    name: 'getStoreSummary',
    domain: 'COMMERCIAL',
    description: 'Calculates store-wide commercial performance, gross margin, total cost-to-serve decomposition, and true contribution.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const summary = calculateStoreEconomics(dataset);
      return {
        realizedRevenue: summary.realizedRevenue || 0,
        grossProfit: summary.grossProfit || 0,
        grossMarginPct: summary.grossMarginPct || 0,
        totalCostToServe: summary.totalCostToServe || 0,
        costToServePct: summary.costToServePct || 0,
        trueContribution: summary.trueContribution || 0,
        trueContributionMarginPct: summary.trueContributionMarginPct || 0,
        totalUnitsSold: summary.totalUnitsSold || 0,
        totalOrders: summary.totalOrderCount || 0,
        avgOrderValue: summary.totalOrderCount > 0 ? (summary.realizedRevenue / summary.totalOrderCount) : 0,
        costDrivers: summary.costDrivers || [],
        topCostDriver: summary.costDrivers?.find(d => d.amount > 0)?.name || 'Advertising Spend',
        provenance: '[Calculated Value]'
      };
    }
  },

  getSKUUnitEconomics: {
    name: 'getSKUUnitEconomics',
    domain: 'COMMERCIAL',
    description: 'Retrieves complete unit economics waterfall (List Price -> Discounts -> ASP -> COGS -> Payment/Marketplace fees -> Forward Shipping/Pkg -> Media CAC -> Returns -> Contribution) for a specific SKU.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The unique SKU identifier (e.g., "SNK-BLK-09" or "TEST-001-SKU")' }
      },
      required: ['sku']
    },
    readOnly: true,
    execute: (dataset, { sku }) => {
      const product = getSingleSKUPerformance(dataset, sku);
      if (!product) return { error: `SKU "${sku}" not found in current catalog.` };
      const eco = calculateSKUEconomics(product, dataset) || {};
      const avgPrice = eco.avgSellingPrice || eco.unitRealizedPrice || product.price || 0;
      return {
        sku: product.sku,
        name: product.name,
        category: product.category,
        channel: product.channel || 'D2C',
        unitsSold: eco.unitsSold || 0,
        listPrice: eco.listPrice || product.listPrice || product.price || 0,
        avgSellingPrice: avgPrice,
        unitRealizedPrice: avgPrice,
        avgUnitDiscount: eco.unitEconomics?.unitDiscount || 0,
        discountPct: eco.discountPct || 0,
        unitCost: eco.unitCost || product.cogs || 0,
        unitGrossProfit: eco.unitGrossProfit || (avgPrice - (eco.unitCost || product.cogs || 0)),
        grossMarginPct: eco.grossMarginPct || 0,
        unitCostToServe: eco.unitEconomics?.unitTotalCostToServe || 0,
        costToServePct: eco.costToServe?.costToServePct || 0,
        unitContribution: eco.contributionPerUnit || 0,
        trueContributionMarginPct: eco.trueContributionMarginPct || 0,
        realizedRevenue: eco.realizedRevenue || 0,
        totalTrueContribution: eco.trueContribution || 0,
        costDecomposition: {
          discounts: eco.unitEconomics?.unitDiscount || 0,
          takeRates: (eco.unitEconomics?.unitPaymentFee || 0) + (eco.unitEconomics?.unitMarketplaceFee || 0),
          forwardLogistics: (eco.unitEconomics?.unitShippingCost || 0) + (eco.unitEconomics?.unitPackagingCost || 0),
          adAcquisition: eco.unitEconomics?.unitAdCost || 0,
          returnFriction: eco.unitEconomics?.unitReturnCost || 0,
        },
        provenance: '[Calculated Value]'
      };
    }
  },

  getProductMix: {
    name: 'getProductMix',
    domain: 'COMMERCIAL',
    description: 'Retrieves catalog-wide rankings of SKUs sorted by contribution margin health, identifying top profit generators and margin-eroding draggers.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum number of SKUs to return per bracket (default 5)' }
      },
      required: []
    },
    readOnly: true,
    execute: (dataset, { limit = 5 } = {}) => {
      const products = calculateProductPerformance(dataset) || [];
      const sortedByMargin = [...products].sort((a, b) => (a.trueContributionMarginPct || 0) - (b.trueContributionMarginPct || 0));
      
      const marginDraggers = sortedByMargin.slice(0, limit).map(p => ({
        sku: p.sku,
        name: p.name,
        realizedRevenue: p.revenue || p.realizedRevenue || 0,
        grossMarginPct: p.grossMarginPct || 0,
        trueContributionMarginPct: p.trueContributionMarginPct || 0,
        trueContribution: p.trueContribution || 0,
        unitsSold: p.unitsSold || 0,
        operatingStatus: p.operatingStatus || 'ACTIVE'
      }));

      const topContributors = [...products].sort((a, b) => (b.trueContribution || 0) - (a.trueContribution || 0)).slice(0, limit).map(p => ({
        sku: p.sku,
        name: p.name,
        trueContribution: p.trueContribution || 0,
        trueContributionMarginPct: p.trueContributionMarginPct || 0,
        revenueSharePct: p.revenueSharePct || 0
      }));

      return {
        totalCatalogSKUs: products.length,
        subMarginalCount: products.filter(p => (p.trueContributionMarginPct || 0) < 20).length,
        marginDraggers,
        topContributors,
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 2: PRICING & PROMOTIONS
  // =========================================================================

  getPricingEconomics: {
    name: 'getPricingEconomics',
    domain: 'PRICING',
    description: 'Evaluates required economic realized price floor, discount headroom, and margin preservation thresholds for a SKU.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The unique SKU identifier' },
        channelId: { type: 'string', description: 'Channel to evaluate (e.g. "shopify_d2c", "amazon_fba")' }
      },
      required: ['sku']
    },
    readOnly: true,
    execute: (dataset, { sku, channelId = 'shopify_d2c' }) => {
      const product = (dataset.products || []).find(p => p.sku === sku);
      if (!product) return { error: `SKU "${sku}" not found.` };
      const channelConfig = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === channelId) || MARKETPLACE_CHANNELS.SHOPIFY_D2C;
      const priceEco = calculatePriceEconomics(product, dataset, { channelConfig }) || {};
      
      return {
        sku: product.sku,
        name: product.name,
        channel: channelConfig.name,
        listPrice: priceEco.listPrice || 0,
        unitRealizedPrice: priceEco.unitRealizedPrice || 0,
        targetContributionMarginPct: DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct,
        currentContributionMarginPct: priceEco.trueContributionMarginPct || 0,
        requiredRealizedPrice: priceEco.maxDiscount?.requiredRealizedPrice || 0,
        discountHeadroom: priceEco.maxDiscount?.discountHeadroom || 0,
        isBelowMarginFloor: (priceEco.maxDiscount?.discountHeadroom || 0) < 0,
        floorDeficitPerUnit: Math.max(0, (priceEco.maxDiscount?.requiredRealizedPrice || 0) - (priceEco.unitRealizedPrice || 0)),
        provenance: '[Calculated Value]'
      };
    }
  },

  getPriceSensitivity: {
    name: 'getPriceSensitivity',
    domain: 'PRICING',
    description: 'Simulates price adjustment scenarios (-5%, -2.5%, Base, +2.5%, +5%) and calculates corresponding net contribution margin for a SKU.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The unique SKU identifier' },
        channelId: { type: 'string', description: 'Channel to evaluate' }
      },
      required: ['sku']
    },
    readOnly: true,
    execute: (dataset, { sku, channelId = 'shopify_d2c' }) => {
      const product = (dataset.products || []).find(p => p.sku === sku);
      if (!product) return { error: `SKU "${sku}" not found.` };
      const channelConfig = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === channelId) || MARKETPLACE_CHANNELS.SHOPIFY_D2C;
      const scenarios = calculatePriceSensitivity(product, dataset, channelConfig) || [];

      return {
        sku: product.sku,
        channel: channelConfig.name,
        scenarios: scenarios.map(s => ({
          label: s.label,
          price: s.price,
          unitCostToServe: s.unitCostToServe,
          unitContribution: s.unitContribution,
          contributionMarginPct: s.contributionMarginPct,
          isViable: (s.contributionMarginPct || 0) >= DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct
        })),
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 3: MARKETPLACE CHANNELS & FEES
  // =========================================================================

  getMarketplaceEconomics: {
    name: 'getMarketplaceEconomics',
    domain: 'MARKETPLACE',
    description: 'Compares realization, commission/take-rates, fulfillment burden, and net contribution across marketplace channels (D2C, Amazon FBA, Amazon MFN, Myntra).',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const channels = calculateChannelStoreSummary(dataset) || [];
      return {
        channels: channels.map(c => ({
          channelId: c.channelId,
          channelName: c.channelName,
          fulfilmentModel: c.fulfilmentModelName,
          realizedRevenue: c.totalRealizedRevenue,
          totalCostToServe: c.totalCostToServe,
          costToServePct: c.costToServePct,
          trueContribution: c.totalTrueContribution,
          contributionMarginPct: c.blendedContributionMarginPct,
          takeRatePct: c.feeRules?.marketplaceCommissionPct || 0,
          settlementDays: c.settlementDays || 14
        })),
        provenance: '[Calculated Value]'
      };
    }
  },

  compareChannelEconomics: {
    name: 'compareChannelEconomics',
    domain: 'MARKETPLACE',
    description: 'Calculates itemized SKU fee decomposition and pairwise contribution differences between Shopify D2C and Amazon FBA/MFN.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The unique SKU identifier' }
      },
      required: ['sku']
    },
    readOnly: true,
    execute: (dataset, { sku }) => {
      const product = (dataset.products || []).find(p => p.sku === sku);
      if (!product) return { error: `SKU "${sku}" not found.` };
      const comparison = compareMarketplaceFeeStructures(product, dataset);
      const fit = calculateMarketplaceFit(product, dataset, MARKETPLACE_CHANNELS.AMAZON_FBA);
      
      return {
        sku: product.sku,
        name: product.name,
        profiles: comparison?.profiles || [],
        pairwiseTradeoffs: comparison?.tradeoffs || [],
        amazonFBAFit: {
          viabilityScore: fit?.viabilityScore || 0,
          status: fit?.status || 'UNKNOWN',
          narrative: fit?.narrative || ''
        },
        dtcDirect: comparison?.profiles?.find(p => p.channelId === 'shopify_d2c') || {},
        amazonFBA: comparison?.profiles?.find(p => p.channelId === 'amazon_fba') || {},
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 4: OPERATIONS & FULFILLMENT
  // =========================================================================

  getWarehouseEconomics: {
    name: 'getWarehouseEconomics',
    domain: 'OPERATIONS',
    description: 'Analyzes multi-warehouse capacity utilization, stored inventory units, and regional stock vs destination demand imbalances.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const wh = calculateStoreWarehouseEconomics(dataset) || {};
      const distribution = calculateWarehouseDistributionEconomics(null, dataset) || {};
      return {
        blendedCapacityUtilizationPct: wh.blendedCapacityUtilizationPct || 0,
        warehouses: (wh.warehouseBreakdowns || []).map(w => ({
          warehouseId: w.warehouseId,
          name: w.name,
          region: w.region,
          storedUnits: w.storedUnits,
          utilizationPct: w.utilizationPct,
          fulfillmentCostPerOrder: w.fulfillmentCostPerOrder
        })),
        hasRegionalImbalance: Boolean(distribution.imbalances && distribution.imbalances.length > 0),
        imbalances: distribution.imbalances || [],
        provenance: '[Calculated Value]'
      };
    }
  },

  getCarrierPerformance: {
    name: 'getCarrierPerformance',
    domain: 'OPERATIONS',
    description: 'Evaluates carrier logistics performance, SLA transit variance, freight cost per order, and delivery-delay-driven return rate correlations.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const delivery = calculateDeliveryPerformance(dataset) || {};
      const lanes = calculateShippingLanes(dataset) || [];
      const returnCorr = calculateFulfilmentReturnAnalysis(dataset) || {};

      return {
        overallOnTimePct: delivery.onTimePct || 0,
        avgTotalDeliveryDays: delivery.avgTotalDeliveryDays || 0,
        avgTransitDays: delivery.avgTransitDays || 0,
        targetTransitDays: delivery.targetTransitDays || 1.8,
        slaVarianceDays: delivery.slaVarianceDays || 0,
        delayedCount: delivery.delayedCount || 0,
        carriers: lanes.map(l => ({
          carrierName: l.primaryCourier || 'Primary Carrier',
          corridor: l.lane,
          orderCount: l.orders,
          avgTransitDays: l.avgTransitDays,
          slaDriftDays: l.slaVarianceDays,
          freightCostPerOrder: l.avgShippingCost,
          returnRatePct: l.returnRatePct,
          returnCorrelationNote: returnCorr.observationNote
        })),
        criticalCorridors: lanes.filter(l => (l.slaVarianceDays || 0) > 1.0).map(l => ({
          corridor: l.lane,
          slaVarianceDays: l.slaVarianceDays,
          returnRatePct: l.returnRatePct
        })),
        returnCorrelation: returnCorr,
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 5: CASH & WORKING CAPITAL
  // =========================================================================

  getCashExposure: {
    name: 'getCashExposure',
    domain: 'CASH',
    description: 'Analyzes inventory locked capital, open supplier PO commitments, marketplace settlement receivables, and net working capital exposure.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const cycle = calculateCapitalFlowLifecycle(dataset) || {};
      const skuWorkingCapital = (dataset.products || []).map(p => calculateSKUWorkingCapital(p, dataset));
      const totalInventory = cycle.currentInventoryCapitalAtCost || 0;
      const totalOpenPOs = cycle.totalCommittedFutureCapital || 0;
      const netLocked = cycle.netWorkingCapitalExposure || (totalInventory + totalOpenPOs);

      const criticalSKUs = skuWorkingCapital
        .filter(s => (s.inventory?.coverageDays || 0) < 30 || (s.inventory?.coverageDays || 0) > 90)
        .map(s => ({
          sku: s.sku,
          name: s.name,
          stockUnits: s.inventory?.stockUnits || 0,
          coverageDays: s.inventory?.coverageDays || 0,
          leadTimeDays: s.inventory?.leadTimeDays || 30,
          capitalLocked: s.inventory?.inventoryCapital || 0,
          status: (s.inventory?.coverageDays || 0) < 30 ? 'STOCKOUT_RISK' : 'EXCESS_CAPITAL'
        }));

      return {
        totalInventoryCapitalLocked: totalInventory,
        totalInventoryCapital: totalInventory,
        openPurchaseOrderCommitments: totalOpenPOs,
        settlementReceivables: cycle.settlementDisbursementExposure || 0,
        netWorkingCapitalExposure: netLocked,
        totalWorkingCapitalLocked: netLocked,
        criticalSKUs,
        provenance: '[Calculated Value]'
      };
    }
  },

  getInventoryAging: {
    name: 'getInventoryAging',
    domain: 'CASH',
    description: 'Evaluates inventory aging distribution across 0-30d, 31-60d, 61-90d, and 90+d aging brackets.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const storeCapital = calculateStoreInventoryCapital(dataset) || {};
      return {
        totalInventoryValue: storeCapital.totalInventoryCapitalAtCost || 0,
        skuAgingSummary: storeCapital.inventoryRecords || [],
        holdingDragMonthly: (storeCapital.totalInventoryCapitalAtCost || 0) * 0.18 / 12,
        provenance: '[Calculated Value]'
      };
    }
  },

  getCapitalFlowLifecycle: {
    name: 'getCapitalFlowLifecycle',
    domain: 'CASH',
    description: 'Retrieves the 7-stage working capital lifecycle from purchase commitments to customer realized cash.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const cycle = calculateCapitalFlowLifecycle(dataset) || {};
      return {
        stages: cycle.stages || [],
        netWorkingCapitalExposure: cycle.netWorkingCapitalExposure || 0,
        totalCommittedFutureCapital: cycle.totalCommittedFutureCapital || 0,
        currentInventoryCapitalAtCost: cycle.currentInventoryCapitalAtCost || 0,
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 6: OPERATIONAL FINDINGS & SIGNALS
  // =========================================================================

  getActiveFindings: {
    name: 'getActiveFindings',
    domain: 'FINDINGS',
    description: 'Retrieves all prioritized operational findings, root causes, and recommended management actions generated by rule evaluation.',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Filter by domain (e.g. "MARGIN EROSION", "MARKETING EFFICIENCY", "WORKING CAPITAL")' }
      },
      required: []
    },
    readOnly: true,
    execute: (dataset, { domain = null } = {}) => {
      const signals = generateSignals(dataset) || [];
      const filtered = domain ? signals.filter(s => s.domain?.toUpperCase() === domain.toUpperCase()) : signals;

      return {
        totalFindingsCount: signals.length,
        findings: filtered.map(s => ({
          id: s.id,
          title: s.title,
          domain: s.domain,
          severity: s.severity,
          whatChanged: s.whatChanged,
          rootCause: s.rootCause,
          whyItMatters: s.whyItMatters,
          recommendedAction: s.recommendedAction,
          evidence: s.evidence || []
        })),
        provenance: '[Calculated Value]'
      };
    }
  },

  getSignalsSummary: {
    name: 'getSignalsSummary',
    domain: 'FINDINGS',
    description: 'Retrieves active operational signals across margin erosion, CAC efficiency, stockout risk, and logistics bottlenecks.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const signals = generateSignals(dataset) || [];
      return {
        signals,
        count: signals.length,
        provenance: '[Calculated Value]'
      };
    }
  },

  getDecisionActionItems: {
    name: 'getDecisionActionItems',
    domain: 'FINDINGS',
    description: 'Synthesizes prioritized actionable operating decisions for merchant leadership.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const crossFindings = detectCrossFunctionalFindings(dataset) || [];
      const signals = generateSignals(dataset) || [];
      const actionItems = signals.map(s => ({
        id: s.id,
        title: s.title,
        priority: s.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        recommendedAction: s.recommendedAction
      }));

      return {
        actionItems,
        crossFunctionalFindingsCount: crossFindings.length,
        provenance: '[Calculated Value]'
      };
    }
  },

  // =========================================================================
  // DOMAIN 7: INVESTIGATION WORKFLOW MULTI-STEP TOOLS
  // =========================================================================

  investigateContributionChange: {
    name: 'investigateContributionChange',
    domain: 'INVESTIGATION',
    description: 'Performs multi-driver root cause decomposition of contribution margin changes across discounts, ad CAC, marketplace take-rates, and reverse logistics friction.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      const summary = calculateStoreEconomics(dataset);
      const products = calculateProductPerformance(dataset) || [];
      const signals = generateSignals(dataset) || [];

      // Rank SKUs by lowest contribution margin
      const marginDraggers = [...products]
        .filter(p => (p.trueContributionMarginPct ?? 0) < 20)
        .sort((a, b) => (a.trueContributionMarginPct ?? 0) - (b.trueContributionMarginPct ?? 0));

      const drivers = [];
      const costDrivers = summary.costDrivers || [];

      // Identify major drivers
      costDrivers.forEach(cd => {
        if (cd.amount > 0) {
          drivers.push({
            name: cd.name,
            amount: cd.amount,
            pctOfRevenue: cd.pctOfRevenue || 0,
            impact: `Absorbs ${(cd.pctOfRevenue || 0).toFixed(1)}% of realized revenue`
          });
        }
      });

      return {
        blendedContributionMarginPct: summary.trueContributionMarginPct || 0,
        blendedGrossMarginPct: summary.grossMarginPct || 0,
        costToServePct: summary.costToServePct || 0,
        topCostDriver: summary.costDrivers?.find(d => d.amount > 0)?.name || 'Advertising Spend',
        primaryDrivers: drivers,
        marginDraggers: marginDraggers.map(p => ({
          sku: p.sku,
          name: p.name,
          marginPct: p.trueContributionMarginPct ?? 0,
          contribution: p.trueContribution || 0,
          revenue: p.realizedRevenue || p.revenue || 0
        })),
        correlatedSignals: signals.filter(s => s.domain === 'MARGIN EROSION' || s.domain === 'MARKETING EFFICIENCY'),
        provenance: '[Calculated Value]'
      };
    }
  },

  investigateSKUWorkingCapital: {
    name: 'investigateSKUWorkingCapital',
    domain: 'INVESTIGATION',
    description: 'Performs deep-dive working capital diagnostic on a specific SKU.',
    parameters: {
      type: 'object',
      properties: {
        sku: { type: 'string', description: 'The unique SKU identifier' }
      },
      required: ['sku']
    },
    readOnly: true,
    execute: (dataset, { sku }) => {
      const product = (dataset.products || []).find(p => p.sku === sku);
      if (!product) return { error: `SKU "${sku}" not found.` };
      const wc = calculateSKUWorkingCapital(product, dataset);
      return {
        sku: product.sku,
        name: product.name,
        skuWorkingCapitalLocked: wc.inventory?.inventoryCapital || 0,
        coverageDays: wc.inventory?.coverageDays || 0,
        reorderLeadTimeDays: wc.inventory?.leadTimeDays || 30,
        status: wc.inventory?.status || 'NORMAL',
        provenance: '[Calculated Value]'
      };
    }
  },

  getDatasetDiagnostics: {
    name: 'getDatasetDiagnostics',
    domain: 'INVESTIGATION',
    description: 'Inspects catalog and transactional record counts, source data mode, and date coverage.',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    },
    readOnly: true,
    execute: (dataset) => {
      return {
        skuCount: dataset.products?.length || 0,
        orderCount: dataset.orders?.length || 0,
        dataMode: dataset.source || 'demo',
        hasCatalog: Boolean(dataset.products && dataset.products.length > 0),
        provenance: '[Calculated Value]'
      };
    }
  }
};

export const AGENT_TOOLS = TOOL_REGISTRY;
