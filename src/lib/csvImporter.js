/**
 * CSV / ERP Data Parser and Normalizer for Sind & Sind Canonical Data Model
 * 
 * Provides parsing, column auto-mapping, validation, template generation,
 * and pre-configured test datasets (e.g. TEST-001 verification dataset).
 */

export const EMPTY_CANONICAL_DATA = {
  products: [],
  inventory: [],
  orders: [],
  orderItems: [],
  returns: [],
  adSpend: [],
  decisionsLedger: [],
  promotions: [],
  competitorBenchmarks: [],
  suppliers: [],
  purchaseOrders: [],
  warehouses: [],
  fulfillmentEvents: []
};

/**
 * Standard CSV Templates
 */
export const CSV_TEMPLATES = {
  products: `sku,name,category,listPrice,cogs,unitLandedCost,packagingCost,shippingCost,operatingStatus
SKU-001,Premium Cotton Shirt,Apparel,2499,650,750,45,95,ACTIVE
SKU-002,Slim Fit Denim,Apparel,3999,1100,1250,55,110,ACTIVE
SKU-003,Leather Cardholder,Accessories,1499,380,450,30,85,ACTIVE`,

  orders: `orderId,sku,orderDate,quantity,unitPrice,realizedPrice,channel,status,customerState,carrier
ORD-1001,SKU-001,2026-09-20,1,2499,2299,Shopify D2C,DELIVERED,Maharashtra,BlueDart
ORD-1002,SKU-001,2026-09-21,2,2499,2199,Amazon FBA,DELIVERED,Delhi,Amazon Shipping
ORD-1003,SKU-002,2026-09-22,1,3999,3799,Shopify D2C,DELIVERED,Karnataka,Delhivery
ORD-1004,SKU-003,2026-09-23,1,1499,1499,Shopify D2C,RETURNED,Maharashtra,BlueDart`,

  inventory: `sku,warehouseId,stockUnits,availableUnits,reservedUnits,reorderPoint,leadTimeDays
SKU-001,WH-WEST,250,220,30,100,14
SKU-002,WH-WEST,120,100,20,80,21
SKU-003,WH-WEST,450,430,20,50,10`
};

/**
 * Test C Verification Dataset (TEST-001)
 * 1 single product, deliberately different from Atelier & Co.
 */
export const TEST_001_DATASET = {
  products: [
    {
      id: 'PROD-TEST-001',
      sku: 'TEST-001',
      name: 'Wireless Studio ANC Headphones',
      category: 'Audio Electronics',
      price: 1000,
      listPrice: 1000,
      cost: 200,
      cogs: 200,
      unitLandedCost: 240,
      packagingCost: 20,
      shippingCost: 50,
      operatingStatus: 'ACTIVE',
      color: 'Matte Black',
      weightKg: 0.35
    }
  ],
  inventory: [
    {
      id: 'INV-TEST-001',
      sku: 'TEST-001',
      productId: 'PROD-TEST-001',
      stockUnits: 500,
      availableUnits: 490,
      reservedUnits: 10,
      reorderPoint: 50,
      leadTimeDays: 14,
      dailyVelocity: 1.2,
      coverageDays: 416.6,
      warehouseId: 'WH-TEST-01'
    }
  ],
  orders: [
    {
      id: 'ORD-TEST-101',
      orderId: 'ORD-TEST-101',
      orderDate: '2026-09-25T10:00:00Z',
      channel: 'Amazon Marketplace',
      status: 'DELIVERED',
      totalAmount: 10000,
      customerState: 'Karnataka',
      originWarehouseId: 'WH-TEST-01',
      carrier: 'Delhivery Surface',
      items: [
        {
          id: 'ITEM-TEST-101',
          productId: 'PROD-TEST-001',
          sku: 'TEST-001',
          quantity: 10,
          price: 1000,
          unitPrice: 1000,
          realizedPrice: 1000,
          netRevenue: 10000,
          discount: 0
        }
      ]
    }
  ],
  orderItems: [
    {
      id: 'ITEM-TEST-101',
      orderId: 'ORD-TEST-101',
      productId: 'PROD-TEST-001',
      sku: 'TEST-001',
      quantity: 10,
      price: 1000,
      unitPrice: 1000,
      realizedPrice: 1000,
      netRevenue: 10000,
      discount: 0
    }
  ],
  returns: [],
  adSpend: [
    {
      id: 'AD-TEST-01',
      productId: 'PROD-TEST-001',
      channel: 'Amazon Ads',
      spend: 1200,
      date: '2026-09-25'
    }
  ],
  decisionsLedger: [],
  promotions: [],
  competitorBenchmarks: [],
  suppliers: [
    {
      id: 'SUP-TEST-01',
      name: 'Apex Precision Acoustics Ltd.',
      city: 'Shenzhen / Bengaluru',
      leadTimeDays: 14,
      paymentTerms: 'NET_30',
      moqUnits: 100,
      skuList: ['TEST-001']
    }
  ],
  purchaseOrders: [
    {
      id: 'PO-TEST-900',
      poNumber: 'PO-TEST-900',
      supplierId: 'SUP-TEST-01',
      supplierName: 'Apex Precision Acoustics Ltd.',
      sku: 'TEST-001',
      quantity: 200,
      unitCost: 200,
      totalValue: 40000,
      totalCost: 40000,
      status: 'CONFIRMED',
      orderDate: '2026-09-20',
      expectedDeliveryDate: '2026-10-15',
      paymentTerms: 'NET_30'
    }
  ],
  warehouses: [
    {
      id: 'WH-TEST-01',
      name: 'Bengaluru Tech Logistics Hub',
      city: 'Bengaluru',
      state: 'Karnataka',
      capacityUnits: 2000,
      currentUnits: 500,
      primaryRegions: ['South', 'West']
    }
  ],
  fulfillmentEvents: []
};

/**
 * Simple CSV Text to Array of Objects Parser
 */
export function parseCsvText(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const lines = csvText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx];
      });
      rows.push(obj);
    }
  }

  return rows;
}

/**
 * Normalizes Products CSV into Canonical Products
 */
export function normalizeProductsCsv(rows) {
  return rows.map((r, index) => {
    const listPrice = Number(r.listPrice || r.price || 0);
    const cogs = Number(r.cogs || r.cost || 0);
    const unitLandedCost = Number(r.unitLandedCost || cogs * 1.15 || cogs);
    const packagingCost = Number(r.packagingCost || 30);
    const shippingCost = Number(r.shippingCost || 90);

    return {
      id: r.id || `PROD-${r.sku || String(index + 1).padStart(3, '0')}`,
      sku: r.sku || `SKU-${index + 1}`,
      name: r.name || `Imported Product ${r.sku || index + 1}`,
      category: r.category || 'General Merchandise',
      price: listPrice,
      listPrice,
      cost: cogs,
      cogs,
      unitLandedCost,
      packagingCost,
      shippingCost,
      operatingStatus: (r.operatingStatus || 'ACTIVE').toUpperCase(),
      weightKg: Number(r.weightKg || 0.5)
    };
  });
}

/**
 * Normalizes Orders CSV into Canonical Orders and OrderItems
 */
export function normalizeOrdersCsv(rows, products = []) {
  const ordersMap = new Map();
  const orderItems = [];

  rows.forEach((r, idx) => {
    const orderId = r.orderId || `ORD-${1000 + idx}`;
    const sku = r.sku;
    const prod = products.find(p => p.sku === sku) || { id: `PROD-${sku}`, price: Number(r.unitPrice || 1000), cost: 300 };
    const quantity = Number(r.quantity || 1);
    const unitPrice = Number(r.unitPrice || prod.price || 0);
    const realizedPrice = Number(r.realizedPrice || unitPrice);
    const netRevenue = realizedPrice * quantity;
    const discount = Math.max(0, (unitPrice - realizedPrice) * quantity);

    const item = {
      id: `ITEM-${idx + 1}`,
      orderId,
      productId: prod.id,
      sku,
      quantity,
      price: unitPrice,
      unitPrice,
      realizedPrice,
      netRevenue,
      discount
    };
    orderItems.push(item);

    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        id: orderId,
        orderId,
        orderDate: r.orderDate || new Date().toISOString(),
        channel: r.channel || 'Shopify D2C',
        status: (r.status || 'DELIVERED').toUpperCase(),
        totalAmount: netRevenue,
        customerState: r.customerState || 'Maharashtra',
        originWarehouseId: r.warehouseId || 'WH-MAIN',
        carrier: r.carrier || 'Express Logistics',
        items: [item]
      });
    } else {
      const existing = ordersMap.get(orderId);
      existing.totalAmount += netRevenue;
      existing.items.push(item);
    }
  });

  return {
    orders: Array.from(ordersMap.values()),
    orderItems
  };
}

/**
 * Normalizes Inventory CSV into Canonical Inventory
 */
export function normalizeInventoryCsv(rows, products = []) {
  return rows.map((r, idx) => {
    const sku = r.sku;
    const prod = products.find(p => p.sku === sku);
    const stockUnits = Number(r.stockUnits || r.units || 0);
    const availableUnits = Number(r.availableUnits || stockUnits);
    const reservedUnits = Number(r.reservedUnits || 0);
    const reorderPoint = Number(r.reorderPoint || 50);
    const leadTimeDays = Number(r.leadTimeDays || 14);
    const dailyVelocity = Math.max(0.1, stockUnits > 0 ? stockUnits / 30 : 0);

    return {
      id: `INV-${sku || idx + 1}`,
      sku,
      productId: prod?.id || `PROD-${sku}`,
      stockUnits,
      availableUnits,
      reservedUnits,
      reorderPoint,
      leadTimeDays,
      dailyVelocity: Number(dailyVelocity.toFixed(2)),
      coverageDays: Number((stockUnits / dailyVelocity).toFixed(1)),
      warehouseId: r.warehouseId || 'WH-MAIN'
    };
  });
}

/**
 * Ingests multi-table CSV payload into full Canonical Store
 */
export function createCanonicalStoreFromCsv({ productsCsv = '', ordersCsv = '', inventoryCsv = '', storeName = 'Imported Store' }) {
  const prodRows = parseCsvText(productsCsv);
  const products = normalizeProductsCsv(prodRows);

  const orderRows = parseCsvText(ordersCsv);
  const { orders, orderItems } = normalizeOrdersCsv(orderRows, products);

  const invRows = parseCsvText(inventoryCsv);
  let inventory = normalizeInventoryCsv(invRows, products);

  // If no inventory CSV was provided, synthesize minimal positions from products
  if (inventory.length === 0 && products.length > 0) {
    inventory = products.map((p, idx) => ({
      id: `INV-${p.sku}`,
      sku: p.sku,
      productId: p.id,
      stockUnits: 100,
      availableUnits: 90,
      reservedUnits: 10,
      reorderPoint: 30,
      leadTimeDays: 14,
      dailyVelocity: 2.0,
      coverageDays: 50.0,
      warehouseId: 'WH-MAIN'
    }));
  }

  // Extract unique warehouses
  const warehouseIds = new Set(inventory.map(i => i.warehouseId).concat(orders.map(o => o.originWarehouseId)));
  const warehouses = Array.from(warehouseIds).filter(Boolean).map(whId => ({
    id: whId,
    name: `${whId} Facility`,
    city: 'Mumbai',
    state: 'Maharashtra',
    capacityUnits: 2000,
    currentUnits: inventory.filter(i => i.warehouseId === whId).reduce((sum, i) => sum + i.stockUnits, 0),
    primaryRegions: ['West', 'North']
  }));

  return {
    products,
    inventory,
    orders,
    orderItems,
    returns: [],
    adSpend: [],
    decisionsLedger: [],
    promotions: [],
    competitorBenchmarks: [],
    suppliers: [],
    purchaseOrders: [],
    warehouses,
    fulfillmentEvents: []
  };
}
