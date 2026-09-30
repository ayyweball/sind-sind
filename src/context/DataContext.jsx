import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { initialDemoData } from '../data/demoStore.js';
import { EMPTY_CANONICAL_DATA, TEST_001_DATASET } from '../lib/csvImporter.js';
import { CONNECTION_STATUS, DATA_PROVENANCE_SOURCE } from '../lib/marketplace/constants.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Mode: 'empty' | 'demo' | 'connected' | 'imported'
  const [dataMode, setDataMode] = useState('empty');
  const [storeName, setStoreName] = useState('No Store Connected');
  
  // Isolated data stores
  const [demoData] = useState(initialDemoData);
  const [customData, setCustomData] = useState(EMPTY_CANONICAL_DATA);

  const [connectionState, setConnectionState] = useState({
    sellerCentral: {
      status: CONNECTION_STATUS.NOT_CONNECTED,
      lastSync: null,
      merchantId: null,
      region: 'IN',
      ordersCount: 0,
      inventorySkus: 0
    },
    vendorCentral: {
      status: CONNECTION_STATUS.NOT_CONNECTED,
      lastSync: null,
      vendorCode: null,
      region: 'IN'
    },
    shopify: {
      status: CONNECTION_STATUS.NOT_CONNECTED,
      shopDomain: null
    },
    csv: {
      status: 'READY',
      lastImport: null
    }
  });

  // Fetch initial connection statuses from server if available
  useEffect(() => {
    async function checkServerStatus() {
      try {
        const res = await fetch('/api/marketplaces/status');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.accounts) {
            const sellerAcc = json.accounts.find(a => a.account?.accountType === 'SELLER_CENTRAL');
            const vendorAcc = json.accounts.find(a => a.account?.accountType === 'VENDOR_CENTRAL');

            const isSellerConn = sellerAcc?.connection?.status === CONNECTION_STATUS.CONNECTED || sellerAcc?.connection?.status === CONNECTION_STATUS.SYNC_COMPLETE;

            setConnectionState(prev => ({
              ...prev,
              sellerCentral: {
                status: sellerAcc?.connection?.status || CONNECTION_STATUS.NOT_CONNECTED,
                lastSync: sellerAcc?.connection?.lastSyncTimestamp ? new Date(sellerAcc.connection.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                merchantId: sellerAcc?.account?.merchantId || null,
                region: sellerAcc?.account?.region || 'IN',
                ordersCount: isSellerConn ? 140 : 0,
                inventorySkus: isSellerConn ? 10 : 0
              },
              vendorCentral: {
                status: vendorAcc?.connection?.status || CONNECTION_STATUS.NOT_CONNECTED,
                lastSync: vendorAcc?.connection?.lastSyncTimestamp ? new Date(vendorAcc.connection.lastSyncTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                vendorCode: vendorAcc?.account?.vendorCode || null,
                region: vendorAcc?.account?.region || 'IN'
              }
            }));
          }
        }
      } catch {
        // Fallback for offline mode
      }
    }
    checkServerStatus();
  }, []);

  // Compute active dataset strictly from mode
  const activeData = useMemo(() => {
    if (dataMode === 'demo') {
      return demoData;
    }
    if (dataMode === 'imported' || dataMode === 'connected') {
      return customData;
    }
    return EMPTY_CANONICAL_DATA;
  }, [dataMode, demoData, customData]);

  // Compute data source info metadata
  const dataSourceInfo = useMemo(() => {
    switch (dataMode) {
      case 'demo':
        return {
          mode: 'demo',
          provider: 'demo',
          label: 'Atelier & Co. (Demo Store)',
          provenance: DATA_PROVENANCE_SOURCE.CONFIGURED_ASSUMPTION,
          observationWindow: 'Last 28 Days (Synthetic)',
          lastSyncAt: 'Demo Baseline',
          status: 'AVAILABLE'
        };
      case 'imported':
        return {
          mode: 'imported',
          provider: 'csv',
          label: storeName,
          provenance: 'Imported Custom Data',
          observationWindow: 'Custom Imported Records',
          lastSyncAt: 'Imported Just Now',
          status: 'AVAILABLE'
        };
      case 'connected':
        return {
          mode: 'connected',
          provider: 'amazon_seller',
          label: storeName,
          provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
          observationWindow: 'Last 28 Days (SP-API Stream)',
          lastSyncAt: connectionState.sellerCentral.lastSync || 'Just Now',
          status: 'AVAILABLE'
        };
      case 'empty':
      default:
        return {
          mode: 'empty',
          provider: null,
          label: 'No Source Connected',
          provenance: DATA_PROVENANCE_SOURCE.UNAVAILABLE,
          observationWindow: '—',
          lastSyncAt: 'Never Synchronized',
          status: 'EMPTY'
        };
    }
  }, [dataMode, storeName, connectionState]);

  // User Actions
  const switchToDemoMode = () => {
    setDataMode('demo');
    setStoreName('Atelier & Co. (Demo Store)');
  };

  const importCsvData = (canonicalDataset, customStoreName = 'Custom Imported Store') => {
    setCustomData(canonicalDataset);
    setDataMode('imported');
    setStoreName(customStoreName);
  };

  const loadTest001Data = () => {
    setCustomData(TEST_001_DATASET);
    setDataMode('imported');
    setStoreName('Apex Audio (Test Store)');
  };

  const connectAmazon = (normalizedData, merchantName = 'Amazon India Connected Store') => {
    setCustomData(normalizedData || EMPTY_CANONICAL_DATA);
    setDataMode('connected');
    setStoreName(merchantName);
    setConnectionState(prev => ({
      ...prev,
      sellerCentral: {
        ...prev.sellerCentral,
        status: CONNECTION_STATUS.CONNECTED,
        merchantId: 'A21TJRUUN4KGV',
        lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ordersCount: normalizedData?.orders?.length || 0,
        inventorySkus: normalizedData?.products?.length || 0
      }
    }));
  };

  const disconnect = () => {
    setCustomData(EMPTY_CANONICAL_DATA);
    setDataMode('empty');
    setStoreName('No Store Connected');
    setConnectionState(prev => ({
      ...prev,
      sellerCentral: {
        ...prev.sellerCentral,
        status: CONNECTION_STATUS.NOT_CONNECTED,
        lastSync: null,
        ordersCount: 0,
        inventorySkus: 0
      },
      vendorCentral: {
        ...prev.vendorCentral,
        status: CONNECTION_STATUS.NOT_CONNECTED,
        lastSync: null
      }
    }));
  };

  const addDecision = (newDecision) => {
    const updater = (prev) => ({
      ...prev,
      decisionsLedger: [
        {
          id: `DEC-${String((prev.decisionsLedger || []).length + 1).padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          status: 'active',
          ...newDecision
        },
        ...(prev.decisionsLedger || [])
      ]
    });

    if (dataMode === 'imported' || dataMode === 'connected') {
      setCustomData(updater);
    }
  };

  const value = useMemo(
    () => ({
      data: activeData,
      dataMode,
      storeName,
      dataSourceInfo,
      connectionState,
      setConnectionState,
      switchToDemoMode,
      importCsvData,
      loadTest001Data,
      connectAmazon,
      disconnect,
      clearData: disconnect,
      addDecision
    }),
    [activeData, dataMode, storeName, dataSourceInfo, connectionState]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
