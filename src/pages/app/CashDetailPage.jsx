import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { calculateSKUWorkingCapital } from '../../lib/economics.js';

export default function CashDetailPage() {
  const { sku } = useParams();
  const { data, storeName } = useData();
  const products = data.products || [];

  const product = products.find(p => p.sku === sku);

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/cash" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Working Capital Review
          </Link>
        </div>
        <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl text-[#141310]">No Cash Dossier for "{sku}"</h2>
          <Link to="/app/cash" className="button-primary text-xs inline-block mt-4">
            View All Cash Dossiers
          </Link>
        </div>
      </div>
    );
  }

  const skuCash = calculateSKUWorkingCapital(product, data);
  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12">
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6e6a60]">
          <Link to="/app" className="hover:text-[#141310]">Overview</Link>
          <span>/</span>
          <Link to="/app/cash" className="hover:text-[#141310]">Cash &amp; Working Capital</Link>
          <span>/</span>
          <span className="text-[#141310] font-semibold">{product.sku}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              SKU Working Capital Dossier
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#141310]">
              {product.name}
            </h1>
            <p className="text-sm font-mono text-[#6e6a60]">
              SKU: {product.sku} · Unit Cost: ₹{product.unitCost} · Supplier Lead Time: {product.supplierLeadTimeDays} Days
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link to={`/app/products/${product.sku}`} className="editorial-link">
              Open SKU Dossier →
            </Link>
          </div>
        </div>
      </div>

      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Capital Locked</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(skuCash.inventoryCapital)}</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">{skuCash.currentStock} units in stock</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Daily Velocity</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{skuCash.dailyVelocity.toFixed(1)}/day</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">Current run rate</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Coverage Runway</span>
            <span className={`font-serif text-2xl font-medium block mt-1 ${skuCash.coverageDays < skuCash.supplierLeadTimeDays ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
              {skuCash.coverageDays.toFixed(1)} Days
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">Lead time: {skuCash.supplierLeadTimeDays}d</span>
          </div>
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">Net Exposure</span>
            <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(skuCash.totalCapitalAtRisk)}</span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">Stock + Commitments</span>
          </div>
        </div>
      </section>
    </div>
  );
}
