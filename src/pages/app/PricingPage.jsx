import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import {
  calculatePriceEconomics,
  calculatePriceSensitivity,
  calculateCompetitivePriceAnalysis
} from '../../lib/economics.js';
import {
  MARKETPLACE_CHANNELS,
  DEFAULT_PRICING_THRESHOLDS
} from '../../lib/economicRules.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function PricingPage() {
  const { data, storeName } = useCommerceData();
  const products = data.products || [];

  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [selectedChannelId, setSelectedChannelId] = useState('shopify_d2c');

  const activeProduct = products.find(p => p.sku === selectedSku) || products[0];
  const activeChannel = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === selectedChannelId) || MARKETPLACE_CHANNELS.SHOPIFY_D2C;

  const catalogPricing = products.map(p => calculatePriceEconomics(p, data, { channelConfig: MARKETPLACE_CHANNELS.SHOPIFY_D2C })).filter(Boolean);
  const activeSensitivity = activeProduct ? calculatePriceSensitivity(activeProduct, data, activeChannel) : [];
  const activePriceEcon = activeProduct ? calculatePriceEconomics(activeProduct, data, { channelConfig: activeChannel }) : null;
  const competitiveAnalysis = activeProduct ? calculateCompetitivePriceAnalysis(activeProduct, data, activeChannel) : null;

  const avgRealizedPrice = catalogPricing.length > 0
    ? catalogPricing.reduce((sum, p) => sum + (p.unitRealizedPrice || 0), 0) / catalogPricing.length
    : 0;
  const breachedCount = catalogPricing.filter(p => p.isFloorBreached).length;

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (products.length === 0) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Commercial / Pricing &amp; Market Realization
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              Pricing Floor &amp; Discount Sensitivity
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No catalog pricing records found"
          message="Connect a marketplace or import products to calculate required economic price floors and discount sensitivity."
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
            Commercial / Pricing &amp; Market Realization
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            Where is realized price approaching the economic floor?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · Target Margin Floor: {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}% · Competitive reference prices vs required economic price.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CORE TELEMETRY STRIP */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Catalog Average ASP</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINRPrecise(avgRealizedPrice)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Net realized selling price</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Target Margin Floor</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Configured demo benchmark</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Margin Breached Lines</span>
          <span className={`font-serif text-2xl font-medium block mt-1 ${breachedCount > 0 ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
            {breachedCount} SKU
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Below 25% contribution floor</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Monitored SKUs</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {catalogPricing.length} Lines
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Active catalog register</span>
        </div>
      </section>

      {/* 3. COMPETITIVE PRICE & MARKET REALIZATION LAYER (SECTION 53 & 70) */}
      {competitiveAnalysis && (
        <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-[#141310] font-medium">
                Competitive Reference vs Required Economic Price
              </h2>
              <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
                Market realization gap, discount headroom, and cost-to-serve constraint diagnosis
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[#6e6a60]">Select SKU:</span>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="bg-[#faf7f0] border border-[#ded8cb] px-2.5 py-1 text-xs text-[#141310]"
              >
                {products.map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} — {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#faf7f0] border border-[#ded8cb]">
              <div className="text-xs font-mono text-[#6e6a60]">Current Realized Price</div>
              <div className="text-2xl font-serif font-medium text-[#141310] mt-1">{formatINRPrecise(competitiveAnalysis.realizedPrice)}</div>
              <div className="text-[11px] font-mono text-[#45423b] mt-1">List: {formatINR(competitiveAnalysis.listPrice)}</div>
            </div>
            <div className="p-4 bg-[#faf7f0] border border-[#ded8cb]">
              <div className="text-xs font-mono text-[#6e6a60]">Required Economic Floor</div>
              <div className="text-2xl font-serif font-medium text-[#141310] mt-1">{formatINRPrecise(competitiveAnalysis.requiredEconomicPrice)}</div>
              <div className="text-[11px] font-mono text-[#45423b] mt-1">To achieve 25% margin</div>
            </div>
            <div className="p-4 bg-[#faf7f0] border border-[#ded8cb]">
              <div className="text-xs font-mono text-[#6e6a60]">Observed Competitor Offer</div>
              <div className="text-2xl font-serif font-medium text-[#141310] mt-1">{formatINRPrecise(competitiveAnalysis.competitivePrice)}</div>
              <div className="text-[11px] font-mono text-[#45423b] mt-1">{competitiveAnalysis.competitorName}</div>
            </div>
            <div className="p-4 bg-[#faf7f0] border border-[#ded8cb]">
              <div className="text-xs font-mono text-[#6e6a60]">Discount Headroom</div>
              <div className={`text-2xl font-serif font-medium mt-1 ${competitiveAnalysis.floorGap < 0 ? 'text-[#c5301a]' : 'text-[#1b7340]'}`}>
                {competitiveAnalysis.floorGap >= 0 ? `+${formatINRPrecise(competitiveAnalysis.discountHeadroom)}` : `-${formatINRPrecise(Math.abs(competitiveAnalysis.floorGap))}`}
              </div>
              <div className="text-[11px] font-mono text-[#45423b] mt-1">{competitiveAnalysis.floorGap < 0 ? 'Margin Deficit' : 'Available buffer'}</div>
            </div>
          </div>

          <div className="p-6 bg-[#faf7f0] border border-[#ded8cb] space-y-4">
            <div className="font-mono text-xs font-semibold text-[#c5301a] uppercase tracking-wider">
              Economic Diagnosis &amp; Trade-Off Analysis
            </div>
            <p className="font-serif text-sm text-[#141310] leading-relaxed">
              {competitiveAnalysis.diagnosis}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#ded8cb]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#141310]">Available Management Levers</div>
              <ul className="space-y-1.5 font-sans text-xs text-[#45423b]">
                {competitiveAnalysis.managementLevers.map((lever, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[11px] text-[#c5301a]">0{idx + 1}.</span>
                    <span>{lever}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 4. CATALOG PRICING HEADROOM REGISTER */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            SKU Pricing Headroom &amp; Required Realized Price Matrix
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Maximum discount capacity before unit contribution drops below the 25.0% floor
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">SKU</th>
                <th className="py-2.5 px-4 font-semibold">Product Name</th>
                <th className="py-2.5 px-4 text-right font-semibold">Realized ASP</th>
                <th className="py-2.5 px-4 text-right font-semibold">Required Price</th>
                <th className="py-2.5 px-4 text-right font-semibold">Discount Headroom</th>
                <th className="py-2.5 px-4 text-right font-semibold">True Contribution</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Floor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {catalogPricing.map((item) => {
                const headroom = item.maxDiscount?.discountHeadroom ?? 0;
                const reqPrice = item.maxDiscount?.requiredRealizedPrice ?? 0;
                return (
                  <tr key={item.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                    <td className="py-2.5 pr-4 font-mono font-medium text-[#141310]">
                      <Link to={`/app/pricing/${item.sku}`} className="hover:text-[#c5301a] underline">
                        {item.sku}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 font-serif text-sm text-[#141310]">
                      <Link to={`/app/pricing/${item.sku}`} className="hover:text-[#c5301a]">
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#141310]">
                      {formatINRPrecise(item.unitRealizedPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                      {formatINRPrecise(reqPrice)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium">
                      <span className={headroom < 0 ? 'text-[#c5301a]' : 'text-[#141310]'}>
                        {formatINRPrecise(headroom)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">
                      {formatINRPrecise(item.unitTrueContribution)} ({item.trueContributionMarginPct.toFixed(1)}%)
                    </td>
                    <td className="py-2.5 pl-4 text-right font-mono">
                      <span className={`uppercase text-[10px] tracking-wider px-2 py-0.5 ${
                        item.isFloorBreached
                          ? 'bg-[#f4f0e6] text-[#c5301a] border border-[#c5301a] font-semibold'
                          : 'bg-[#f4f0e6] text-[#141310] border border-[#ded8cb]'
                      }`}>
                        {item.isFloorBreached ? 'Floor Breached' : 'Protected'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PRICE SENSITIVITY MATRIX */}
      {activePriceEcon && (
        <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-[#141310] font-medium">
                Deterministic Price Sensitivity Simulation
              </h2>
              <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
                Simulated contribution impact across -5% to +5% realized price steps for {activeProduct.name}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                  <th className="py-2.5 pr-4 font-semibold">Price Scenario</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Realized Price</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Unit Cost-to-Serve</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Unit Contribution</th>
                  <th className="py-2.5 pl-4 text-right font-semibold">Contribution Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {activeSensitivity.map((sc) => (
                  <tr key={sc.label} className={`hover:bg-[#f4f0e6]/50 transition-colors ${sc.percentChange === 0 ? 'bg-[#f4f0e6]/40 font-semibold' : ''}`}>
                    <td className="py-2.5 pr-4 font-serif text-sm text-[#141310]">{sc.label}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#141310]">{formatINRPrecise(sc.price)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">{formatINRPrecise(sc.unitCostToServe)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">{formatINRPrecise(sc.unitContribution)}</td>
                    <td className="py-2.5 pl-4 text-right font-mono">
                      <span className={(sc.contributionMarginPct || 0) < 25 ? 'text-[#c5301a]' : 'text-[#141310]'}>
                        {(sc.contributionMarginPct || 0).toFixed(1)}%
                      </span>
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
