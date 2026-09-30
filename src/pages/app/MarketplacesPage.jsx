import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import {
  calculateChannelStoreSummary,
  compareMarketplaceFeeStructures,
  calculateMarketplaceFit
} from '../../lib/economics.js';
import { MARKETPLACE_CHANNELS } from '../../lib/economicRules.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function MarketplacesPage() {
  const { data, storeName } = useCommerceData();
  const products = data.products || [];
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [selectedChannelId, setSelectedChannelId] = useState('amazon_fba');

  const channelSummaries = calculateChannelStoreSummary(data);
  const activeProduct = products.find(p => p.sku === selectedSku) || products[0];
  const activeChannelConfig = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === selectedChannelId) || MARKETPLACE_CHANNELS.AMAZON_FBA;

  const feeComparison = activeProduct ? compareMarketplaceFeeStructures(activeProduct, data) : null;
  const marketplaceFit = activeProduct ? calculateMarketplaceFit(activeProduct, data, activeChannelConfig) : null;

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toFixed(2)}`;

  if (products.length === 0) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Commercial / Marketplace &amp; Channel Economics
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              Marketplace Fee &amp; Channel Comparison
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No marketplace or catalog data connected"
          message="Connect Amazon Seller Central, Shopify, or import product data to compare marketplace commissions and fulfillment cost-to-serve."
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl">
      {/* 1. MODULE HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Commercial / Marketplace &amp; Channel Economics
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            How do fees and fulfilment alter realized contribution by channel?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · Transparent fee decomposition across marketplaces, fulfilment models, and channel viability.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CHANNEL SUMMARY MATRIX */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Active Channel Economics Matrix
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Blended catalog revenue, platform take-rates, cost-to-serve, and true contribution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Channel</th>
                <th className="py-2.5 px-4 font-semibold">Fulfilment Model</th>
                <th className="py-2.5 px-4 text-right font-semibold">Realized Revenue</th>
                <th className="py-2.5 px-4 text-right font-semibold">Take Rate %</th>
                <th className="py-2.5 px-4 text-right font-semibold">Cost-to-Serve</th>
                <th className="py-2.5 px-4 text-right font-semibold">True Contribution</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {channelSummaries.map((ch) => (
                <tr key={ch.channelId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    <Link to={`/app/marketplaces/${ch.channelId}`} className="hover:text-[#c5301a] underline">
                      {ch.channelName}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-[#6e6a60]">
                    {ch.fulfilmentModelName}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#141310]">
                    {formatINR(ch.totalRealizedRevenue)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                    {ch.feeRules?.marketplaceCommissionPct || 0}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                    -{formatINR(ch.totalCostToServe)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(ch.totalTrueContribution)}
                  </td>
                  <td className="py-2.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                    {ch.blendedContributionMarginPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. SKU × MARKETPLACE FEE COMPARISON LAYER (SECTION 52) */}
      <section className="space-y-6 pt-6 border-t border-[#ded8cb]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#141310] font-medium">
              SKU Marketplace Fee &amp; Fulfilment Cost-to-Serve Decomposition
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Itemized per-unit breakdown across selling platforms and custody models
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#6e6a60]">Select SKU:</span>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="bg-[#faf7f0] border border-[#ded8cb] px-2.5 py-1 text-xs font-mono text-[#141310] focus:outline-none focus:border-[#141310]"
            >
              {products.map(p => (
                <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {feeComparison && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                    <th className="py-2.5 pr-3 font-semibold">Cost Component</th>
                    {feeComparison.comparisons.map(c => (
                      <th key={c.channelId} className="py-2.5 px-3 text-right font-semibold">{c.channelName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8cb] font-mono text-xs">
                  <tr className="hover:bg-[#f4f0e6]/50 font-medium">
                    <td className="py-2 pr-3 font-sans text-[#141310]">Realized Selling Price</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right text-[#141310] font-semibold">{formatINR(c.realizedSellingPrice)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Marketplace Commission</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">{c.marketplaceCommission > 0 ? `-${formatINR(c.marketplaceCommission)}` : '₹0'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Payment Processing Fee</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">{c.paymentProcessingFee > 0 ? `-${formatINR(c.paymentProcessingFee)}` : '₹0'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Forward Fulfilment &amp; Freight</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">-{formatINR(c.shipping + c.fulfilmentFee)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Packaging &amp; Handling</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">{c.packaging > 0 ? `-${formatINR(c.packaging)}` : '₹0 (Bundled)'}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Return &amp; Reverse Logistics</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">-{formatINR(c.returnReverseLogistics)}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-[#f4f0e6]/50 text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Advertising / Acquisition</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">-{formatINR(c.advertising)}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-[#141310] font-medium bg-[#f4f0e6]/40">
                    <td className="py-2.5 pr-3 font-sans text-[#141310]">Total Cost-to-Serve</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2.5 px-3 text-right text-[#c5301a]">-{formatINR(c.totalCostToServe)}</td>
                    ))}
                  </tr>
                  <tr className="text-[#6e6a60]">
                    <td className="py-2 pr-3 font-sans">Unit Landed Cost (COGS)</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-2 px-3 text-right">-{formatINR(c.cogs)}</td>
                    ))}
                  </tr>
                  <tr className="border-t-2 border-[#141310] font-bold bg-[#f4f0e6]">
                    <td className="py-3 pr-3 font-sans text-sm text-[#141310]">True Contribution</td>
                    {feeComparison.comparisons.map(c => (
                      <td key={c.channelId} className="py-3 px-3 text-right text-sm text-[#141310]">
                        {formatINR(c.trueContribution)}
                        <span className="block text-[11px] font-normal text-[#6e6a60]">{c.trueContributionMarginPct.toFixed(1)}% margin</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PAIRWISE TRADE-OFF EXPLANATIONS */}
            <div className="border border-[#ded8cb] bg-[#faf7f0] p-6 space-y-6">
              <h3 className="font-serif text-lg text-[#141310] font-medium">
                Observed Channel Trade-Offs &amp; Economic Drivers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feeComparison.tradeOffs.map(to => (
                  <div key={to.pair} className="p-4 bg-[#f4f0e6] border border-[#ded8cb] space-y-3">
                    <div className="font-serif font-medium text-base text-[#141310]">{to.pair}</div>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="font-mono text-[11px] font-semibold text-[#6e6a60]">Observed Difference: </span><span className="text-[#45423b]">{to.observedDifference}</span></div>
                      <div><span className="font-mono text-[11px] font-semibold text-[#6e6a60]">Economic Driver: </span><span className="text-[#45423b]">{to.economicDriver}</span></div>
                      <div><span className="font-mono text-[11px] font-semibold text-[#6e6a60]">Contribution Impact: </span><span className="text-[#141310] font-semibold">{to.contributionImpact}</span></div>
                      <div className="pt-1 text-[#141310]"><span className="font-mono text-[11px] font-semibold text-[#c5301a]">Management Implication: </span>{to.managementImplication}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. MARKETPLACE FIT DIAGNOSTIC LAYER (SECTION 54) */}
      {marketplaceFit && (
        <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-[#141310] font-medium">
              Marketplace Fit &amp; Channel Viability Diagnostic
            </h2>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#6e6a60]">Evaluate Channel:</span>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="bg-[#faf7f0] border border-[#ded8cb] px-2.5 py-1 text-xs font-mono text-[#141310]"
              >
                {Object.values(MARKETPLACE_CHANNELS).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 border border-[#ded8cb] bg-[#faf7f0] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border ${
                  marketplaceFit.viabilityStatus === 'HIGH_FIT'
                    ? 'bg-[#e6f4ea] text-[#1b7340] border-[#a8dab5]'
                    : marketplaceFit.viabilityStatus === 'MARGIN_CONSTRAINED'
                    ? 'bg-[#fef7e0] text-[#b06000] border-[#fcd34d]'
                    : 'bg-[#fce8e6] text-[#c5221f] border-[#f5c6cb]'
                }`}>
                  Status: {marketplaceFit.viabilityStatus.replace('_', ' ')}
                </span>
                <div className="font-mono text-xs text-[#6e6a60] mt-1">
                  Primary Constraint: {marketplaceFit.primaryConstraint}
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <div className="text-[#6e6a60]">Unit Margin</div>
                <div className="text-base font-semibold text-[#141310]">{marketplaceFit.metrics.marginPct.toFixed(1)}%</div>
              </div>
            </div>

            <p className="text-sm text-[#141310] font-serif leading-relaxed">
              {marketplaceFit.narrative}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#ded8cb] font-mono text-xs">
              <div>
                <span className="text-[#6e6a60] block text-[11px]">Fee Take-Rate</span>
                <span className="font-semibold text-[#141310] mt-0.5 block">{marketplaceFit.metrics.feeShareOfRevenue.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[#6e6a60] block text-[11px]">Fulfilment Share</span>
                <span className="font-semibold text-[#141310] mt-0.5 block">{marketplaceFit.metrics.fulfilmentShareOfRevenue.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[#6e6a60] block text-[11px]">Inventory Runway</span>
                <span className="font-semibold text-[#141310] mt-0.5 block">{marketplaceFit.metrics.coverageDays.toFixed(1)} Days</span>
              </div>
              <div>
                <span className="text-[#6e6a60] block text-[11px]">Lead Time</span>
                <span className="font-semibold text-[#141310] mt-0.5 block">{marketplaceFit.metrics.leadTimeDays} Days</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
