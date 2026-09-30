// Synthetic Demo Store Dataset for Sind & Sind Operating Intelligence Platform
// Note: This is an internally consistent, synthetic dataset for demonstration and rule testing.

export const demoProducts = [
  {
    id: 'prod-001',
    sku: 'SNK-BLK-09',
    name: 'Classic Leather Sneaker — Noir',
    category: 'Footwear',
    price: 4200,
    cost: 1650,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.60
  },
  {
    id: 'prod-002',
    sku: 'LIN-WHT-M',
    name: 'Relaxed Linen Overshirt — Chalk',
    category: 'Apparel',
    price: 3400,
    cost: 1100,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.67
  },
  {
    id: 'prod-003',
    sku: 'TOT-CNV-NAT',
    name: 'Heavyweight Canvas Carryall',
    category: 'Accessories',
    price: 1800,
    cost: 620,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.65
  },
  {
    id: 'prod-004',
    sku: 'SLK-SLP-EMR',
    name: 'Bias-Cut Silk Slip Dress — Emerald',
    category: 'Apparel',
    price: 6800,
    cost: 1950,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.71
  },
  {
    id: 'prod-005',
    sku: 'WOL-COAT-CAM',
    name: 'Structured Wool Overcoat — Camel',
    category: 'Apparel',
    price: 9500,
    cost: 4100,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.56
  },
  {
    id: 'prod-006',
    sku: 'MER-TEE-NVY',
    name: 'Merino Wool Daily Tee — Navy',
    category: 'Apparel',
    price: 2400,
    cost: 780,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.67
  },
  {
    id: 'prod-007',
    sku: 'LTH-WLT-TAN',
    name: 'Minimal Bifold Card Wallet — Tan',
    category: 'Accessories',
    price: 1600,
    cost: 450,
    channel: 'Amazon Marketplace',
    targetGrossMargin: 0.71
  },
  {
    id: 'prod-008',
    sku: 'DEN-STR-RAW',
    name: 'Selvedge Straight Leg Denim — Raw',
    category: 'Apparel',
    price: 4900,
    cost: 1800,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.63
  },
  {
    id: 'prod-009',
    sku: 'KNT-POLO-OLV',
    name: 'Fine-Gauge Knit Polo — Olive',
    category: 'Apparel',
    price: 3200,
    cost: 1050,
    channel: 'DTC Shopify',
    targetGrossMargin: 0.67
  },
  {
    id: 'prod-010',
    sku: 'SUN-ACE-BLK',
    name: 'Acetate Square Frame Sunglasses',
    category: 'Accessories',
    price: 2800,
    cost: 720,
    channel: 'Amazon Marketplace',
    targetGrossMargin: 0.74
  }
];

export const demoInventory = [
  {
    productId: 'prod-001',
    sku: 'SNK-BLK-09',
    currentStock: 98,
    leadTimeDays: 14,
    safetyStock: 60,
    reorderPoint: 180,
    dailyVelocity: 14.8,
    coverageDays: 6.6, // Low coverage alert!
    warehouseLocation: 'Mumbai Central'
  },
  {
    productId: 'prod-002',
    sku: 'LIN-WHT-M',
    currentStock: 240,
    leadTimeDays: 10,
    safetyStock: 50,
    reorderPoint: 140,
    dailyVelocity: 9.2,
    coverageDays: 26.1,
    warehouseLocation: 'Delhi NCR'
  },
  {
    productId: 'prod-003',
    sku: 'TOT-CNV-NAT',
    currentStock: 320,
    leadTimeDays: 7,
    safetyStock: 40,
    reorderPoint: 90,
    dailyVelocity: 7.1,
    coverageDays: 45.0,
    warehouseLocation: 'Mumbai Central'
  },
  {
    productId: 'prod-004',
    sku: 'SLK-SLP-EMR',
    currentStock: 110,
    leadTimeDays: 15,
    safetyStock: 30,
    reorderPoint: 75,
    dailyVelocity: 3.4,
    coverageDays: 32.3,
    warehouseLocation: 'Bengaluru'
  },
  {
    productId: 'prod-005',
    sku: 'WOL-COAT-CAM',
    currentStock: 480, // Excess stock alert!
    leadTimeDays: 20,
    safetyStock: 40,
    reorderPoint: 80,
    dailyVelocity: 1.8,
    coverageDays: 266.6,
    warehouseLocation: 'Delhi NCR'
  },
  {
    productId: 'prod-006',
    sku: 'MER-TEE-NVY',
    currentStock: 185,
    leadTimeDays: 8,
    safetyStock: 40,
    reorderPoint: 100,
    dailyVelocity: 8.5,
    coverageDays: 21.7,
    warehouseLocation: 'Mumbai Central'
  },
  {
    productId: 'prod-007',
    sku: 'LTH-WLT-TAN',
    currentStock: 160,
    leadTimeDays: 10,
    safetyStock: 35,
    reorderPoint: 85,
    dailyVelocity: 5.2,
    coverageDays: 30.7,
    warehouseLocation: 'Amazon FBA'
  },
  {
    productId: 'prod-008',
    sku: 'DEN-STR-RAW',
    currentStock: 145,
    leadTimeDays: 16,
    safetyStock: 40,
    reorderPoint: 110,
    dailyVelocity: 4.6,
    coverageDays: 31.5,
    warehouseLocation: 'Delhi NCR'
  },
  {
    productId: 'prod-009',
    sku: 'KNT-POLO-OLV',
    currentStock: 210,
    leadTimeDays: 12,
    safetyStock: 45,
    reorderPoint: 105,
    dailyVelocity: 5.8,
    coverageDays: 36.2,
    warehouseLocation: 'Bengaluru'
  },
  {
    productId: 'prod-010',
    sku: 'SUN-ACE-BLK',
    currentStock: 130,
    leadTimeDays: 10,
    safetyStock: 30,
    reorderPoint: 70,
    dailyVelocity: 4.1,
    coverageDays: 31.7,
    warehouseLocation: 'Amazon FBA'
  }
];

// Helper to generate a consistent set of 140 orders over the past 30 days
const generateDemoOrders = () => {
  const orders = [];
  const orderItems = [];
  const fulfillmentEvents = [];
  const returns = [];

  const baseDate = new Date(2026, 8, 25); // 25 Sept 2026
  const channels = ['DTC Shopify', 'DTC Shopify', 'DTC Shopify', 'Amazon Marketplace'];
  const returnReasons = [
    'Sizing too small',
    'Fabric texture differed from imagery',
    'Changed mind before unboxing',
    'Arrived past delivery expectation',
    'Fit too loose around chest'
  ];

  let orderCount = 140;
  for (let i = 1; i <= orderCount; i++) {
    const orderId = `ORD-2026-${String(1000 + i).padStart(5, '0')}`;
    const dayOffset = Math.floor((i / orderCount) * 28);
    const orderDate = new Date(baseDate.getTime() - (28 - dayOffset) * 24 * 60 * 60 * 1000);
    const dateStr = orderDate.toISOString().split('T')[0];
    const channel = channels[i % channels.length];
    const customerId = `CUST-${String((i * 13) % 89 + 100).padStart(4, '0')}`;

    // Select 1 to 3 items
    const itemCount = (i % 5 === 0) ? 2 : (i % 11 === 0 ? 3 : 1);
    let orderTotal = 0;

    for (let j = 0; j < itemCount; j++) {
      // Pick product with weighted distribution towards Sneakers and Linen Shirts
      let productIndex = (i * (j + 1) + j) % demoProducts.length;
      if (i % 3 === 0) productIndex = 0; // High velocity for Sneakers
      if (i % 4 === 0) productIndex = 1; // High velocity for Linen Shirt
      
      const product = demoProducts[productIndex];
      const quantity = (product.price < 2000 && i % 4 === 0) ? 2 : 1;
      
      // Intentional discount margin compression for Tote Bag
      let discount = 0;
      if (product.id === 'prod-003') {
        discount = i > 70 ? 350 : 100; // Increased discounting in recent period
      } else if (i % 7 === 0) {
        discount = 200;
      }

      const itemTotal = quantity * (product.price - discount);
      orderTotal += itemTotal;

      orderItems.push({
        id: `ITEM-${orderId}-${j + 1}`,
        orderId,
        productId: product.id,
        sku: product.sku,
        quantity,
        sellingPrice: product.price,
        discount,
        cogs: product.cost * quantity,
        netRevenue: itemTotal
      });

      // High return rate scenario for Linen Shirt (prod-002) in recent batch
      if (product.id === 'prod-002' && (i % 4 === 0)) {
        returns.push({
          id: `RET-${orderId}-${j + 1}`,
          orderId,
          productId: product.id,
          date: dateStr,
          refundAmount: itemTotal,
          reason: returnReasons[i % returnReasons.length],
          status: 'processed'
        });
      } else if (i % 18 === 0) {
        returns.push({
          id: `RET-${orderId}-${j + 1}`,
          orderId,
          productId: product.id,
          date: dateStr,
          refundAmount: itemTotal,
          reason: returnReasons[i % returnReasons.length],
          status: 'processed'
        });
      }
    }

    // Destination geographic assignment
    const destinations = [
      { city: 'Delhi', state: 'Delhi NCR', region: 'North' },
      { city: 'Mumbai', state: 'Maharashtra', region: 'West' },
      { city: 'Bengaluru', state: 'Karnataka', region: 'South' },
      { city: 'Kolkata', state: 'West Bengal', region: 'East' },
      { city: 'Chennai', state: 'Tamil Nadu', region: 'South' },
      { city: 'Hyderabad', state: 'Telangana', region: 'South' }
    ];
    const dest = destinations[i % destinations.length];
    const originWarehouseId = (i % 3 === 0) ? 'WH-BOM' : ((i % 3 === 1) ? 'WH-DEL' : 'WH-BLR');
    const warehouseNameMap = { 'WH-BOM': 'Mumbai Central Fulfillment Hub', 'WH-DEL': 'Delhi NCR North Distribution Center', 'WH-BLR': 'Bengaluru South Regional Hub' };
    const originCityMap = { 'WH-BOM': 'Mumbai', 'WH-DEL': 'Gurugram', 'WH-BLR': 'Bengaluru' };
    const courier = (i % 3 === 0) ? 'BlueDart' : ((i % 3 === 1) ? 'Delhivery' : 'Amazon Logistics');

    const isDelayed = i % 14 === 0;
    const transitDays = isDelayed ? 4.5 : (originWarehouseId === 'WH-BOM' && dest.city === 'Mumbai' ? 1.2 : (originWarehouseId === 'WH-DEL' && dest.city === 'Delhi' ? 1.1 : 2.2));
    const dispatchDays = isDelayed ? 2.0 : 0.8;

    orders.push({
      id: orderId,
      date: dateStr,
      channel,
      customerId,
      total: orderTotal,
      currency: 'INR',
      originWarehouseId,
      destinationCity: dest.city,
      destinationState: dest.state,
      destinationRegion: dest.region,
      courier,
      status: i > 132 ? 'processing' : (isDelayed ? 'delayed' : 'delivered')
    });

    // Fulfillment lag scenario for delayed orders
    fulfillmentEvents.push({
      orderId,
      status: i > 132 ? 'processing' : (isDelayed ? 'delayed' : 'delivered'),
      orderedAt: `${dateStr}T10:30:00Z`,
      fulfilledAt: isDelayed ? `${dateStr}T18:45:00Z` : `${dateStr}T14:15:00Z`,
      dispatchedAt: isDelayed ? `${dateStr}T22:00:00Z` : `${dateStr}T16:00:00Z`,
      deliveredAt: isDelayed ? null : `${dateStr}T20:00:00Z`,
      dispatchDays,
      transitDays,
      totalDeliveryDays: dispatchDays + transitDays,
      originWarehouseId,
      warehouse: warehouseNameMap[originWarehouseId],
      originCity: originCityMap[originWarehouseId],
      destinationCity: dest.city,
      destinationRegion: dest.region,
      shippingLane: `${originCityMap[originWarehouseId]} → ${dest.city}`,
      courier,
      shippingCost: (i % 2 === 0) ? 90 : 110,
      pickPackCost: originWarehouseId === 'WH-DEL' ? 28 : (originWarehouseId === 'WH-BOM' ? 25 : 24)
    });
  }

  return { orders, orderItems, fulfillmentEvents, returns };
};

const generated = generateDemoOrders();

export const demoOrders = generated.orders;
export const demoOrderItems = generated.orderItems;
export const demoFulfillmentEvents = generated.fulfillmentEvents;
export const demoReturns = generated.returns;

export const demoWarehouses = [
  {
    id: 'WH-BOM',
    name: 'Mumbai Central Fulfillment Hub',
    city: 'Mumbai',
    state: 'Maharashtra',
    capacityUnits: 2500,
    currentUnits: 1420,
    dailyProcessingCapacity: 400,
    operatingCostPerOrder: 35.0,
    pickPackCostPerOrder: 25.0,
    status: 'ACTIVE',
    source: 'Configured Demo Assumption'
  },
  {
    id: 'WH-DEL',
    name: 'Delhi NCR North Distribution Center',
    city: 'Gurugram',
    state: 'Haryana',
    capacityUnits: 2000,
    currentUnits: 1180,
    dailyProcessingCapacity: 300,
    operatingCostPerOrder: 40.0,
    pickPackCostPerOrder: 28.0,
    status: 'ACTIVE',
    source: 'Configured Demo Assumption'
  },
  {
    id: 'WH-BLR',
    name: 'Bengaluru South Regional Hub',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacityUnits: 1500,
    currentUnits: 680,
    dailyProcessingCapacity: 250,
    operatingCostPerOrder: 38.0,
    pickPackCostPerOrder: 24.0,
    status: 'ACTIVE',
    source: 'Configured Demo Assumption'
  }
];

export const demoAdSpend = [
  // Week 1-2 (Baseline)
  { date: '2026-09-01', channel: 'Meta Ads', campaign: 'BOFU — Sneaker Scale', productId: 'prod-001', spend: 42000, clicks: 1420, impressions: 84000, attributedRevenue: 168000, attributedOrders: 40 },
  { date: '2026-09-01', channel: 'Meta Ads', campaign: 'MOFU — Linen & Essentials', productId: 'prod-002', spend: 28000, clicks: 1100, impressions: 62000, attributedRevenue: 98000, attributedOrders: 28 },
  { date: '2026-09-01', channel: 'Google Ads', campaign: 'Search — Brand & Footwear', productId: 'prod-001', spend: 18000, clicks: 650, impressions: 14000, attributedRevenue: 84000, attributedOrders: 20 },
  
  // Week 3 (Meta CAC inflation begins)
  { date: '2026-09-10', channel: 'Meta Ads', campaign: 'BOFU — Sneaker Scale', productId: 'prod-001', spend: 68000, clicks: 1750, impressions: 112000, attributedRevenue: 210000, attributedOrders: 50 },
  { date: '2026-09-10', channel: 'Meta Ads', campaign: 'MOFU — Linen & Essentials', productId: 'prod-002', spend: 34000, clicks: 1200, impressions: 71000, attributedRevenue: 102000, attributedOrders: 30 },
  { date: '2026-09-10', channel: 'Google Ads', campaign: 'Search — Brand & Footwear', productId: 'prod-001', spend: 22000, clicks: 720, impressions: 16000, attributedRevenue: 92400, attributedOrders: 22 },

  // Week 4 (Meta spend continues to scale against depleted Sneaker stock)
  { date: '2026-09-20', channel: 'Meta Ads', campaign: 'BOFU — Sneaker Scale', productId: 'prod-001', spend: 89000, clicks: 2100, impressions: 145000, attributedRevenue: 243600, attributedOrders: 58 },
  { date: '2026-09-20', channel: 'Meta Ads', campaign: 'MOFU — Tote Volume Push', productId: 'prod-003', spend: 26000, clicks: 1600, impressions: 88000, attributedRevenue: 54000, attributedOrders: 30 },
  { date: '2026-09-20', channel: 'Google Ads', campaign: 'Search — Brand & Footwear', productId: 'prod-001', spend: 26000, clicks: 810, impressions: 18500, attributedRevenue: 105000, attributedOrders: 25 }
];

export const demoDecisionsLedger = [
  {
    id: 'DEC-001',
    date: '2026-09-12',
    decision: 'Cap Meta Daily Budget on Canvas Carryall',
    domain: 'Paid Acquisition & Margin',
    reason: 'Contribution margin dropped below 22% target due to compounding 20% discount code.',
    expectedOutcome: 'Restore blended campaign contribution margin to >32% without sacrificing organic velocity.',
    relevantMetric: 'Contribution Margin %',
    reviewDate: '2026-10-02',
    status: 'active'
  },
  {
    id: 'DEC-002',
    date: '2026-09-18',
    decision: 'Issue Purchase Order for 300 units of Leather Sneaker Noir',
    domain: 'Inventory Operations',
    reason: 'Inventory coverage dropped below 8 days with lead time of 14 days.',
    expectedOutcome: 'Avoid projected stockout scheduled for 29 September 2026.',
    relevantMetric: 'Inventory Coverage Days',
    reviewDate: '2026-09-28',
    status: 'in_progress'
  }
];

export const demoPromotions = [
  {
    id: 'PROM-2026-001',
    name: 'Carryall Volume Push Discount',
    type: 'COUPON',
    startDate: '2026-09-10',
    endDate: '2026-09-24',
    discountType: 'FIXED_AMOUNT',
    discountValue: 350,
    fundingSource: 'SELLER_FUNDED',
    applicableChannel: 'Shopify D2C',
    applicableSku: 'TOT-CNV-NAT',
    productId: 'prod-003',
    status: 'active',
    note: 'Stackable promotional coupon applied at checkout'
  },
  {
    id: 'PROM-2026-002',
    name: 'Linen Essentials Seasonal Markdown',
    type: 'PERCENTAGE_DISCOUNT',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    fundingSource: 'SELLER_FUNDED',
    applicableChannel: 'Shopify D2C',
    applicableSku: 'LIN-WHT-M',
    productId: 'prod-002',
    status: 'concluded',
    note: 'End-of-summer transition promo'
  },
  {
    id: 'PROM-2026-003',
    name: 'Prime Day / Deal of the Day Tier',
    type: 'PLATFORM_PROMOTION',
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    fundingSource: 'CO_FUNDED',
    applicableChannel: 'Amazon FBA',
    applicableSku: 'LTH-WLT-TAN',
    productId: 'prod-007',
    status: 'active',
    note: 'Marketplace featured deal'
  },
  {
    id: 'PROM-2026-004',
    name: 'Silk Slip Holiday Flash Offer',
    type: 'COUPON',
    startDate: '2026-09-15',
    endDate: '2026-09-25',
    discountType: 'FIXED_AMOUNT',
    discountValue: 500,
    fundingSource: 'SELLER_FUNDED',
    applicableChannel: 'Shopify D2C',
    applicableSku: 'SLK-SLP-EMR',
    productId: 'prod-004',
    status: 'active',
    note: 'VIP customer exclusive voucher'
  }
];

export const demoCompetitorBenchmarks = [
  {
    sku: 'SNK-BLK-09',
    brand: 'Minimalist Studio A',
    channel: 'Direct DTC',
    observedPrice: 4500,
    priceType: 'RETAIL_MSRP',
    observationDate: '2026-09-20',
    source: 'Configured Demo Assumption'
  },
  {
    sku: 'TOT-CNV-NAT',
    brand: 'Heritage Bags Co.',
    channel: 'Marketplace',
    observedPrice: 1950,
    priceType: 'PROMOTIONAL_PRICE',
    observationDate: '2026-09-22',
    source: 'Configured Demo Assumption'
  }
];

export const demoSuppliers = [
  {
    id: 'SUP-001',
    name: 'Heritage Mills',
    category: 'Woolens & Tailored Outerwear',
    leadTimeDays: 21,
    paymentTerms: 'NET_45',
    creditPeriodDays: 45,
    location: 'Ludhiana, Punjab',
    source: 'Configured Demo Assumption'
  },
  {
    id: 'SUP-002',
    name: 'Northern Leathercraft',
    category: 'Footwear & Small Leather Goods',
    leadTimeDays: 24,
    paymentTerms: 'NET_30',
    creditPeriodDays: 30,
    location: 'Agra, Uttar Pradesh',
    source: 'Configured Demo Assumption'
  },
  {
    id: 'SUP-003',
    name: 'Studio Knitters',
    category: 'Silk & Fine Knitwear',
    leadTimeDays: 18,
    paymentTerms: 'NET_30',
    creditPeriodDays: 30,
    location: 'Tiruppur, Tamil Nadu',
    source: 'Configured Demo Assumption'
  },
  {
    id: 'SUP-004',
    name: 'Artisan Loom Works',
    category: 'Linen & Shirting Fabrics',
    leadTimeDays: 14,
    paymentTerms: 'NET_15',
    creditPeriodDays: 15,
    location: 'Bhagalpur, Bihar',
    source: 'Configured Demo Assumption'
  }
];

export const demoPurchaseOrders = [
  {
    id: 'PO-2026-088',
    supplierId: 'SUP-003',
    supplierName: 'Studio Knitters',
    productId: 'prod-004',
    sku: 'SLK-SLP-EMR',
    productName: 'Bias-Cut Silk Slip Dress — Emerald',
    quantity: 120,
    unitCost: 1950,
    totalValue: 234000,
    orderDate: '2026-09-10',
    expectedDeliveryDate: '2026-10-05',
    paymentTerms: 'NET_30',
    paymentDueDate: '2026-10-10',
    status: 'CONFIRMED',
    note: 'Winter festive replenishment production batch'
  },
  {
    id: 'PO-2026-091',
    supplierId: 'SUP-001',
    supplierName: 'Heritage Mills',
    productId: 'prod-005',
    sku: 'WOL-COAT-CAM',
    productName: 'Structured Wool Overcoat — Camel',
    quantity: 80,
    unitCost: 4100,
    totalValue: 328000,
    orderDate: '2026-09-02',
    expectedDeliveryDate: '2026-09-29',
    paymentTerms: 'NET_45',
    paymentDueDate: '2026-10-17',
    status: 'IN_TRANSIT',
    note: 'Autumn overcoat pre-season inventory commitment'
  },
  {
    id: 'PO-2026-095',
    supplierId: 'SUP-002',
    supplierName: 'Northern Leathercraft',
    productId: 'prod-001',
    sku: 'SNK-BLK-09',
    productName: 'Classic Leather Sneaker — Noir',
    quantity: 150,
    unitCost: 1650,
    totalValue: 247500,
    orderDate: '2026-09-18',
    expectedDeliveryDate: '2026-10-15',
    paymentTerms: 'NET_30',
    paymentDueDate: '2026-10-18',
    status: 'CONFIRMED',
    note: 'Urgent buffer reorder to avert stockout'
  },
  {
    id: 'PO-2026-072',
    supplierId: 'SUP-004',
    supplierName: 'Artisan Loom Works',
    productId: 'prod-002',
    sku: 'LIN-WHT-M',
    productName: 'Relaxed Linen Overshirt — Chalk',
    quantity: 100,
    unitCost: 1100,
    totalValue: 110000,
    orderDate: '2026-08-01',
    expectedDeliveryDate: '2026-08-25',
    actualReceiptDate: '2026-08-24',
    paymentTerms: 'NET_15',
    paymentDueDate: '2026-08-31',
    status: 'RECEIVED',
    note: 'Completed batch received into central warehouse'
  }
];

export const demoChannelSettlementRules = [
  {
    channelId: 'd2c',
    channelName: 'Shopify D2C',
    settlementCycle: 'NET_3',
    settlementDelayDays: 3,
    commissionTakeRatePct: 0.0,
    paymentGatewayDeductionPct: 2.0,
    logisticsDeductionPerOrder: 0.0,
    refundReservePct: 0.0,
    source: 'Configured Demo Assumption'
  },
  {
    channelId: 'amazon_fba',
    channelName: 'Amazon FBA',
    settlementCycle: 'NET_14',
    settlementDelayDays: 14,
    commissionTakeRatePct: 14.5,
    paymentGatewayDeductionPct: 0.0,
    logisticsDeductionPerOrder: 65.0,
    refundReservePct: 3.0,
    source: 'Configured Demo Assumption'
  },
  {
    channelId: 'amazon_easyship',
    channelName: 'Amazon Easy Ship',
    settlementCycle: 'NET_14',
    settlementDelayDays: 14,
    commissionTakeRatePct: 14.5,
    paymentGatewayDeductionPct: 0.0,
    logisticsDeductionPerOrder: 80.0,
    refundReservePct: 3.0,
    source: 'Configured Demo Assumption'
  },
  {
    channelId: 'myntra_ajio',
    channelName: 'Myntra / Ajio',
    settlementCycle: 'NET_30',
    settlementDelayDays: 30,
    commissionTakeRatePct: 18.0,
    paymentGatewayDeductionPct: 1.5,
    logisticsDeductionPerOrder: 75.0,
    refundReservePct: 5.0,
    source: 'Configured Demo Assumption'
  },
  {
    channelId: 'b2b_wholesale',
    channelName: 'B2B Wholesale',
    settlementCycle: 'NET_45',
    settlementDelayDays: 45,
    commissionTakeRatePct: 0.0,
    paymentGatewayDeductionPct: 0.5,
    logisticsDeductionPerOrder: 35.0,
    refundReservePct: 0.0,
    source: 'Configured Demo Assumption'
  }
];

export const demoSettlements = [
  {
    id: 'SETTL-2026-0901',
    channelId: 'd2c',
    channelName: 'Shopify D2C',
    periodStartDate: '2026-09-20',
    periodEndDate: '2026-09-23',
    grossSales: 64200,
    fees: 1284,
    refundDeductions: 0,
    expectedNetSettlement: 62916,
    expectedSettlementDate: '2026-09-26',
    status: 'PENDING_SETTLEMENT'
  },
  {
    id: 'SETTL-2026-0902',
    channelId: 'amazon_fba',
    channelName: 'Amazon FBA',
    periodStartDate: '2026-09-10',
    periodEndDate: '2026-09-24',
    grossSales: 114800,
    fees: 19850,
    refundDeductions: 3444,
    expectedNetSettlement: 91506,
    expectedSettlementDate: '2026-10-08',
    status: 'PENDING_SETTLEMENT'
  },
  {
    id: 'SETTL-2026-0903',
    channelId: 'myntra_ajio',
    channelName: 'Myntra / Ajio',
    periodStartDate: '2026-08-25',
    periodEndDate: '2026-09-24',
    grossSales: 48600,
    fees: 9477,
    refundDeductions: 2430,
    expectedNetSettlement: 36693,
    expectedSettlementDate: '2026-10-24',
    status: 'PENDING_SETTLEMENT'
  }
];

export const initialDemoData = {
  products: demoProducts,
  inventory: demoInventory,
  orders: demoOrders,
  orderItems: demoOrderItems,
  fulfillmentEvents: demoFulfillmentEvents,
  returns: demoReturns,
  adSpend: demoAdSpend,
  decisionsLedger: demoDecisionsLedger,
  promotions: demoPromotions,
  competitorBenchmarks: demoCompetitorBenchmarks,
  suppliers: demoSuppliers,
  purchaseOrders: demoPurchaseOrders,
  channelSettlementRules: demoChannelSettlementRules,
  settlements: demoSettlements,
  warehouses: demoWarehouses
};

