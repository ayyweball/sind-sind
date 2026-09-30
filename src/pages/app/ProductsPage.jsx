import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import {
  calculateProductPerformance,
  calculateCatalogSummary
} from '../../lib/metrics.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function ProductsPage() {
  const { data, storeName } = useCommerceData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc');

  const catalogSummary = useMemo(() => calculateCatalogSummary(data), [data]);
  const productPerformance = useMemo(() => calculateProductPerformance(data), [data]);

  const categories = useMemo(() => {
    const cats = new Set((data?.products || []).map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [data?.products]);

  const blendedGrossMarginPct = useMemo(() => {
    const totalRev = catalogSummary?.totalRevenue || 0;
    const totalGross = productPerformance.reduce((sum, p) => sum + (p.grossProfit || 0), 0);
    return totalRev > 0 ? (totalGross / totalRev) * 100 : 0;
  }, [catalogSummary, productPerformance]);

  const filteredProducts = useMemo(() => {
    return productPerformance.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchesStatus = selectedStatus === 'ALL' || (p.operatingStatus || '').toUpperCase() === selectedStatus.toUpperCase();

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [productPerformance, searchQuery, selectedCategory, selectedStatus, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  if (productPerformance.length === 0) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Commercial / Products
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              SKU Performance Register
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No product catalog records found"
          message="Connect a marketplace or upload a Products CSV to evaluate SKU-level unit economics, margin health, and supply risks."
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl">
      {/* 1. MODULE HEADER */}
      <div className="space-y-4 border-b border-[#ded8cb] pb-6">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
            Commercial / Products
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            Which SKUs require management attention?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · {catalogSummary.totalSKUs} active catalogue lines · Unit economics, attribution, inventory runway, and contribution health.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CORE CATALOG METRICS */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Monitored SKUs</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {catalogSummary.totalSKUs}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Active catalog lines</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Blended Gross Margin</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {blendedGrossMarginPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Pre-CTS baseline</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Supply Risk Lines</span>
          <span className={`font-serif text-2xl font-medium block mt-1 ${catalogSummary.stockoutRiskCount > 0 ? 'text-[#c5301a]' : 'text-[#141310]'}`}>
            {catalogSummary.stockoutRiskCount} SKU
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Runway &lt; replenishment</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Top 3 Concentration</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {catalogSummary.top3ConcentrationPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Share of total revenue</span>
        </div>
      </section>

      {/* 3. SKU REGISTER TABLE */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#141310] font-medium">
              Commercial SKU Register
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Select any SKU to inspect its central dossier
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <input
              type="text"
              placeholder="Search SKU or name..."
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
                <th onClick={() => handleSort('revenue')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Realized Rev {sortField === 'revenue' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('grossMarginPct')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Gross %
                </th>
                <th onClick={() => handleSort('currentStock')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Stock
                </th>
                <th onClick={() => handleSort('coverageDays')} className="py-2.5 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Runway
                </th>
                <th className="py-2.5 pl-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a] underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(p.revenue)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#6e6a60]">
                    {(p.grossMarginPct || 0).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-[#141310]">
                    {p.currentStock}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono">
                    <span className={p.isStockoutRisk ? 'text-[#c5301a] font-semibold' : 'text-[#141310]'}>
                      {(p.coverageDays || 0).toFixed(1)}d
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-right font-mono">
                    <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-[#f4f0e6] border border-[#ded8cb] text-[#141310]">
                      {p.operatingStatus}
                    </span>
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
