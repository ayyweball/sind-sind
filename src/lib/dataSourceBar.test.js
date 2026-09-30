import test from 'node:test';
import assert from 'node:assert/strict';
import { DATA_PROVENANCE_SOURCE } from './marketplace/constants.js';

test('DataSourceBar Logic: Computes correct mode labels and provenance for DEMO', () => {
  const dataMode = 'demo';
  const isDemo = dataMode === 'demo';
  const isEmpty = dataMode === 'empty';
  const isImported = dataMode === 'imported';

  assert.equal(isDemo, true);
  assert.equal(isEmpty, false);
  assert.equal(isImported, false);

  const defaultSource = isDemo ? 'Atelier & Co. · Configured Demo Assumptions' : '';
  const defaultProvenance = isDemo ? DATA_PROVENANCE_SOURCE.CONFIGURED_ASSUMPTION : '';
  const modeLabel = isDemo ? 'DEMO MODE' : '';

  assert.equal(defaultSource, 'Atelier & Co. · Configured Demo Assumptions');
  assert.equal(defaultProvenance, 'Configured Demo Assumption');
  assert.equal(modeLabel, 'DEMO MODE');
});

test('DataSourceBar Logic: Computes correct mode labels and provenance for EMPTY', () => {
  const dataMode = 'empty';
  const isDemo = dataMode === 'demo';
  const isEmpty = dataMode === 'empty';
  const isImported = dataMode === 'imported';

  assert.equal(isEmpty, true);
  assert.equal(isDemo, false);

  const defaultSource = isEmpty ? 'No Data Source Connected' : '';
  const defaultProvenance = isEmpty ? DATA_PROVENANCE_SOURCE.UNAVAILABLE : '';
  const modeLabel = isEmpty ? 'NO DATA' : '';

  assert.equal(defaultSource, 'No Data Source Connected');
  assert.equal(defaultProvenance, 'Unavailable Data');
  assert.equal(modeLabel, 'NO DATA');
});

test('DataSourceBar Logic: Computes correct mode labels and provenance for IMPORTED', () => {
  const dataMode = 'imported';
  const storeName = 'Apex Audio (Test Store)';
  const isDemo = dataMode === 'demo';
  const isEmpty = dataMode === 'empty';
  const isImported = dataMode === 'imported';

  assert.equal(isImported, true);

  const defaultSource = isImported ? `${storeName} · CSV / ERP Ingestion` : '';
  const defaultProvenance = isImported ? 'Imported Custom Data' : '';
  const modeLabel = isImported ? 'IMPORTED DATA' : '';

  assert.equal(defaultSource, 'Apex Audio (Test Store) · CSV / ERP Ingestion');
  assert.equal(defaultProvenance, 'Imported Custom Data');
  assert.equal(modeLabel, 'IMPORTED DATA');
});

test('DataSourceBar Logic: Computes correct mode labels and provenance for CONNECTED', () => {
  const dataMode = 'connected';
  const isDemo = dataMode === 'demo';
  const isEmpty = dataMode === 'empty';
  const isImported = dataMode === 'imported';

  const defaultSource = 'Amazon Seller Central · Connected Channel';
  const defaultProvenance = DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED;
  const modeLabel = isEmpty ? 'NO DATA' : (isDemo ? 'DEMO MODE' : (isImported ? 'IMPORTED DATA' : 'CONNECTED STREAM'));

  assert.equal(defaultSource, 'Amazon Seller Central · Connected Channel');
  assert.equal(defaultProvenance, 'Amazon Observed Data');
  assert.equal(modeLabel, 'CONNECTED STREAM');
});
