import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_CANONICAL_DATA,
  TEST_001_DATASET,
  parseCsvText,
  normalizeProductsCsv,
  normalizeOrdersCsv,
  normalizeInventoryCsv,
  createCanonicalStoreFromCsv,
  CSV_TEMPLATES
} from './csvImporter.js';
import { calculateStoreEconomics, calculateSKUEconomics } from './economics.js';
import { calculateProductPerformance } from './metrics.js';

describe('CSV Importer & Canonical Data Isolation', () => {
  it('1. parseCsvText correctly parses multi-line CSV string', () => {
    const csv = `sku,name,price\nSKU-1,T-Shirt,999\nSKU-2,Jeans,1999`;
    const rows = parseCsvText(csv);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].sku, 'SKU-1');
    assert.equal(rows[0].price, '999');
    assert.equal(rows[1].name, 'Jeans');
  });

  it('2. createCanonicalStoreFromCsv builds valid canonical dataset', () => {
    const store = createCanonicalStoreFromCsv({
      productsCsv: CSV_TEMPLATES.products,
      ordersCsv: CSV_TEMPLATES.orders,
      inventoryCsv: CSV_TEMPLATES.inventory,
      storeName: 'Test Apparel Co.'
    });

    assert.equal(store.products.length, 3);
    assert.equal(store.orders.length, 4);
    assert.equal(store.orderItems.length, 4);
    assert.equal(store.inventory.length, 3);
    assert.ok(store.warehouses.length >= 1);

    // Verify economic engine computes from imported data
    const econ = calculateStoreEconomics(store);
    assert.ok(econ.realizedRevenue > 0);
    assert.ok(econ.trueContribution !== undefined);
  });

  it('3. TEST_001 dataset contains only TEST-001 and no Atelier & Co. entities', () => {
    const testStore = TEST_001_DATASET;

    assert.equal(testStore.products.length, 1);
    assert.equal(testStore.products[0].sku, 'TEST-001');
    assert.equal(testStore.products[0].price, 1000);
    assert.equal(testStore.products[0].cost, 200);
    assert.equal(testStore.inventory[0].stockUnits, 500);
    assert.equal(testStore.orders[0].items[0].quantity, 10);

    const perf = calculateProductPerformance(testStore);
    assert.equal(perf.length, 1);
    assert.equal(perf[0].sku, 'TEST-001');
    assert.equal(perf[0].unitsSold, 10);
    assert.equal(perf[0].revenue, 10000);

    const skuEcon = calculateSKUEconomics(testStore.products[0], testStore);
    assert.equal(skuEcon.sku, 'TEST-001');
    assert.equal(skuEcon.realizedRevenue, 10000);
    assert.equal(skuEcon.unitsSold, 10);

    // Verify zero traces of Atelier demo SKUs
    const jsonStr = JSON.stringify(testStore);
    assert.equal(jsonStr.includes('Leather Sneaker'), false);
    assert.equal(jsonStr.includes('Canvas Carryall'), false);
    assert.equal(jsonStr.includes('Atelier'), false);
    assert.equal(jsonStr.includes('Heritage Mills'), false);
    assert.equal(jsonStr.includes('PO-2026-088'), false);
  });

  it('4. EMPTY_CANONICAL_DATA evaluates cleanly in economics engine without throwing', () => {
    const econ = calculateStoreEconomics(EMPTY_CANONICAL_DATA);
    assert.equal(econ.realizedRevenue, 0);
    assert.equal(econ.totalUnitsSold, 0);
    assert.equal(econ.totalOrderCount, 0);
    assert.equal(econ.grossMarginPct, 0);

    const perf = calculateProductPerformance(EMPTY_CANONICAL_DATA);
    assert.equal(perf.length, 0);
  });
});
