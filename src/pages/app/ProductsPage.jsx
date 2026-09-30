import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import {
  calculateProductPerformance,
  calculateCatalogSummary
} from '../../lib/metrics.js';

export default function ProductsPage() {
  const { data, storeName } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState('revenue');
  const [sortDirection, setSortDirection] = useState('desc');

  const catalogSummary = useMemo(() => calculateCatalogSummary(data), [data]);
  const productPerformance = useMemo(() => calculateProductPerformance(data), [data]);

  const categories = useMemo(() => {
    const cats = new Set(data.products.map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [data.products]);

  const filteredProducts = useMemo(() => {
    return productPerformance.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ALL' || p.category.toUpperCase() === selectedCategory.toUpperCase();
      const matchesStatus = selectedStatus === 'ALL' || p.operatingStatus.toUpperCase() === selectedStatus.toUpperCase();

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

  const formatINR = (val) => `₹${Math.round(val).toLocaleString()}`;

  return (
    <div className="space-y-10">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Commercial / Products</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Commercial SKU Register
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · {catalogSummary.totalSKUs} active SKUs · Unit economics, attribution, inventory runway, and contribution health.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/economics" className="button-secondary text-xs">
            Economics Matrix →
          </Link>
          <Link to="/app/pricing" className="button-primary text-xs">
            Pricing Review →
          </Link>
        </div>
      </div>

      {/* 2. HORIZONTAL CATALOG SUMMARY STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Monitored SKUs
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {catalogSummary.totalSKUs}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Active catalogue lines
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Catalogue Gross Margin
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {catalogSummary.catalogGrossMarginPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Blended before CTS
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Average Return Rate
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {catalogSummary.catalogReturnRatePct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Post-purchase friction
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Supply Risk Lines
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#c5301a] font-medium block mt-1">
              {catalogSummary.stockoutRiskCount} SKU
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              Runway &lt; replenishment
            </span>
          </div>
        </div>
      </section>

      {/* 3. FILTER CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <input
            type="text"
            placeholder="Search by SKU identifier or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#ded8cb] bg-[#fcfbf8] px-3.5 py-1.5 text-xs text-[#141310] placeholder-[#8e8a80] focus:outline-none focus:border-[#141310] min-w-[280px]"
          />

          <div className="flex items-center gap-2">
            <span className="text-[#6e6a60] text-[11px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1.5 text-xs text-[#141310] focus:outline-none focus:border-[#141310]"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#6e6a60] text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-2.5 py-1.5 text-xs text-[#141310] focus:outline-none focus:border-[#141310]"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="HEALTHY">HEALTHY</option>
              <option value="SUPPLY RISK">SUPPLY RISK</option>
              <option value="MARGIN EROSION">MARGIN EROSION</option>
              <option value="RETURN FRICTION">RETURN FRICTION</option>
              <option value="CAPITAL OVER-COVERED">CAPITAL OVER-COVERED</option>
            </select>
          </div>
        </div>

        <span className="text-[#6e6a60] text-[11px]">
          Showing {filteredProducts.length} of {productPerformance.length} products
        </span>
      </div>

      {/* 4. SKU REGISTER TABLE */}
      <section className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th
                  onClick={() => handleSort('sku')}
                  className="py-3 pr-4 font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  SKU {sortField === 'sku' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Product Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th
                  onClick={() => handleSort('revenue')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Realized Revenue {sortField === 'revenue' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('grossMarginPct')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Gross Margin {sortField === 'grossMarginPct' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('returnRatePct')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Return Rate {sortField === 'returnRatePct' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('currentStock')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Stock {sortField === 'currentStock' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('coverageDays')}
                  className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]"
                >
                  Runway {sortField === 'coverageDays' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="py-3 pl-4 text-right font-semibold">Operating Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#f4f0e6]/50 transition-colors group">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a] underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/products/${p.sku}`} className="hover:text-[#c5301a]">
                      {p.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(p.revenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {p.grossMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={p.returnRatePct > 15 ? 'text-[#c5301a] font-medium' : 'text-[#6e6a60]'}>
                      {p.returnRatePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {p.currentStock}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={`text-[11px] ${
                      p.isStockoutRisk
                        ? 'text-[#c5301a] font-semibold'
                        : p.isExcessStock
                        ? 'text-[#6e6a60]'
                        : 'text-[#141310]'
                    }`}>
                      {p.coverageDays.toFixed(1)}d
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono">
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
