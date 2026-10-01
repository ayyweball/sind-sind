import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { useAgent } from '../../agent/useAgent.js';

const QUICK_INQUIRIES = [
  { label: 'Store Contribution Audit', query: 'Why did true contribution change?' },
  { label: 'Working Capital & Inventory Drag', query: 'Where is working capital tied up?' },
  { label: 'Margin Eroding SKUs', query: 'Which SKUs are eroding margin?' },
  { label: 'Logistics & Return Friction', query: 'Audit fulfillment and reverse logistics friction' },
  { label: 'Amazon FBA vs DTC Comparison', query: 'Compare Amazon FBA and DTC marketplace economics' },
  { label: 'Full Portfolio Review', query: 'Review the last 28 days performance' }
];

export default function AgentPage() {
  const { data, storeName, dataMode, hasData } = useCommerceData();
  const [queryInput, setQueryInput] = useState('');
  const [showTrace, setShowTrace] = useState(true);
  const { investigate, investigation, loading, error } = useAgent();

  // Run initial default investigation on mount or dataMode change
  useEffect(() => {
    investigate('Review the last 28 days performance');
  }, [dataMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (queryInput.trim()) {
      investigate(queryInput.trim());
    }
  };

  const handleChipClick = (query) => {
    setQueryInput(query);
    investigate(query);
  };

  const trace = investigation?.trace;
  const llmStatus = investigation?.llmStatus;

  return (
    <div className="space-y-10 max-w-5xl">
      {/* 1. HEADER */}
      <div className="space-y-3 border-b border-[#ded8cb] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Operating Intelligence</span>
            <span>·</span>
            <span>Commerce Operating Agent</span>
          </div>
          {llmStatus && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className={`px-2.5 py-0.5 border ${
                llmStatus.configured 
                  ? 'border-[#2e7d32] text-[#2e7d32] bg-[#e8f5e9]/50' 
                  : 'border-[#6e6a60] text-[#6e6a60] bg-[#f4f0e6]/60'
              }`}>
                {llmStatus.configured 
                  ? `[LLM REASONING: ${llmStatus.provider?.toUpperCase()} / ${llmStatus.model}]`
                  : '[DETERMINISTIC ENGINE MODE]'}
              </span>
            </div>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
          Operating Intelligence Agent
        </h1>
        <p className="text-sm font-mono text-[#6e6a60] pt-1">
          {storeName} · Authoritative diagnostic synthesis grounded in deterministic commerce models and verified transaction ledgers.
        </p>
      </div>

      {/* 2. INQUIRY INPUT & QUICK CHIPS */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask an operating question (e.g. 'Why did margin drop?', 'Where is cash trapped?', 'Audit SKU-001')..."
            className="flex-1 bg-[#fcfbf8] border border-[#ded8cb] px-4 py-3 text-sm text-[#141310] placeholder-[#8e8a80] focus:outline-none focus:border-[#141310] font-sans shadow-inner"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#141310] text-[#fcfbf8] text-xs font-mono uppercase tracking-wider hover:bg-[#c5301a] transition-colors disabled:opacity-50"
          >
            {loading ? 'Executing Tools...' : 'Investigate →'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="font-mono text-xs text-[#8e8a80] mr-2">Operating Inquiries:</span>
          {QUICK_INQUIRIES.map((item) => (
            <button
              key={item.label}
              onClick={() => handleChipClick(item.query)}
              className="text-xs font-mono px-3 py-1.5 bg-[#f4f0e6]/60 border border-[#ded8cb] text-[#45423b] hover:border-[#141310] hover:text-[#141310] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LOADING STATE */}
      {loading && (
        <div className="py-16 text-center space-y-4 border border-[#ded8cb] bg-[#fcfbf8]">
          <div className="inline-block animate-pulse font-mono text-xs uppercase tracking-wider text-[#c5301a]">
            Executing Multi-Step Investigation Plan...
          </div>
          <p className="text-sm font-serif text-[#45423b] max-w-md mx-auto">
            Sequencing deterministic tool calls across commercial waterfalls, inventory carrying drag, and logistics telemetry.
          </p>
        </div>
      )}

      {/* 4. ERROR STATE */}
      {error && (
        <div className="p-4 border border-[#c5301a] bg-[#fcfbf8] font-mono text-xs text-[#c5301a]">
          Investigation Exception: {error}
        </div>
      )}

      {/* 5. INVESTIGATION DOSSIER & TRACE */}
      {!loading && investigation && (
        <div className="space-y-8">
          {/* INVESTIGATION TRACE TELEMETRY ACCORDION */}
          {trace && (
            <div className="border border-[#ded8cb] bg-[#f4f0e6]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                  <span className="font-semibold text-[#141310] uppercase tracking-wider">
                    Diagnostic Trace Audit
                  </span>
                  <span className="text-[#8e8a80]">·</span>
                  <span className="text-[#45423b]">
                    Intent: <strong className="text-[#141310]">{trace.intent}</strong>
                  </span>
                  <span className="text-[#8e8a80]">·</span>
                  <span className="text-[#45423b]">
                    {trace.stepsCount} Step{trace.stepsCount !== 1 ? 's' : ''} Executed ({trace.durationMs}ms)
                  </span>
                  <span className="text-[#8e8a80]">·</span>
                  <span className="text-[#45423b]">
                    {trace.evidenceCount} Grounded Telemetry Point{trace.evidenceCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrace(!showTrace)}
                  className="font-mono text-xs text-[#c5301a] hover:underline"
                >
                  {showTrace ? 'Hide Trace ↑' : 'Inspect Trace ↓'}
                </button>
              </div>

              {showTrace && trace.steps && (
                <div className="space-y-2 pt-2 border-t border-[#ded8cb]/80">
                  {trace.steps.map((step) => (
                    <div 
                      key={step.stepNumber} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono p-2.5 bg-[#fcfbf8] border border-[#ded8cb] gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-[#141310] text-[#fcfbf8] text-[10px] font-bold">
                          {step.stepNumber}
                        </span>
                        <code className="text-[#c5301a] font-semibold">{step.toolName}</code>
                        <span className="text-[#6e6a60] hidden sm:inline">— {step.reason}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#8e8a80]">
                        <span>{step.resultSummary}</span>
                        <span className="text-[#2e7d32] font-semibold">✓ {step.status}</span>
                        <span>({step.durationMs}ms)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OLIVER WYMAN 7-SECTION OPERATING REVIEW */}
          <div className="border border-[#ded8cb] bg-[#fcfbf8] p-8 sm:p-12 shadow-sm space-y-10">
            {/* Section 1: Executive Finding */}
            <div className="space-y-3 border-b border-[#ded8cb] pb-8">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#6e6a60]">
                <span className="uppercase tracking-[0.16em] text-[#c5301a] font-semibold">
                  01 / Executive Finding
                </span>
                <span>Inquiry: "{investigation.query}"</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#141310] font-medium leading-tight">
                {investigation.finding}
              </h2>
            </div>

            {/* Section 2: Grounded Telemetry & Evidence Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] font-semibold">
                  02 / Grounded Evidence &amp; Telemetry
                </span>
                <span className="font-mono text-[10px] text-[#8e8a80]">
                  Grounded in Verified Engine Outputs
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-1">
                {investigation.evidence?.map((item, idx) => (
                  <div key={idx} className="border-l-2 border-[#141310] pl-4 py-1.5 space-y-1 bg-[#f4f0e6]/20 p-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block truncate">
                      {item.label}
                    </span>
                    <span className="font-serif text-xl sm:text-2xl text-[#141310] font-medium block">
                      {item.value}
                    </span>
                    <span className="font-mono text-[10px] text-[#8e8a80] block">
                      {item.provenance}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Root Cause Diagnosis */}
            <div className="space-y-3 border-t border-[#ded8cb] pt-8">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] font-semibold block">
                03 / Root Cause Diagnosis
              </span>
              <p className="text-base sm:text-lg text-[#141310] leading-relaxed max-w-4xl font-serif">
                {investigation.rootCause}
              </p>
            </div>

            {/* Section 4: Economic Implication */}
            <div className="space-y-3 border-t border-[#ded8cb] pt-8">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60] font-semibold block">
                04 / Economic &amp; Cash Implication
              </span>
              <p className="text-base sm:text-lg text-[#45423b] leading-relaxed max-w-4xl font-serif">
                {investigation.economicImplication}
              </p>
            </div>

            {/* Section 5: Strategic Management Levers */}
            <div className="space-y-4 border-t border-[#ded8cb] pt-8">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#c5301a] font-semibold block">
                05 / Strategic Management Levers
              </span>
              <div className="border-l-2 border-[#c5301a] pl-6 py-2 space-y-4">
                {investigation.managementConsiderations?.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#c5301a] font-bold mt-1">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <p className="font-serif text-lg text-[#141310] font-medium leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 6 & 7: Assumptions, Data Gaps & Verification Basis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-[#ded8cb] pt-8 font-mono text-xs text-[#6e6a60]">
              <div className="space-y-1.5 p-4 bg-[#f4f0e6]/40 border border-[#ded8cb]">
                <span className="block text-[10px] uppercase tracking-wider text-[#8e8a80] font-semibold">
                  06 / Model Assumptions &amp; Sensitivities
                </span>
                <p className="text-[#45423b] leading-normal">{investigation.dataGaps}</p>
              </div>
              <div className="space-y-1.5 p-4 bg-[#f4f0e6]/40 border border-[#ded8cb]">
                <span className="block text-[10px] uppercase tracking-wider text-[#8e8a80] font-semibold">
                  07 / Data Basis &amp; Monitored Scope
                </span>
                <p className="text-[#45423b] leading-normal">{investigation.dataBasis}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
