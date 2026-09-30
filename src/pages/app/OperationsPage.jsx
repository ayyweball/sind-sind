import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCommerceData } from '../../hooks/useCommerceData.js';
import {
  calculateStoreWarehouseEconomics,
  calculateDeliveryPerformance,
  calculateShippingLanes,
  calculateWarehouseDistributionEconomics,
  calculateCarrierLaneEconomics,
  calculateSupplierPipelineEconomics
} from '../../lib/economics.js';
import DataSourceBar from '../../components/app/DataSourceBar.jsx';
import EmptyState from '../../components/app/EmptyState.jsx';

export default function OperationsPage() {
  const { data, storeName } = useCommerceData();

  const storeWh = calculateStoreWarehouseEconomics(data) || { warehouseBreakdowns: [], blendedCapacityUtilizationPct: 0 };
  const deliveryPerf = calculateDeliveryPerformance(data) || { onTimePct: 0, avgTotalDeliveryDays: 0, avgDispatchDays: 0, avgTransitDays: 0 };
  const shippingLanes = calculateShippingLanes(data) || [];
  const distributionEcon = calculateWarehouseDistributionEconomics(null, data);
  const carrierLaneEcon = calculateCarrierLaneEconomics(data);
  const supplierPipeline = calculateSupplierPipelineEconomics(data);

  const formatINR = (val) => `₹${Math.round(val || 0).toLocaleString()}`;

  const hasNoData = (!data.products || data.products.length === 0) && (!data.orders || data.orders.length === 0) && (!data.warehouses || data.warehouses.length === 0);

  if (hasNoData) {
    return (
      <div className="space-y-12 max-w-5xl">
        <div className="space-y-4 border-b border-[#ded8cb] pb-6">
          <div className="space-y-1">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#6e6a60]">
              Operations / Fulfilment, Distribution &amp; Supply Chain
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
              Warehouse &amp; Logistics Economics
            </h1>
          </div>
          <DataSourceBar />
        </div>
        <EmptyState
          title="No operational or warehouse records found"
          message="Connect a 3PL/WMS source, marketplace account, or import logistics CSV tables to analyse warehouse density, carrier SLAs, and shipping friction."
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
            Operations / Fulfilment, Distribution &amp; Supply Chain
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#141310] font-medium tracking-tight">
            Where is fulfilment creating operating &amp; distribution friction?
          </h1>
          <p className="font-mono text-xs text-[#6e6a60]">
            {storeName.replace(' (Demo Store)', '')} · Warehouse geographic allocation, carrier lane SLAs, and supplier purchase commitments.
          </p>
        </div>

        <DataSourceBar />
      </div>

      {/* 2. CORE OPERATIONAL TELEMETRY */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
        <div>
          <span className="text-[#6e6a60] block text-[11px]">Network Storage Density</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {distributionEcon.networkCapacityUtilizationPct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{distributionEcon.totalNetworkStock.toLocaleString()} units stored</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Network On-Time SLA</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {(deliveryPerf.onTimePct || 0).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Target benchmark: ≥ 92%</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">Avg Delivery Cycle</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {(deliveryPerf.avgTotalDeliveryDays || 0).toFixed(1)} Days
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">Dispatch: {(deliveryPerf.avgDispatchDays || 0).toFixed(1)}d · Transit: {(deliveryPerf.avgTransitDays || 0).toFixed(1)}d</span>
        </div>

        <div>
          <span className="text-[#6e6a60] block text-[11px]">PO Commitments</span>
          <span className="font-serif text-2xl text-[#141310] font-medium block mt-1">
            {formatINR(supplierPipeline.totalCommittedValue)}
          </span>
          <span className="text-[11px] text-[#6e6a60] mt-0.5 block">{supplierPipeline.totalOpenPOs} open purchase batches</span>
        </div>
      </section>

      {/* 3. WAREHOUSE DISTRIBUTION & DEMAND IMBALANCE (SECTIONS 55 & 56) */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Warehouse Geographic Allocation vs Regional Demand
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Physical stock custody vs destination customer order concentration
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Facility Name</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 text-right font-semibold">Stored Units</th>
                <th className="py-2.5 px-4 text-right font-semibold">Capacity %</th>
                <th className="py-2.5 px-4 text-right font-semibold">Stock Share %</th>
                <th className="py-2.5 px-4 text-right font-semibold">Regional Demand %</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Allocation Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb] font-mono text-xs">
              {distributionEcon.warehouses.map((wh) => (
                <tr key={wh.warehouseId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {wh.name}
                  </td>
                  <td className="py-2.5 px-4 text-[#6e6a60]">{wh.city}</td>
                  <td className="py-2.5 px-4 text-right text-[#141310]">{wh.stockUnits.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right text-[#6e6a60]">{wh.capacityPct.toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right font-semibold text-[#141310]">{wh.networkStockSharePct.toFixed(1)}%</td>
                  <td className="py-2.5 px-4 text-right text-[#45423b]">{wh.regionalDemandSharePct.toFixed(1)}%</td>
                  <td className="py-2.5 pl-4 text-right">
                    <span className={`px-2 py-0.5 text-[10px] ${wh.isImbalanced ? 'bg-[#f4f0e6] text-[#c5301a] border border-[#c5301a] font-semibold' : 'text-[#1b7340]'}`}>
                      {wh.distributionVariance > 0 ? `+${wh.distributionVariance.toFixed(1)}%` : `${wh.distributionVariance.toFixed(1)}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#faf7f0] border border-[#ded8cb] font-sans text-xs text-[#45423b] leading-relaxed">
          <span className="font-mono font-semibold text-[#c5301a] uppercase text-[11px] block mb-1">Distribution Diagnosis:</span>
          {distributionEcon.distributionDiagnosis}
        </div>
      </section>

      {/* 4. CARRIER & SHIPPING LANE ECONOMICS (SECTIONS 57, 58 & 59) */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Courier Partner &amp; Shipping Corridor Economics
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Carrier transit times, SLA drift, freight costs, and observed return rates
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Carrier / Partner</th>
                <th className="py-2.5 px-4 font-semibold">Service Type</th>
                <th className="py-2.5 px-4 text-right font-semibold">Orders</th>
                <th className="py-2.5 px-4 text-right font-semibold">Avg Transit</th>
                <th className="py-2.5 px-4 text-right font-semibold">SLA Drift</th>
                <th className="py-2.5 px-4 text-right font-semibold">Freight / Order</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Return Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb] font-mono text-xs">
              {carrierLaneEcon.carriers.map((car) => (
                <tr key={car.carrierName} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {car.carrierName}
                  </td>
                  <td className="py-2.5 px-4 text-[#6e6a60]">{car.serviceType}</td>
                  <td className="py-2.5 px-4 text-right text-[#141310]">{car.ordersShipped}</td>
                  <td className="py-2.5 px-4 text-right text-[#141310]">{car.avgTransitDays.toFixed(1)} Days</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={car.slaDriftDays > 0.5 ? 'text-[#c5301a] font-semibold' : 'text-[#1b7340]'}>
                      +{car.slaDriftDays.toFixed(1)}d
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-medium text-[#141310]">{formatINR(car.avgFreightPerOrder)}</td>
                  <td className="py-2.5 pl-4 text-right font-semibold text-[#141310]">{car.observedReturnRatePct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#f4f0e6] border border-[#ded8cb] font-sans text-xs text-[#45423b] leading-relaxed">
          <span className="font-mono font-semibold text-[#141310] uppercase text-[11px] block mb-1">Observed Correlation &amp; Friction:</span>
          {carrierLaneEcon.economicInsight}
        </div>
      </section>

      {/* 5. SUPPLIER & PURCHASE ORDER PIPELINE (SECTIONS 63 & 64) */}
      <section className="space-y-4 pt-6 border-t border-[#ded8cb]">
        <div>
          <h2 className="font-serif text-xl text-[#141310] font-medium">
            Supplier Economics &amp; Purchase Order Pipeline
          </h2>
          <p className="font-mono text-xs text-[#6e6a60] mt-0.5">
            Manufacturing lead times, payment terms, minimum order quantities, and committed capital
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
                <th className="py-2.5 pr-4 font-semibold">Supplier Name</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 text-right font-semibold">Lead Time</th>
                <th className="py-2.5 px-4 text-right font-semibold">Payment Terms</th>
                <th className="py-2.5 px-4 text-right font-semibold">MOQ</th>
                <th className="py-2.5 px-4 text-right font-semibold">Open POs</th>
                <th className="py-2.5 pl-4 text-right font-semibold">Capital Committed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb] font-mono text-xs">
              {supplierPipeline.suppliers.map((sup) => (
                <tr key={sup.supplierId} className="hover:bg-[#f4f0e6]/50 transition-colors">
                  <td className="py-2.5 pr-4 font-serif text-sm font-medium text-[#141310]">
                    {sup.name}
                  </td>
                  <td className="py-2.5 px-4 text-[#6e6a60]">{sup.city}</td>
                  <td className="py-2.5 px-4 text-right text-[#141310]">{sup.leadTimeDays} Days</td>
                  <td className="py-2.5 px-4 text-right text-[#6e6a60]">{sup.paymentTerms}</td>
                  <td className="py-2.5 px-4 text-right text-[#6e6a60]">{sup.moqUnits} Units</td>
                  <td className="py-2.5 px-4 text-right text-[#141310]">{sup.openPoCount}</td>
                  <td className="py-2.5 pl-4 text-right font-semibold text-[#141310]">{formatINR(sup.totalCapitalCommitted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
