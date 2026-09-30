import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { calculateSKUWorkingCapital } from '../../lib/economics.js';

export default function CashDetailPage() {
  const { sku } = useParams();
  const { data, storeName } = useCommerceData();
  const products = data.products || [];

  const product = products.find(p => p.sku === sku);

  if (!product) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/cash" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Working Capital Review
          </Link>
        </div>
        <div className="py-12 text-center space-y-4">
          <span className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">SKU Not Found</span>
          <h2 className="font-serif text-2xl text-[#141310]">No Cash Dossier for "{sku}"</h2>
          <Link to="/app/cash" className="font-mono text-xs text-[#141310] underline inline-block mt-4">
            View All Cash Dossiers
          </Link>
        </div>
      </div>
    );
  }

  const skuCash = calculateSKUWorkingCapital(product, data) || {};
  const inv = skuCash?.inventory || {};
  const coverage = inv.coverageDays || 0;
  const leadTime = inv.leadTimeDays || 30;

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12 max-w-5xl">
      <div className="space-y-2 border-b border-[#ded8cb] pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-[#6e6a60]">
          <Link to="/app/cash" className="hover:text-[#141310]">Cash &amp; Working Capital</Link>
          <span>/</span>
          <span className="text-[#141310] font-semibold">{product.sku}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
          {product.name || product.sku} Working Capital Dossier
        </h1>
        <p className="font-mono text-xs text-[#6e6a60]">
          SKU: {product.sku} · Unit Cost: ₹{inv.unitCOGS || product.cost || 0} · Supplier Lead Time: {leadTime} Days
        </p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Capital Locked</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(inv.inventoryCapital)}</span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{inv.stockUnits || 0} units in stock</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Daily Velocity</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{(inv.dailyVelocity || 0).toFixed(1)}/day</span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">28-day observed velocity</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Coverage Runway</span>
          <span className={`font-serif text-2xl font-medium block mt-1 ${coverage < leadTime ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
            {coverage.toFixed(1)} Days
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Lead time: {leadTime}d</span>
        </div>
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Net Cash Exposure</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">{formatINR(skuCash.netCashExposure)}</span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Stock + Open POs + Float</span>
        </div>
      </section>
    </div>
  );
}
