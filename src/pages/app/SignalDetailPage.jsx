import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { generateSignals, PRIORITY_LABELS } from '../../lib/signals.js';

export default function SignalDetailPage() {
  const { signalId } = useParams();
  const { data, storeName } = useCommerceData();

  const allSignals = useMemo(() => generateSignals(data), [data]);
  const baseSignal = allSignals.find(s => s.id.toLowerCase() === signalId?.toLowerCase());

  const [localStatus, setLocalStatus] = useState(baseSignal?.status || 'OPEN');

  if (!baseSignal) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-4">
          <Link to="/app/signals" className="font-mono text-xs text-[#6e6a60] hover:text-[#141310]">
            ← Return to Operating Findings
          </Link>
        </div>
        <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 text-center space-y-4">
          <span className="font-mono text-xs text-[#c5301a] uppercase tracking-wider">Finding Not Found</span>
          <h2 className="font-serif text-2xl text-[#141310]">No Finding matching "{signalId}"</h2>
          <p className="text-sm text-[#45423b] max-w-md mx-auto">
            The requested finding could not be located in the current operating evaluation cycle.
          </p>
          <Link to="/app/signals" className="px-4 py-2 bg-[#141310] text-[#fcfbf8] font-mono text-xs inline-block mt-4 hover:bg-[#c5301a] transition-colors">
            View All Findings
          </Link>
        </div>
      </div>
    );
  }

  const signal = { ...baseSignal, status: localStatus };
  const priorityLabel = PRIORITY_LABELS[signal.severity] || signal.severity || 'MEDIUM';

  const currentIndex = allSignals.findIndex(s => s.id === signal.id);
  const prevSignal = currentIndex > 0 ? allSignals[currentIndex - 1] : null;
  const nextSignal = currentIndex >= 0 && currentIndex < allSignals.length - 1 ? allSignals[currentIndex + 1] : null;

  return (
    <div className="space-y-12">
      {/* 1. BREADCRUMBS & TOP NAV */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#6e6a60]">
          <div className="flex items-center gap-2">
            <Link to="/app" className="hover:text-[#141310]">Overview</Link>
            <span>/</span>
            <Link to="/app/signals" className="hover:text-[#141310]">Findings</Link>
            <span>/</span>
            <span className="text-[#141310] font-semibold">{signal.id}</span>
          </div>

          <div className="flex items-center gap-3">
            {prevSignal && (
              <Link to={`/app/signals/${prevSignal.id}`} className="hover:text-[#141310]">
                ← Prev ({prevSignal.id})
              </Link>
            )}
            {prevSignal && nextSignal && <span>|</span>}
            {nextSignal && (
              <Link to={`/app/signals/${nextSignal.id}`} className="hover:text-[#141310]">
                Next ({nextSignal.id}) →
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs text-[#6e6a60]">
              <span className="uppercase font-semibold text-[#c5301a]">{signal.domain || 'OPERATIONS'}</span>
              <span>·</span>
              <span>Recorded: {signal.createdAt || 'Cycle Active'}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] leading-tight tracking-tight">
              {signal.title}
            </h1>
            <p className="text-base text-[#45423b] leading-relaxed pt-1">
              {signal.summary}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6e6a60]">Priority:</span>
              <span className="font-semibold uppercase text-[#c5301a]">{priorityLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6e6a60]">Status:</span>
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value)}
                className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1 uppercase text-[#141310] focus:outline-none"
              >
                <option value="OPEN">OPEN</option>
                <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 4-STAGE ANALYTICAL REPORT FLOW */}
      <section className="space-y-12">
        {/* Stage 1: Observation & Evidence */}
        <div className="space-y-4">
          <div className="border-b border-[#ded8cb] pb-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              01 / Observation &amp; Telemetry
            </span>
          </div>
          <p className="font-serif text-xl sm:text-2xl text-[#141310] leading-snug">
            {signal.whatChanged}
          </p>

          {/* Evidence Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
            {signal.evidence && signal.evidence.map((ev, idx) => (
              <div key={idx} className="border-l-2 border-[#141310] pl-4 py-1">
                <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">
                  {ev.metric}
                </span>
                <span className="font-serif text-xl sm:text-2xl text-[#141310] font-medium block mt-0.5">
                  {ev.value}
                </span>
                <span className="font-mono text-[10px] text-[#8e8a80] block mt-0.5">
                  [Observed Data]
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage 2: Root Cause Diagnosis */}
        <div className="space-y-4 border-t border-[#ded8cb] pt-8">
          <div className="border-b border-[#ded8cb] pb-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              02 / Root Cause Diagnosis
            </span>
          </div>
          <p className="text-base sm:text-lg text-[#141310] leading-relaxed max-w-3xl">
            {signal.rootCause}
          </p>
        </div>

        {/* Stage 3: Economic Implication */}
        <div className="space-y-4 border-t border-[#ded8cb] pt-8">
          <div className="border-b border-[#ded8cb] pb-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              03 / Economic Implication &amp; Impact
            </span>
          </div>
          <p className="text-base sm:text-lg text-[#45423b] leading-relaxed max-w-3xl">
            {signal.whyItMatters}
          </p>
        </div>

        {/* Stage 4: Management Lever */}
        <div className="space-y-6 border-t border-[#ded8cb] pt-8">
          <div className="border-b border-[#ded8cb] pb-2">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a]">
              04 / Recommended Management Action
            </span>
          </div>
          <div className="border-l-2 border-[#c5301a] pl-6 py-2 space-y-4 max-w-3xl">
            <p className="font-serif text-xl sm:text-2xl text-[#141310] font-medium leading-snug">
              {signal.recommendedAction}
            </p>
            <p className="text-sm text-[#45423b] leading-relaxed">
              Evaluating this lever against store contribution and cash timing prevents reactive decision-making.
            </p>
            <div className="pt-2 flex items-center gap-4 font-mono text-xs">
              <Link to="/app/decisions" className="px-4 py-2 bg-[#141310] text-[#fcfbf8] hover:bg-[#c5301a] transition-colors">
                Log into Decision Ledger →
              </Link>
              {signal.entityId && (
                <Link to={`/app/products/${signal.entityId}`} className="text-[#141310] underline hover:text-[#c5301a]">
                  Open SKU Dossier ({signal.entityId}) →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
