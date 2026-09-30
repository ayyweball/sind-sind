import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';

export default function EmptyState({
  title = 'No operating data connected',
  message = 'Connect a live marketplace source, import a CSV dataset, or enter Demo Mode to analyse unit economics, inventory runway, and contribution performance.'
}) {
  const { switchToDemoMode, loadTest001Data } = useData();

  return (
    <div className="border border-[#ded8cb] bg-white p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-6">
      <div className="w-8 h-8 mx-auto border border-[#ded8cb] flex items-center justify-center font-mono text-xs text-[#6e6a60]">
        —
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-2xl font-medium text-[#141310]">
          {title}
        </h3>
        <p className="font-mono text-xs text-[#6e6a60] leading-relaxed max-w-lg mx-auto">
          {message}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Link to="/app/data" className="button-primary text-xs">
          Connect Marketplace / Import CSV →
        </Link>
        <button
          onClick={loadTest001Data}
          className="button-secondary text-xs"
        >
          Load Test (TEST-001)
        </button>
        <button
          onClick={switchToDemoMode}
          className="button-secondary text-xs hover:border-[#141310]"
        >
          Enter Demo Mode
        </button>
      </div>
    </div>
  );
}
