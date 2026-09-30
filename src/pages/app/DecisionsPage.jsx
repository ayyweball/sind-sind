import React from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function DecisionsPage() {
  const { data, storeName } = useCommerceData();
  const ledger = data.decisionsLedger || [];

  if (ledger.length === 0) {
    return (
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
              <span>Intelligence / Decisions</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
              Executive Decision Register
            </h1>
            <p className="text-sm font-mono text-[#6e6a60]">
              {storeName} · Audited governance actions, operational trade-offs, and scheduled management reviews.
            </p>
            <div className="pt-2">
              <DataSourceBar />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/app/signals" className="button-secondary text-xs">
              Review Active Findings →
            </Link>
          </div>
        </div>

        <EmptyState
          title="No governance decisions recorded"
          message="The Decision Centre tracks executive interventions, operational trade-offs, and scheduled reviews generated from operating findings."
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Intelligence / Decisions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Executive Decision Register
          </h1>
          <p className="text-sm font-mono text-[#6e6a60]">
            {storeName} · Audited governance actions, operational trade-offs, and scheduled management reviews.
          </p>
          <div className="pt-2">
            <DataSourceBar />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/signals" className="button-secondary text-xs">
            Review Active Findings →
          </Link>
        </div>
      </div>

      {/* 2. HORIZONTAL SUMMARY STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Recorded Decisions
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {ledger.length}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Persistent governance ledger
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Active Executions
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {ledger.filter(d => d.status === 'ACTIVE').length}
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              In flight
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Scheduled Reviews
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {ledger.filter(d => d.reviewDate).length}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Review milestones set
            </span>
          </div>
        </div>
      </section>

      {/* 3. DECISION LEDGER TABLE */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#ded8cb] pb-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#141310] font-semibold">
            All Governance Actions ({ledger.length})
          </span>
          <span className="font-mono text-[11px] text-[#6e6a60]">
            Deterministic Audit Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Domain</th>
                <th className="py-3 px-4 font-semibold">Approved Action</th>
                <th className="py-3 px-4 font-semibold">Operating Rationale</th>
                <th className="py-3 px-4 font-semibold">Expected Outcome</th>
                <th className="py-3 px-4 font-semibold">Review Date</th>
                <th className="py-3 pl-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {ledger.map((dec) => (
                <tr key={dec.id} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-4 pr-4 font-mono font-medium text-[#c5301a] align-top">
                    {dec.id}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-[#6e6a60] align-top whitespace-nowrap">
                    {dec.date}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] uppercase text-[#6e6a60] align-top">
                    {dec.domain}
                  </td>
                  <td className="py-4 px-4 font-serif text-sm font-medium text-[#141310] align-top max-w-xs">
                    {dec.decision}
                  </td>
                  <td className="py-4 px-4 text-[#45423b] align-top max-w-sm leading-relaxed">
                    {dec.reason}
                  </td>
                  <td className="py-4 px-4 text-[#45423b] align-top max-w-xs leading-relaxed">
                    {dec.expectedOutcome}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-[#141310] align-top whitespace-nowrap">
                    {dec.reviewDate}
                  </td>
                  <td className="py-4 pl-4 text-right font-mono align-top">
                    <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-[#f4f0e6] border border-[#ded8cb] text-[#141310]">
                      {dec.status}
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
