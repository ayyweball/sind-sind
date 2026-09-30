import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';

export default function AppShell() {
  const { data, dataMode, storeName } = useData();
  const location = useLocation();
  const path = location.pathname;

  // Determine active section
  const isCommand = path === '/app' || path === '/app/';
  const isCommercial = path.startsWith('/app/products') || path.startsWith('/app/economics') || path.startsWith('/app/pricing') || path.startsWith('/app/marketplaces');
  const isOperations = path.startsWith('/app/operations') || path.startsWith('/app/cash');
  const isIntelligence = path.startsWith('/app/signals') || path.startsWith('/app/decisions') || path.startsWith('/app/agent');
  const isSystem = path.startsWith('/app/data') || path.startsWith('/app/settings');

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#141310] font-sans flex flex-col selection:bg-[#c5301a] selection:text-white">
      {/* GLOBAL TOP NAVIGATION */}
      <header className="border-b border-[#ded8cb] bg-[#fcfbf8] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          {/* Logo & Primary Navigation */}
          <div className="flex items-center gap-8 sm:gap-12">
            <Link 
              to="/" 
              className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#141310] hover:text-[#c5301a] transition-colors"
              title="Return to SIND & SIND Homepage"
            >
              SIND &amp; SIND
            </Link>

            <nav className="flex items-center gap-6 sm:gap-8 font-sans text-xs uppercase tracking-[0.14em]">
              <Link
                to="/app"
                className={`transition-colors pb-0.5 ${isCommand ? 'font-semibold text-[#141310] border-b-2 border-[#141310]' : 'text-[#6e6a60] hover:text-[#141310]'}`}
              >
                Command
              </Link>
              <Link
                to="/app/products"
                className={`transition-colors pb-0.5 ${isCommercial ? 'font-semibold text-[#141310] border-b-2 border-[#141310]' : 'text-[#6e6a60] hover:text-[#141310]'}`}
              >
                Commercial
              </Link>
              <Link
                to="/app/operations"
                className={`transition-colors pb-0.5 ${isOperations ? 'font-semibold text-[#141310] border-b-2 border-[#141310]' : 'text-[#6e6a60] hover:text-[#141310]'}`}
              >
                Operations
              </Link>
              <Link
                to="/app/signals"
                className={`transition-colors pb-0.5 ${isIntelligence ? 'font-semibold text-[#141310] border-b-2 border-[#141310]' : 'text-[#6e6a60] hover:text-[#141310]'}`}
              >
                Intelligence
              </Link>
            </nav>
          </div>

          {/* Right Header Secondary Controls */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/app/agent"
              className={`text-xs font-mono font-medium px-2.5 py-1 border transition-colors ${
                path.startsWith('/app/agent')
                  ? 'bg-[#141310] text-[#fcfbf8] border-[#141310]'
                  : 'bg-[#f4f0e6]/70 text-[#141310] border-[#ded8cb] hover:border-[#141310]'
              }`}
            >
              AI Agent →
            </Link>

            <Link
              to="/app/data"
              className={`text-xs font-mono transition-colors hidden md:inline-block ${isSystem ? 'text-[#141310] font-semibold underline' : 'text-[#6e6a60] hover:text-[#141310]'}`}
            >
              Data Hub
            </Link>

            {/* Global Explicit Mode Indicator */}
            <Link
              to="/app/data"
              className={`inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono border transition-colors ${
                dataMode === 'demo'
                  ? 'bg-[#f4f0e6] text-[#45423b] border-[#ded8cb] hover:border-[#141310]'
                  : 'bg-[#e6f4ea] text-[#1b7340] border-[#a8dab5] font-semibold'
              }`}
              title="Click to manage live marketplace connections and data modes"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dataMode === 'demo' ? 'bg-[#c5301a]' : 'bg-[#1b7340]'}`}></span>
              <span>{dataMode === 'demo' ? 'Atelier & Co. · DEMO MODE' : `${storeName} · CONNECTED`}</span>
            </Link>

            <Link
              to="/"
              className="font-mono text-xs text-[#6e6a60] hover:text-[#c5301a] transition-colors"
            >
              Exit →
            </Link>
          </div>
        </div>

        {/* CONTEXTUAL SECONDARY NAVIGATION BAR */}
        {isCommercial && (
          <div className="border-t border-[#ded8cb] bg-[#f8f6f0]">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-10 flex items-center gap-6 text-xs font-mono">
              <span className="text-[#8e8a80] uppercase tracking-wider text-[11px]">Commercial:</span>
              <Link
                to="/app/products"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/products') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Products
              </Link>
              <Link
                to="/app/economics"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/economics') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Economics
              </Link>
              <Link
                to="/app/pricing"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/pricing') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Pricing
              </Link>
              <Link
                to="/app/marketplaces"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/marketplaces') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Marketplaces
              </Link>
            </div>
          </div>
        )}

        {isOperations && (
          <div className="border-t border-[#ded8cb] bg-[#f8f6f0]">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-10 flex items-center gap-6 text-xs font-mono">
              <span className="text-[#8e8a80] uppercase tracking-wider text-[11px]">Operations:</span>
              <Link
                to="/app/operations"
                className={`hover:text-[#141310] transition-colors ${path === '/app/operations' ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Fulfilment &amp; Logistics
              </Link>
              <Link
                to="/app/cash"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/cash') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Cash &amp; Working Capital
              </Link>
            </div>
          </div>
        )}

        {isIntelligence && (
          <div className="border-t border-[#ded8cb] bg-[#f8f6f0]">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-10 flex items-center gap-6 text-xs font-mono">
              <span className="text-[#8e8a80] uppercase tracking-wider text-[11px]">Intelligence:</span>
              <Link
                to="/app/signals"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/signals') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Findings
              </Link>
              <Link
                to="/app/decisions"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/decisions') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Decisions
              </Link>
              <Link
                to="/app/agent"
                className={`hover:text-[#141310] transition-colors ${path.startsWith('/app/agent') ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                AI Operating Agent
              </Link>
            </div>
          </div>
        )}

        {isSystem && (
          <div className="border-t border-[#ded8cb] bg-[#f8f6f0]">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-10 flex items-center gap-6 text-xs font-mono">
              <span className="text-[#8e8a80] uppercase tracking-wider text-[11px]">System:</span>
              <Link
                to="/app/data"
                className={`hover:text-[#141310] transition-colors ${path === '/app/data' ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Data Model
              </Link>
              <Link
                to="/app/settings"
                className={`hover:text-[#141310] transition-colors ${path === '/app/settings' ? 'text-[#141310] font-semibold underline underline-offset-4' : 'text-[#6e6a60]'}`}
              >
                Settings &amp; Thresholds
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 sm:px-10 py-10">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#ded8cb] bg-[#fcfbf8] px-6 sm:px-10 py-6 text-xs font-mono text-[#6e6a60] mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#141310] font-serif font-semibold hover:text-[#c5301a]">
              SIND &amp; SIND
            </Link>
            <span className="text-[#ded8cb]">|</span>
            <span>OPERATING INTELLIGENCE</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/app" className="hover:text-[#141310]">Command</Link>
            <Link to="/app/products" className="hover:text-[#141310]">Products</Link>
            <Link to="/app/economics" className="hover:text-[#141310]">Economics</Link>
            <Link to="/app/pricing" className="hover:text-[#141310]">Pricing</Link>
            <Link to="/app/operations" className="hover:text-[#141310]">Operations</Link>
            <Link to="/app/cash" className="hover:text-[#141310]">Cash</Link>
            <Link to="/app/signals" className="hover:text-[#141310]">Findings</Link>
            <Link to="/app/agent" className="hover:text-[#141310]">Agent</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
