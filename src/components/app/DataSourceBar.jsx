import React from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { DATA_PROVENANCE_SOURCE } from '../../lib/marketplace/constants.js';

export default function DataSourceBar({
  source = null,
  period = 'Last 28 Days (Rolling Window)',
  lastSync = null,
  dataQuality = null,
  dataMode: explicitDataMode = null,
  storeName: explicitStoreName = null
}) {
  const context = useCommerceData();
  const dataMode = explicitDataMode || context?.dataMode || 'empty';
  const storeName = explicitStoreName || context?.storeName || 'No Store Connected';
  const connectionState = context?.connectionState;

  const isDemo = dataMode === 'demo';
  const isEmpty = dataMode === 'empty';
  const isImported = dataMode === 'imported';

  let defaultSource = 'Amazon Seller Central · Connected Channel';
  let defaultProvenance = DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED;
  let defaultSync = connectionState?.sellerCentral?.lastSync ? `Synchronized ${connectionState.sellerCentral.lastSync}` : 'Live Authorized Stream';

  if (isEmpty) {
    defaultSource = 'No Data Source Connected';
    defaultProvenance = DATA_PROVENANCE_SOURCE.UNAVAILABLE;
    defaultSync = 'No Data Available';
  } else if (isDemo) {
    defaultSource = 'Atelier & Co. · Configured Demo Assumptions';
    defaultProvenance = DATA_PROVENANCE_SOURCE.CONFIGURED_ASSUMPTION;
    defaultSync = 'Synthetic Dataset · Internally Consistent';
  } else if (isImported) {
    defaultSource = `${storeName} · CSV / ERP Ingestion`;
    defaultProvenance = 'Imported Custom Data';
    defaultSync = 'Imported Dataset';
  }

  const displaySource = source || defaultSource;
  const displayProvenance = dataQuality || defaultProvenance;
  const displaySync = lastSync || defaultSync;

  const dotColor = isEmpty ? 'bg-[#c5301a]' : (isDemo ? 'bg-[#6e6a60]' : (isImported ? 'bg-[#1a56db]' : 'bg-[#1b7340]'));
  const modeLabel = isEmpty ? 'NO DATA' : (isDemo ? 'DEMO MODE' : (isImported ? 'IMPORTED DATA' : 'CONNECTED STREAM'));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 bg-[#f4f0e6] border border-[#ded8cb] font-mono text-[11px] text-[#45423b]">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
          <span className="font-semibold text-[#141310] uppercase tracking-wider text-[10px]">
            {modeLabel}
          </span>
        </div>
        <span className="text-[#ded8cb]">|</span>
        <div>
          <span className="text-[#6e6a60]">Source: </span>
          <span className="text-[#141310] font-medium">{displaySource}</span>
        </div>
        <span className="text-[#ded8cb] hidden sm:inline">|</span>
        <div className="hidden sm:inline">
          <span className="text-[#6e6a60]">Provenance: </span>
          <span className="px-1.5 py-0.2 bg-[#ece7db] text-[#141310] text-[10px]">[{displayProvenance}]</span>
        </div>
        <span className="text-[#ded8cb] hidden md:inline">|</span>
        <div className="hidden md:inline">
          <span className="text-[#6e6a60]">Window: </span>
          <span>{isEmpty ? '—' : period}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[#6e6a60] text-[10px]">{displaySync}</span>
        <Link
          to="/app/data"
          className="text-[#141310] underline hover:text-[#c5301a] transition-colors"
        >
          Manage Data →
        </Link>
      </div>
    </div>
  );
}
