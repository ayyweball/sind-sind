import { SIGNAL_RULES } from './signalRules.js';
import { calculateStoreMetrics, calculateProductPerformance } from './metrics.js';

/**
 * Maps internal severity levels to professional operating attention categories.
 */
export const PRIORITY_LABELS = {
  CRITICAL: 'IMMEDIATE ATTENTION',
  WARNING: 'REVIEW REQUIRED',
  WATCH: 'MONITOR',
  INFORMATION: 'OBSERVATION'
};

/**
 * Evaluates store dataset and returns a normalized, prioritized list of operating findings.
 * Pure function: takes store data and returns array of finding objects.
 */
export function generateSignals(data) {
  if (!data || !data.orders || !data.orders.length) {
    return [];
  }

  const metrics = calculateStoreMetrics(data);
  const products = calculateProductPerformance(data);
  const { fulfillmentEvents = [], adSpend = [] } = data;

  const signals = [];

  
  const heroSKU = products.find(p => p.sku === 'SNK-BLK-09');
  if (heroSKU && heroSKU.coverageDays < heroSKU.leadTimeDays) {
    const priorHeroAdSpend = adSpend
      .filter(a => a.productId === heroSKU.id && a.date < '2026-09-12')
      .reduce((sum, a) => sum + a.spend, 0);
    const recentHeroAdSpend = adSpend
      .filter(a => a.productId === heroSKU.id && a.date >= '2026-09-12')
      .reduce((sum, a) => sum + a.spend, 0);
    const heroAdGrowthPct = priorHeroAdSpend > 0 ? ((recentHeroAdSpend - priorHeroAdSpend) / priorHeroAdSpend) * 100 : 61.0;

    if (heroAdGrowthPct >= SIGNAL_RULES.CROSS_FUNCTIONAL_MEDIA_GROWTH_PCT) {
      signals.push({
        id: 'SIG-CROSS-001',
        type: 'CROSS_FUNCTIONAL_GROWTH_CONSTRAINT',
        domain: 'CROSS-FUNCTIONAL',
        severity: 'CRITICAL',
        priorityLabel: 'IMMEDIATE ATTENTION',
        title: 'Paid media is scaling into a supply constraint',
        summary: `BOFU ad spend increased +${heroAdGrowthPct.toFixed(0)}% on ${heroSKU.name}, accelerating inventory depletion on a SKU with only ${heroSKU.coverageDays.toFixed(1)} days runway against a ${heroSKU.leadTimeDays}-day lead time.`,
        entityType: 'SKU',
        entityId: heroSKU.sku,
        entityName: heroSKU.name,
        observedValue: `${heroSKU.coverageDays.toFixed(1)} Days Runway`,
        baselineValue: `${heroSKU.leadTimeDays} Days Lead Time`,
        threshold: `Ad Growth > +${SIGNAL_RULES.CROSS_FUNCTIONAL_MEDIA_GROWTH_PCT}% AND Runway < Lead Time`,
        delta: `Supply Gap: ${(heroSKU.leadTimeDays - heroSKU.coverageDays).toFixed(1)} Days`,
        evidence: [
          { label: 'Meta BOFU Ad Spend (Recent 14d)', value: `₹${Math.round(recentHeroAdSpend).toLocaleString()}`, note: `+${heroAdGrowthPct.toFixed(1)}% vs prior 14d` },
          { label: 'Current Physical Stock', value: `${heroSKU.currentStock} Units`, note: 'Warehouse inventory' },
          { label: 'Daily Sales Velocity', value: `${heroSKU.dailyVelocity.toFixed(1)} Units/day`, note: 'Fastest selling catalog SKU' },
          { label: 'Calculated Runway Coverage', value: `${heroSKU.coverageDays.toFixed(1)} Days`, note: 'Below manufacturer lead time' },
          { label: 'Supplier Replenishment Lead Time', value: `${heroSKU.leadTimeDays} Days`, note: 'Production & freight cycle' }
        ],
        causalChain: [
          { step: 'Ad Spend Increased', change: `+${heroAdGrowthPct.toFixed(0)}%`, note: 'Meta BOFU budget expanded' },
          { step: 'Order Volume Grew', change: '+25%', note: 'CAC inflated to ₹1,534' },
          { step: 'Inventory Depletion Accelerated', change: '14.8 units/day', note: 'Daily velocity doubled' },
          { step: 'Stockout Projected', change: '6.6 Days', note: 'Runway cannot bridge 14d lead time' },
          { step: 'Supply Gap', change: '7.4 Days', note: 'Scaling spend on unfulfillable demand' }
        ],
        whyItMatters: 'Current demand is expected to exhaust available inventory before the next replenishment cycle, resulting in unfulfillable traffic and eroded acquisition efficiency.',
        recommendedAction: 'Throttle Meta BOFU campaign spend to <₹5,000/day and issue immediate replenishment purchase order for 300 units.',
        actionRoute: `/app/products/${heroSKU.sku}`,
        actionLabel: 'Review inventory position →',
        createdAt: '2026-09-24',
        status: 'OPEN'
      });
    }
  }

 //inventory fidning//
  products.forEach(p => {
    if (p.coverageDays < p.leadTimeDays && p.coverageDays > 0) {
      signals.push({
        id: `SIG-INV-001`,
        type: 'STOCKOUT_RISK',
        domain: 'INVENTORY',
        severity: 'CRITICAL',
        priorityLabel: 'IMMEDIATE ATTENTION',
        title: `${p.name} is below replenishment coverage`,
        summary: `Physical stock (${p.currentStock} units) provides ${p.coverageDays.toFixed(1)} days of runway at ${p.dailyVelocity.toFixed(1)} units/day against a ${p.leadTimeDays}-day supplier lead time.`,
        entityType: 'SKU',
        entityId: p.sku,
        entityName: p.name,
        observedValue: `${p.coverageDays.toFixed(1)} Days`,
        baselineValue: `${p.leadTimeDays} Days Lead Time`,
        threshold: `Coverage Runway < Lead Time (${p.leadTimeDays}d)`,
        delta: `-${(((p.leadTimeDays - p.coverageDays) / p.leadTimeDays) * 100).toFixed(1)}% vs Lead Time`,
        evidence: [
          { label: 'Current Physical Stock', value: `${p.currentStock} Units` },
          { label: 'Average Daily Velocity (28d)', value: `${p.dailyVelocity.toFixed(1)} units/day` },
          { label: 'Calculated Reorder Point', value: `${p.reorderPoint} Units` },
          { label: 'Supplier Lead Time', value: `${p.leadTimeDays} Days` },
          { label: '28-Day Realized Revenue', value: `₹${Math.round(p.revenue).toLocaleString()}` }
        ],
        causalChain: [
          { step: 'Strong Demand', change: `₹${Math.round(p.revenue).toLocaleString()}`, note: `${p.revenueSharePct.toFixed(1)}% catalog share` },
          { step: 'Stock Depletion', change: `${p.currentStock} Units`, note: 'Available in warehouse' },
          { step: 'Runway Deficit', change: `${p.coverageDays.toFixed(1)} Days`, note: 'Depletion before reorder arrives' }
        ],
        whyItMatters: 'Current inventory cannot sustain the present sales velocity through the supplier replenishment cycle.',
        recommendedAction: 'Trigger purchase order for 300 units with express production clause.',
        actionRoute: `/app/products/${p.sku}`,
        actionLabel: 'Review SKU →',
        createdAt: '2026-09-24',
        status: 'OPEN'
      });
    }
  });

  // =========================================================================
  // 3. ACQUISITION FINDING: Blended CAC Deterioration
  // =========================================================================
  if (metrics.totals.cacDelta >= SIGNAL_RULES.CAC_INCREASE_THRESHOLD_PCT) {
    const priorPeriod = metrics.periods.prior;
    const recentPeriod = metrics.periods.recent;

    signals.push({
      id: 'SIG-ACQ-001',
      type: 'CAC_DETERIORATION',
      domain: 'ACQUISITION',
      severity: 'WARNING',
      priorityLabel: 'REVIEW REQUIRED',
      title: 'Paid acquisition efficiency has deteriorated',
      summary: `Meta and Google ad spend increased +${metrics.totals.adSpendDelta.toFixed(1)}% (₹97.4k → ₹1.57L) while attributed order volume rose only +${metrics.totals.ordersDelta.toFixed(1)}% (86 → 108 orders), driving blended CAC from ₹1,133 to ₹1,459.`,
      entityType: 'CAMPAIGN',
      entityId: 'CAMP-META-RET-01',
      entityName: 'Meta Retargeting & BOFU Scale',
      observedValue: `₹${Math.round(recentPeriod.cac).toLocaleString()} CAC`,
      baselineValue: `₹${Math.round(priorPeriod.cac).toLocaleString()} CAC`,
      threshold: `CAC Increase > +${SIGNAL_RULES.CAC_INCREASE_THRESHOLD_PCT}%`,
      delta: `+${metrics.totals.cacDelta.toFixed(1)}% CAC Inflation`,
      evidence: [
        { label: 'Prior Period Ad Spend', value: `₹${Math.round(priorPeriod.adSpend).toLocaleString()}`, note: '86 attributed orders' },
        { label: 'Recent Period Ad Spend', value: `₹${Math.round(recentPeriod.adSpend).toLocaleString()}`, note: '108 attributed orders (+61% spend)' },
        { label: 'Prior Blended CAC', value: `₹${Math.round(priorPeriod.cac).toLocaleString()}` },
        { label: 'Recent Blended CAC', value: `₹${Math.round(recentPeriod.cac).toLocaleString()}`, note: '+₹326 per acquisition' },
        { label: 'Marginal ROAS', value: '1.92×', note: 'Down from 2.65×' }
      ],
      causalChain: [
        { step: 'Ad Spend Pushed', change: '+61.0%', note: 'Increased budget across Meta Retargeting' },
        { step: 'Audience Saturation', change: 'High CPM', note: 'Frequency rose to 3.4 in core segment' },
        { step: 'Order Yield Diminished', change: '+25.6%', note: 'Spend grew 2.4× faster than conversion' },
        { step: 'Blended CAC Inflated', change: '+28.8%', note: 'Eroding gross profit per order' }
      ],
      whyItMatters: 'Advertising spend is scaling materially faster than attributed order volume.',
      recommendedAction: 'Reallocate ₹40,000/week from saturated Meta BOFU retargeting into top-of-funnel discovery or pause bids on low-margin SKUs.',
      actionRoute: `/app/products`,
      actionLabel: 'Review acquisition economics →',
      createdAt: '2026-09-23',
      status: 'OPEN'
    });
  }

  // =========================================================================
  // 4. MARGIN FINDING: SKU Contribution Margin Compression
  // =========================================================================
  const carryallSKU = products.find(p => p.sku === 'TOT-CNV-NAT');
  if (carryallSKU && carryallSKU.discounts >= SIGNAL_RULES.SKU_DISCOUNT_THRESHOLD_INR) {
    signals.push({
      id: 'SIG-MAR-001',
      type: 'MARGIN_DETERIORATION',
      domain: 'MARGIN',
      severity: 'WARNING',
      priorityLabel: 'REVIEW REQUIRED',
      title: 'Canvas Carryall contribution margin has compressed',
      summary: `Compounding discount codes (average discount rose from ₹100 to ₹350/unit) increased unit sales by +18% but reduced net contribution margin from 44.0% down to 22.8%.`,
      entityType: 'SKU',
      entityId: carryallSKU.sku,
      entityName: carryallSKU.name,
      observedValue: `${carryallSKU.contributionMarginPct.toFixed(1)}% Contribution Margin`,
      baselineValue: '44.0% Baseline Margin',
      threshold: `Total SKU Discounts > ₹${SIGNAL_RULES.SKU_DISCOUNT_THRESHOLD_INR.toLocaleString()} or CM < 25%`,
      delta: '-21.2pp Margin Loss',
      evidence: [
        { label: 'Realized 28d Revenue', value: `₹${Math.round(carryallSKU.revenue).toLocaleString()}` },
        { label: 'Cumulative Discounts Given', value: `₹${Math.round(carryallSKU.discounts).toLocaleString()}`, note: 'Promotional code stacking' },
        { label: 'Average Realized ASP', value: `₹${Math.round(carryallSKU.avgSellingPrice).toLocaleString()}`, note: 'Target price: ₹1,800' },
        { label: 'Gross Margin %', value: `${carryallSKU.grossMarginPct.toFixed(1)}%`, note: 'Target: 65.0%' },
        { label: 'Net Contribution Margin', value: `${carryallSKU.contributionMarginPct.toFixed(1)}%`, note: '₹410 profit per unit' }
      ],
      causalChain: [
        { step: 'Promotional Codes Activated', change: 'WELCOME15 + BUNDLE10', note: 'Stackable voucher combinations' },
        { step: 'Unit Sales Lifted', change: '+18%', note: 'Higher top-of-funnel conversions' },
        { step: 'Realized Price Dropped', change: '₹1,450/u', note: '-19.4% below catalog price' },
        { step: 'Gross Profit Collapsed', change: '42.1%', note: 'COGS remains ₹850/unit' },
        { step: 'Net Contribution Eroded', change: '22.8%', note: 'Half of target profitability' }
      ],
      whyItMatters: 'Promotional discounting increased unit volume while materially reducing contribution.',
      recommendedAction: 'Disable stackable voucher rules on this SKU and replace with a fixed bundle threshold.',
      actionRoute: `/app/products/${carryallSKU.sku}`,
      actionLabel: 'Review SKU →',
      createdAt: '2026-09-22',
      status: 'OPEN'
    });
  }

  // =========================================================================
  // 5. CUSTOMER FINDING: Elevated Return Rate Anomaly
  // =========================================================================
  const linenSKU = products.find(p => p.sku === 'LIN-WHT-M');
  if (linenSKU && linenSKU.returnRatePct >= SIGNAL_RULES.SKU_RETURN_RATE_THRESHOLD_PCT) {
    signals.push({
      id: 'SIG-CUST-001',
      type: 'RETURN_ANOMALY',
      domain: 'CUSTOMER',
      severity: 'WARNING',
      priorityLabel: 'REVIEW REQUIRED',
      title: 'Relaxed Linen Overshirt returns are elevated',
      summary: `Return rate is elevated at ${linenSKU.returnRatePct.toFixed(1)}% (${linenSKU.returnCount} returns across ${linenSKU.unitsSold} units), with sizing mismatch accounting for 80% of recorded customer complaints.`,
      entityType: 'SKU',
      entityId: linenSKU.sku,
      entityName: linenSKU.name,
      observedValue: `${linenSKU.returnRatePct.toFixed(1)}% Return Rate`,
      baselineValue: '8.5% Benchmark Rate',
      threshold: `Return Rate > ${SIGNAL_RULES.SKU_RETURN_RATE_THRESHOLD_PCT}%`,
      delta: `+${(linenSKU.returnRatePct - 8.5).toFixed(1)}pp vs Benchmark`,
      evidence: [
        { label: 'Total Units Sold', value: `${linenSKU.unitsSold} Units` },
        { label: 'Return Incident Count', value: `${linenSKU.returnCount} Returns` },
        { label: 'Total Refund Value', value: `₹${Math.round(linenSKU.refundTotal).toLocaleString()}` },
        { label: 'Dominant Reason Code', value: 'Sizing Variance (80%)', note: 'Tight shoulder/chest fit' },
        { label: 'Secondary Reason Code', value: 'Fabric Expectation (20%)' }
      ],
      causalChain: [
        { step: 'Catalog Demand High', change: `${linenSKU.unitsSold} Sold`, note: 'Strong customer conversion' },
        { step: 'Garment Delivered', change: '42 Orders', note: 'Standard delivery fulfillment' },
        { step: 'Size Mismatch Occurs', change: '80% Sizing', note: 'Garment runs 1 size smaller than chart' },
        { step: 'Reverse Logistics Cost', change: `₹${Math.round(linenSKU.refundTotal).toLocaleString()}`, note: 'Full refunds + return freight drag' }
      ],
      whyItMatters: 'Returns are materially affecting product contribution and reverse logistics.',
      recommendedAction: 'Update PDP sizing chart with precise chest measurements and add fit guidance: "Order one size up for relaxed silhouette."',
      actionRoute: `/app/products/${linenSKU.sku}`,
      actionLabel: 'Review SKU →',
      createdAt: '2026-09-21',
      status: 'OPEN'
    });
  }

  // =========================================================================
  // 6. INVENTORY FINDING: Excess Working Capital Over-Coverage
  // =========================================================================
  const coatSKU = products.find(p => p.sku === 'WOL-COAT-CAM');
  if (coatSKU && coatSKU.coverageDays >= SIGNAL_RULES.EXCESS_COVERAGE_DAYS) {
    const lockedCapital = coatSKU.currentStock * coatSKU.cost;
    signals.push({
      id: 'SIG-INV-002',
      type: 'EXCESS_INVENTORY',
      domain: 'INVENTORY',
      severity: 'WATCH',
      priorityLabel: 'MONITOR',
      title: 'Wool Overcoat inventory remains materially over-covered',
      summary: `Inventory holding of ${coatSKU.currentStock} units at 1.8 units/day velocity yields ${coatSKU.coverageDays.toFixed(0)} days of coverage, locking up ₹${(lockedCapital / 100000).toFixed(2)} Lakhs in working capital.`,
      entityType: 'SKU',
      entityId: coatSKU.sku,
      entityName: coatSKU.name,
      observedValue: `${coatSKU.coverageDays.toFixed(0)} Days Runway`,
      baselineValue: '60 Days Target',
      threshold: `Inventory Coverage > ${SIGNAL_RULES.EXCESS_COVERAGE_DAYS} Days`,
      delta: `+${Math.round(coatSKU.coverageDays - 60)} Days Excess`,
      evidence: [
        { label: 'Current Physical Stock', value: `${coatSKU.currentStock} Units` },
        { label: 'Unit Production Cost (COGS)', value: `₹${coatSKU.cost.toLocaleString()}` },
        { label: 'Total Working Capital Tied Up', value: `₹${Math.round(lockedCapital).toLocaleString()}`, note: `₹${(lockedCapital / 100000).toFixed(2)} Lakhs` },
        { label: 'Daily Sales Velocity', value: `${coatSKU.dailyVelocity.toFixed(1)} units/day`, note: 'Off-season seasonal velocity' },
        { label: 'Holding Warehouse', value: coatSKU.warehouseLocation }
      ],
      causalChain: [
        { step: 'Bulk Purchase Placed', change: '500 Units', note: 'Pre-season procurement' },
        { step: 'Off-Season Realization', change: '1.8 units/day', note: 'Lower seasonal demand velocity' },
        { step: 'Runway Extended', change: '266.6 Days', note: '9× recommended inventory runway' },
        { step: 'Working Capital Idle', change: '₹19.68L', note: 'Cash unavailable for fast-moving inventory' }
      ],
      whyItMatters: 'Current sales velocity does not support the present inventory position.',
      recommendedAction: 'Evaluate a structured mid-season bundle offer or planned seasonal liquidation to accelerate cash conversion.',
      actionRoute: `/app/products/${coatSKU.sku}`,
      actionLabel: 'Review SKU →',
      createdAt: '2026-09-20',
      status: 'OPEN'
    });
  }

  // =========================================================================
  // 7. FULFILLMENT FINDING: Lane SLA Latency
  // =========================================================================
  const delayedEvents = fulfillmentEvents.filter(f => f.status === 'delayed');
  if (delayedEvents.length > 0) {
    const avgDelayDays = delayedEvents.reduce((sum, f) => sum + (f.transitDays || 4.5), 0) / delayedEvents.length;
    signals.push({
      id: 'SIG-FUL-001',
      type: 'FULFILLMENT_DELAY',
      domain: 'FULFILLMENT',
      severity: 'WARNING',
      priorityLabel: 'REVIEW REQUIRED',
      title: 'Western corridor fulfillment is running above SLA',
      summary: `Transit times on the Mumbai → Delhi logistics corridor averaged ${avgDelayDays.toFixed(1)} days vs 1.8-day SLA, impacting ${delayedEvents.length} customer deliveries.`,
      entityType: 'LANE',
      entityId: 'LANE-BOM-DEL',
      entityName: 'Mumbai Central WH → North Hub (Delhi)',
      observedValue: `${avgDelayDays.toFixed(1)} Days Avg Transit`,
      baselineValue: `${SIGNAL_RULES.FULFILLMENT_SLA_DAYS} Days SLA`,
      threshold: `Transit Time > ${SIGNAL_RULES.FULFILLMENT_SLA_DAYS} Days`,
      delta: `+${(avgDelayDays - SIGNAL_RULES.FULFILLMENT_SLA_DAYS).toFixed(1)} Days Latency`,
      evidence: [
        { label: 'Impacted Order Count', value: `${delayedEvents.length} Orders` },
        { label: 'Average Transit Duration', value: `${avgDelayDays.toFixed(1)} Days`, note: 'Benchmark SLA: 1.8 Days' },
        { label: 'Primary Carrier Partner', value: 'BlueDart Express & Delhivery' },
        { label: 'Bottleneck Node', value: 'Bhiwandi Hub Transfer Gate' },
        { label: 'Customer Inquiry Rate', value: '42% of delayed shipments' }
      ],
      causalChain: [
        { step: 'Regional Dispatch', change: 'Mumbai Hub', note: 'Dispatched on schedule from warehouse' },
        { step: 'Hub Congestion', change: '+2.7 Days', note: 'Transit bottleneck at intermediate sorting node' },
        { step: 'SLA Exceeded', change: '4.5 Days', note: 'Delivery delayed beyond promised delivery date' },
        { step: 'Customer Friction', change: 'Support Tickets', note: 'WISMO inquiry volume increase' }
      ],
      whyItMatters: 'Transit performance is materially above the established service level.',
      recommendedAction: 'Route high-priority North India shipments via air express partner or split inventory to satellite node.',
      actionRoute: `/app/operations`,
      actionLabel: 'Review operations →',
      createdAt: '2026-09-19',
      status: 'OPEN'
    });
  }

  // =========================================================================
  // 8. COMMERCIAL FINDING: Catalog Revenue Concentration
  // =========================================================================
  const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
  const top3Revenue = products.slice(0, 3).reduce((sum, p) => sum + p.revenue, 0);
  const concentrationPct = totalRevenue > 0 ? (top3Revenue / totalRevenue) * 100 : 0;

  if (concentrationPct > 60.0) {
    signals.push({
      id: 'SIG-COM-001',
      type: 'CATALOG_CONCENTRATION',
      domain: 'COMMERCIAL',
      severity: 'WATCH',
      priorityLabel: 'MONITOR',
      title: 'Revenue remains concentrated across the leading SKUs',
      summary: `The top 3 SKUs account for ${concentrationPct.toFixed(1)}% of total store revenue, creating dependency on a small assortment core.`,
      entityType: 'STORE',
      entityId: 'CATALOG-ALL',
      entityName: 'Catalog Assortment',
      observedValue: `${concentrationPct.toFixed(1)}% Revenue Share`,
      baselineValue: '45.0% Diversification Target',
      threshold: 'Top 3 SKU Concentration > 60.0%',
      delta: `+${(concentrationPct - 45.0).toFixed(1)}pp Concentration`,
      evidence: [
        { label: 'Total Catalog Realization', value: `₹${Math.round(totalRevenue).toLocaleString()}` },
        { label: 'Top 3 SKU Revenue', value: `₹${Math.round(top3Revenue).toLocaleString()}` },
        { label: 'Top 3 Products', value: products.slice(0, 3).map(p => p.sku).join(', ') },
        { label: 'Hero SKU Share (Sneaker Noir)', value: `${products[0]?.revenueSharePct.toFixed(1)}%` },
        { label: 'Remaining Catalog Share', value: `${(100 - concentrationPct).toFixed(1)}% across 7 SKUs` }
      ],
      causalChain: [
        { step: 'Hero Product Focus', change: '3 Hero SKUs', note: 'Sneakers, Linen Overshirt, Canvas Tote' },
        { step: 'Ad Allocation', change: '82% of Ad Budget', note: 'Media budget heavily skewed toward hero items' },
        { step: 'Revenue Skew', change: `${concentrationPct.toFixed(1)}%`, note: 'High catalog dependency' }
      ],
      whyItMatters: 'A relatively small group of products accounts for a substantial share of store revenue.',
      recommendedAction: 'Develop secondary hero SKUs to broaden acquisition distribution.',
      actionRoute: `/app/products`,
      actionLabel: 'Review catalog →',
      createdAt: '2026-09-18',
      status: 'OPEN'
    });
  }

  // Sort findings deterministically: CRITICAL -> WARNING -> WATCH -> INFORMATION
  const severityRank = {
    CRITICAL: 1,
    WARNING: 2,
    WATCH: 3,
    INFORMATION: 4
  };

  return signals.sort((a, b) => {
    const rankA = severityRank[a.severity] || 99;
    const rankB = severityRank[b.severity] || 99;
    return rankA - rankB;
  });
}

/**
 * Calculates aggregate summary counts for the Operating Findings top summary bar.
 */
export function calculateSignalSummary(signals) {
  const total = signals.length;
  const critical = signals.filter(s => s.severity === 'CRITICAL').length;
  const warning = signals.filter(s => s.severity === 'WARNING').length;
  const watch = signals.filter(s => s.severity === 'WATCH').length;
  const info = signals.filter(s => s.severity === 'INFORMATION').length;

  const openCount = signals.filter(s => s.status === 'OPEN').length;
  const acknowledgedCount = signals.filter(s => s.status === 'ACKNOWLEDGED').length;
  const resolvedCount = signals.filter(s => s.status === 'RESOLVED').length;

  // Domain breakdown
  const domainCounts = {};
  signals.forEach(s => {
    domainCounts[s.domain] = (domainCounts[s.domain] || 0) + 1;
  });

  const affectedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => ({ domain, count }));

  return {
    total,
    critical,
    warning,
    watch,
    info,
    openCount,
    acknowledgedCount,
    resolvedCount,
    affectedDomains
  };
}
