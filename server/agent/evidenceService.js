/**
 * Evidence formatting service for the AI Commerce Operating Agent.
 * Explicitly tags every metric with data provenance:
 * - [Observed Data]
 * - [Amazon Observed Data]
 * - [Shopify Observed Data]
 * - [Calculated Value]
 * - [Configured Demo Assumption]
 * - [Insufficient Data]
 */

export function formatINR(val) {
  return `₹${Math.round(val || 0).toLocaleString()}`;
}

export function formatINRAccurate(val) {
  return `₹${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildEvidenceItem(label, value, provenance = '[Calculated Value]') {
  return {
    label,
    value,
    provenance
  };
}

export function buildProvenanceContext(dataMode, source) {
  if (dataMode === 'connected' || source === 'amazon_sp_api') {
    return '[Amazon Observed Data]';
  }
  if (dataMode === 'connected' || source === 'shopify') {
    return '[Shopify Observed Data]';
  }
  if (dataMode === 'imported') {
    return '[Observed Data]';
  }
  return '[Configured Demo Assumption]';
}
