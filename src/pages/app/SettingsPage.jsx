import React from 'react';
import { useData } from '../../context/DataContext.jsx';
import { DEFAULT_PRICING_THRESHOLDS, WORKING_CAPITAL_THRESHOLDS } from '../../lib/economicRules.js';

export default function SettingsPage() {
  const { storeName, dataMode } = useData();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>System / Settings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Operating Thresholds &amp; Settings
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Rules-based threshold configurations for economic engines.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-xl text-[#141310] font-medium">Economic Contribution Thresholds</h2>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
            <span className="text-[#6e6a60]">Target Contribution Margin Floor:</span>
            <span className="font-mono font-medium text-[#141310]">{DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}%</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
            <span className="text-[#6e6a60]">Minimum Unit Contribution:</span>
            <span className="font-mono text-[#141310]">Optional / Configurable</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
            <span className="text-[#6e6a60]">Target Coverage Days:</span>
            <span className="font-mono font-medium text-[#141310]">{WORKING_CAPITAL_THRESHOLDS.targetCoverageDays} Days</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
            <span className="text-[#6e6a60]">Excess Inventory Threshold:</span>
            <span className="font-mono font-medium text-[#141310]">{WORKING_CAPITAL_THRESHOLDS.excessCoverageDays} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
