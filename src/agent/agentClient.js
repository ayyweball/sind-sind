const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5174';

/**
 * Sends an analytical investigation request to the Operating Agent API on Express backend.
 * Browser-safe: strictly makes HTTP requests and never imports server-only modules.
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

    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.details || `Agent API responded with status ${response.status}`);
  } catch (err) {
    console.warn('Backend Operating Agent API error:', err.message);
    
    // Provide a safe, structured fallback response if backend is offline or returns error
    return {
      query: query || 'Operating Investigation',
      timestamp: new Date().toISOString(),
      llmStatus: {
        configured: false,
        provider: 'none',
        model: 'none',
        mode: 'DETERMINISTIC_ENGINE'
      },
      trace: {
        stepsCount: 1,
        evidenceCount: 0,
        steps: [{
          stepNumber: 1,
          stepName: 'Backend Connectivity Status',
          reason: 'Attempted connection to Express agent endpoint',
          tool: 'None',
          toolName: 'api_connectivity',
          status: 'offline_fallback',
          resultSummary: err.message || 'Backend unreachable on port 5174',
          durationMs: 0
        }],
        durationMs: 0,
        intent: 'CONNECTIVITY_FALLBACK',
        activeDataset: {
          storeName: storeName || 'Store',
          dataMode: dataMode || 'demo',
          skuCount: dataset?.products?.length || 0,
          orderCount: dataset?.orders?.length || 0
        }
      },
      finding: `Agent investigation completed in fallback mode: ${err.message}`,
      evidence: [
        { label: 'API Endpoint', value: `${API_BASE}/api/agent/investigate`, provenance: '[Insufficient Data]' },
        { label: 'Active Dataset', value: `${storeName} (${dataMode})`, provenance: '[Observed Data]' }
      ],
      rootCause: 'The frontend could not communicate with the backend Operating Agent server or the server returned an error.',
      economicImplication: 'Full multi-step tool telemetry requires an active backend connection.',
      managementConsiderations: [
        'Ensure the Express API backend is running (e.g. via npm run dev or npm start).',
        'Verify network connectivity and API port 5174.'
      ],
      dataGaps: 'Agent server unreachable.',
      dataBasis: `Store: ${storeName} · Mode: ${dataMode}`
    };
  }
}
