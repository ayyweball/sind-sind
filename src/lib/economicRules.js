// Centralized Deterministic Economic Rules & Cost Configuration for Sind & Sind

/**
 * Economic Cost Allocation Bases
 */
export const COST_BASIS = {
  PER_ORDER: 'PER_ORDER',
  PER_UNIT: 'PER_UNIT',
  PERCENT_OF_REALIZED_REVENUE: 'PERCENT_OF_REALIZED_REVENUE',
  PERCENT_OF_LIST_PRICE: 'PERCENT_OF_LIST_PRICE',
  FIXED_PERIOD_COST: 'FIXED_PERIOD_COST',
  ALLOCATED_COST: 'ALLOCATED_COST'
};

/**
 * Data Quality and Provenance Types
 */
export const DATA_QUALITY = {
  OBSERVED: 'Observed Data',
  DEMO_ASSUMPTION: 'Configured Demo Assumption',
  CALCULATED: 'Calculated Value',
  UNAVAILABLE: 'Unavailable Data'
};

/**
 * Standard Fulfilment Model Classifications
 */
export const FULFILMENT_MODELS = {
  SELLER_FULFILLED: {
    id: 'SELLER_FULFILLED',
    name: 'Seller Fulfilled / Direct Warehouse',
    description: 'Orders picked, packed, and dispatched directly from merchant facility with commercial couriers.'
  },
  MARKETPLACE_FULFILLED: {
    id: 'MARKETPLACE_FULFILLED',
    name: 'Marketplace Fulfilled (e.g. FBA / Myntra PPMP)',
    description: 'Inventory pre-inbounded to marketplace fulfillment center; marketplace handles pick, pack, and delivery.'
  },
  MARKETPLACE_COURIER: {
    id: 'MARKETPLACE_COURIER',
    name: 'Seller Pick / Marketplace Courier (e.g. Easy Ship)',
    description: 'Merchant packs goods at own warehouse; marketplace courier collects from warehouse for final delivery.'
  },
  THIRD_PARTY_3PL: {
    id: 'THIRD_PARTY_3PL',
    name: 'Dedicated 3PL Hub',
    description: 'Contract logistics partner manages multi-channel warehousing and forward dispatches.'
  },
  DIRECT_BULK: {
    id: 'DIRECT_BULK',
    name: 'Direct Bulk Freight (B2B Wholesale)',
    description: 'Palletized carton shipments dispatched directly to wholesale distributor or retail store network.'
  }
};

/**
 * Default Economic Assumptions & Fee Configurations for Atelier & Co. Demo Store
 * Note: All assumptions are visibly tagged with DEMO ASSUMPTION in the user interface.
 */
export const DEFAULT_ECONOMIC_ASSUMPTIONS = {
  // Platform / Marketplace Commission Rate
  marketplaceCommissionPct: 0.0, // D2C primary storefront
  marketplaceFixedFeePerOrder: 0.0,

  // Payment Gateway Processing Fee (e.g. Razorpay / Stripe D2C standard)
  paymentProcessingPct: 2.0, // 2.0% of realized order value
  paymentFixedFeePerOrder: 3.0, // ₹3 per transaction

  // Forward Fulfilment & Delivery
  forwardShippingCostPerOrder: 90.0, // ₹90 per forward dispatch
  fulfilmentPerUnit: 0.0, // In-house warehouse handling
  packagingCostPerUnit: 30.0, // ₹30 per unit for bespoke protective packaging

  // Reverse Logistics & Return Processing Costs
  reverseLogisticsPerReturn: 140.0, // ₹140 reverse courier charge per return
  returnRestockingPerReturn: 60.0, // ₹60 inspection, re-bagging and restocking cost per return

  // Other Variable Costs
  customerSupportPerOrder: 15.0 // ₹15 allocated support, tracking, and notification overhead
};

/**
 * Standard Multi-Marketplace Fee Model Architecture (Demonstration Configurations)
 * Allows modeling differing channel economics without hardcoding single universal percentages.
 * Tagged explicitly as [Configured Demo Assumption].
 */
export const MARKETPLACE_CHANNELS = {
  SHOPIFY_D2C: {
    id: 'shopify_d2c',
    name: 'Shopify D2C',
    marketplace: 'Shopify',
    fulfilmentModelId: 'SELLER_FULFILLED',
    fulfilmentModelName: 'Seller Fulfilled / 3PL',
    active: true,
    channelType: 'D2C',
    feeRules: {
      marketplaceCommissionPct: 0.0,
      marketplaceFixedFeePerOrder: 0.0,
      paymentProcessingPct: 2.0,
      paymentFixedFeePerOrder: 3.0,
      forwardShippingCostPerOrder: 90.0,
      fulfilmentPerUnit: 0.0, // Internal warehouse labor
      packagingCostPerUnit: 30.0,
      reverseLogisticsPerReturn: 140.0,
      returnRestockingPerReturn: 60.0,
      customerSupportPerOrder: 15.0,
      expectedDiscountPct: 5.0, // Base promotional allowance
      settlementDelayDays: 3
    },
    operatingNotes: 'Direct customer relationship. No marketplace take-rate; brand bears full payment gateway, forward courier, packaging, and reverse logistics friction.',
    source: DATA_QUALITY.DEMO_ASSUMPTION
  },
  AMAZON_FBA: {
    id: 'amazon_fba',
    name: 'Amazon FBA',
    marketplace: 'Amazon.in',
    fulfilmentModelId: 'MARKETPLACE_FULFILLED',
    fulfilmentModelName: 'Marketplace Fulfilled (FBA)',
    active: true,
    channelType: 'Marketplace',
    feeRules: {
      marketplaceCommissionPct: 14.5, // Standard apparel & accessories referral fee
      marketplaceFixedFeePerOrder: 5.0, // Closing fee tier
      paymentProcessingPct: 0.0, // Included in referral take-rate
      paymentFixedFeePerOrder: 0.0,
      forwardShippingCostPerOrder: 65.0, // FBA pick & pack + weight handling
      fulfilmentPerUnit: 0.0, // Included in FBA fee
      packagingCostPerUnit: 0.0, // Amazon standard box provided
      reverseLogisticsPerReturn: 110.0, // Subsidized reverse courier fee
      returnRestockingPerReturn: 60.0, // FBA return inspection/processing fee
      customerSupportPerOrder: 10.0, // Marketplace handles L1 buyer inquiries
      expectedDiscountPct: 8.0, // Marketplace coupon & Deal of the Day dynamics
      settlementDelayDays: 14
    },
    operatingNotes: 'High customer reach and Prime delivery. 14.5% commission + ₹5 closing fee. Zero external payment gateway charges; packaging bundled in FBA.',
    source: DATA_QUALITY.DEMO_ASSUMPTION
  },
  AMAZON_EASYSHIP: {
    id: 'amazon_easyship',
    name: 'Amazon Easy Ship',
    marketplace: 'Amazon.in',
    fulfilmentModelId: 'MARKETPLACE_COURIER',
    fulfilmentModelName: 'Seller Pick / Marketplace Courier',
    active: true,
    channelType: 'Marketplace',
    feeRules: {
      marketplaceCommissionPct: 14.5,
      marketplaceFixedFeePerOrder: 5.0,
      paymentProcessingPct: 0.0,
      paymentFixedFeePerOrder: 0.0,
      forwardShippingCostPerOrder: 80.0, // Easy Ship weight-slab courier fee
      fulfilmentPerUnit: 0.0,
      packagingCostPerUnit: 30.0, // Merchant must provide branded/unbranded packaging
      reverseLogisticsPerReturn: 130.0,
      returnRestockingPerReturn: 60.0,
      customerSupportPerOrder: 15.0,
      expectedDiscountPct: 6.0,
      settlementDelayDays: 14
    },
    operatingNotes: 'Merchant fulfills from own facility; Amazon Easy Ship manages logistics pickup and transit. Merchant absorbs packaging and standard Easy Ship courier fees.',
    source: DATA_QUALITY.DEMO_ASSUMPTION
  },
  MYNTRA_AJIO: {
    id: 'myntra_ajio',
    name: 'Myntra / Ajio',
    marketplace: 'Myntra',
    fulfilmentModelId: 'MARKETPLACE_FULFILLED',
    fulfilmentModelName: 'Marketplace Managed (PPMP)',
    active: true,
    channelType: 'Fashion Marketplace',
    feeRules: {
      marketplaceCommissionPct: 18.0, // Fashion vertical commission take-rate
      marketplaceFixedFeePerOrder: 0.0,
      paymentProcessingPct: 1.5, // Platform gateway & reconciliation charge
      paymentFixedFeePerOrder: 0.0,
      forwardShippingCostPerOrder: 75.0, // Platform logistics fee
      fulfilmentPerUnit: 0.0,
      packagingCostPerUnit: 20.0,
      reverseLogisticsPerReturn: 160.0, // Higher fashion reverse logistics cost
      returnRestockingPerReturn: 60.0,
      customerSupportPerOrder: 20.0,
      expectedDiscountPct: 12.0, // Category promotional cadence
      settlementDelayDays: 30
    },
    operatingNotes: 'High fashion discovery with premium category take-rate (18.0%) and elevated reverse logistics exposure due to standard fashion return dynamics.',
    source: DATA_QUALITY.DEMO_ASSUMPTION
  },
  B2B_WHOLESALE: {
    id: 'b2b_wholesale',
    name: 'B2B Wholesale',
    marketplace: 'Direct Wholesale',
    fulfilmentModelId: 'DIRECT_BULK',
    fulfilmentModelName: 'Direct Bulk Freight',
    active: true,
    channelType: 'Wholesale',
    feeRules: {
      marketplaceCommissionPct: 0.0,
      marketplaceFixedFeePerOrder: 0.0,
      paymentProcessingPct: 0.5, // NEFT / RTGS banking settlement fee
      paymentFixedFeePerOrder: 0.0,
      forwardShippingCostPerOrder: 35.0, // Palletized bulk unit freight equivalent
      fulfilmentPerUnit: 0.0,
      packagingCostPerUnit: 10.0, // Bulk carton packaging per unit
      reverseLogisticsPerReturn: 0.0, // No-return policy on wholesale purchase orders
      returnRestockingPerReturn: 0.0,
      customerSupportPerOrder: 5.0,
      expectedDiscountPct: 35.0, // Standard wholesale trade margin discount off MSRP
      settlementDelayDays: 45
    },
    operatingNotes: 'Bulk carton distribution to stockists and retail partners. High trade discount (35%) offset by zero commission, minimal payment friction, and zero customer returns.',
    source: DATA_QUALITY.DEMO_ASSUMPTION
  }
};

/**
 * Channel Metric Definitions for Documentation and Tooltips
 */
export const CHANNEL_ECONOMIC_DEFINITIONS = [
  {
    term: 'Marketplace / Channel Take-Rate',
    category: 'Channel Commissions',
    meaning: 'The percentage commission or fixed fee retained by the sales platform or marketplace per transaction.',
    calculation: '(Realized Revenue × Commission %) + Fixed Order Fee',
    included: 'Platform referral fees, listing fees, closing fees.',
    excluded: 'Logistics handling, advertising media spend, gateway fees.',
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  {
    term: 'Fulfilment Model Cost Structure',
    category: 'Logistics & Warehousing',
    meaning: 'The aggregated operational cost of warehousing, picking, packing, and courier transit under the specific channel operating model.',
    calculation: 'Forward Shipping + Fulfilment Labor + Packaging Materials',
    included: 'Pick & pack fees, courier freight, protective boxes, warehouse handling.',
    excluded: 'Customer returns, merchant storage overhead.',
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  {
    term: 'Channel Cost-to-Serve (CTS)',
    category: 'Variable Channel Overhead',
    meaning: 'The sum of all variable costs required to generate, process, fulfill, and support an order on a specific channel.',
    calculation: 'Marketplace Fees + Payment Fees + Forward Shipping + Packaging + Allocated Ads + Return Friction + Support',
    included: 'All variable channel operating friction.',
    excluded: 'Cost of Goods Sold (COGS), general fixed overheads.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Channel True Contribution Value',
    category: 'Operating Profitability',
    meaning: 'The net rupee contribution retained by the business from sales on a specific channel after subtracting COGS and all channel-specific cost-to-serve.',
    calculation: 'Realized Revenue − COGS − Channel Cost-to-Serve',
    included: 'Net retained financial contribution.',
    excluded: 'Corporate overhead, income taxes, depreciation.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Channel True Contribution Margin %',
    category: 'Operating Profitability',
    meaning: 'True contribution value expressed as a percentage of realized revenue on that channel.',
    calculation: '(Channel True Contribution / Realized Revenue) × 100',
    included: 'Percentage profit conversion.',
    excluded: 'None.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Return Logistics Friction Drag',
    category: 'Reverse Logistics',
    meaning: 'The combined cost of reverse courier shipping, inspection, and restocking friction across returned units on the channel.',
    calculation: '(Reverse Courier Freight + Restocking Inspection) × Return Count',
    included: 'Reverse logistics courier charges, grading, repackaging.',
    excluded: 'Customer refund amount (accounted as top-line revenue reversal).',
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  }
];

/**
 * Standard Promotion Type Classifications (Phase 7)
 */
export const PROMOTION_TYPES = {
  PERCENTAGE_DISCOUNT: 'PERCENTAGE_DISCOUNT',
  FIXED_DISCOUNT: 'FIXED_DISCOUNT',
  SALE_PRICE: 'SALE_PRICE',
  COUPON: 'COUPON',
  PLATFORM_PROMOTION: 'PLATFORM_PROMOTION',
  BUNDLE: 'BUNDLE',
  OTHER: 'OTHER'
};

/**
 * Promotion & Discount Funding Sources
 */
export const DISCOUNT_FUNDING_SOURCES = {
  SELLER_FUNDED: 'SELLER_FUNDED',
  PLATFORM_FUNDED: 'PLATFORM_FUNDED',
  CO_FUNDED: 'CO_FUNDED',
  UNSPECIFIED: 'UNSPECIFIED'
};

/**
 * Configurable Pricing & Contribution Thresholds
 * Note: Target margin is configured as a demo benchmark (25%), while minimum unit rupee contribution is an optional configurable parameter.
 */
export const DEFAULT_PRICING_THRESHOLDS = {
  targetContributionMarginPct: 25.0, // Configured benchmark: 25.0% contribution margin floor [DEMO ASSUMPTION]
  minimumUnitContribution: null // Optional: e.g. ₹500/u if configured per SKU/category
};

/**
 * Pricing & Promotion Metric Definitions for Documentation and Tooltips
 */
export const PRICING_ECONOMIC_DEFINITIONS = [
  {
    term: 'Realized Selling Price (ASP)',
    category: 'Revenue Realization',
    meaning: 'Net invoiced price per unit after subtracting all seller and platform promotional discounts from the catalog list price.',
    calculation: 'List Price − Promotional Discount',
    included: 'Item selling price minus coupons, promo codes, and markdown discounts.',
    excluded: 'Sales taxes (GST), post-order refunds.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Configured Contribution Threshold',
    category: 'Margin Protection',
    meaning: 'The management-configured minimum profitability threshold (e.g. 25.0% contribution margin) required for commercial viability.',
    calculation: 'Configured Target Margin % (or optional Minimum Rupee Contribution / unit)',
    included: 'Policy benchmark used for discount headroom and floor breach detection.',
    excluded: 'Automatic pricing rules.',
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  {
    term: 'Discount Headroom',
    category: 'Promotional Capacity',
    meaning: 'The maximum additional rupee discount per unit that can be granted before contribution margin drops below the configured threshold.',
    calculation: 'Current Realized Price − Required Realized Price',
    included: 'Remaining margin buffer above the contribution floor.',
    excluded: 'Volume elasticity or demand reaction.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Required Realized Price',
    category: 'Target Pricing',
    meaning: 'The exact realized selling price required to yield the configured target contribution margin given unit COGS and channel-specific cost-to-serve.',
    calculation: '(COGS + Fixed CTS per Unit) / (1 − Variable CTS Rate − Target Margin %)',
    included: 'Fixed fulfillment, packaging, allocated ads, return friction, and channel take-rates.',
    excluded: 'Arbitrary price suggestions.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Promotion Break-Even Volume Sensitivity',
    category: 'Volume Dynamics',
    meaning: 'The mathematical number of additional units required to offset the rupee contribution lost per unit from discounting [Demand response not modelled].',
    calculation: '(Base Units × Rupee Contribution Lost per Unit) / Promotional Contribution per Unit',
    included: 'Exact financial volume offset requirement.',
    excluded: 'Sales forecasting, conversion predictions.',
    provenance: DATA_QUALITY.CALCULATED
  }
];

/**
 * Standard Supplier Payment Terms (Phase 8)
 */
export const PAYMENT_TERMS = {
  IMMEDIATE: 'IMMEDIATE',
  NET_15: 'NET_15',
  NET_30: 'NET_30',
  NET_45: 'NET_45',
  NET_60: 'NET_60',
  CUSTOM: 'CUSTOM'
};

/**
 * Standard Marketplace Settlement Cycles (Phase 8)
 */
export const SETTLEMENT_CYCLES = {
  DAILY: 'DAILY',
  NET_3: 'NET_3',
  NET_7: 'NET_7',
  NET_14: 'NET_14',
  NET_30: 'NET_30',
  NET_45: 'NET_45',
  CUSTOM: 'CUSTOM'
};

/**
 * Purchase Order Status
 */
export const PO_STATUS = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED'
};

/**
 * Channel Settlement Status
 */
export const SETTLEMENT_STATUS = {
  PENDING_SETTLEMENT: 'PENDING_SETTLEMENT',
  PROCESSING: 'PROCESSING',
  SETTLED: 'SETTLED'
};

/**
 * Configurable Working Capital Operating Thresholds
 */
export const WORKING_CAPITAL_THRESHOLDS = {
  targetCoverageDays: 45, // Target optimal inventory buffer [Configured Demo Assumption]
  excessCoverageDays: 90, // Extended working capital lock threshold [Configured Demo Assumption]
  minimumCoverageRatio: 1.0 // Below lead-time coverage threshold (coverage < leadTime)
};

/**
 * Working Capital & Cash Exposure Metric Definitions for Documentation and Tooltips
 */
export const WORKING_CAPITAL_DEFINITIONS = [
  {
    term: 'Inventory Capital (at Cost)',
    category: 'Asset Valuation',
    meaning: 'The total capital currently tied up in physical on-hand stock valued strictly at manufacturing cost (COGS). Never valued at retail list price or selling ASP.',
    calculation: 'Current Stock Units × Unit COGS',
    included: 'Physical inventory held in central or channel fulfillment hubs.',
    excluded: 'In-transit purchase orders, future commitments, retail markup/profit.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Inventory Coverage Days',
    category: 'Inventory Velocity',
    meaning: 'The estimated number of days of operational demand supported by current physical stock at current average daily sales run-rates.',
    calculation: 'Current Stock Units / Daily Sales Velocity (28d)',
    included: 'Current physical inventory divided by actual observed 28d sales velocity.',
    excluded: 'Speculative seasonal demand increases.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Open Purchase Commitments',
    category: 'Future Obligations',
    meaning: 'Committed future inventory purchases under confirmed or in-transit purchase orders not yet received into physical stock.',
    calculation: 'Sum of (Open PO Units × PO Unit Cost)',
    included: 'Confirmed and in-transit purchase orders.',
    excluded: 'Current on-hand inventory, draft unapproved purchase requests.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Supplier Payment Timing & Credit Float',
    category: 'Payables Timing',
    meaning: 'The outstanding payables owed to manufacturers for completed or in-flight production, governed by supplier credit terms (e.g. Net 30, Net 45).',
    calculation: 'Sum of Outstanding PO Values within agreed supplier payment window',
    included: 'Agreed commercial supplier credit terms.',
    excluded: 'Uncontracted future purchases.',
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  {
    term: 'Marketplace Settlement Exposure',
    category: 'Receivables Timing',
    meaning: 'Gross customer sales recorded on marketplace channels for which cash disbursements have not yet been remitted to the merchant bank account.',
    calculation: 'Gross Sales − Channel Take-Rate Commissions − Platform Logistics − Refund Withholdings',
    included: 'Disbursement backlog across settlement cycle delay windows (e.g. Net 14).',
    excluded: 'Funds already remitted to bank accounts.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Operating Cash Float',
    category: 'Operating Outflow',
    meaning: 'The near-term operating cash required to support ongoing fulfillment, courier shipping, packaging materials, advertising, and customer service.',
    calculation: 'Ad Spend Outflow + Forward Courier Freight + Packaging Materials + Customer Support',
    included: 'All variable operating cash required to service current order volume.',
    excluded: 'Fixed corporate overhead, salary payroll.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Return / Refund Cash Exposure',
    category: 'Liquidity Exposure',
    meaning: 'The direct cash outflow resulting from customer refund processing and reverse courier logistics friction during the open return window.',
    calculation: 'Total Customer Refund Outflow + Reverse Logistics Courier Cost',
    included: 'Actual cash returned to buyers + reverse freight costs paid to logistics carriers.',
    excluded: 'COGS write-down or non-cash inventory adjustments.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Estimated Cash Conversion Exposure',
    category: 'Liquidity Timing',
    meaning: 'An operational estimate of the net days required to convert operational cash outflows back into cash inflows across inventory holding, marketplace settlement delays, and supplier credit terms.',
    calculation: 'Inventory Coverage Days + Settlement Delay Days − Supplier Credit Days',
    included: 'Operational timing of inventory holding, channel settlement, and supplier credit.',
    excluded: 'Audited GAAP/IFRS accounting cash conversion cycle adjustments.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Estimated Net Cash Exposure',
    category: 'Total Exposure',
    meaning: 'The net total operational capital tied up in the business across physical inventory, open commitments, operating float, and return drag, net of pending settlements and supplier credit.',
    calculation: 'Inventory Capital + Open Commitments + Operating Float + Return Exposure − Net Settlement Receivables − Supplier Credit Float',
    included: 'Complete transparent multi-driver cash exposure waterfall.',
    excluded: 'Corporate equity, bank loans, balance sheet cash balances.',
    provenance: DATA_QUALITY.CALCULATED
  }
];

/**
 * Operations & Fulfilment Economics Thresholds [Configured Demo Assumptions]
 */
export const OPERATIONS_THRESHOLDS = {
  // Configured SLA Benchmarks
  targetDispatchDays: 1.0, // Order received to carrier dispatch target
  targetTransitDays: 1.8,  // Carrier dispatch to customer doorstep target
  targetDeliveryDays: 3.0, // Total order-to-delivery target

  // Capacity & Utilization Benchmarks
  targetWarehouseCapacityPct: 75.0,
  excessWarehouseCapacityPct: 85.0,
  criticalWarehouseCapacityPct: 92.0,

  // Service Level Benchmarks
  targetOnTimeDeliveryPct: 92.0,
  criticalOnTimeDeliveryPct: 85.0,

  // Shipping Cost Benchmarks
  maxAcceptableShippingPctOfRevenue: 6.0,

  // Operating Lead Time Buffer
  reorderBufferDays: 5.0
};

/**
 * Standard Multi-Warehouse Configuration for Atelier & Co. Demo Network
 * [Configured Demo Assumption]
 */
export const WAREHOUSE_CONFIGS = {
  WH_BOM: {
    id: 'WH-BOM',
    name: 'Mumbai Central Fulfillment Hub',
    city: 'Mumbai',
    state: 'Maharashtra',
    capacityUnits: 2500,
    dailyProcessingCapacity: 400, // orders/day
    operatingCostPerOrder: 35.0, // ₹35 allocated facility overhead
    pickPackCostPerOrder: 25.0,  // ₹25 labor and handling
    status: 'ACTIVE',
    primaryRegions: ['West', 'Southwest'],
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  WH_DEL: {
    id: 'WH-DEL',
    name: 'Delhi NCR North Distribution Center',
    city: 'Gurugram',
    state: 'Haryana',
    capacityUnits: 2000,
    dailyProcessingCapacity: 300,
    operatingCostPerOrder: 40.0,
    pickPackCostPerOrder: 28.0,
    status: 'ACTIVE',
    primaryRegions: ['North', 'Northwest'],
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  },
  WH_BLR: {
    id: 'WH-BLR',
    name: 'Bengaluru South Regional Hub',
    city: 'Bengaluru',
    state: 'Karnataka',
    capacityUnits: 1500,
    dailyProcessingCapacity: 250,
    operatingCostPerOrder: 38.0,
    pickPackCostPerOrder: 24.0,
    status: 'ACTIVE',
    primaryRegions: ['South', 'Southeast'],
    provenance: DATA_QUALITY.DEMO_ASSUMPTION
  }
};

/**
 * Operations & Fulfilment Economic Definitions Dictionary
 */
export const OPERATIONS_DEFINITIONS = [
  {
    term: 'Warehouse Capacity Utilization',
    category: 'Facility Capacity',
    meaning: 'The percentage of total physical storage space occupied by on-hand inventory units.',
    calculation: '(Current Stock Units / Total Capacity Units) × 100',
    included: 'Physical inventory units stored in active facility racking.',
    excluded: 'In-transit purchase orders and off-site staging inventory.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Daily Processing Utilization',
    category: 'Facility Throughput',
    meaning: 'The percentage of daily fulfillment and dispatch capacity utilized by current order volume.',
    calculation: '(Daily Orders Dispatched / Daily Rated Processing Capacity) × 100',
    included: 'Actual order dispatch volume against rated facility throughput.',
    excluded: 'Inbound receiving labor allocation.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Fulfilment SLA Variance',
    category: 'Service Performance',
    meaning: 'The deviation between actual delivery transit duration and the configured target service level.',
    calculation: 'Actual Delivery Transit Days − Target SLA Days',
    included: 'Doorstep carrier transit tracking records across all fulfilled orders.',
    excluded: 'Pre-order fulfillment holds and customer rescheduling.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Fulfilment Cost per Order',
    category: 'Operating Friction',
    meaning: 'Total variable and allocated facility operating expense required to pick, pack, package, and dispatch an order.',
    calculation: 'Pick & Pack Labor + Packaging Materials + Forward Courier Freight + Allocated Facility Overhead',
    included: 'Direct order handling, packaging box, carrier freight, and warehouse operating overhead.',
    excluded: 'Corporate salaries, marketing acquisition costs.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Shipping Lane Efficiency',
    category: 'Logistics Geography',
    meaning: 'Operational transit performance, courier cost, and return frequency across specific origin warehouse to destination customer regional corridors.',
    calculation: 'Average Transit Days, Delivery Cost per Unit, and SLA Compliance Rate per Origin-Destination Lane',
    included: 'Aggregated parcel performance on specific origin-destination pairs (e.g. Mumbai → Delhi).',
    excluded: 'International bulk freight or import customs.',
    provenance: DATA_QUALITY.CALCULATED
  },
  {
    term: 'Fulfilment-Driven Return Friction',
    category: 'Service Quality',
    meaning: 'Return cases and reverse logistics expenses associated with delayed transit, incorrect picking, or transit packaging damage.',
    calculation: 'Return Rate on Orders with SLA Breaches vs Normal Transit Orders + Reverse Logistics Freight',
    included: 'Observed return rate correlation with transit delays and reverse courier cost.',
    excluded: 'Customer preference or styling returns unrelated to logistics execution.',
    provenance: DATA_QUALITY.CALCULATED
  }
];



