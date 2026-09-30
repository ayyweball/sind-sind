import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { calculateChannelStoreSummary } from '../../lib/economics.js';
import { MARKETPLACE_CHANNELS } from '../../lib/economicRules.js';

export default function ChannelDetailPage() {
  const { channelId } = useParams();
  const { data, storeName } = useCommerceData();

  const channelSummaries = calculateChannelStoreSummary(data) || [];
  const channel = channelSummaries.find(c => c.channelId === channelId);
  const config = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === channelId);

  if (!channel || !config) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/marketplaces" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Marketplace Analysis
          </Link>
        </div>
        <div className="py-12 text-center space-y-4">
          <span className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">Channel Not Found</span>
          <h2 className="font-serif text-2xl text-[#141310]">Channel "{channelId}" Not Found</h2>
          <Link to="/app/marketplaces" className="font-mono text-xs text-[#141310] underline inline-block mt-4">
            View All Channels
          </Link>
        </div>
      </div>
    );
  }

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12 max-w-5xl">
      <div className="space-y-2 border-b border-[#ded8cb] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6e6a60]">
          <Link to="/app/marketplaces" className="hover:text-[#141310]">Marketplaces</Link>
          <span>/</span>
          <span className="text-[#141310] font-semibold">{channel.channelName}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
          {channel.channelName} Economic Profile
        </h1>
        <p className="font-mono text-xs text-[#6e6a60]">
          Fulfilment Model: {channel.fulfilmentModelName} · Take-Rate: {channel.feeRules?.marketplaceCommissionPct || 0}% · Settlement Float: {config.settlementDays || 14} Days
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Simulated Revenue</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(channel.totalRealizedRevenue)}</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Total Cost-to-Serve</span>
          <span className="font-serif text-2xl text-[#6e6a60] font-medium block mt-1">-{formatINR(channel.totalCostToServe)}</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">True Contribution</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(channel.totalTrueContribution)}</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Contribution Margin</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{(channel.blendedContributionMarginPct || 0).toFixed(1)}%</span>
        </div>
      </section>

      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            SKU Channel Performance
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Catalog-wide unit economics under {channel.channelName} fee rules
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">SKU</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 text-right font-semibold">Unit Realized ASP</th>
                <th className="py-2.5 px-4 text-right font-semibold">Unit CTS (₹)</th>
                <th className="py-2.5 px-4 text-right font-semibold">Unit Contribution</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {(channel.skuProfiles || []).map((p) => (
                <tr key={p.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-mono font-medium text-[#141310]">{p.sku}</td>
                  <td className="py-2.5 px-4 font-serif text-sm text-[#141310]">{p.name || p.sku}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{formatINR(p.unitRealizedPrice)}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">-{formatINR(p.unitTotalCostToServe)}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">{formatINR(p.unitTrueContribution)}</td>
                  <td className="py-2.5 pl-4 text-right font-mono font-semibold text-[#141310]">{(p.trueContributionMarginPct || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
