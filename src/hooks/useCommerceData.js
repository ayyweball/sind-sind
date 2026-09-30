import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { calculateStoreEconomics, calculateSKUEconomics } from '../lib/economics.js';
import { calculateProductPerformance } from '../lib/metrics.js';
import { generateSignals } from '../lib/signals.js';

/**
 * useCommerceData
 * Single unified data access hook for all console routes.
 * Provides guaranteed arrays and default structures to prevent undefined/null errors.
 */
export function useCommerceData() {
  const context = useData();
  const { data, dataMode, storeName, isSyncing, lastSyncedAt, connectionStatus } = context;

  const safeData = useMemo(() => {
    return {
      products: data?.products || [],
      orders: data?.orders || [],
      orderItems: data?.orderItems || [],
      inventory: data?.inventory || [],
      adSpend: data?.adSpend || [],
      returns: data?.returns || [],
      fulfillmentEvents: data?.fulfillmentEvents || [],
      warehouses: data?.warehouses || [],
      suppliers: data?.suppliers || [],
      purchaseOrders: data?.purchaseOrders || [],
      settlements: data?.settlements || [],
      promotions: data?.promotions || [],
      competitorBenchmarks: data?.competitorBenchmarks || [],
      channelConfigs: data?.channelConfigs || {},
      source: data?.source || dataMode || 'empty',
    };
  }, [data, dataMode]);

  const hasData = safeData.products.length > 0 || safeData.orders.length > 0;

  // Cached analytical calculations
  const storeEconomics = useMemo(() => {
    if (!hasData) return null;
    return calculateStoreEconomics(safeData);
  }, [safeData, hasData]);

  const productPerformance = useMemo(() => {
    if (!hasData) return [];
    return calculateProductPerformance(safeData);
  }, [safeData, hasData]);

  const signals = useMemo(() => {
    if (!hasData) return [];
    return generateSignals(safeData);
  }, [safeData, hasData]);

  return {
    ...context,
    data: safeData,
    hasData,
    storeEconomics,
    productPerformance,
    signals,
  };
}

export default useCommerceData;
