import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import {
  calculateStoreInventoryCapital,
  calculatePurchaseCommitments,
  calculateStoreSettlementExposure,
  calculateOperatingCashFloat,
  calculateReturnCashExposure,
  calculateCashExposureWaterfall,
  calculateCapitalFlowLifecycle,
  calculateSKUWorkingCapital
} from '../../lib/economics.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function WorkingCapitalPage() {
  const { data, storeName } = useCommerceData();

  const storeInv = calculateStoreInventoryCapital(data) || { totalInventoryUnits: 0, totalInventoryCapital: 0 };
  const commitments = calculatePurchaseCommitments(data) || { openPOCount: 0, totalCommittedValue: 0 };
  const operatingFloat = calculateOperatingCashFloat(data, 28) || { totalOperatingCashFloat: 0 };
  const waterfall = calculateCashExposureWaterfall(data) || { waterfallSteps: [], estimatedNetCashExposure: 0 };
  const capitalFlow = calculateCapitalFlowLifecycle(data);

  const products = data?.products || [];
  const skuWorkingCapitalList = products.map(p => calculateSKUWorkingCapital(p, data)).filter(Boolean);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  if (products.length === 0) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Operations / Cash &amp; Working Capital Flow
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              Working Capital &amp; Cash Exposure
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No inventory or working capital records found"
          message="Connect inventory feeds, supplier ERP tables, or enter Demo Mode to evaluate the 7-stage capital flow lifecycle and inventory capital lockup."
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
            Operations / Cash &amp; Working Capital Flow
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            Where is operating capital committed, locked, and transitioning?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · End-to-end capital flow lifecycle: supplier commitments, inventory at cost, operational float, and marketplace settlement timing.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CORE FINANCIAL STRIP */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Inventory Capital (At Cost)</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(storeInv.totalInventoryCapital)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{storeInv.totalInventoryUnits} units physical custody</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Supplier PO Commitments</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(commitments.totalCommittedValue)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{commitments.openPOCount} open batches</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Operating Cash Float</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(operatingFloat.totalOperatingCashFloat)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Acquisition &amp; logistics float</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Net Deployed Exposure</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(waterfall.estimatedNetCashExposure)}
          </span>
          <span className="text-[11px] text-[#141310] font-medium mt-0.5 block">Total active capital</span>
        </div>
      </section>

      {/* 3. CAPITAL FLOW LIFECYCLE (SECTIONS 60, 61 & 62) */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            End-to-End Operating Capital Flow Chain
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Stage-by-stage lifecycle from supplier commitment to realized marketplace cash clearance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Stage</th>
                <th className="py-2.5 px-4 font-semibold">Lifecycle Event</th>
                <th className="py-2.5 px-4 font-semibold">Status / Flow</th>
                <th className="py-2.5 px-4 text-right font-semibold">Capital (₹)</th>
                <th className="py-2.5 px-4 font-semibold">Timing Window</th>
                <th className="py-2.5 pl-4 font-semibold">Economic Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb] font-mono text-xs">
              {capitalFlow.stages.map((stg) => (
                <tr key={stg.stageNumber} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 text-[#c5301a] font-bold">0{stg.stageNumber}.</td>
                  <td className="py-2.5 px-4 font-serif text-sm font-medium text-[#141310]">{stg.stageName}</td>
                  <td className="py-2.5 px-4 text-[#6e6a60]">{stg.status}</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[#141310]">{formatINR(stg.amount)}</td>
                  <td className="py-2.5 px-4 text-[#45423b]">{stg.timing}</td>
                  <td className="py-2.5 pl-4 font-sans text-xs text-[#45423b]">{stg.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. CASH EXPOSURE WATERFALL */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Cash Exposure Waterfall Reconciliation
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Reconciliation from physical inventory stock to net capital exposure
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Exposure Driver</th>
                <th className="py-2.5 px-4 text-right font-semibold">Capital Amount (₹)</th>
                <th className="py-2.5 px-4 text-right font-semibold">Category</th>
                <th className="py-2.5 pl-4 font-semibold">Analytical Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {(waterfall.waterfallSteps || []).map((step) => (
                <tr key={step.step} className={`hover:bg-[#f4f0e6]/50 transition-colors ${step.type === 'TOTAL' ? 'bg-[#f4f0e6] font-semibold text-[#141310]' : ''}`}>
                  <td className="py-2.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {step.label}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    <span className={step.amount < 0 ? 'text-[#1b7340]' : 'text-[#141310]'}>
                      {step.amount < 0 ? `-${formatINR(Math.abs(step.amount))}` : formatINR(step.amount)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[11px] text-[#6e6a60]">
                    {step.type}
                  </td>
                  <td className="py-2.5 pl-4 font-sans text-xs text-[#45423b]">
                    {step.description}
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
