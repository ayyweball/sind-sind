import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import {
  calculateStoreInventoryCapital,
  calculatePurchaseCommitments,
  calculateStoreSettlementExposure,
  calculateOperatingCashFloat,
  calculateReturnCashExposure,
  calculateCashExposureWaterfall,
  calculateSKUWorkingCapital
} from '../../lib/economics.js';

export default function WorkingCapitalPage() {
  const { data, storeName } = useData();

  const storeInv = calculateStoreInventoryCapital(data) || { totalInventoryUnits: 0, totalInventoryCapital: 0, skuBreakdown: [] };
  const commitments = calculatePurchaseCommitments(data) || { openPOCount: 0, totalCommittedCapital: 0, openPOs: [] };
  const settlementExp = calculateStoreSettlementExposure(data) || { netSettlementExposure: 0, channelExposures: [] };
  const operatingFloat = calculateOperatingCashFloat(data, 28) || { totalOperatingFloatRequired: 0 };
  const returnExp = calculateReturnCashExposure(data) || { totalReturnCashExposure: 0 };
  const waterfall = calculateCashExposureWaterfall(data) || { steps: [] };

  const products = data?.products || [];
  const skuWorkingCapitalList = products.map(p => calculateSKUWorkingCapital(p, data)).filter(Boolean);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-12">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Operations / Cash &amp; Working Capital</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Working Capital &amp; Cash Exposure Review
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Profitability ≠ Cash Timing. Exposure analysis across stock, payables, receivables, and float.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/operations" className="button-secondary text-xs">
            Operations &amp; Logistics →
          </Link>
        </div>
      </div>

      {/* 2. OPENING EDITORIAL STATEMENT */}
      <section className="border-b border-[#ded8cb] pb-8">
        <blockquote className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium max-w-4xl">
          “Inventory remains the largest current use of operating capital.”
        </blockquote>
        <p className="mt-3 text-base text-[#45423b] max-w-3xl leading-relaxed">
          Even when commercial unit economics are profitable, capital remains committed in physical inventory, delayed marketplace settlement cycles, and open purchase orders before cash is collected.
        </p>
      </section>

      {/* 3. HORIZONTAL FINANCIAL STATEMENT STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Inventory Capital (COGS)
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(storeInv.totalInventoryCapital)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {storeInv.totalInventoryUnits} units on hand
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              PO Commitments
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(commitments.totalCommittedCapital)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {commitments.openPOCount} open purchase orders
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Settlement Exposure
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(settlementExp.netSettlementExposure)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Receivables in transit
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Operating Cash Float
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(operatingFloat.totalOperatingFloatRequired)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Ad, logistics &amp; pack buffer
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Return Drain
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#c5301a] font-medium block mt-1">
              {formatINR(returnExp.totalReturnCashExposure)}
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              Refunds &amp; reverse fees
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Net Cash Exposure
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(waterfall.netExposure)}
            </span>
            <span className="font-mono text-[11px] text-[#141310] font-medium block mt-0.5">
              Total capital deployed
            </span>
          </div>
        </div>
      </section>

      {/* 4. CASH EXPOSURE WATERFALL TABLE */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Cash Exposure Waterfall Reconciliation
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Step-by-step reconciliation from physical inventory stock to net capital exposure
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Exposure Driver</th>
                <th className="py-3 px-4 text-right font-semibold">Capital Amount (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Timing / Float</th>
                <th className="py-3 px-4 font-semibold">Analytical Purpose</th>
                <th className="py-3 pl-4 text-right font-semibold">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {waterfall.steps.map((step) => (
                <tr key={step.name} className={`hover:bg-[#f4f0e6]/50 transition-colors ${step.isTotal ? 'bg-[#f4f0e6] font-semibold text-[#141310]' : ''}`}>
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium">
                    {step.name}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono ${step.amount < 0 ? 'text-[#141310]' : ''}`}>
                    {step.amount >= 0 ? '+' : ''}{formatINR(step.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {step.timingNote || 'Immediate'}
                  </td>
                  <td className="py-3.5 px-4 text-[#45423b] max-w-md">
                    {step.description}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">
                    {step.provenance || 'Calculated'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. SKU CAPITAL CONCENTRATION REGISTER */}
      <section className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            SKU Working Capital &amp; Inventory Runway Register
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Capital committed in stock vs replenishment lead times across all active products
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">SKU Identifier</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 text-right font-semibold">Stock on Hand</th>
                <th className="py-3 px-4 text-right font-semibold">Unit COGS (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Capital Locked (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Coverage (Days)</th>
                <th className="py-3 pl-4 text-right font-semibold">Reorder Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {skuWorkingCapitalList.map((sku) => (
                <tr key={sku.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/cash/${sku.sku}`} className="hover:text-[#c5301a] underline">
                      {sku.sku}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/cash/${sku.sku}`} className="hover:text-[#c5301a]">
                      {sku.productName}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {sku.currentStock}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {formatINR(sku.unitCost)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(sku.inventoryCapital)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={sku.coverageDays < sku.supplierLeadTimeDays ? 'text-[#c5301a] font-medium' : 'text-[#141310]'}>
                      {sku.coverageDays.toFixed(1)}d (LT: {sku.supplierLeadTimeDays}d)
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono">
                    <span className={`uppercase text-[10px] tracking-wider px-2 py-0.5 ${
                      sku.coverageDays < sku.supplierLeadTimeDays
                        ? 'bg-[#f4f0e6] text-[#c5301a] border border-[#c5301a] font-semibold'
                        : 'bg-[#f4f0e6] text-[#141310] border border-[#ded8cb]'
                    }`}>
                      {sku.coverageDays < sku.supplierLeadTimeDays ? 'Reorder Immediate' : 'Sufficient'}
                    </span>
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
