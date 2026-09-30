import React from 'react';
import { useData } from '../../context/DataContext.jsx';

export default function DataPage() {
  const { data, dataMode, storeName } = useData();

  const entities = [
    { name: 'Products / SKUs', count: data.products?.length || 0, description: 'Catalogue records, unit costs, dimensions, lead times' },
    { name: 'Orders', count: data.orders?.length || 0, description: '28-day transaction records across channels' },
    { name: 'Order Items', count: data.orderItems?.length || 0, description: 'Line-item SKU units, discounts, realized prices' },
    { name: 'Returns', count: data.returns?.length || 0, description: 'Customer refund and return reason records' },
    { name: 'Warehouses', count: data.warehouses?.length || 0, description: 'Multi-facility storage and custody nodes' },
    { name: 'Shipping Events', count: data.shippingEvents?.length || 0, description: 'Corridor dispatch, transit, and SLA logs' },
    { name: 'Purchase Orders', count: data.purchaseOrders?.length || 0, description: 'Open commitments and production pipeline' },
    { name: 'Suppliers', count: data.suppliers?.length || 0, description: 'Manufacturing partners, lead times, payment terms' },
    { name: 'Decisions Ledger', count: data.decisionsLedger?.length || 0, description: 'Audited governance records and reviews' }
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ded8cb] pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5301a]">
            <span>System / Data Model</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141310] tracking-tight">
            Active Operating Data Model
          </h1>
          <p className="text-sm font-mono text-[#6e6a60] pt-1">
            {storeName} · Mode: {dataMode.toUpperCase()} · Transparent schema powering deterministic engines.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#141310] font-mono text-[11px] uppercase tracking-wider text-[#141310]">
              <th className="py-3 pr-4 font-semibold">Entity Collection</th>
              <th className="py-3 px-4 text-right font-semibold">Record Count</th>
              <th className="py-3 pl-4 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ded8cb]">
            {entities.map((ent) => (
              <tr key={ent.name} className="hover:bg-[#f4f0e6]/50 transition-colors">
                <td className="py-3.5 pr-4 font-serif text-sm font-medium text-[#141310]">{ent.name}</td>
                <td className="py-3.5 px-4 text-right font-mono font-medium text-[#141310]">{ent.count.toLocaleString()}</td>
                <td className="py-3.5 pl-4 text-[#45423b]">{ent.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
