import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { useAgent } from '../../agent/useAgent.js';

const QUICK_INQUIRIES = [
  'Review the last 28 days performance',
  'Why did true contribution change?',
  'Where is working capital tied up?',
  'Which SKUs are eroding margin?',
  'Audit fulfillment and reverse logistics friction'
];

export default function AgentPage() {
  const { data, storeName, dataMode, hasData } = useCommerceData();
  const [queryInput, setQueryInput] = useState('');
  const { investigate, investigation, loading, error } = useAgent();

  // Run initial default investigation on mount
  useEffect(() => {
    investigate('Review the last 28 days performance');
  }, [dataMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (queryInput.trim()) {
      investigate(queryInput.trim());
    }
  };

  const handleChipClick = (prompt) => {
    setQueryInput(prompt);
    investigate(prompt);
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. HEADER */}
      <div className="space-y-2 border-b border-[#ded8cb] pb-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
          <span>Operating Intelligence</span>
          <span>·</span>
          <span>Autonomous AI Review</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
          Commerce Operating Agent
        </h1>
        <p className="text-sm font-mono text-[#6e6a60] pt-1">
          {storeName} · Authoritative reasoning and diagnostic synthesis over deterministic commerce models.
        </p>
      </div>

      {/* 2. INQUIRY INPUT & CHIPS */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask an operating question (e.g., 'Why did margin drop on SKU-001?', 'Where is cash trapped?')"
            className="flex-1 bg-[#fcfbf8] border border-[#ded8cb] px-4 py-3 text-sm text-[#141310] placeholder-[#8e8a80] focus:outline-none focus:border-[#141310] font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#141310] text-[#fcfbf8] text-xs font-mono uppercase tracking-wider hover:bg-[#c5301a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Investigate →'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-xs text-[#8e8a80] mr-2">Predefined Inquiries:</span>
          {QUICK_INQUIRIES.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleChipClick(prompt)}
              className="text-xs font-mono px-3 py-1 bg-[#f4f0e6]/60 border border-[#ded8cb] text-[#45423b] hover:border-[#141310] hover:text-[#141310] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. INVESTIGATION RESULTS DOSSIER */}
      {loading && (
        <div className="py-16 text-center space-y-3 border border-[#ded8cb] bg-[#fcfbf8]">
          <span className="font-mono text-xs uppercase tracking-wider text-[#c5301a]">Executing Analytical Engines</span>
          <p className="text-sm text-[#45423b]">Auditing order items, unit waterfalls, and cash conversion cycle...</p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-[#c5301a] bg-[#fcfbf8] font-mono text-xs text-[#c5301a]">
          Investigation Error: {error}
        </div>
      )}

      {!loading && investigation && (
        <div className="space-y-10 border border-[#ded8cb] bg-[#fcfbf8] p-8 sm:p-10 shadow-sm">
          {/* Section 1: Finding */}
          <div className="space-y-2 border-b border-[#ded8cb] pb-6">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#6e6a60]">
              <span className="uppercase tracking-[0.16em] text-[#c5301a]">01 / Executive Finding</span>
              <span>Inquiry: "{investigation.query}"</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141310] font-medium leading-snug">
              {investigation.finding}
            </h2>
          </div>

          {/* Section 2: Telemetry & Evidence Grid */}
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] block">
              02 / Grounded Evidence &amp; Telemetry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-1">
              {investigation.evidence?.map((item, idx) => (
                <div key={idx} className="border-l-2 border-[#141310] pl-4 py-1">
                  <span className="font-mono text-[10px] uppercase text-[#6e6a60] block">{item.label}</span>
                  <span className="font-serif text-xl sm:text-2xl text-[#141310] font-medium block mt-0.5">
                    {item.value}
                  </span>
                  <span className="font-mono text-[10px] text-[#8e8a80] block mt-0.5">
                    {item.provenance}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Root Cause Diagnosis */}
          <div className="space-y-3 border-t border-[#ded8cb] pt-8">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] block">
              03 / Root Cause Diagnosis
            </span>
            <p className="text-base sm:text-lg text-[#141310] leading-relaxed max-w-3xl">
              {investigation.rootCause}
            </p>
          </div>

          {/* Section 4: Economic Implication */}
          <div className="space-y-3 border-t border-[#ded8cb] pt-8">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] block">
              04 / Economic &amp; Cash Implication
            </span>
            <p className="text-base sm:text-lg text-[#45423b] leading-relaxed max-w-3xl">
              {investigation.economicImplication}
            </p>
          </div>

          {/* Section 5: Management Considerations */}
          <div className="space-y-4 border-t border-[#ded8cb] pt-8">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a] block">
              05 / Strategic Management Levers
            </span>
            <div className="border-l-2 border-[#c5301a] pl-6 py-2 space-y-3">
              {investigation.managementConsiderations?.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#c5301a] font-semibold mt-0.5">{idx + 1}.</span>
                  <p className="font-serif text-lg text-[#141310] font-medium leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6 & 7: Data Gaps & Basis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#ded8cb] pt-6 font-mono text-xs text-[#6e6a60]">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#8e8a80]">06 / Model Assumptions &amp; Sensitivities</span>
              <p className="mt-1 text-[#45423b]">{investigation.dataGaps}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-[#8e8a80]">07 / Data Basis &amp; Verification</span>
              <p className="mt-1 text-[#45423b]">{investigation.dataBasis}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
