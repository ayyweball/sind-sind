import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { generateSignals, calculateSignalSummary, PRIORITY_LABELS } from '../../lib/signals.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function SignalsPage() {
  const { data, storeName } = useCommerceData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [signalStatuses, setSignalStatuses] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  const baseSignals = useMemo(() => generateSignals(data), [data]);

  const signals = useMemo(() => {
    return baseSignals.map(s => ({
      ...s,
      status: signalStatuses[s.id] || s.status
    }));
  }, [baseSignals, signalStatuses]);

  const summary = useMemo(() => calculateSignalSummary(signals), [signals]);

  const domains = ['ALL', 'CROSS-FUNCTIONAL', 'INVENTORY', 'ACQUISITION', 'MARGIN', 'CUSTOMER', 'FULFILLMENT', 'COMMERCIAL'];

  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.entityName.toLowerCase().includes(q) ||
        s.entityId.toLowerCase().includes(q);

      const matchesPriority = selectedPriority === 'ALL' || s.severity === selectedPriority;
      const matchesDomain = selectedDomain === 'ALL' || s.domain === selectedDomain;
      const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchesSearch && matchesPriority && matchesDomain && matchesStatus;
    });
  }, [signals, searchQuery, selectedPriority, selectedDomain, selectedStatus]);

  const handleStatusChange = (signalId, newStatus) => {
    setSignalStatuses(prev => ({
      ...prev,
      [signalId]: newStatus
    }));
  };

  const getPriorityBadge = (severity) => {
    const label = PRIORITY_LABELS[severity] || severity;
    const classes = {
      CRITICAL: 'text-[#c5301a] font-semibold',
      WARNING: 'text-[#d97706] font-medium',
      WATCH: 'text-[#6e6a60]',
      INFORMATION: 'text-[#141310]'
    }[severity] || 'text-[#141310]';

    return (
      <span className={`font-mono text-[11px] uppercase tracking-wider ${classes}`}>
        {label}
      </span>
    );
  };

  if (signals.length === 0) {
    return (
      <div className="space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
              <span>Intelligence / Findings</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
              Operating Findings Register
            </h1>
            <p className="text-sm font-mono text-[#6e6a60]">
              {storeName} · What requires management review? Prioritized cross-functional tensions and operational constraints.
            </p>
            <div className="pt-2">
              <DataSourceBar />
            </div>
          </div>
        </div>
        <EmptyState
          title="No operating findings identified"
          message="Deterministic finding engines continuously scan inventory coverage, customer return friction, pricing floor breaches, and supply constraints. No operating exceptions found in active dataset."
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
            <span>Intelligence / Findings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Operating Findings Register
          </h1>
          <p className="text-sm font-mono text-[#6e6a60]">
            {storeName} · What requires management review? Prioritized cross-functional tensions and operational constraints.
          </p>
          <div className="pt-2">
            <DataSourceBar />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/decisions" className="button-primary text-xs">
            Decision Ledger →
          </Link>
        </div>
      </div>

      {/* 2. HORIZONTAL SUMMARY STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Active Findings
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {summary.total}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Deterministic evaluation
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Immediate Attention
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#c5301a] font-medium block mt-1">
              {summary.critical}
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              High operational exposure
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Review Required
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#d97706] font-medium block mt-1">
              {summary.warning}
            </span>
            <span className="font-mono text-[11px] text-[#d97706] block mt-0.5">
              Margin / customer friction
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Monitor / Watch
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {summary.watch + summary.info}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Trending metrics
            </span>
          </div>
        </div>
      </section>

      {/* 3. FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <input
            type="text"
            placeholder="Search findings by SKU, topic or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#ded8cb] bg-[#fcfbf8] px-3.5 py-1.5 text-xs text-[#141310] placeholder-[#8e8a80] focus:outline-none focus:border-[#141310] min-w-[280px]"
          />

          <div className="flex items-center gap-2">
            <span className="text-[#6e6a60] text-[11px]">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1.5 text-xs text-[#141310] focus:outline-none focus:border-[#141310]"
            >
              {domains.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#6e6a60] text-[11px]">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1.5 text-xs text-[#141310] focus:outline-none focus:border-[#141310]"
            >
              <option value="ALL">ALL PRIORITIES</option>
              <option value="CRITICAL">IMMEDIATE ATTENTION</option>
              <option value="WARNING">REVIEW REQUIRED</option>
              <option value="WATCH">MONITOR</option>
              <option value="INFORMATION">OBSERVATION</option>
            </select>
          </div>
        </div>

        <span className="text-[#6e6a60] text-[11px]">
          Showing {filteredSignals.length} of {signals.length} findings
        </span>
      </div>

      {/* 4. FINDINGS RESEARCH REGISTER TABLE */}
      <section className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Domain</th>
                <th className="py-3 px-4 font-semibold">Operating Finding &amp; Evidence</th>
                <th className="py-3 px-4 font-semibold">Priority</th>
                <th className="py-3 px-4 font-semibold">Key Metric</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 pl-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredSignals.map((signal) => {
                const isExpanded = expandedId === signal.id;
                return (
                  <React.Fragment key={signal.id}>
                    <tr className={`hover:bg-[#f4f0e6]/50 transition-colors ${isExpanded ? 'bg-[#f4f0e6]/30' : ''}`}>
                      <td className="py-4 pr-4 font-mono font-medium text-[#c5301a] align-top">
                        <Link to={`/app/signals/${signal.id}`} className="hover:underline">
                          {signal.id}
                        </Link>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] uppercase text-[#6e6a60] align-top">
                        {signal.domain}
                      </td>
                      <td className="py-4 px-4 align-top max-w-lg">
                        <Link
                          to={`/app/signals/${signal.id}`}
                          className="font-serif text-base font-medium text-[#141310] hover:text-[#c5301a] block leading-snug"
                        >
                          {signal.title}
                        </Link>
                        <p className="text-xs text-[#45423b] mt-1 leading-relaxed">
                          {signal.summary}
                        </p>
                      </td>
                      <td className="py-4 px-4 align-top">
                        {getPriorityBadge(signal.severity)}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-[#141310] align-top">
                        {signal.evidence ? signal.evidence[0]?.value || '—' : '—'}
                      </td>
                      <td className="py-4 px-4 align-top font-mono text-xs">
                        <select
                          value={signal.status}
                          onChange={(e) => handleStatusChange(signal.id, e.target.value)}
                          className="border border-[#ded8cb] bg-[#fcfbf8] px-2 py-1 text-[11px] uppercase text-[#141310] focus:outline-none"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="ACKNOWLEDGED">ACK</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                      <td className="py-4 pl-4 text-right align-top font-mono">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : signal.id)}
                          className="text-xs text-[#141310] hover:text-[#c5301a] underline cursor-pointer"
                        >
                          {isExpanded ? 'Close ↑' : 'Dossier ↓'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Analytical Dossier Row */}
                    {isExpanded && (
                      <tr className="bg-[#f4f0e6]/40 border-b border-[#ded8cb]">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                            <div className="border-l-2 border-[#141310] pl-4 space-y-1">
                              <span className="font-mono text-[10px] uppercase text-[#6e6a60] font-semibold block">
                                01 / Observation
                              </span>
                              <p className="text-[#141310] leading-relaxed">
                                {signal.whatChanged}
                              </p>
                            </div>

                            <div className="border-l-2 border-[#ded8cb] pl-4 space-y-1">
                              <span className="font-mono text-[10px] uppercase text-[#6e6a60] font-semibold block">
                                02 / Root Cause Diagnosis
                              </span>
                              <p className="text-[#45423b] leading-relaxed">
                                {signal.rootCause}
                              </p>
                            </div>

                            <div className="border-l-2 border-[#ded8cb] pl-4 space-y-1">
                              <span className="font-mono text-[10px] uppercase text-[#6e6a60] font-semibold block">
                                03 / Economic Implication
                              </span>
                              <p className="text-[#45423b] leading-relaxed">
                                {signal.whyItMatters}
                              </p>
                            </div>

                            <div className="border-l-2 border-[#c5301a] pl-4 space-y-2">
                              <span className="font-mono text-[10px] uppercase text-[#c5301a] font-semibold block">
                                04 / Management Lever
                              </span>
                              <p className="text-[#141310] font-medium leading-relaxed">
                                {signal.recommendedAction}
                              </p>
                              <div className="pt-2">
                                <Link
                                  to={`/app/signals/${signal.id}`}
                                  className="font-mono text-[11px] text-[#c5301a] hover:underline"
                                >
                                  Open full analytical report →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
