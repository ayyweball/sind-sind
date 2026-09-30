import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { getSingleSKUPerformance, calculateProductPerformance } from '../../lib/metrics.js';
import {
  calculateSKUEconomics,
  compareSKUChannels,
  calculatePriceEconomics,
  calculateSKUWorkingCapital,
  calculateSKUOperations
} from '../../lib/economics.js';
import { DATA_QUALITY, DEFAULT_PRICING_THRESHOLDS } from '../../lib/economicRules.js';

export default function ProductDetailPage() {
  const { sku } = useParams();
  const { data, storeName } = useData();

  const product = getSingleSKUPerformance(data, sku);
  const allProducts = calculateProductPerformance(data);

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/products" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to SKU Intelligence Register
          </Link>
        </div>
        <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 text-center space-y-4">
          <span className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">SKU Not Found</span>
          <h2 className="font-serif text-2xl text-[#141310]">No SKU matching "{sku}"</h2>
          <p className="text-sm text-[#45423b] max-w-md mx-auto">
            The requested SKU could not be found in the current store catalog dataset.
          </p>
          <Link to="/app/products" className="button-primary text-xs inline-block mt-4">
            View All SKUs
          </Link>
        </div>
      </div>
    );
  }

  const skuEconomics = calculateSKUEconomics(product, data);
  const channelComparison = compareSKUChannels(product, data);
  const priceEconomics = calculatePriceEconomics(product, data);
  const workingCapital = calculateSKUWorkingCapital(product, data);
  const operations = calculateSKUOperations(product, data);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const currentIndex = allProducts.findIndex(p => p.sku === product.sku);
  const prevSKU = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextSKU = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

  return (
    <div className="space-y-12">
      {/* 1. BREADCRUMBS & SKU DOSSIER HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6e6a60]">
          <div className="flex items-center gap-2">
            <Link to="/app" className="hover:text-[#141310]">Overview</Link>
            <span>/</span>
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
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs text-[#6e6a60]">
              <span className="uppercase font-semibold text-[#c5301a]">{product.category}</span>
              <span>·</span>
              <span>Primary Channel: {product.channel.toUpperCase()}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
              {product.name}
            </h1>
            <p className="text-base text-[#45423b] leading-relaxed pt-1">
              List Price: <strong>₹{skuEconomics.listPrice.toLocaleString()}</strong> · Realized ASP: <strong>{formatINRPrecise(skuEconomics.avgSellingPrice)}</strong> · Unit COGS: <strong>₹{skuEconomics.unitCost.toLocaleString()}</strong> · Revenue Share: <strong>{product.revenueSharePct.toFixed(1)}%</strong>
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 font-mono text-xs">
            <span className="uppercase tracking-wider px-3 py-1 bg-[#f4f0e6] border border-[#ded8cb] text-[#141310] font-semibold">
              {product.operatingStatus}
            </span>
            <span className="text-[11px] text-[#6e6a60]">
              Dossier Generated Live
            </span>
          </div>
        </div>
      </div>

      {/* 2. HORIZONTAL ECONOMIC DOSSIER STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Realized Revenue
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(skuEconomics.realizedRevenue)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {skuEconomics.unitsSold} units ({skuEconomics.orderCount} orders)
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Gross Margin %
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {skuEconomics.grossMarginPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              COGS: {formatINR(skuEconomics.totalCogs)}
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Cost-to-Serve %
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {skuEconomics.costToServe.costToServePct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {formatINR(skuEconomics.unitEconomics.unitTotalCostToServe)}/unit CTS
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              True Contribution Margin
            </span>
            <span className={`font-serif text-2xl lg:text-3xl font-medium block mt-1 ${
              skuEconomics.trueContributionMarginPct < 20 ? 'text-[#c5301a]' : 'text-[#141310]'
            }`}>
              {skuEconomics.trueContributionMarginPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {formatINRPrecise(skuEconomics.contributionPerUnit)}/unit net
            </span>
          </div>
        </div>
      </section>

      {/* 3. CROSS-FUNCTIONAL ANALYTICAL PROGRESSION */}
      <section className="space-y-4 border-b border-[#ded8cb] pb-10">
        <div className="border-b border-[#ded8cb] pb-2">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Cross-Functional Analytical Progression
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 pt-2 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          {product.crossFunctionalChain.map((step, idx) => (
            <div key={idx} className="pt-3 sm:pt-0 sm:px-3 first:pl-0">
              <span className="font-mono text-[10px] uppercase text-[#c5301a] block">
                0{idx + 1} / {step.step}
              </span>
              <span className="font-serif text-base text-[#141310] font-medium block mt-1 leading-snug">
                {step.change}
              </span>
              <p className="text-xs text-[#45423b] mt-1.5 leading-relaxed">
                {step.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TRUE CONTRIBUTION & COST-TO-SERVE WATERFALL TABLE */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#141310] font-medium">
              Unit Economics &amp; Cost-to-Serve Decomposition
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Deterministic per-unit waterfall from list price to true contribution
            </p>
          </div>
          <span className="font-mono text-[11px] text-[#6e6a60]">
            [Calculated from {skuEconomics.orderCount} SKU Orders]
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Economic Component</th>
                <th className="py-3 px-4 text-right font-semibold">Per Unit (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">28-Day Total (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">% of Realized Revenue</th>
                <th className="py-3 pl-4 text-right font-semibold">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              <tr>
                <td className="py-3 pr-4 font-medium text-[#141310]">List Price</td>
                <td className="py-3 px-4 text-right font-mono">{formatINRPrecise(skuEconomics.listPrice)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatINR(skuEconomics.listPrice * skuEconomics.unitsSold)}</td>
                <td className="py-3 px-4 text-right font-mono">—</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#c5301a]">(-) Discounts &amp; Markdowns</td>
                <td className="py-3 px-4 text-right font-mono text-[#c5301a]">-{formatINRPrecise(skuEconomics.unitEconomics.unitDiscount)}</td>
                <td className="py-3 px-4 text-right font-mono text-[#c5301a]">-{formatINR(skuEconomics.totalDiscounts)}</td>
                <td className="py-3 px-4 text-right font-mono text-[#c5301a]">-{skuEconomics.discountPct.toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr className="bg-[#f4f0e6]/40 font-medium">
                <td className="py-3 pr-4 text-[#141310]">= Realized Selling Price</td>
                <td className="py-3 px-4 text-right font-mono text-[#141310]">{formatINRPrecise(skuEconomics.avgSellingPrice)}</td>
                <td className="py-3 px-4 text-right font-mono text-[#141310]">{formatINR(skuEconomics.realizedRevenue)}</td>
                <td className="py-3 px-4 text-right font-mono text-[#141310]">100.0%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Cost of Goods Sold (COGS)</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.totalCogs)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.totalCogs / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Channel Take-Rate / Gateway</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics.unitPaymentGatewayFee)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe.paymentGatewayFees)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.costToServe.paymentGatewayFees / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Forward Shipping &amp; Logistics</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics.unitForwardShipping)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe.forwardShippingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.costToServe.forwardShippingCost / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Packaging &amp; Unboxing Materials</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics.unitPackagingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe.packagingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.costToServe.packagingCost / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Demo Assumption</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Reverse Logistics &amp; Restocking Friction</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics.unitReturnFrictionCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe.returnFrictionCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.costToServe.returnFrictionCost / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Allocated Direct Ad Spend (Meta/Google)</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(skuEconomics.unitEconomics.unitAdCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(skuEconomics.costToServe.directAdSpend)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((skuEconomics.costToServe.directAdSpend / skuEconomics.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr className="bg-[#f4f0e6] font-semibold text-[#141310]">
                <td className="py-3.5 pr-4 text-base font-serif">= True Economic Contribution</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{formatINRPrecise(skuEconomics.contributionPerUnit)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{formatINR(skuEconomics.trueContribution)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{skuEconomics.trueContributionMarginPct.toFixed(1)}%</td>
                <td className="py-3.5 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PRICING & CHANNEL DISTRIBUTION DOSSIER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-[#ded8cb] pb-12">
        {/* Pricing Architecture */}
        <section className="space-y-4">
          <div className="border-b border-[#ded8cb] pb-3">
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Pricing Architecture &amp; Headroom
            </h3>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Headroom against {DEFAULT_PRICING_THRESHOLDS.targetContributionMarginPct}% target contribution margin
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Current Realized Price (ASP):</span>
              <span className="font-mono font-medium text-[#141310]">{formatINRPrecise(priceEconomics.unitRealizedPrice)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Required Price for 25% Margin:</span>
              <span className="font-mono font-medium text-[#141310]">{formatINRPrecise(priceEconomics.requiredPriceForTargetMargin)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Available Discount Headroom:</span>
              <span className={`font-mono font-medium ${priceEconomics.headroomToFloor < 0 ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
                {formatINRPrecise(priceEconomics.headroomToFloor)} ({priceEconomics.headroomPct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Maximum Allowable Discount:</span>
              <span className="font-mono text-[#141310]">{formatINRPrecise(priceEconomics.maxAllowableDiscount)}</span>
            </div>
          </div>
        </section>

        {/* Inventory & Custody */}
        <section className="space-y-4">
          <div className="border-b border-[#ded8cb] pb-3">
            <h3 className="font-serif text-xl text-[#141310] font-medium">
              Inventory Custody &amp; Working Capital
            </h3>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Physical units on hand, capital tied up, and reorder status
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Current Stock on Hand:</span>
              <span className="font-mono font-medium text-[#141310]">{product.currentStock} Units</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Capital Tied Up (at Unit COGS):</span>
              <span className="font-mono font-medium text-[#141310]">{formatINR(product.currentStock * product.unitCost)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Daily Sales Velocity:</span>
              <span className="font-mono text-[#141310]">{product.dailyVelocity.toFixed(1)} units/day</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#ded8cb]">
              <span className="text-[#6e6a60]">Coverage Runway:</span>
              <span className={`font-mono font-medium ${product.isStockoutRisk ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
                {product.coverageDays.toFixed(1)} Days (Lead Time: {product.supplierLeadTimeDays}d)
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 6. MULTI-CHANNEL DISTRIBUTION COMPARISON */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#ded8cb] pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#141310] font-medium">
              Multi-Channel Distribution Economics
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Simulated cost-to-serve and contribution margin across channels
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Sales Channel</th>
                <th className="py-3 px-4 font-semibold">Fulfilment Model</th>
                <th className="py-3 px-4 text-right font-semibold">Realized Price</th>
                <th className="py-3 px-4 text-right font-semibold">Take-Rate Fees</th>
                <th className="py-3 px-4 text-right font-semibold">Fulfilment CTS</th>
                <th className="py-3 px-4 text-right font-semibold">True Contribution</th>
                <th className="py-3 pl-4 text-right font-semibold">Contribution %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {channelComparison.map((ch) => (
                <tr key={ch.channelId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {ch.channelName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                    {ch.fulfilmentModel}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {formatINRPrecise(ch.unitRealizedPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#c5301a]">
                    -{formatINRPrecise(ch.costToServe.channelFee)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                    -{formatINRPrecise(ch.costToServe.forwardShipping + ch.costToServe.pickPack)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINRPrecise(ch.unitTrueContribution)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                    {ch.trueContributionMarginPct.toFixed(1)}%
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
