import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import {
  calculatePriceEconomics,
  calculatePriceSensitivity,
  calculatePromotionBreakEven,
  calculatePromotionEconomics,
  detectPricingFindings
} from '../../lib/economics.js';
import {
  MARKETPLACE_CHANNELS,
  DEFAULT_PRICING_THRESHOLDS,
  DATA_QUALITY
} from '../../lib/economicRules.js';

export default function PricingPage() {
  const { data, storeName } = useData();
  const products = data.products || [];
  const promotions = data.promotions || [];

  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || 'SNK-BLK-09');
  const [selectedChannelId, setSelectedChannelId] = useState('shopify_d2c');

  const activeProduct = products.find(p => p.sku === selectedSku) || products[0];
  const activeChannel = Object.values(MARKETPLACE_CHANNELS).find(c => c.id === selectedChannelId) || MARKETPLACE_CHANNELS.SHOPIFY_D2C;

  const catalogPricing = products.map(p => calculatePriceEconomics(p, data, { channelConfig: MARKETPLACE_CHANNELS.SHOPIFY_D2C }));
  const activeSensitivity = activeProduct ? calculatePriceSensitivity(activeProduct, data, activeChannel) : [];
  const activePriceEcon = activeProduct ? calculatePriceEconomics(activeProduct, data, { channelConfig: activeChannel }) : null;
  const activeBreakEven = activeProduct ? calculatePromotionBreakEven(activeProduct, data, 350, 100, activeChannel) : null;

  const promoEconomicsList = promotions.map(promo => {
    const matchedProduct = products.find(p => p.sku === promo.applicableSku || p.id === promo.productId);
    return matchedProduct ? calculatePromotionEconomics(promo, matchedProduct, data) : null;
  }).filter(Boolean);

  const avgRealizedPrice = catalogPricing.length > 0
    ? catalogPricing.reduce((sum, p) => sum + p.unitRealizedPrice, 0) / catalogPricing.length
    : 0;
  const avgDiscountPct = catalogPricing.length > 0
    ? catalogPricing.reduce((sum, p) => sum + p.discountPct, 0) / catalogPricing.length
    : 0;
  const breachedCount = catalogPricing.filter(p => p.isFloorBreached).length;

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-12">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Commercial / Pricing</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Pricing &amp; Promotion Economics Review
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Target Contribution Margin Floor: {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}% · Mathematical headroom analysis.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/economics" className="button-primary text-xs">
            True Contribution Waterfall →
          </Link>
        </div>
      </div>

      {/* 2. OPENING EDITORIAL STATEMENT */}
      <section className="border-b border-[#ded8cb] pb-8">
        <blockquote className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium max-w-4xl">
          “Several SKUs are operating with limited headroom between realized price and required economic price.”
        </blockquote>
        <p className="mt-3 text-base text-[#45423b] max-w-3xl leading-relaxed">
          Uncontrolled promotional coupon stacking and discounting erode unit contribution faster than incremental volume can compensate. Maintaining a minimum <strong>25% contribution margin floor</strong> protects enterprise liquidity.
        </p>
      </section>

      {/* 3. HORIZONTAL PRICING SUMMARY STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Catalogue Average ASP
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINRPrecise(avgRealizedPrice)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Net realized selling price
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Average Discount Rate
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {avgDiscountPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Markdown share of list price
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Target Margin Floor
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Configured benchmark
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Floor Breached Lines
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#c5301a] font-medium block mt-1">
              {breachedCount} SKU
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              Margin &lt; 25% floor
            </span>
          </div>
        </div>
      </section>

      {/* 4. CATALOGUE PRICING HEADROOM REGISTER */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Catalogue Pricing &amp; Margin Headroom Register
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Required realized price to sustain 25% target margin vs current realized selling price
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">SKU Identifier</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 text-right font-semibold">List Price</th>
                <th className="py-3 px-4 text-right font-semibold">Discount %</th>
                <th className="py-3 px-4 text-right font-semibold">Realized Price (ASP)</th>
                <th className="py-3 px-4 text-right font-semibold">Required Price (25% Floor)</th>
                <th className="py-3 px-4 text-right font-semibold">Headroom / Gap</th>
                <th className="py-3 pl-4 text-right font-semibold">Floor Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {catalogPricing.map((p) => (
                <tr key={p.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/pricing/${p.sku}`} className="hover:text-[#c5301a] underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/pricing/${p.sku}`} className="hover:text-[#c5301a]">
                      {p.productName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {formatINRPrecise(p.unitListPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {p.discountPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINRPrecise(p.unitRealizedPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINRPrecise(p.requiredPriceForTargetMargin)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={p.headroomToFloor < 0 ? 'text-[#c5301a] font-medium' : 'text-[#141310]'}>
                      {p.headroomToFloor >= 0 ? '+' : ''}{formatINRPrecise(p.headroomToFloor)}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono">
                    <span className={`uppercase text-[10px] tracking-wider px-2 py-0.5 ${
                      p.isFloorBreached
                        ? 'bg-[#f4f0e6] text-[#c5301a] border border-[#c5301a] font-semibold'
                        : 'bg-[#f4f0e6] text-[#141310] border border-[#ded8cb]'
                    }`}>
                      {p.isFloorBreached ? 'Breached' : 'Protected'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PRICE SENSITIVITY MATRIX */}
      {activePriceEcon && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
            <div>
              <h2 className="font-serif text-2xl text-[#141310] font-medium">
                Deterministic Price Sensitivity Matrix — {activeProduct.name}
              </h2>
              <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
                Simulated ±5% price movement impact on unit contribution and volume requirements (excluding elasticity modeling)
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
                  <th className="py-3 pr-4 font-semibold">Scenario</th>
                  <th className="py-3 px-4 text-right font-semibold">Simulated Realized Price</th>
                  <th className="py-3 px-4 text-right font-semibold">Unit Cost-to-Serve</th>
                  <th className="py-3 px-4 text-right font-semibold">Unit True Contribution</th>
                  <th className="py-3 px-4 text-right font-semibold">Contribution Margin %</th>
                  <th className="py-3 pl-4 text-right font-semibold">Volume Offset Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {activeSensitivity.map((sc) => (
                  <tr key={sc.label} className={`hover:bg-[#f4f0e6]/50 transition-colors ${sc.percentChange === 0 ? 'bg-[#f4f0e6]/40 font-semibold' : ''}`}>
                    <td className="py-3.5 pr-4 font-serif text-sm text-[#141310]">
                      {sc.label}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                      {formatINRPrecise(sc.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                      {formatINRPrecise(sc.unitCostToServe)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                      {formatINRPrecise(sc.unitContribution)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={sc.contributionMarginPct < 25 ? 'text-[#c5301a]' : 'text-[#141310]'}>
                        {sc.contributionMarginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono text-[#6e6a60]">
                      {sc.breakEvenVolumeChangePct !== null ? `${sc.breakEvenVolumeChangePct >= 0 ? '+' : ''}${sc.breakEvenVolumeChangePct.toFixed(1)}%` : 'Base'}
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
