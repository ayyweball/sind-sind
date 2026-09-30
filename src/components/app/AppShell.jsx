import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AppNav from './AppNav.jsx';
import { useData } from '../../context/DataContext.jsx';

export default function AppShell() {
  const { data, dataMode, storeName } = useData();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.replace('/app', '');
    if (!path || path === '/') return 'Command / Overview';
    const parts = path.split('/').filter(Boolean);
    const domainMap = {
      products: 'Commercial / Products',
      economics: 'Commercial / Economics',
      pricing: 'Commercial / Pricing',
      marketplaces: 'Commercial / Marketplaces',
      operations: 'Operations / Overview',
      cash: 'Operations / Cash & Working Capital',
      signals: 'Intelligence / Findings',
      decisions: 'Intelligence / Decisions',
      data: 'System / Data Model',
      settings: 'System / Settings'
    };
    const primary = domainMap[parts[0]] || parts[0].toUpperCase();
    if (parts.length > 1) {
      return `${primary} / ${parts.slice(1).join(' / ')}`;
    }
    return primary;
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#141310] font-sans flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between border-b border-[#ded8cb] bg-[#fcfbf8] px-4 py-3 sticky top-0 z-40">
        <Link to="/app" className="font-serif text-lg font-medium text-[#141310]">
          SIND &amp; SIND
        </Link>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="px-2.5 py-1 text-xs font-mono border border-[#ded8cb] bg-[#f4f0e6] text-[#141310]"
          aria-label="Toggle Navigation"
        >
          {mobileNavOpen ? '✕ CLOSE' : '☰ MENU'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex">
          <div className="w-72 max-w-[85vw] bg-[#fcfbf8] h-full shadow-xl">
            <AppNav onItemClick={() => setMobileNavOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileNavOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0 md:min-h-screen border-r border-[#ded8cb] sticky top-0 h-screen overflow-hidden">
        <AppNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fcfbf8]">
        {/* Top Header Bar */}
        <header className="border-b border-[#ded8cb] bg-[#fcfbf8] px-8 py-3.5 hidden md:flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#6e6a60]">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#6e6a60]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5301a]"></span>
              <span className="font-medium text-[#141310]">{storeName}</span>
              <span className="text-[#ded8cb]">·</span>
              <span className="uppercase text-[10px] tracking-wider">{dataMode} MODE</span>
            </div>
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 px-6 py-10 md:px-10 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Console Footer */}
        <footer className="border-t border-[#ded8cb] bg-[#fcfbf8] px-8 py-4 text-xs font-mono text-[#6e6a60] mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[#141310] font-medium">SIND &amp; SIND</span>
              <span className="text-[#ded8cb]">|</span>
              <span>OPERATING INTELLIGENCE</span>
              <span className="hidden sm:inline text-[#ded8cb]">|</span>
              <span className="hidden sm:inline text-[11px]">
                {data.products?.length || 0} Products · {data.orders?.length || 0} Orders · {data.returns?.length || 0} Returns
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/app/data" className="hover:text-[#141310] underline">
                Data Model
              </Link>
              <Link to="/app/settings" className="hover:text-[#141310] underline">
                Settings
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
