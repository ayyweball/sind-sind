import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import {
  calculateStoreWarehouseEconomics,
  calculateDeliveryPerformance,
  calculateShippingLanes,
  calculateFulfilmentReturnAnalysis,
  calculateStoreInventoryCapital,
  calculatePurchaseCommitments
} from '../../lib/economics.js';

export default function OperationsPage() {
  const { data, storeName } = useData();

  const storeWh = calculateStoreWarehouseEconomics(data);
  const deliveryPerf = calculateDeliveryPerformance(data);
  const shippingLanes = calculateShippingLanes(data);
  const returnAnalysis = calculateFulfilmentReturnAnalysis(data);
  const storeInv = calculateStoreInventoryCapital(data) || { totalInventoryUnits: 0 };
  const commitments = calculatePurchaseCommitments(data) || { openPOCount: 0 };

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  const suppliers = data.suppliers || [
    { id: 'SUP-01', name: 'Heritage Mills', category: 'Silk & Fine Fabrics', leadTimeDays: 45, defaultPaymentTerms: 'Net 30', reliabilityScore: '98%' },
    { id: 'SUP-02', name: 'Northern Leathercraft', category: 'Leather & Outerwear', leadTimeDays: 60, defaultPaymentTerms: 'Net 45', reliabilityScore: '94%' },
    { id: 'SUP-03', name: 'Studio Knitters', category: 'Fine Knitwear & Wool', leadTimeDays: 30, defaultPaymentTerms: 'Net 30', reliabilityScore: '96%' },
    { id: 'SUP-04', name: 'Artisan Loom Works', category: 'Linen & Shirting', leadTimeDays: 21, defaultPaymentTerms: 'Net 15', reliabilityScore: '99%' }
  ];

  return (
    <div className="space-y-12">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>Operations / Overview</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Operations &amp; Fulfilment Economics
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Facility custody, courier SLA compliance, corridor freight economics, and supplier pipelines.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/app/cash" className="button-primary text-xs">
            Working Capital Review →
          </Link>
        </div>
      </div>

      {/* 2. OPENING EDITORIAL STATEMENT */}
      <section className="border-b border-[#ded8cb] pb-8">
        <blockquote className="font-serif text-2xl sm:text-3xl text-[#141310] leading-snug font-medium max-w-4xl">
          “Physical operations, courier SLAs, and multi-facility custody determine whether commercial promises are profitable.”
        </blockquote>
        <p className="mt-3 text-base text-[#45423b] max-w-3xl leading-relaxed">
          Logistics friction and delivery delays compound customer returns and refund claims. Monitoring warehouse density, pick/pack throughput, and corridor transit variance maintains operational discipline.
        </p>
      </section>

      {/* 3. HORIZONTAL OPERATIONAL SUMMARY STRIP */}
      <section className="border-b border-[#ded8cb] pb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#ded8cb]">
          <div className="pt-4 sm:pt-0 sm:pr-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Facility Storage Density
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {storeWh.storageCapacityUtilisationPct.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              {storeInv.totalInventoryUnits} units across {storeWh.warehouseEconomics.length} hubs
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Transit SLA Compliance
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {deliveryPerf.onTimePercentage.toFixed(1)}%
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Across all corridors
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Average Delivery Cycle
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#141310] font-medium block mt-1">
              {deliveryPerf.avgTotalDeliveryDays.toFixed(1)} Days
            </span>
            <span className="font-mono text-[11px] text-[#6e6a60] block mt-0.5">
              Dispatch: {deliveryPerf.avgDispatchDays.toFixed(1)}d · Transit: {deliveryPerf.avgTransitDays.toFixed(1)}d
            </span>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6e6a60] block">
              Delayed Shipments
            </span>
            <span className="font-serif text-2xl lg:text-3xl text-[#c5301a] font-medium block mt-1">
              {deliveryPerf.delayedOrderCount} Orders
            </span>
            <span className="font-mono text-[11px] text-[#c5301a] block mt-0.5">
              Lagging SLA target
            </span>
          </div>
        </div>
      </section>

      {/* 4. WAREHOUSE POSITION REGISTER */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Warehouse Custody &amp; Throughput Position
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Physical stock allocation, capacity headroom, and facility economics
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Facility Name</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 text-right font-semibold">Current Stock (Units)</th>
                <th className="py-3 px-4 text-right font-semibold">Rated Capacity</th>
                <th className="py-3 px-4 text-right font-semibold">Utilisation %</th>
                <th className="py-3 pl-4 text-right font-semibold">Daily Dispatch Throughput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {storeWh.warehouseEconomics.map((wh) => (
                <tr key={wh.warehouseId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {wh.warehouseName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] uppercase text-[#6e6a60]">
                    {wh.location}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#45423b]">
                    {wh.type}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">
                    {wh.unitsOnHand.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {wh.ratedCapacityUnits.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {wh.storageUtilisationPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono text-[#141310]">
                    {wh.dailyOrdersProcessed.toFixed(1)} orders/day
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CORRIDOR TRANSIT SLA PERFORMANCE */}
      <section className="space-y-6 border-b border-[#ded8cb] pb-12">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Courier Freight Corridors &amp; SLA Drift
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Regional shipping lane transit performance vs benchmark service level agreements
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Freight Corridor</th>
                <th className="py-3 px-4 text-right font-semibold">Order Volume</th>
                <th className="py-3 px-4 text-right font-semibold">Average Transit</th>
                <th className="py-3 px-4 text-right font-semibold">Benchmark SLA</th>
                <th className="py-3 px-4 text-right font-semibold">SLA Variance</th>
                <th className="py-3 px-4 text-right font-semibold">Average Freight Cost</th>
                <th className="py-3 pl-4 text-right font-semibold">On-Time %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {shippingLanes.map((lane) => (
                <tr key={lane.laneKey} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {lane.laneKey}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {lane.orderCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {lane.avgTransitDays.toFixed(1)} Days
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {lane.benchmarkSlaDays.toFixed(1)} Days
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className={lane.slaVarianceDays > 0 ? 'text-[#c5301a] font-medium' : 'text-[#141310]'}>
                      {lane.slaVarianceDays > 0 ? '+' : ''}{lane.slaVarianceDays.toFixed(1)}d
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {formatINR(lane.avgShippingCost)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono font-semibold text-[#141310]">
                    {lane.onTimePercentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. SUPPLIER PIPELINE REGISTER */}
      <section className="space-y-6">
        <div className="border-b border-[#ded8cb] pb-3">
          <h2 className="font-serif text-2xl text-[#141310] font-medium">
            Supplier Manufacturing Pipeline &amp; Payment Terms
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Upstream production partners, lead times, and trade credit terms
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-3 pr-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold">Product Specialty</th>
                <th className="py-3 px-4 text-right font-semibold">Production Lead Time</th>
                <th className="py-3 px-4 text-right font-semibold">Payment Terms</th>
                <th className="py-3 pl-4 text-right font-semibold">Reliability Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {sup.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#45423b]">
                    {sup.category}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#141310]">
                    {sup.leadTimeDays} Days
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[#6e6a60]">
                    {sup.defaultPaymentTerms}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono font-medium text-[#141310]">
                    {sup.reliabilityScore}
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
