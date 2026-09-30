import { useState, useCallback } from 'react';
import { useCommerceData } from '../hooks/useCommerceData.js';
import { investigateOperatingQuestion } from './agentClient.js';

export function useAgent(activeSKU = null, currentRoute = '/app') {
  const { data, storeName, dataMode } = useCommerceData();
  const [loading, setLoading] = useState(false);
  const [investigation, setInvestigation] = useState(null);
  const [error, setError] = useState(null);

  const ask = useCallback(async (question) => {
    setLoading(true);
    setError(null);
    try {
      const res = await investigateOperatingQuestion({
        query: question,
        activeSKU,
        currentRoute,
        dataset: data,
        storeName,
        dataMode
      });
      setInvestigation(res);
      return res;
    } catch (err) {
      setError(err.message || 'Investigation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeSKU, currentRoute, data, storeName, dataMode]);

  return {
    investigate: ask,
    investigation,
    loading,
    error,
    clear: () => setInvestigation(null)
  };
}

export default useAgent;
