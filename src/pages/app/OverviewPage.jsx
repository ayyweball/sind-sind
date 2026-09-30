import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import {
  calculateStoreMetrics,
  calculateProductPerformance,
  calculateDailyTimeSeries
} from '../../lib/metrics.js';
import { generateSignals } from '../../lib/signals.js';
import TrendChart from '../../components/app/TrendChart.jsx';

export default function OverviewPage() {
  const { data, storeName } = useData();

  const metrics = useMemo(() => calculateStoreMetrics(data), [data]);
  const productMetrics = useMemo(() => calculateProductPerformance(data), [data]);
  const timeSeries = useMemo(() => calculateDailyTimeSeries(data), [data]);
  const signals = useMemo(() => generateSignals(data), [data]);

  if (!metrics) {
    return (
      <div className="p-8 font-mono text-xs text-[#6e6a60]">
        No order or inventory records found in current dataset.
      </div>
    );
  }

  const { totals } = metrics;
  const topProducts = productMetrics.slice(0, 5);

  const formatINR = (val) => `₹${Math.round(val).toLocaleString()}`;
  const formatDelta = (val, isPercentagePoint = false) => {
    if (val === 0 || isNaN(val)) return '0.0%';
    const sign = val > 0 ? '↑ ' : '↓ ';
    const absVal = Math.abs(val).toFixed(1);
    return `${sign}${absVal}${isPercentagePoint ? 'pp' : '%'}`;
  };

  return (
    <div className="space-y-12">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Executive Command</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            The Current Operating Picture
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · 28-day operating period ({metrics.dateRange.start} — {metrics.dateRange.end})
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/signals" className="button-secondary text-xs">
            Review {signals.length} Operating Findings
          </Link>
          <Link to="/app/decisions" className="button-primary text-xs">
            Decision Ledger →
          </Link>
        </div>
      </div>

      {/* 2. HORIZONTAL OPERATING METRICS STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Net Revenue
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(totals.revenue)}
            </span>
            <span className="font-mono text-[11px] text-[#141310] block mt-0.5">
              {formatDelta(totals.revenueDelta)} vs prior 14d
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Orders
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {totals.orders}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {(totals.orders / 28).toFixed(1)}/day avg
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Average Order Value
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(totals.aov)}
            </span>
            <span className="font-mono text-[11px] text-[#141310] block mt-0.5">
              {formatDelta(totals.aovDelta)}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Gross Margin
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {totals.grossMarginPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              {formatDelta(totals.grossMarginDelta, true)}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Blended CAC
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(totals.blendedCAC)}
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              {formatDelta(totals.cacDelta)}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Return Rate
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {totals.returnRatePct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {data.returns.length} cases
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Inventory Runway
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {totals.weightedCoverageDays.toFixed(0)} Days
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] font-medium block mt-0.5">
              {totals.stockoutRiskCount} Risk SKU
            </span>
          </div>
        </div>
      </section>

      {/* 3. PRIMARY OPERATING NARRATIVE: WHAT CHANGED */}
      <section className="border-b border-[#ded8cb] pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a]"></span>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
                Primary Operating Finding
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium">
              Acquisition is scaling faster than the current inventory position can support.
            </h2>
            <p className="text-base text-[#45423b] leading-relaxed">
              Meta advertising spend increased <strong>61%</strong> over the past 14 days (reaching ₹1.57L), while attributed customer orders expanded by only <strong>25%</strong> (108 orders). This represents a <strong>+28.8% CAC drift</strong>, compressing net contribution per order before fulfillment costs.
            </p>
            <div className="pt-2 flex items-center gap-4">
              <Link to="/app/signals" className="editorial-link">
                Inspect Acquisition Economics <span>→</span>
              </Link>
            </div>
          </div>

          <div className="bg-[#fcfbf8] border border-[#ded8cb] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#ded8cb] pb-2">
              <span className="font-mono text-[10px] uppercase text-[#6e6a60] tracking-wider">
                28-Day Daily Revenue &amp; Order Velocity
              </span>
              <span className="font-mono text-[10px] text-[#141310] font-medium">
                [Observed Data]
              </span>
            </div>
            <TrendChart data={timeSeries} />
          </div>
        </div>
      </section>

      {/* 4. THE 4 STRUCTURAL OPERATING TENSIONS */}
      <section className="space-y-10 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Operating Constraints &amp; Economic Exposure
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="border-l-2 border-[#c5301a] pl-5 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#c5301a] block">
              The Operating Constraint · Inventory
            </span>
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Leather Sneaker Noir (SNK-BLK-09)
            </h3>
            <p className="text-sm text-[#45423b] leading-relaxed">
              <strong>6.6 days</strong> of inventory coverage remains against a <strong>14-day replenishment lead time</strong>. Current stock is 98 units at a sales velocity of 14.8 units/day. The SKU generates 35% of store revenue.
            </p>
            <div className="pt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-[#6e6a60]">Stockout Window: ~7 Days</span>
              <Link to="/app/products/SNK-BLK-09" className="text-[#141310] hover:text-[#c5301a] underline">
                Inspect Dossier →
              </Link>
            </div>
          </div>

          <div className="border-l-2 border-[#ded8cb] pl-5 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Economic Pressure · Margins
            </span>
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Canvas Carryall (TOT-CNV-NAT)
            </h3>
            <p className="text-sm text-[#45423b] leading-relaxed">
              Discounting (+250% average promotional discount) has reduced unit contribution margin by <strong>21.2 percentage points</strong> despite an 18% increase in unit sales volume.
            </p>
            <div className="pt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-[#6e6a60]">Net Profit: ₹410/unit</span>
              <Link to="/app/pricing/TOT-CNV-NAT" className="text-[#141310] hover:text-[#c5301a] underline">
                Review Pricing →
              </Link>
            </div>
          </div>

          <div className="border-l-2 border-[#ded8cb] pl-5 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Capital Position · Working Capital
            </span>
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Wool Overcoat Camel (WOL-COAT-CAM)
            </h3>
            <p className="text-sm text-[#45423b] leading-relaxed">
              <strong>266 days</strong> of inventory runway with <strong>₹19.68 Lakhs</strong> in capital tied up. Sales velocity is 1.8 units/day, creating significant holding drag while faster-moving lines face cash starvation.
            </p>
            <div className="pt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-[#6e6a60]">480 Units on Hand</span>
              <Link to="/app/cash" className="text-[#141310] hover:text-[#c5301a] underline">
                Inspect Cash Exposure →
              </Link>
            </div>
          </div>

          <div className="border-l-2 border-[#ded8cb] pl-5 space-y-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Fulfilment SLA · Logistics
            </span>
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Mumbai → Delhi Transit Corridor
            </h3>
            <p className="text-sm text-[#45423b] leading-relaxed">
              Transit performance is lagging SLA expectation by <strong>+2.7 days</strong> on 10 shipments (7.1% delay rate), correlating directly with early return claims and post-purchase customer friction.
            </p>
            <div className="pt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-[#6e6a60]">Avg Transit: 4.5 Days</span>
              <Link to="/app/operations" className="text-[#141310] hover:text-[#c5301a] underline">
                Inspect Logistics →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TOP PRODUCTS REGISTER */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#141310] font-medium">
              Commercial SKU Register
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Top products ranked by commercial volume and true contribution health
            </p>
          </div>
          <Link to="/app/products" className="editorial-link text-xs">
            Open Full Catalogue Register ({data.products.length} SKUs) <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">SKU Identifier</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 text-right font-semibold">Revenue</th>
                <th className="py-3 px-4 text-right font-semibold">Units Sold</th>
                <th className="py-3 px-4 text-right font-semibold">Gross Margin</th>
                <th className="py-3 px-4 text-right font-semibold">Return Rate</th>
                <th className="py-3 px-4 text-right font-semibold">Stock</th>
                <th className="py-3 pl-4 text-right font-semibold">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {topProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#f4f0e6]/50 transition-colors group">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a] underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(p.revenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {p.unitsSold}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {p.grossMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={p.returnRatePct > 15 ? 'text-[#c5301a] font-medium' : 'text-[#6e6a60]'}>
                      {p.returnRatePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {p.currentStock}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono">
                    <span className={`inline-block text-[11px] ${
                      p.isStockoutRisk
                        ? 'text-[#c5301a] font-semibold'
                        : p.isExcessStock
                        ? 'text-[#6e6a60]'
                        : 'text-[#141310]'
                    }`}>
                      {p.coverageDays.toFixed(1)} days {p.isStockoutRisk ? '(Risk)' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. MANAGEMENT DECISION REGISTER PREVIEW */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#141310] font-medium">
              Management Decision Register
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Audited governance decisions and operational review milestones
            </p>
          </div>
          <Link to="/app/decisions" className="editorial-link text-xs">
            Open Full Decision Ledger <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Domain</th>
                <th className="py-3 px-4 font-semibold">Approved Action</th>
                <th className="py-3 px-4 font-semibold">Operating Rationale</th>
                <th className="py-3 px-4 font-semibold">Target Metric</th>
                <th className="py-3 pl-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {data.decisionsLedger.slice(0, 3).map((dec) => (
                <tr key={dec.id} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#c5301a]">
                    {dec.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                    {dec.domain}
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm font-medium text-[#141310]">
                    {dec.decision}
                  </td>
                  <td className="py-3.5 px-4 text-[#45423b] max-w-md leading-relaxed">
                    {dec.reason}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#141310]">
                    {dec.relevantMetric}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono">
                    <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-[#f4f0e6] border border-[#ded8cb] text-[#141310]">
                      {dec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
