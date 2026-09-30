// Canonical Commerce Data Model Builders for Sind & Sind

import { DATA_PROVENANCE_SOURCE } from './constants.js';

export function createCanonicalOrder(data = {}) {
  return {
    id: data.id || data.orderId || '',
    marketplaceOrderId: data.marketplaceOrderId || data.amazonOrderId || data.id || '',
    organizationId: data.organizationId || 'org_atelier',
    marketplaceAccountId: data.marketplaceAccountId || 'mkt_amazon_in',
    channel: data.channel || 'AMAZON',
    accountType: data.accountType || 'SELLER_CENTRAL',
    orderDate: data.orderDate || data.purchaseDate || new Date().toISOString().split('T')[0],
    orderStatus: data.orderStatus || 'Shipped',
    fulfilmentModel: data.fulfilmentModel || 'MARKETPLACE_FULFILLED', // FBA | SELLER_FULFILLED
    currency: data.currency || 'INR',
    grossAmount: Number(data.grossAmount || data.orderTotal || 0),
    discountAmount: Number(data.discountAmount || 0),
    netRevenue: Number(data.netRevenue || (data.grossAmount - (data.discountAmount || 0))),
    marketplaceFees: Number(data.marketplaceFees || 0),
    shippingCharge: Number(data.shippingCharge || 0),
    itemsCount: Number(data.itemsCount || 1),
    isReturn: Boolean(data.isReturn || false),
    provenance: data.provenance || DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
    sourceTimestamp: data.sourceTimestamp || new Date().toISOString()
  };
}

export function createCanonicalOrderItem(data = {}) {
  return {
    id: data.id || `item_${data.orderId}_${data.sku}`,
    orderId: data.orderId || '',
    productId: data.productId || data.sku || '',
    sku: data.sku || '',
    title: data.title || data.name || '',
    asin: data.asin || '',
    quantity: Number(data.quantity || 1),
    listPrice: Number(data.listPrice || data.itemPrice || 0),
    discount: Number(data.discount || 0),
    netRevenue: Number(data.netRevenue || ((data.listPrice || 0) * (data.quantity || 1) - (data.discount || 0))),
    cogs: Number(data.cogs || 0),
    marketplaceFee: Number(data.marketplaceFee || 0),
    fulfilmentFee: Number(data.fulfilmentFee || 0),
    shippingCost: Number(data.shippingCost || 0),
    provenance: data.provenance || DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED
  };
}

export function createCanonicalInventoryPosition(data = {}) {
  return {
    sku: data.sku || '',
    asin: data.asin || '',
    title: data.title || '',
    fulfillableQuantity: Number(data.fulfillableQuantity || data.available || 0),
    inboundQuantity: Number(data.inboundQuantity || data.inbound || 0),
    reservedQuantity: Number(data.reservedQuantity || data.reserved || 0),
    unfulfillableQuantity: Number(data.unfulfillableQuantity || 0),
    totalUnits: Number(data.totalUnits || (data.fulfillableQuantity || 0) + (data.inboundQuantity || 0) + (data.reservedQuantity || 0)),
    unitCost: Number(data.unitCost || 0),
    inventoryCapitalAtCost: Number(data.inventoryCapitalAtCost || ((data.fulfillableQuantity || 0) * (data.unitCost || 0))),
    fulfilmentType: data.fulfilmentType || 'FBA',
    locationNode: data.locationNode || 'Amazon FC (BOM)',
    provenance: data.provenance || DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
    lastUpdated: data.lastUpdated || new Date().toISOString()
  };
}

export function createCanonicalFinancialEvent(data = {}) {
  return {
    eventId: data.eventId || `fin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventType: data.eventType || 'ShipmentEvent', // ShipmentEvent | RefundEvent | ServiceFeeEvent | GuaranteeClaimEvent
    orderId: data.orderId || '',
    postedDate: data.postedDate || new Date().toISOString(),
    amount: Number(data.amount || 0),
    currency: data.currency || 'INR',
    feeComponents: data.feeComponents || [],
    description: data.description || 'Amazon Marketplace Order Settlement Event',
    provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED
  };
}
