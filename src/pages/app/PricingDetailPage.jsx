import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { calculatePriceEconomics, calculatePriceSensitivity } from '../../lib/economics.js';
import { MARKETPLACE_CHANNELS, DEFAULT_PRICING_THRESHOLDS } from '../../lib/economicRules.js';

export default function PricingDetailPage() {
  const { sku } = useParams();
  const { data, storeName } = useData();
  const products = data.products || [];

  const product = products.find(p => p.sku === sku);

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/pricing" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Pricing Review
          </Link>
        </div>
        <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl text-[#141310]">No Pricing Dossier for "{sku}"</h2>
          <Link to="/app/pricing" className="button-primary text-xs inline-block mt-4">
            View All Pricing Dossiers
          </Link>
        </div>
      </div>
    );
  }

  const priceEco = calculatePriceEconomics(product, data, { channelConfig: MARKETPLACE_CHANNELS.SHOPIFY_D2C });
  const sensitivity = calculatePriceSensitivity(product, data, MARKETPLACE_CHANNELS.SHOPIFY_D2C);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6e6a60]">
          <Link to="/app" className="hover:text-[#141310]">Overview</Link>
          <span>/</span>
          <Link to="/app/pricing" className="hover:text-[#141310]">Pricing</Link>
          <span>/</span>
          <span className="text-[#141310] font-semibold">{product.sku}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              Pricing &amp; Margin Dossier
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141310]">
              {product.name}
            </h1>
            <p className="text-sm font-mono text-[#6e6a60]">
              SKU: {product.sku} · Category: {product.category.toUpperCase()} · Target Floor: {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}%
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link to={`/app/products/${product.sku}`} className="editorial-link">
              Open Full SKU Dossier →
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Realized Price (ASP)</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINRPrecise(priceEco.unitRealizedPrice)}</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">List: {formatINRPrecise(priceEco.unitListPrice)}</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Required Price</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINRPrecise(priceEco.requiredPriceForTargetMargin)}</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">For 25% target margin</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Available Headroom</span>
            <span className={`font-serif text-2xl font-medium block mt-1 ${priceEco.headroomToFloor < 0 ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
              {formatINRPrecise(priceEco.headroomToFloor)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">{priceEco.headroomPct.toFixed(1)}% buffer</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">True Contribution</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{priceEco.trueContributionMarginPct.toFixed(1)}%</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">{formatINRPrecise(priceEco.unitContribution)}/unit</span>
          </div>
        </div>
      </section>

      {/* Sensitivity Table */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl text-[#141310] font-medium">Price Sensitivity Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Scenario</th>
                <th className="py-3 px-4 text-right font-semibold">Realized Price</th>
                <th className="py-3 px-4 text-right font-semibold">Unit CTS</th>
                <th className="py-3 px-4 text-right font-semibold">Unit Contribution</th>
                <th className="py-3 px-4 text-right font-semibold">Contribution %</th>
                <th className="py-3 pl-4 text-right font-semibold">Volume Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {sensitivity.map((sc) => (
                <tr key={sc.label} className={`hover:bg-[#f4f0e6]/50 ${sc.percentChange === 0 ? 'bg-[#f4f0e6]/40 font-semibold' : ''}`}>
                  <td className="py-3.5 pr-4 font-serif text-sm text-[#141310]">{sc.label}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">{formatINRPrecise(sc.price)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">{formatINRPrecise(sc.unitCostToServe)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">{formatINRPrecise(sc.unitContribution)}</td>
                  <td className="py-3.5 px-4 text-right font-mono">{sc.contributionMarginPct.toFixed(1)}%</td>
                  <td className="py-3.5 pl-4 text-right font-mono text-[#6e6a60]">
                    {sc.breakEvenVolumeChangePct !== null ? `${sc.breakEvenVolumeChangePct >= 0 ? '+' : ''}${sc.breakEvenVolumeChangePct.toFixed(1)}%` : 'Base'}
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
