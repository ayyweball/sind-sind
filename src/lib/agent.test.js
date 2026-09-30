import test from 'node:test';
import assert from 'node:assert/strict';
import { AGENT_TOOLS } from '../../server/agent/toolRegistry.js';
import { runAgentInvestigation } from '../../server/agent/agentService.js';
import { TEST_001_DATASET } from './csvImporter.js';
import { initialDemoData as DEMO_DATASET } from '../data/demoStore.js';

test('AI Agent Tools: getStoreSummary produces deterministic non-NaN metrics on demo dataset', () => {
  const summary = AGENT_TOOLS.getStoreSummary.execute(DEMO_DATASET);
  assert.ok(summary.realizedRevenue > 0);
  assert.ok(summary.trueContribution > 0);
  assert.ok(!Number.isNaN(summary.grossMarginPct));
  assert.ok(!Number.isNaN(summary.trueContributionMarginPct));
  assert.ok(!Number.isNaN(summary.costToServePct));
});

test('AI Agent Tools: getStoreSummary functions correctly on TEST-001 dataset', () => {
  const summary = AGENT_TOOLS.getStoreSummary.execute(TEST_001_DATASET);
  assert.equal(summary.realizedRevenue, 10000);
  assert.equal(summary.grossProfit, 8000);
  assert.ok(summary.trueContribution > 0);
});

test('AI Agent Tools: getSKUUnitEconomics returns accurate waterfall for SKU', () => {
  const targetSku = DEMO_DATASET.products[0].sku;
  const skuEco = AGENT_TOOLS.getSKUUnitEconomics.execute(DEMO_DATASET, { sku: targetSku });
  assert.equal(skuEco.sku, targetSku);
  assert.ok(skuEco.avgSellingPrice > 0);
  assert.ok(!Number.isNaN(skuEco.trueContributionMarginPct));
  assert.ok(skuEco.costDecomposition !== undefined);
});

test('AI Agent Tools: getCashExposure identifies working capital locked', () => {
  const cashData = AGENT_TOOLS.getCashExposure.execute(DEMO_DATASET);
  assert.ok(cashData.totalWorkingCapitalLocked > 0);
  assert.ok(cashData.totalInventoryCapital > 0);
  assert.ok(Array.isArray(cashData.criticalSKUs));
});

test('AI Agent Investigation: returns 7 structured Oliver Wyman sections', async () => {
  const result = await runAgentInvestigation({
    query: 'Why did true contribution change?',
    dataset: DEMO_DATASET,
    storeName: 'Atelier & Co.',
    dataMode: 'demo'
  });

  assert.ok(result.finding, 'Must have finding');
  assert.ok(Array.isArray(result.evidence) && result.evidence.length > 0, 'Must have evidence array');
  assert.ok(result.evidence.every(e => e.provenance), 'Every evidence item must have explicit provenance tag');
  assert.ok(result.rootCause, 'Must have root cause');
  assert.ok(result.economicImplication, 'Must have economic implication');
  assert.ok(Array.isArray(result.managementConsiderations) && result.managementConsiderations.length > 0, 'Must have management considerations');
  assert.ok(result.dataGaps, 'Must have data gaps');
  assert.ok(result.dataBasis, 'Must have data basis');
});

test('AI Agent Investigation: handles EMPTY dataset gracefully without throwing', async () => {
  const result = await runAgentInvestigation({
    query: 'Review the store',
    dataset: { products: [], orders: [] },
    storeName: 'Empty Store',
    dataMode: 'empty'
  });

  assert.ok(result.finding.includes('Insufficient operating telemetry'));
  assert.ok(result.evidence.some(e => e.provenance === '[Insufficient Data]'));
});
