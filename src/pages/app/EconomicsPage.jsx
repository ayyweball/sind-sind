import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import { calculateStoreEconomics } from '../../lib/economics.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function EconomicsPage() {
  const { data, storeName } = useCommerceData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState('realizedRevenue');
  const [sortDirection, setSortDirection] = useState('desc');

  const storeEco = useMemo(() => calculateStoreEconomics(data), [data]);

  const categories = useMemo(() => {
    if (!data?.products) return ['ALL'];
    const cats = new Set(data.products.map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [data?.products]);

  const filteredSKUs = useMemo(() => {
    if (!storeEco?.skuEconomicsList) return [];
    return storeEco.skuEconomicsList.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.sku || '').toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ALL' || (s.category || '').toUpperCase() === selectedCategory.toUpperCase();
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'unitTrueContribution') {
        aVal = a.unitEconomics?.unitTrueContribution || 0;
        bVal = b.unitEconomics?.unitTrueContribution || 0;
      } else if (sortField === 'costToServePct') {
        aVal = a.costToServe?.costToServePct || 0;
        bVal = b.costToServe?.costToServePct || 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [storeEco?.skuEconomicsList, searchQuery, selectedCategory, sortField, sortDirection]);

  if (!storeEco || storeEco.skuEconomicsList.length === 0) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Commercial / Economics
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              True Economic Contribution
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No economic records found"
          message="Connect a marketplace or import transactional orders to calculate the cost-to-serve decomposition and true SKU contribution."
        />
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;
  const formatINRPrecise = (val) => `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const avgRealizedASP = storeEco.totalUnitsSold > 0 ? storeEco.realizedRevenue / storeEco.totalUnitsSold : 0;
  const avgUnitCOGS = storeEco.totalUnitsSold > 0 ? storeEco.totalCogs / storeEco.totalUnitsSold : 0;
  const avgUnitContribution = storeEco.totalUnitsSold > 0 ? storeEco.trueContribution / storeEco.totalUnitsSold : 0;
  const avgUnitCTS = storeEco.totalUnitsSold > 0 ? storeEco.totalCostToServe / storeEco.totalUnitsSold : 0;

  return (
    <div className="space-y-12 max-w-5xl">
      {/* 1. MODULE HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Commercial / Economics
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            Where is contribution being created or lost?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · True contribution, cost-to-serve decomposition, and unit economics.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CORE FINANCIAL TELEMETRY (4 RESTRAINED METRICS) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Realized Revenue</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(storeEco.realizedRevenue)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Net of discounts</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Gross Margin</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {storeEco.grossMarginPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">COGS: {formatINR(storeEco.totalCogs)}</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Cost-to-Serve</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {storeEco.costToServePct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{formatINR(storeEco.totalCostToServe)} total CTS</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">True Contribution</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(storeEco.trueContribution)}
          </span>
          <span className="text-[11px] text-[#141310] font-medium mt-0.5 block">{storeEco.trueContributionMarginPct.toFixed(1)}% net margin</span>
        </div>
      </section>

      {/* 3. CONTRIBUTION WATERFALL TABLE */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Contribution Waterfall
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Step-by-step financial bridge from realized price to true contribution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Financial Bridge Step</th>
                <th className="py-2.5 px-4 text-right font-semibold">Per Unit Delivered</th>
                <th className="py-2.5 px-4 text-right font-semibold">Store Total (₹)</th>
                <th className="py-2.5 pl-4 text-right font-semibold">% of Realized Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              <tr className="font-medium bg-[#f4f0e6]/40">
                <td className="py-3 pr-4 text-[#141310]">Realized Selling Price (ASP)</td>
                <td className="py-3 px-4 text-right font-mono">{formatINRPrecise(avgRealizedASP)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatINR(storeEco.realizedRevenue)}</td>
                <td className="py-3 pl-4 text-right font-mono">100.0%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Cost of Goods Sold (COGS)</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(avgUnitCOGS)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(storeEco.totalCogs)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{((storeEco.totalCogs / (storeEco.realizedRevenue || 1)) * 100).toFixed(1)}%</td>
              </tr>
              <tr className="bg-[#fcfbf8] font-medium">
                <td className="py-2.5 pr-4 text-[#141310]">= Gross Profit</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatINRPrecise(avgRealizedASP - avgUnitCOGS)}</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatINR(storeEco.grossProfit)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">{storeEco.grossMarginPct.toFixed(1)}%</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#45423b]">(-) Operating Cost-to-Serve (Fulfillment, Ads, Returns)</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINRPrecise(avgUnitCTS)}</td>
                <td className="py-2.5 px-4 text-right font-mono">-{formatINR(storeEco.totalCostToServe)}</td>
                <td className="py-2.5 pl-4 text-right font-mono">-{storeEco.costToServePct.toFixed(1)}%</td>
              </tr>
              <tr className="bg-[#f4f0e6] font-semibold text-[#141310]">
                <td className="py-3 pr-4 font-serif text-sm">= True Economic Contribution</td>
                <td className="py-3 px-4 text-right font-mono">{formatINRPrecise(avgUnitContribution)}</td>
                <td className="py-3 px-4 text-right font-mono">{formatINR(storeEco.trueContribution)}</td>
                <td className="py-3 pl-4 text-right font-mono">{storeEco.trueContributionMarginPct.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. COST-TO-SERVE DECOMPOSITION */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Cost-to-Serve Breakdown
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Transparent allocation of fulfillment, transaction, advertising, and reverse logistics costs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Cost Component</th>
                <th className="py-2.5 px-4 text-right font-semibold">Total Cost (₹)</th>
                <th className="py-2.5 px-4 text-right font-semibold">% of Realized Revenue</th>
                <th className="py-2.5 pl-4 font-semibold">Allocation Basis &amp; Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {storeEco.costDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-[#141310]">{driver.name}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{formatINR(driver.amount)}</td>
                  <td className="py-2.5 px-4 text-right font-mono">{driver.pctOfRevenue.toFixed(1)}%</td>
                  <td className="py-2.5 pl-4 text-[#6e6a60]">
                    <span>{driver.operatingNote}</span>
                    <span className="font-mono text-[10px] text-[#8e8a80] ml-2">[{driver.source}]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. SKU ECONOMICS REGISTER */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#141310] font-medium">
              SKU Economic Contribution Register
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Unit contribution and cost-to-serve across all monitored catalog lines
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <input
              type="text"
              placeholder="Filter SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1 text-xs text-[#141310] focus:outline-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2 py-1 text-xs text-[#141310] focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th onClick={() => handleSort('sku')} className="py-2.5 pr-4 font-semibold cursor-pointer hover:text-[#c5301a]">
                  SKU {sortField === 'sku' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('name')} className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#c5301a]">
                  Product Name
                </th>
                <th onClick={() => handleSort('realizedRevenue')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Realized Rev {sortField === 'realizedRevenue' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('grossMarginPct')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Gross %
                </th>
                <th onClick={() => handleSort('costToServePct')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  CTS %
                </th>
                <th onClick={() => handleSort('trueContributionMarginPct')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  True Margin % {sortField === 'trueContributionMarginPct' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('unitTrueContribution')} className="py-2.5 pl-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Unit Contribution (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredSKUs.map((sku) => (
                <tr key={sku.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/products/${sku.sku}`} className="hover:text-[#c5301a] underline">
                      {sku.sku}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/products/${sku.sku}`} className="hover:text-[#c5301a]">
                      {sku.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(sku.realizedRevenue)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                    {sku.grossMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                    {sku.costToServe.costToServePct.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">
                    <span className={sku.trueContributionMarginPct < 20 ? 'text-[#c5301a]' : 'text-[#141310]'}>
                      {sku.trueContributionMarginPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-right font-mono font-medium text-[#141310]">
                    {formatINRPrecise(sku.unitEconomics.unitTrueContribution)}
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
