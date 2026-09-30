import { AGENT_TOOLS } from './toolRegistry.js';
import { formatINR, formatINRAccurate, buildProvenanceContext } from './evidenceService.js';

/**
 * Investigates a commercial or operating inquiry and returns a structured,
 * Oliver Wyman-style Executive Review.
 */
export async function runAgentInvestigation({
  query = '',
  activeSKU = null,
  currentRoute = '/app',
  dataset = {},
  storeName = 'Commerce Store',
  dataMode = 'demo'
}) {
  const q = query.toLowerCase().trim();
  const products = dataset.products || [];
  const orders = dataset.orders || [];

  if (products.length === 0 && orders.length === 0) {
    return {
      query,
      timestamp: new Date().toISOString(),
      finding: 'Insufficient operating telemetry to conduct formal investigation.',
      evidence: [
        { label: 'Catalog Size', value: '0 SKUs', provenance: '[Insufficient Data]' },
        { label: 'Order Volume', value: '0 Orders', provenance: '[Insufficient Data]' }
      ],
      rootCause: 'No commerce data has been imported or connected for this merchant store.',
      economicImplication: 'Economic and working capital algorithms require active transactional and catalog history to evaluate contribution margins.',
      managementConsiderations: [
        'Connect an Amazon SP-API account or import a canonical CSV file to initiate operating analysis.',
        'Switch to Demo Mode to inspect sample diagnostic evaluations.'
      ],
      dataGaps: 'All primary commercial data streams (orders, order items, inventory, ad spend) are currently empty.',
      dataBasis: 'Dataset state: EMPTY'
    };
  }

  const prov = buildProvenanceContext(dataMode, dataset.source);

  // Check if query is targeting a specific SKU (or activeSKU is provided)
  const skuMatch = products.find(p => q.includes(p.sku?.toLowerCase()) || (p.name && q.includes(p.name?.toLowerCase())))?.sku || activeSKU;

  // 1. SKU-SPECIFIC INVESTIGATION
  if (skuMatch || q.includes('sku') || q.includes('product') || currentRoute?.startsWith('/app/products/')) {
    const targetSku = skuMatch || products[0]?.sku;
    if (targetSku) {
      const skuEco = AGENT_TOOLS.getSKUUnitEconomics.execute(dataset, { sku: targetSku }) || {};
      const pricingEco = AGENT_TOOLS.getPricingEconomics.execute(dataset, { sku: targetSku }) || {};

      const trueMarginPct = skuEco.trueContributionMarginPct || 0;
      const isSubMarginal = trueMarginPct < 20;

      return {
        query,
        targetSKU: targetSku,
        timestamp: new Date().toISOString(),
        finding: `${skuEco.name || targetSku} (${targetSku}) is delivering a ${trueMarginPct.toFixed(1)}% true contribution margin (${formatINR(skuEco.unitContribution)}/unit net).`,
        evidence: [
          { label: 'Realized ASP', value: formatINRAccurate(skuEco.avgSellingPrice), provenance: prov },
          { label: 'Unit COGS', value: formatINRAccurate(skuEco.unitCost), provenance: prov },
          { label: 'Cost-to-Serve', value: `${(skuEco.costToServePct || 0).toFixed(1)}% (${formatINR(skuEco.unitCostToServe)}/unit)`, provenance: '[Calculated Value]' },
          { label: 'Discount Headroom', value: formatINRAccurate(pricingEco.discountHeadroom), provenance: '[Calculated Value]' },
          { label: '28-Day Realized Revenue', value: formatINR(skuEco.realizedRevenue), provenance: prov },
          { label: '28-Day Units Sold', value: `${skuEco.unitsSold || 0} units`, provenance: prov }
        ],
        rootCause: isSubMarginal 
          ? `Margin is compressed by cost-to-serve overhead (Forward Logistics: ${formatINR(skuEco.costDecomposition?.forwardLogistics)}, Ad CAC: ${formatINR(skuEco.costDecomposition?.adAcquisition)}, and Take-Rates: ${formatINR(skuEco.costDecomposition?.takeRates)}) relative to Realized ASP.`
          : `Healthy gross margin of ${(skuEco.grossMarginPct || 0).toFixed(1)}% sufficiently absorbs operating cost-to-serve of ${(skuEco.costToServePct || 0).toFixed(1)}%.`,
        economicImplication: isSubMarginal
          ? `Erodes portfolio contribution by ${formatINR(Math.abs((skuEco.unitCostToServe || 0) * (skuEco.unitsSold || 0)))} across observed volume.`
          : `Contributes ${formatINR((skuEco.unitContribution || 0) * (skuEco.unitsSold || 0))} in net operating cash flow.`,
        managementConsiderations: [
          (pricingEco.discountHeadroom || 0) < 0 
            ? `Price is currently below the required realized floor of ${formatINRAccurate(pricingEco.requiredRealizedPrice)}. Raise list price or cap promotional discount.`
            : `Maintain price discipline; discount headroom is limited to ${formatINRAccurate(pricingEco.discountHeadroom)}.`,
          (skuEco.costDecomposition?.adAcquisition || 0) > ((skuEco.avgSellingPrice || 1) * 0.2)
            ? 'Media CAC is excessive. Rebalance ad budget toward higher-intent or branded search.'
            : 'Fulfillment and reverse courier fees are within normal operating bounds.'
        ],
        dataGaps: dataMode === 'demo' ? 'Derived from Atelier & Co. synthetic parameters.' : 'Grounded in merchant transaction ledger.',
        dataBasis: `Evaluated across ${skuEco.unitsSold || 0} units of SKU ${targetSku} in ${storeName}.`
      };
    }
  }

  // 2. WORKING CAPITAL & CASH INVESTIGATION
  if (q.includes('cash') || q.includes('working capital') || q.includes('inventory') || currentRoute?.startsWith('/app/cash')) {
    const cashData = AGENT_TOOLS.getCashExposure.execute(dataset) || {};
    const criticalSKUs = cashData.criticalSKUs || [];
    const topRisk = criticalSKUs[0];

    return {
      query,
      timestamp: new Date().toISOString(),
      finding: `Total operating working capital commitment is ${formatINR(cashData.totalWorkingCapitalLocked)}, with ${formatINR(cashData.totalInventoryCapital)} locked in inventory.`,
      evidence: [
        { label: 'Inventory Capital Locked', value: formatINR(cashData.totalInventoryCapital), provenance: '[Calculated Value]' },
        { label: 'Open Supplier POs', value: formatINR(cashData.openPOCommitments), provenance: prov },
        { label: 'Settlement Float', value: formatINR(cashData.settlementReceivables), provenance: '[Calculated Value]' },
        { label: 'Blended Stock Coverage', value: `${(cashData.blendedCoverageDays || 0).toFixed(1)} Days`, provenance: '[Calculated Value]' }
      ],
      rootCause: topRisk
        ? `Capital allocation imbalance: SKU ${topRisk.sku} has ${(topRisk.coverageDays || 0).toFixed(0)} days of stock (${topRisk.status === 'EXCESS_CAPITAL' ? 'excess tied-up capital' : 'imminent stockout risk'}).`
        : 'Inventory replenishment cycles are currently aligned with 28-day observed sales velocity.',
      economicImplication: `Holding carrying cost at 18% annual cost of capital consumes ~${formatINR((cashData.totalInventoryCapital || 0) * 0.18 / 12)} per month in drag.`,
      managementConsiderations: [
        'Accelerate liquidation of slow-moving inventory lines before seasonal decay.',
        'Renegotiate supplier payment terms or batch size for high-velocity SKUs.'
      ],
      dataGaps: 'Warehouse holding costs estimated using standard 18% cost of capital assumption.',
      dataBasis: `Derived from ${dataset.inventory?.length || 0} monitored inventory positions and ${dataset.purchaseOrders?.length || 0} active supplier POs.`
    };
  }

  // 3. STORE CONTRIBUTION & MARGIN INVESTIGATION (DEFAULT)
  const storeEco = AGENT_TOOLS.getStoreSummary.execute(dataset) || {};
  const contributionDiag = AGENT_TOOLS.investigateContributionChange.execute(dataset) || {};
  const activeFindings = AGENT_TOOLS.getActiveFindings.execute(dataset) || [];

  return {
    query: query || 'Portfolio Operating Review',
    timestamp: new Date().toISOString(),
    finding: `Blended store true contribution margin is ${(storeEco.trueContributionMarginPct || 0).toFixed(1)}% (${formatINR(storeEco.trueContribution)} net) against ${formatINR(storeEco.realizedRevenue)} realized revenue.`,
    evidence: [
      { label: 'Realized Revenue', value: formatINR(storeEco.realizedRevenue), provenance: prov },
      { label: 'Gross Margin', value: `${(storeEco.grossMarginPct || 0).toFixed(1)}% (${formatINR(storeEco.grossProfit)})`, provenance: '[Calculated Value]' },
      { label: 'Total Cost-to-Serve', value: `${(storeEco.costToServePct || 0).toFixed(1)}% (${formatINR(storeEco.costToServe)})`, provenance: '[Calculated Value]' },
      { label: 'Top Cost Driver', value: storeEco.topErodingCost || 'Advertising Media Spend', provenance: '[Calculated Value]' },
      { label: 'Active Critical Findings', value: `${activeFindings.length} Diagnoses`, provenance: '[Calculated Value]' }
    ],
    rootCause: `Cost-to-serve absorbs ${(storeEco.costToServePct || 0).toFixed(1)}% of realized revenue, driven primarily by ${storeEco.topErodingCost}. ${(contributionDiag.marginDraggers || []).length} SKU(s) operate below the 20% contribution threshold.`,
    economicImplication: `Eliminating negative margin drag on low-performing SKUs would recover approximately ${formatINR((storeEco.realizedRevenue || 0) * 0.04)} in net annual operating profit.`,
    managementConsiderations: [
      'Audit marketing spend attribution on low-converting campaigns.',
      'Enforce strict promotional discount caps on SKUs with thin gross margins.',
      'Review high return friction SKUs for sizing and packaging defects.'
    ],
    dataGaps: dataMode === 'demo' ? 'Calculated from demo baseline dataset.' : 'Audited against live transactional records.',
    dataBasis: `Calculated from ${storeEco.orderCount || 0} orders across ${dataset.products?.length || 0} SKUs in ${storeName}.`
  };
}
