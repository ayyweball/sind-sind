import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';

export default function AppNav({ onItemClick }) {
  const { dataMode, storeName } = useData();

  const domainGroups = [
    {
      domain: 'COMMAND',
      items: [
        { to: '/app', label: 'Overview', exact: true }
      ]
    },
    {
      domain: 'COMMERCIAL',
      items: [
        { to: '/app/products', label: 'Products' },
        { to: '/app/economics', label: 'Economics' },
        { to: '/app/pricing', label: 'Pricing' },
        { to: '/app/marketplaces', label: 'Marketplaces' }
      ]
    },
    {
      domain: 'OPERATIONS',
      items: [
        { to: '/app/operations', label: 'Operations' },
        { to: '/app/cash', label: 'Cash & Working Capital' }
      ]
    },
    {
      domain: 'INTELLIGENCE',
      items: [
        { to: '/app/signals', label: 'Findings' },
        { to: '/app/decisions', label: 'Decisions' }
      ]
    },
    {
      domain: 'SYSTEM',
      items: [
        { to: '/app/data', label: 'Data Model' },
        { to: '/app/settings', label: 'Settings' }
      ]
    }
  ];

  return (
    <aside className="flex flex-col h-full bg-[#fcfbf8] text-[#141310] select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#ded8cb]">
        <Link
          to="/app"
          onClick={onItemClick}
          className="group block"
        >
          <span className="font-serif text-xl font-medium tracking-tight text-[#141310] group-hover:text-[#c5301a] transition-colors block">
            SIND &amp; SIND
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6e6a60] block mt-1">
            Operating Intelligence
          </span>
        </Link>

        {/* Store Context Badge */}
        <div className="mt-4 flex items-center justify-between bg-[#f4f0e6] border border-[#ded8cb] px-3 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a] flex-shrink-0"></span>
            <span className="text-[10px] font-medium text-[#141310] uppercase tracking-wider truncate">
              {storeName}
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#6e6a60] uppercase tracking-widest pl-2 border-l border-[#ded8cb] flex-shrink-0">
            {dataMode === 'demo' ? 'DEMO' : 'CSV'}
          </span>
        </div>
      </div>

      {/* Navigation Domains */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
        {domainGroups.map((group) => (
          <div key={group.domain} className="space-y-1">
            <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8e8a80] font-semibold">
              {group.domain}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 font-mono text-[11px] tracking-wide transition-colors ${
                      isActive
                        ? 'bg-[#141310] text-[#fcfbf8] font-medium'
                        : 'text-[#45423b] hover:bg-[#f4f0e6] hover:text-[#141310]'
                    }`
                  }
                >
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Exit Console */}
      <div className="p-5 border-t border-[#ded8cb] bg-[#fcfbf8] font-mono text-[10px] text-[#6e6a60] space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between text-[#6e6a60] hover:text-[#141310] transition-colors py-1"
        >
          <span>← Public Front Door</span>
          <span className="text-[10px]">↗</span>
        </Link>
      </div>
    </aside>
  );
}
