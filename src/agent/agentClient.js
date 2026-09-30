import { runAgentInvestigation } from '../../server/agent/agentService.js';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5174';

/**
 * Sends an analytical investigation request to the Operating Agent API.
 * Falls back safely to client-side deterministic evaluation if server is offline.
 */
export async function investigateOperatingQuestion({
  query,
  activeSKU,
  currentRoute,
  dataset,
  storeName,
  dataMode
}) {
  try {
    const response = await fetch(`${API_BASE}/api/agent/investigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        activeSKU,
        currentRoute,
        dataset,
        storeName,
        dataMode
      })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend agent API unavailable, executing client-side agent fallback:', err.message);
  }

  // Client-side deterministic fallback
  return runAgentInvestigation({
    query,
    activeSKU,
    currentRoute,
    dataset,
    storeName,
    dataMode
  });
}
