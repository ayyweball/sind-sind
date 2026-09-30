import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { calculateChannelStoreSummary, compareSKUChannels } from '../../lib/economics.js';

export default function MarketplacesPage() {
  const { data, storeName } = useData();
  const products = data.products || [];
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'SNK-BLK-09');

  const channelSummaries = calculateChannelStoreSummary(data);
  const activeProduct = products.find(p => p.sku === selectedSku) || products[0];
  const skuComparison = activeProduct ? compareSKUChannels(activeProduct, data) : [];

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-12">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Commercial / Marketplaces</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Marketplace &amp; Channel Economics Analysis
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Multi-channel cost-to-serve decomposition and fulfilment model trade-offs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/economics" className="button-primary text-xs">
            Store Economics →
          </Link>
        </div>
      </div>

      {/* 2. OPENING EDITORIAL STATEMENT */}
      <section className="border-b border-[#ded8cb] pb-8">
        <blockquote className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium max-w-4xl">
          “Multi-channel distribution changes the cost-to-serve profile and contribution economics for every SKU.”
        </blockquote>
        <p className="mt-3 text-base text-[#45423b] max-w-3xl leading-relaxed">
          While third-party marketplaces expand customer access, platform take-rates (12–15%) and strict FBA fulfilment requirements change unit contribution dynamics. Comparing models transparently avoids unprofitable channel scaling.
        </p>
      </section>

      {/* 3. CHANNEL ECONOMICS COMPARISON REGISTER */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Active Channel Economics Comparison
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Simulated economics across 5 distribution channels for the full store catalogue
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold">Fulfilment Model</th>
                <th className="py-3 px-4 text-right font-semibold">Platform Fee %</th>
                <th className="py-3 px-4 text-right font-semibold">Fulfilment CTS (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Return Friction (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">True Contribution (₹)</th>
                <th className="py-3 pl-4 text-right font-semibold">Contribution Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {channelSummaries.map((ch) => (
                <tr key={ch.channelId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    <Link to={`/app/marketplaces/${ch.channelId}`} className="hover:text-[#c5301a] underline">
                      {ch.channelName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                    {ch.fulfilmentModel}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {ch.channelFeePct}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                    {formatINR(ch.totalForwardShipping + ch.totalPickPack)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                    {formatINR(ch.totalReturnFriction)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(ch.totalTrueContribution)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                    {ch.blendedContributionMarginPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. SKU CHANNEL COMPARISON DETAIL */}
      {activeProduct && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
            <div>
              <h2 className="font-serif text-2xl text-[#141310] font-medium">
                SKU Multi-Channel Comparison — {activeProduct.name}
              </h2>
              <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
                Per-unit economic breakdown across all 5 distribution options
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#6e6a60]">Select SKU:</span>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1 text-xs text-[#141310] focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                  <th className="py-3 pr-4 font-semibold">Sales Channel</th>
                  <th className="py-3 px-4 font-semibold">Fulfilment Model</th>
                  <th className="py-3 px-4 text-right font-semibold">Realized Price</th>
                  <th className="py-3 px-4 text-right font-semibold">COGS</th>
                  <th className="py-3 px-4 text-right font-semibold">Platform Fee</th>
                  <th className="py-3 px-4 text-right font-semibold">Fulfilment</th>
                  <th className="py-3 px-4 text-right font-semibold">True Contribution</th>
                  <th className="py-3 pl-4 text-right font-semibold">Contribution %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {skuComparison.map((sc) => (
                  <tr key={sc.channelId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                    <td className="py-3.5 pr-4 font-serif text-sm text-[#141310]">
                      {sc.channelName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                      {sc.fulfilmentModel}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                      {formatINRPrecise(sc.unitRealizedPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                      -{formatINRPrecise(sc.unitCogs)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#c5301a]">
                      -{formatINRPrecise(sc.costToServe.channelFee)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                      -{formatINRPrecise(sc.costToServe.forwardShipping + sc.costToServe.pickPack)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                      {formatINRPrecise(sc.unitTrueContribution)}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                      {sc.trueContributionMarginPct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
