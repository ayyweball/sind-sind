import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { getSingleSKUPerformance, calculateProductPerformance } from '../../lib/metrics.js';
import {
  calculateSKUEconomics,
  compareSKUChannels,
} from '../../lib/economics.js';

export default function ProductDetailPage() {
  const { sku } = useParams();
  const { data, storeName } = useCommerceData();

  const product = getSingleSKUPerformance(data, sku);
  const allProducts = calculateProductPerformance(data);

  if (!product) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/products" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Commercial Products Register
          </Link>
        </div>
        <div className="py-12 text-center space-y-4">
          <span className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">SKU Not Found</span>
          <h2 className="font-serif text-2xl text-[#141310]">No SKU matching "{sku}"</h2>
          <p className="text-sm text-[#45423b] max-w-md mx-auto">
            The requested SKU could not be found in the current store catalog dataset.
          </p>
          <Link to="/app/products" className="font-mono text-xs text-[#141310] underline inline-block mt-4">
            View All SKUs
          </Link>
        </div>
      </div>
    );
  }

  const skuEconomics = calculateSKUEconomics(product, data) || {};
  const channelComparison = compareSKUChannels(product, data);
  const channelProfiles = channelComparison?.profiles || [];

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const currentIndex = allProducts.findIndex(p => p.sku === product.sku);
  const prevSKU = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextSKU = currentIndex >= 0 && currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

  const categoryName = (product.category || 'General').toUpperCase();
  const channelName = (product.channel || 'D2C').toUpperCase();
  const operatingStatus = (product.operatingStatus || 'ACTIVE').toUpperCase();

  return (
    <div className="space-y-12 max-w-5xl">
      {/* 1. DOSSIER HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6e6a60]">
          <div className="flex items-center gap-2">
            <Link to="/app/products" className="hover:text-[#141310]">Products</Link>
            <span>/</span>
            <span className="text-[#141310] font-semibold">{product.sku}</span>
          </div>

          <div className="flex items-center gap-3">
            {prevSKU && (
              <Link to={`/app/products/${prevSKU.sku}`} className="hover:text-[#141310]">
                ← Prev ({prevSKU.sku})
              </Link>
            )}
            {prevSKU && nextSKU && <span>|</span>}
            {nextSKU && (
              <Link to={`/app/products/${nextSKU.sku}`} className="hover:text-[#141310]">
                Next ({nextSKU.sku}) →
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs text-[#6e6a60]">
              <span className="uppercase font-semibold text-[#141310]">{categoryName}</span>
              <span>·</span>
              <span>Channel: {channelName}</span>
              <span>·</span>
              <span className="uppercase text-[#8e8a80]">{operatingStatus}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              {product.name || product.sku}
            </h1>
            <p className="text-sm text-[#45423b] pt-1">
              List Price: <strong>₹{(skuEconomics.listPrice || 0).toLocaleString()}</strong> · Realized ASP: <strong>{formatINRPrecise(skuEconomics.avgSellingPrice)}</strong> · Unit COGS: <strong>₹{(skuEconomics.unitCost || 0).toLocaleString()}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE TELEMETRY STRIP */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Realized Revenue</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(skuEconomics.realizedRevenue)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{skuEconomics.unitsSold || 0} units sold</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Gross Margin</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {(skuEconomics.grossMarginPct || 0).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">COGS: {formatINR(skuEconomics.totalCogs)}</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Cost-to-Serve</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {(skuEconomics.costToServe?.costToServePct || 0).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{formatINR(skuEconomics.unitEconomics?.unitTotalCostToServe)}/unit</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">True Contribution</span>
          <span className={`font-serif text-2xl font-medium block mt-1 ${(skuEconomics.trueContributionMarginPct || 0) < 20 ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
            {(skuEconomics.trueContributionMarginPct || 0).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#141310] font-medium mt-0.5 block">{formatINRPrecise(skuEconomics.contributionPerUnit)}/unit net</span>
        </div>
      </section>

      {/* 3. UNIT ECONOMICS WATERFALL */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Unit Economics Waterfall
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Per-unit financial bridge from catalog list price to true net contribution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Cost Component</th>
                <th className="py-2.5 px-4 text-right font-semibold">Per Unit (₹)</th>
                <th className="py-2.5 px-4 text-right font-semibold">28-Day Total (₹)</th>
                <th className="py-2.5 pl-4 text-right font-semibold">% of Realized Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              <tr>
                <td className="py-2.5 pr-4 text-[#141310]">List Price</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatINRPrecise(skuEconomics.listPrice)}</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatINR((skuEconomics.listPrice || 0) * (skuEconomics.unitsSold || 0))}</td>
                <td className="py-2.5 pl-4 text-right font-mono">—</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Promotional Discount</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics?.unitDiscount)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(skuEconomics.totalDiscounts)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{(skuEconomics.discountPct || 0).toFixed(1)}%</td>
              </tr>
              <tr className="bg-[#f4f0e6]/40 font-medium">
                <td className="py-3 pr-4 text-[#141310]">= Realized Selling Price (ASP)</td>
                <td className="py-3 px-4 text-right font-mono text-[#141310]">{formatINRPrecise(skuEconomics.avgSellingPrice)}</td>
                <td className="py-3 px-4 text-right font-mono text-[#141310]">{formatINR(skuEconomics.realizedRevenue)}</td>
                <td className="py-3 pl-4 text-right font-mono text-[#141310]">100.0%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Cost of Goods Sold (COGS)</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitCost)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(skuEconomics.totalCogs)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{(((skuEconomics.totalCogs || 0) / (skuEconomics.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Payment Gateway &amp; Take-Rates</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise((skuEconomics.unitEconomics?.unitPaymentFee || 0) + (skuEconomics.unitEconomics?.unitMarketplaceFee || 0))}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR((skuEconomics.costToServe?.paymentFees || 0) + (skuEconomics.costToServe?.marketplaceFees || 0))}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{((((skuEconomics.costToServe?.paymentFees || 0) + (skuEconomics.costToServe?.marketplaceFees || 0)) / (skuEconomics.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Forward Shipping &amp; Packaging</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise((skuEconomics.unitEconomics?.unitShippingCost || 0) + (skuEconomics.unitEconomics?.unitPackagingCost || 0))}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR((skuEconomics.costToServe?.forwardShippingCost || 0) + (skuEconomics.costToServe?.packagingCost || 0))}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{((((skuEconomics.costToServe?.forwardShippingCost || 0) + (skuEconomics.costToServe?.packagingCost || 0)) / (skuEconomics.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Advertising Media Spend</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics?.unitAdCost)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe?.advertisingCost)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{(((skuEconomics.costToServe?.advertisingCost || 0) / (skuEconomics.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Reverse Logistics &amp; Return Friction</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics?.unitReturnCost)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe?.returnFrictionCost)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{(((skuEconomics.costToServe?.returnFrictionCost || 0) / (skuEconomics.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="bg-[#f4f0e6] font-semibold text-[#141310]">
                <td className="py-3 pr-4 font-serif text-sm">= True Economic Contribution</td>
                <td className="py-3 px-4 text-right font-mono">{formatINRPrecise(skuEconomics.contributionPerUnit)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatINR(skuEconomics.trueContribution)}</td>
                <td className="py-3 pl-4 text-right font-mono">{(skuEconomics.trueContributionMarginPct || 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. CROSS-CHANNEL COMPARISON */}
      {channelProfiles.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
          <div>
            <h2 className="font-serif text-xl text-[#141310] font-medium">
              Cross-Channel Fulfilment Economics
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Unit contribution across marketplace channels and fulfillment models
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                  <th className="py-2.5 pr-4 font-semibold">Channel</th>
                  <th className="py-2.5 px-4 font-semibold">Fulfilment Model</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Realized ASP</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Unit CTS</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Unit Contribution</th>
                  <th className="py-2.5 pl-4 text-right font-semibold">Contribution Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {channelProfiles.map((ch) => (
                  <tr key={ch.channelId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-[#141310]">{ch.channelName}</td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#6e6a60]">{ch.fulfilmentModelName}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatINR(ch.unitRealizedPrice)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">-{formatINR(ch.unitTotalCostToServe)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">{formatINR(ch.unitTrueContribution)}</td>
                    <td className="py-2.5 pl-4 text-right font-mono font-semibold text-[#141310]">{(ch.trueContributionMarginPct || 0).toFixed(1)}%</td>
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
