import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { calculateStoreEconomics, calculateContributionWaterfall } from '../../lib/economics.js';

export default function EconomicsPage() {
  const { data, storeName } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortField, setSortField] = useState('realizedRevenue');
  const [sortDirection, setSortDirection] = useState('desc');

  const storeEco = useMemo(() => calculateStoreEconomics(data), [data]);
  const waterfallSteps = useMemo(() => calculateContributionWaterfall(storeEco), [storeEco]);

  const categories = useMemo(() => {
    if (!data?.products) return ['ALL'];
    const cats = new Set(data.products.map(p => p.category));
    return ['ALL', ...Array.from(cats)];
  }, [data?.products]);

  const filteredSKUs = useMemo(() => {
    if (!storeEco?.skuEconomicsList) return [];
    return storeEco.skuEconomicsList.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ALL' || s.category.toUpperCase() === selectedCategory.toUpperCase();
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'unitTrueContribution') {
        aVal = a.unitEconomics.unitTrueContribution;
        bVal = b.unitEconomics.unitTrueContribution;
      } else if (sortField === 'costToServePct') {
        aVal = a.costToServe.costToServePct;
        bVal = b.costToServe.costToServePct;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal - bVal) : (bVal - aVal);
    });
  }, [storeEco?.skuEconomicsList, searchQuery, selectedCategory, sortField, sortDirection]);

  if (!storeEco) {
    return (
      <div className="p-8 font-mono text-xs text-[#6e6a60]">
        No economic records found in current dataset.
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

  return (
    <div className="space-y-12">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Commercial / Economics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Operating Economics &amp; True Contribution
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · {storeEco.reportingPeriod.label} · True contribution, cost-to-serve decomposition, and unit economics.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/pricing" className="button-secondary text-xs">
            Pricing Review →
          </Link>
          <Link to="/app/marketplaces" className="button-primary text-xs">
            Marketplace Matrix →
          </Link>
        </div>
      </div>

      {/* 2. OPENING EDITORIAL STATEMENT */}
      <section className="border-b border-[#ded8cb] pb-8">
        <blockquote className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium max-w-4xl">
          “True contribution is being shaped more by cost-to-serve than by gross margin alone.”
        </blockquote>
        <p className="mt-3 text-base text-[#45423b] max-w-3xl leading-relaxed">
          While catalogue gross margin averages <strong>{storeEco.grossMarginPct.toFixed(1)}%</strong>, order-level payment processing, forward logistics, packaging, reverse friction, and direct advertising consume <strong>{storeEco.costToServePct.toFixed(1)}%</strong> of realized revenue, yielding a net true contribution margin of <strong>{storeEco.trueContributionMarginPct.toFixed(1)}%</strong>.
        </p>
      </section>

      {/* 3. HORIZONTAL ECONOMIC STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Realized Revenue
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(storeEco.realizedRevenue)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              List: {formatINR(storeEco.grossListRevenue)} (-{storeEco.discountPct.toFixed(1)}%)
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Gross Profit
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(storeEco.grossProfit)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {storeEco.grossMarginPct.toFixed(1)}% margin
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Total Cost-to-Serve
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(storeEco.totalCostToServe)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {storeEco.costToServePct.toFixed(1)}% of realized rev
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              True Contribution
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINR(storeEco.trueContribution)}
            </span>
            <span className="font-mono text-[11px] text-[#141310] font-medium block mt-0.5">
              {storeEco.trueContributionMarginPct.toFixed(1)}% Net Margin
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Avg Unit Contribution
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {formatINRPrecise(storeEco.unitEconomics.unitTrueContribution)}
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Per unit delivered
            </span>
          </div>
        </div>
      </section>

      {/* 4. CONTRIBUTION WATERFALL TABLE */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Cost-to-Serve Decomposition Waterfall
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Step-by-step financial bridge from realized selling price to true contribution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Cost Driver / Bridge Step</th>
                <th className="py-3 px-4 text-right font-semibold">Per Unit (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">Total Cost (₹)</th>
                <th className="py-3 px-4 text-right font-semibold">% of Realized Revenue</th>
                <th className="py-3 pl-4 text-right font-semibold">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              <tr className="font-medium bg-[#f4f0e6]/40">
                <td className="py-3.5 pr-4 text-[#141310]">Realized Selling Price (ASP)</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatINRPrecise(storeEco.unitEconomics.unitAvgSellingPrice)}</td>
                <td className="py-3.5 px-4 text-right font-mono">{formatINR(storeEco.realizedRevenue)}</td>
                <td className="py-3.5 px-4 text-right font-mono">100.0%</td>
                <td className="py-3.5 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Cost of Goods Sold (COGS)</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitCogs)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.totalCOGS)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.totalCOGS / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Channel Take-Rate &amp; Payment Gateway</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitPaymentGatewayFee)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.paymentGatewayFees)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.paymentGatewayFees / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Forward Shipping &amp; Carrier Freight</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitForwardShipping)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.forwardShippingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.forwardShippingCost / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Warehouse Pick &amp; Pack Throughput</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitPickPackCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.pickPackCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.pickPackCost / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Demo Assumption</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Packaging &amp; Unboxing Presentation</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitPackagingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.packagingCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.packagingCost / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Demo Assumption</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Reverse Logistics &amp; Return Friction</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitReturnFrictionCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.returnFrictionCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.returnFrictionCost / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-[#45423b]">(-) Allocated Advertising Media Spend</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINRPrecise(storeEco.unitEconomics.unitAdCost)}</td>
                <td className="py-3 px-4 text-right font-mono">-{formatINR(storeEco.costToServe.directAdSpend)}</td>
                <td className="py-3 px-4 text-right font-mono">-{((storeEco.costToServe.directAdSpend / storeEco.realizedRevenue) * 100).toFixed(1)}%</td>
                <td className="py-3 pl-4 text-right font-mono text-[10px] text-[#6e6a60]">Observed</td>
              </tr>
              <tr className="bg-[#f4f0e6] font-semibold text-[#141310]">
                <td className="py-3.5 pr-4 text-base font-serif">= True Economic Contribution</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{formatINRPrecise(storeEco.unitEconomics.unitTrueContribution)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{formatINR(storeEco.trueContribution)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-sm">{storeEco.trueContributionMarginPct.toFixed(1)}%</td>
                <td className="py-3.5 pl-4 text-right font-mono text-[10px] text-[#141310]">Calculated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. SKU ECONOMICS COMPARISON REGISTER */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ded8cb] pb-3">
          <div>
            <h2 className="font-serif text-2xl text-[#141310] font-medium">
              SKU Economic Contribution Register
            </h2>
            <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
              Ranked breakdown of unit true contribution and cost-to-serve share
            </p>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <input
              type="text"
              placeholder="Search SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-[#ded8cb] bg-[#fcfbf8] px-3 py-1 text-xs text-[#141310] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th onClick={() => handleSort('sku')} className="py-3 pr-4 font-semibold cursor-pointer hover:text-[#c5301a]">
                  SKU {sortField === 'sku' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('name')} className="py-3 px-4 font-semibold cursor-pointer hover:text-[#c5301a]">
                  Product Name
                </th>
                <th onClick={() => handleSort('realizedRevenue')} className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Revenue
                </th>
                <th onClick={() => handleSort('grossMarginPct')} className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Gross Margin
                </th>
                <th onClick={() => handleSort('costToServePct')} className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Cost-to-Serve
                </th>
                <th onClick={() => handleSort('unitTrueContribution')} className="py-3 px-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Contribution/Unit
                </th>
                <th onClick={() => handleSort('trueContributionMarginPct')} className="py-3 pl-4 text-right font-semibold cursor-pointer hover:text-[#c5301a]">
                  Contribution %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredSKUs.map((sku) => (
                <tr key={sku.sku} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-mono font-medium text-[#141310]">
                    <Link to={`/app/products/${sku.sku}`} className="hover:text-[#c5301a] underline">
                      {sku.sku}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-serif text-sm text-[#141310]">
                    <Link to={`/app/products/${sku.sku}`} className="hover:text-[#c5301a]">
                      {sku.name}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINR(sku.realizedRevenue)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {sku.grossMarginPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#45423b]">
                    {sku.costToServe.costToServePct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {formatINRPrecise(sku.contributionPerUnit)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                    {sku.trueContributionMarginPct.toFixed(1)}%
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
