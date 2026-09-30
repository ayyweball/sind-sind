import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { calculateStoreMetrics } from '../../lib/metrics.js';
import { calculateStoreEconomics } from '../../lib/economics.js';
import { generateSignals } from '../../lib/signals.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import OnboardingScreen from '../../components/app/OnboardingScreen.jsx';

export default function OverviewPage() {
  const { data, dataMode, storeName } = useCommerceData();

  const metrics = useMemo(() => calculateStoreMetrics(data), [data]);
  const storeEconomics = useMemo(() => calculateStoreEconomics(data), [data]);
  const signals = useMemo(() => generateSignals(data), [data]);

  // If no data exists, show Onboarding Experience
  if (dataMode === 'empty' || !data.products || data.products.length === 0) {
    return <OnboardingScreen />;
  }

  const totals = metrics?.totals || {
    revenue: storeEconomics.realizedRevenue,
    orders: storeEconomics.totalOrderCount,
    grossMarginPct: storeEconomics.grossMarginPct,
    blendedCAC: 0,
    weightedCoverageDays: 0
  };

  const primarySignal = signals[0];
  const secondarySignals = signals.slice(1, 4);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12 max-w-4xl">
      {/* 1. EDITORIAL HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Executive Overview
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            The Operating Picture
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · {metrics?.dateRange?.start ? `${metrics.dateRange.start} — ${metrics.dateRange.end}` : 'Active Operating Window'}
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. PRIMARY OPERATING FOCUS (DYNAMIC FROM DATA) */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium">
          {primarySignal
            ? primarySignal.title
            : 'Catalog operations and unit economics are functioning within established baseline thresholds.'}
        </h2>

        {primarySignal && (
          <div className="flex flex-wrap items-center gap-8 sm:gap-12 py-3 font-mono text-xs border-y border-[#ded8cb]">
            <div>
              <span className="text-[#6e6a60] block text-[11px]">Domain</span>
              <span className="text-base font-semibold text-[#141310] mt-0.5 block">{primarySignal.domain}</span>
            </div>
            <div>
              <span className="text-[#6e6a60] block text-[11px]">Observed Metric</span>
              <span className="text-base font-semibold text-[#141310] mt-0.5 block">{primarySignal.observedValue}</span>
            </div>
            <div>
              <span className="text-[#6e6a60] block text-[11px]">Severity / Priority</span>
              <span className="text-base font-semibold text-[#c5301a] mt-0.5 block">{primarySignal.priorityLabel || primarySignal.severity}</span>
            </div>
          </div>
        )}

        {primarySignal && (
          <div>
            <Link
              to={primarySignal.actionRoute || "/app/signals"}
              className="font-mono text-xs text-[#141310] font-medium hover:text-[#c5301a] underline underline-offset-4"
            >
              {primarySignal.actionLabel || 'Inspect Finding Details →'}
            </Link>
          </div>
        )}
      </section>

      {/* 3. SECONDARY OPERATING PRESSURES (DYNAMIC) */}
      {secondarySignals.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-[#ded8cb]">
          <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#6e6a60]">
            Other Operating Pressures
          </div>

          <div className="divide-y divide-[#ded8cb] font-sans text-sm">
            {secondarySignals.map(sig => (
              <div key={sig.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium text-[#141310]">{sig.entityName || sig.title}</span>
                  <span className="text-xs text-[#6e6a60] ml-3">{sig.summary}</span>
                </div>
                <Link
                  to={sig.actionRoute || `/app/signals`}
                  className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]"
                >
                  {sig.actionLabel || 'Inspect →'}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SELECTED OPERATING METRICS */}
      <section className="space-y-4 pt-4 border-t border-[#ded8cb]">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#6e6a60]">
          Selected Operating Metrics
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 font-mono text-xs">
          <div>
            <span className="text-[#6e6a60] block text-[11px]">Net Revenue</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
              {formatINR(totals.revenue || storeEconomics.realizedRevenue)}
            </span>
            <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{totals.orders || storeEconomics.totalOrderCount} orders fulfilled</span>
          </div>

          <div>
            <span className="text-[#6e6a60] block text-[11px]">Gross Margin</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
              {(totals.grossMarginPct || storeEconomics.grossMarginPct || 0).toFixed(1)}%
            </span>
            <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Pre-CTS baseline</span>
          </div>

          <div>
            <span className="text-[#6e6a60] block text-[11px]">True Contribution</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
              {formatINR(storeEconomics.trueContribution)}
            </span>
            <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{(storeEconomics.trueContributionMarginPct || 0).toFixed(1)}% of revenue</span>
          </div>

          <div>
            <span className="text-[#6e6a60] block text-[11px]">Inventory Runway</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
              {(totals.weightedCoverageDays || 0).toFixed(0)} Days
            </span>
            <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{data.products?.length || 0} active SKUs</span>
          </div>
        </div>
      </section>
    </div>
  );
}
