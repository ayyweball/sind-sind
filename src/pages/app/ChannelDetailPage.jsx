import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { calculateChannelStoreSummary } from '../../lib/economics.js';
import { MARKETPLACE_CHANNELS } from '../../lib/economicRules.js';

export default function ChannelDetailPage() {
  const { channelId } = useParams();
  const { data, storeName } = useData();

  const channelSummaries = calculateChannelStoreSummary(data);
  const channel = channelSummaries.find(c => c.channelId === channelId);
  const config = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === channelId);

  if (!channel || !config) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/marketplaces" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Marketplace Analysis
          </Link>
        </div>
        <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl text-[#141310]">Channel "{channelId}" Not Found</h2>
          <Link to="/app/marketplaces" className="button-primary text-xs inline-block mt-4">
            View All Channels
          </Link>
        </div>
      </div>
    );
  }

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12">
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6e6a60]">
          <Link to="/app" className="hover:text-[#141310]">Overview</Link>
          <span>/</span>
          <Link to="/app/marketplaces" className="hover:text-[#141310]">Marketplaces</Link>
          <span>/</span>
          <span className="text-[#141310] font-semibold">{channel.channelName}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              Channel Economic Profile
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141310]">
              {channel.channelName}
            </h1>
            <p className="text-sm font-mono text-[#6e6a60]">
              Fulfilment Model: {channel.fulfilmentModel} · Take-Rate Fee: {channel.channelFeePct}% · Settlement Float: {config.settlementDays} Days
            </p>
          </div>

          <Link to="/app/marketplaces" className="editorial-link">
            ← All Channels
          </Link>
        </div>
      </div>

      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Simulated Revenue</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(channel.totalRealizedRevenue)}</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Platform Fees</span>
            <span className="font-serif text-2xl text-[#c5301a] font-medium block mt-1">-{formatINR(channel.totalChannelFees)}</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">True Contribution</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(channel.totalTrueContribution)}</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Contribution Margin</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{channel.blendedContributionMarginPct.toFixed(1)}%</span>
          </div>
        </div>
      </section>
    </div>
  );
}
