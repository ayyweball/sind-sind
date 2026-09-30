import { createContext, useContext, useState, useMemo } from 'react';
import { initialDemoData } from '../data/demoStore.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(initialDemoData);
  const [dataMode, setDataMode] = useState('demo'); // 'demo' | 'csv'
  const [storeName, setStoreName] = useState('Atelier & Co. (Demo Store)');

  const resetToDemo = () => {
    setData(initialDemoData);
    setDataMode('demo');
    setStoreName('Atelier & Co. (Demo Store)');
  };

  const updateData = (newData, mode = 'csv', name = 'Custom Imported Store') => {
    setData(newData);
    setDataMode(mode);
    setStoreName(name);
  };

  const addDecision = (newDecision) => {
    setData((prev) => ({
      ...prev,
      decisionsLedger: [
        {
          id: `DEC-${String(prev.decisionsLedger.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          status: 'active',
          ...newDecision
        },
        ...prev.decisionsLedger
      ]
    }));
  };

  const value = useMemo(
    () => ({
      data,
      dataMode,
      storeName,
      setData,
      resetToDemo,
      updateData,
      addDecision
    }),
    [data, dataMode, storeName]
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
