import { TOOL_REGISTRY } from './toolRegistry.js';
import { buildProvenanceContext, formatINR, formatINRAccurate } from './evidenceService.js';

/**
 * Multi-Step Investigation Planner for Sind & Sind Operating Agent.
 * Plans, chains, and executes tool calls deterministically over the active commerce dataset.
 */

export class InvestigationPlanner {
  constructor(registry = TOOL_REGISTRY) {
    this.registry = registry;
  }

  /**
   * Classifies user inquiry into specific analytical intent.
   */
  classifyIntent(query, activeSKU, currentRoute, products = []) {
    const q = (query || '').toLowerCase().trim();

    // Check if query is targeting a specific SKU in the catalog
    const matchedProduct = products.find(p => 
      (p.sku && q.includes(p.sku.toLowerCase())) || 
      (p.name && q.includes(p.name.toLowerCase()))
    );
    const targetSku = matchedProduct?.sku || (activeSKU && products.some(p => p.sku === activeSKU) ? activeSKU : null);

    if (targetSku) {
      if (q.includes('price') || q.includes('discount') || q.includes('floor')) {
        return { intent: 'PRICING_INVESTIGATION', targetSku };
      }
      if (q.includes('amazon') || q.includes('channel') || q.includes('marketplace') || q.includes('fba')) {
        return { intent: 'MARKETPLACE_INVESTIGATION', targetSku };
      }
      if (q.includes('cash') || q.includes('stock') || q.includes('inventory')) {
        return { intent: 'WORKING_CAPITAL_INVESTIGATION', targetSku };
      }
      return { intent: 'SKU_DIAGNOSTIC', targetSku };
    }

    if (q.includes('review') || q.includes('operating position') || q.includes('overall performance') || q.includes('28 days') || q.includes('store performance')) {
      return { intent: 'FULL_OPERATING_REVIEW', targetSku: null };
    }

    if (q.includes('contribution') || q.includes('margin') || q.includes('profit') || q.includes('drag') || q.includes('erosion')) {
      return { intent: 'CONTRIBUTION_INVESTIGATION', targetSku: null };
    }

    if (q.includes('cash') || q.includes('working capital') || q.includes('inventory capital') || q.includes('tied up') || q.includes('purchase order') || q.includes('open po') || q.includes('stockout') || currentRoute?.startsWith('/app/cash')) {
      return { intent: 'WORKING_CAPITAL_INVESTIGATION', targetSku: null };
    }

    if (q.includes('price') || q.includes('pricing') || q.includes('discount') || q.includes('headroom') || currentRoute?.startsWith('/app/pricing')) {
      return { intent: 'PRICING_INVESTIGATION', targetSku: products[0]?.sku || null };
    }

    if (q.includes('marketplace') || q.includes('channel') || q.includes('amazon') || q.includes('myntra') || q.includes('take-rate') || currentRoute?.startsWith('/app/marketplaces')) {
      return { intent: 'MARKETPLACE_INVESTIGATION', targetSku: products[0]?.sku || null };
    }

    if (q.includes('operation') || q.includes('fulfilment') || q.includes('fulfillment') || q.includes('return') || q.includes('carrier') || q.includes('warehouse') || q.includes('delivery') || q.includes('shipping') || currentRoute?.startsWith('/app/operations')) {
      return { intent: 'OPERATIONS_RETURN_INVESTIGATION', targetSku: null };
    }

    if (q.includes('finding') || q.includes('signal') || q.includes('attention') || q.includes('priority') || currentRoute?.startsWith('/app/signals')) {
      return { intent: 'FINDINGS_REVIEW', targetSku: null };
    }

    return { intent: 'FULL_OPERATING_REVIEW', targetSku: null };
  }

  /**
   * Executes a plan of controlled tool steps sequentially, inspecting intermediate outputs.
   */
  async planAndExecute({ query, activeSKU, currentRoute, dataset, storeName, dataMode }) {
    const startTime = Date.now();
    const products = dataset?.products || [];
    const orders = dataset?.orders || [];
    const prov = buildProvenanceContext(dataMode, dataset?.source);

    const stepsTelemetry = [];
    const evidencePackage = {
      query,
      storeName,
      dataMode,
      intent: null,
      targetSku: null,
      primaryMetrics: {},
      evidencePoints: [],
      toolResults: {},
      durationMs: 0
    };

    // 1. EMPTY DATASET GUARD
    if (products.length === 0 && orders.length === 0) {
      evidencePackage.intent = 'EMPTY_DATASET';
      evidencePackage.evidencePoints.push({
        label: 'Catalog Data',
        value: '0 SKUs',
        provenance: '[Insufficient Data]'
      });
      evidencePackage.evidencePoints.push({
        label: 'Order Telemetry',
        value: '0 Orders',
        provenance: '[Insufficient Data]'
      });
      stepsTelemetry.push({
        stepNumber: 1,
        stepName: 'Verify Data Availability',
        reason: 'Check active dataset availability',
        tool: 'None',
        toolName: 'getDatasetDiagnostics',
        status: 'insufficient_data',
        resultSummary: 'No active commerce records found',
        durationMs: 0
      });

      return {
        evidencePackage,
        stepsTelemetry,
        durationMs: Date.now() - startTime
      };
    }

    // 2. CLASSIFY INTENT
    const { intent, targetSku } = this.classifyIntent(query, activeSKU, currentRoute, products);
    evidencePackage.intent = intent;
    evidencePackage.targetSku = targetSku;

    // 3. EXECUTE MULTI-STEP INVESTIGATION
    let stepCount = 0;
    const executeStep = (reason, toolName, args = {}) => {
      stepCount += 1;
      const tool = this.registry[toolName];
      if (!tool) throw new Error(`Tool "${toolName}" not found in registry.`);
      const t0 = Date.now();
      const result = tool.execute(dataset, args);
      const duration = Date.now() - t0;
      evidencePackage.toolResults[toolName] = result;

      let summary = 'Calculated metrics';
      if (toolName === 'getStoreSummary') {
        summary = `Revenue: ${formatINR(result.realizedRevenue)}, Margin: ${result.trueContributionMarginPct?.toFixed(1)}%`;
      } else if (toolName === 'investigateContributionChange') {
        summary = `Identified ${result.marginDraggers?.length || 0} sub-marginal SKUs`;
      } else if (toolName === 'getCashExposure') {
        summary = `Locked Capital: ${formatINR(result.netWorkingCapitalExposure)}`;
      } else if (toolName === 'getSKUUnitEconomics') {
        summary = `${result.sku} Unit Margin: ${result.trueContributionMarginPct?.toFixed(1)}%`;
      } else if (toolName === 'getPricingEconomics') {
        summary = `ASP: ${formatINRAccurate(result.unitRealizedPrice)}, Floor: ${formatINRAccurate(result.requiredRealizedPrice)}`;
      } else if (toolName === 'getCarrierPerformance') {
        summary = `On-time: ${result.overallOnTimePct?.toFixed(1)}%, Transit: ${result.avgTransitDays?.toFixed(1)}d`;
      } else if (toolName === 'getActiveFindings' || toolName === 'getSignalsSummary') {
        summary = `Found ${result.findings?.length || result.signals?.length || 0} active operating signals`;
      }

      stepsTelemetry.push({
        stepNumber: stepCount,
        stepName: reason,
        reason,
        tool: toolName,
        toolName,
        args,
        status: 'completed',
        resultSummary: summary,
        durationMs: duration
      });
      return result;
    };

    switch (intent) {
      // -----------------------------------------------------------------------
      // CONTRIBUTION INVESTIGATION
      // -----------------------------------------------------------------------
      case 'CONTRIBUTION_INVESTIGATION': {
        // Step 1: Macro store economics
        const storeSummary = executeStep('Retrieve store-wide contribution waterfall', 'getStoreSummary');
        
        // Step 2: Investigate contribution drivers & margin draggers
        const contribDiag = executeStep('Decompose contribution variance & identify dragger SKUs', 'investigateContributionChange');
        
        // Step 3: Deep dive into the worst margin dragger SKU if found
        const worstSku = contribDiag.marginDraggers?.[0]?.sku || products[0]?.sku;
        if (worstSku) {
          executeStep(`Audit unit economics for primary dragger SKU (${worstSku})`, 'getSKUUnitEconomics', { sku: worstSku });
          executeStep(`Check pricing floor & discount headroom for SKU (${worstSku})`, 'getPricingEconomics', { sku: worstSku });
        }

        // Step 4: Check cross-functional findings
        executeStep('Cross-reference active margin & acquisition findings', 'getActiveFindings', { domain: 'MARGIN EROSION' });

        // Package key evidence
        evidencePackage.evidencePoints.push(
          { label: 'Realized Revenue', value: formatINR(storeSummary.realizedRevenue), provenance: prov },
          { label: 'Blended Gross Margin', value: `${(storeSummary.grossMarginPct ?? 0).toFixed(1)}%`, provenance: '[Calculated Value]' },
          { label: 'Cost-to-Serve', value: `${(storeSummary.costToServePct ?? 0).toFixed(1)}% (${formatINR(storeSummary.totalCostToServe)})`, provenance: '[Calculated Value]' },
          { label: 'True Contribution', value: `${(storeSummary.trueContributionMarginPct ?? 0).toFixed(1)}% (${formatINR(storeSummary.trueContribution)})`, provenance: '[Calculated Value]' },
          { label: 'Primary Cost Driver', value: storeSummary.topCostDriver, provenance: '[Calculated Value]' },
          { label: 'Sub-Marginal SKUs (<20%)', value: `${contribDiag.marginDraggers?.length || 0} SKU(s)`, provenance: '[Calculated Value]' }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // WORKING CAPITAL & CASH INVESTIGATION
      // -----------------------------------------------------------------------
      case 'WORKING_CAPITAL_INVESTIGATION': {
        // Step 1: Overall cash exposure
        const cashExposure = executeStep('Audit total working capital commitments & inventory capital', 'getCashExposure');
        
        // Step 2: 7-stage capital flow lifecycle
        executeStep('Evaluate 7-stage working capital lifecycle', 'getCapitalFlowLifecycle');

        // Step 3: If target SKU specified or critical risk SKU found, audit its working capital
        const criticalSku = targetSku || cashExposure.criticalSKUs?.[0]?.sku || products[0]?.sku;
        if (criticalSku) {
          executeStep(`Inspect inventory coverage & supplier lead time for SKU (${criticalSku})`, 'getSKUUnitEconomics', { sku: criticalSku });
        }

        // Step 4: Active findings in working capital
        executeStep('Cross-reference working capital & supply bottleneck findings', 'getActiveFindings', { domain: 'WORKING CAPITAL' });

        evidencePackage.evidencePoints.push(
          { label: 'Inventory Capital Locked', value: formatINR(cashExposure.totalInventoryCapitalLocked), provenance: '[Calculated Value]' },
          { label: 'Open Supplier POs', value: formatINR(cashExposure.openPurchaseOrderCommitments), provenance: prov },
          { label: 'Settlement Receivables', value: formatINR(cashExposure.settlementReceivables), provenance: '[Calculated Value]' },
          { label: 'Net Working Capital Exposure', value: formatINR(cashExposure.netWorkingCapitalExposure), provenance: '[Calculated Value]' },
          { label: 'Critical Inventory Lines', value: `${cashExposure.criticalSKUs?.length || 0} SKU(s)`, provenance: '[Calculated Value]' }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // PRICING INVESTIGATION
      // -----------------------------------------------------------------------
      case 'PRICING_INVESTIGATION': {
        const skuToAudit = targetSku || products[0]?.sku;
        const pricingEco = executeStep(`Evaluate pricing floor & discount headroom for SKU (${skuToAudit})`, 'getPricingEconomics', { sku: skuToAudit });
        executeStep(`Run price sensitivity scenario simulation for SKU (${skuToAudit})`, 'getPriceSensitivity', { sku: skuToAudit });
        executeStep(`Audit complete unit cost-to-serve waterfall for SKU (${skuToAudit})`, 'getSKUUnitEconomics', { sku: skuToAudit });
        executeStep('Cross-reference active pricing & margin signals', 'getActiveFindings');

        evidencePackage.evidencePoints.push(
          { label: 'Target SKU', value: skuToAudit, provenance: prov },
          { label: 'List Price', value: formatINRAccurate(pricingEco.listPrice), provenance: prov },
          { label: 'Realized ASP', value: formatINRAccurate(pricingEco.unitRealizedPrice), provenance: prov },
          { label: 'Required Realized Floor', value: formatINRAccurate(pricingEco.requiredRealizedPrice), provenance: '[Calculated Value]' },
          { label: 'Discount Headroom', value: formatINRAccurate(pricingEco.discountHeadroom), provenance: '[Calculated Value]' },
          { label: 'Contribution Margin', value: `${(pricingEco.currentContributionMarginPct ?? 0).toFixed(1)}%`, provenance: '[Calculated Value]' }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // MARKETPLACE INVESTIGATION
      // -----------------------------------------------------------------------
      case 'MARKETPLACE_INVESTIGATION': {
        const skuToAudit = targetSku || products[0]?.sku;
        const mktEco = executeStep('Compare store-wide marketplace fee structures', 'getMarketplaceEconomics');
        if (skuToAudit) {
          executeStep(`Decompose channel economics & Amazon FBA fit for SKU (${skuToAudit})`, 'compareChannelEconomics', { sku: skuToAudit });
        }
        executeStep('Cross-reference active channel findings', 'getActiveFindings');

        evidencePackage.evidencePoints.push(
          { label: 'Monitored Channels', value: `${mktEco.channels?.length || 0} Channels`, provenance: '[Calculated Value]' },
          { label: 'D2C Take-Rate', value: `${mktEco.channels?.find(c => c.channelId === 'shopify_d2c')?.takeRatePct || 2.0}%`, provenance: '[Calculated Value]' },
          { label: 'Amazon FBA Take-Rate', value: `${mktEco.channels?.find(c => c.channelId === 'amazon_fba')?.takeRatePct || 14.5}%`, provenance: '[Configured Demo Assumption]' },
          { label: 'Target SKU Channel Fit', value: skuToAudit || 'Catalog-Wide', provenance: prov }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // OPERATIONS & RETURN INVESTIGATION
      // -----------------------------------------------------------------------
      case 'OPERATIONS_RETURN_INVESTIGATION': {
        const carrierPerf = executeStep('Evaluate carrier delivery performance & return rate correlations', 'getCarrierPerformance');
        executeStep('Audit multi-warehouse capacity & geographic stock imbalance', 'getWarehouseEconomics');
        executeStep('Cross-reference operational fulfillment signals', 'getActiveFindings', { domain: 'FULFILMENT BOTTLENECK' });

        evidencePackage.evidencePoints.push(
          { label: 'Overall On-Time Delivery', value: `${(carrierPerf.overallOnTimePct ?? 0).toFixed(1)}%`, provenance: prov },
          { label: 'Avg Transit Time', value: `${(carrierPerf.avgTransitDays ?? 0).toFixed(1)} Days`, provenance: prov },
          { label: 'Critical Shipping Corridors', value: `${carrierPerf.criticalCorridors?.length || 0} Corridor(s)`, provenance: '[Calculated Value]' }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // SKU DIAGNOSTIC
      // -----------------------------------------------------------------------
      case 'SKU_DIAGNOSTIC': {
        const skuEco = executeStep(`Audit unit economics waterfall for SKU (${targetSku})`, 'getSKUUnitEconomics', { sku: targetSku });
        const pricingEco = executeStep(`Evaluate discount headroom & floor for SKU (${targetSku})`, 'getPricingEconomics', { sku: targetSku });
        executeStep(`Compare cross-channel economics for SKU (${targetSku})`, 'compareChannelEconomics', { sku: targetSku });
        executeStep('Cross-reference active signals for SKU', 'getActiveFindings');

        evidencePackage.evidencePoints.push(
          { label: 'SKU Identifier', value: targetSku, provenance: prov },
          { label: 'Product Name', value: skuEco.name || targetSku, provenance: prov },
          { label: 'Realized ASP', value: formatINRAccurate(skuEco.avgSellingPrice), provenance: prov },
          { label: 'Unit COGS', value: formatINRAccurate(skuEco.unitCost), provenance: prov },
          { label: 'Cost-to-Serve', value: `${(skuEco.costToServePct ?? 0).toFixed(1)}% (${formatINR(skuEco.unitCostToServe)}/unit)`, provenance: '[Calculated Value]' },
          { label: 'True Contribution', value: `${(skuEco.trueContributionMarginPct ?? 0).toFixed(1)}% (${formatINR(skuEco.unitContribution)}/unit)`, provenance: '[Calculated Value]' },
          { label: 'Discount Headroom', value: formatINRAccurate(pricingEco.discountHeadroom), provenance: '[Calculated Value]' }
        );
        break;
      }

      // -----------------------------------------------------------------------
      // DEFAULT FULL OPERATING REVIEW / FINDINGS
      // -----------------------------------------------------------------------
      case 'FINDINGS_REVIEW':
      case 'FULL_OPERATING_REVIEW':
      default: {
        const storeSummary = executeStep('Retrieve store-wide commercial performance', 'getStoreSummary');
        const contribDiag = executeStep('Decompose contribution drivers', 'investigateContributionChange');
        const cashExposure = executeStep('Audit working capital exposure', 'getCashExposure');
        const activeFindings = executeStep('Retrieve all prioritized operational findings', 'getActiveFindings');

        evidencePackage.evidencePoints.push(
          { label: 'Realized Revenue', value: formatINR(storeSummary.realizedRevenue), provenance: prov },
          { label: 'Gross Margin', value: `${(storeSummary.grossMarginPct ?? 0).toFixed(1)}% (${formatINR(storeSummary.grossProfit)})`, provenance: '[Calculated Value]' },
          { label: 'Total Cost-to-Serve', value: `${(storeSummary.costToServePct ?? 0).toFixed(1)}% (${formatINR(storeSummary.totalCostToServe)})`, provenance: '[Calculated Value]' },
          { label: 'True Contribution', value: `${(storeSummary.trueContributionMarginPct ?? 0).toFixed(1)}% (${formatINR(storeSummary.trueContribution)})`, provenance: '[Calculated Value]' },
          { label: 'Working Capital Locked', value: formatINR(cashExposure.totalWorkingCapitalLocked), provenance: '[Calculated Value]' },
          { label: 'Active Critical Findings', value: `${activeFindings.findings?.length || 0} Diagnoses`, provenance: '[Calculated Value]' }
        );
        break;
      }
    }

    evidencePackage.durationMs = Date.now() - startTime;

    return {
      evidencePackage,
      stepsTelemetry,
      durationMs: evidencePackage.durationMs
    };
  }
}

export const defaultInvestigationPlanner = new InvestigationPlanner();
