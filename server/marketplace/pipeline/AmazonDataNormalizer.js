// Normalizer: Raw SP-API Payload -> Sind & Sind Canonical Commerce Data Model
import {
  createCanonicalOrder,
  createCanonicalOrderItem,
  createCanonicalInventoryPosition,
  createCanonicalFinancialEvent
} from '../../../src/lib/marketplace/canonicalModels.js';
import { DATA_PROVENANCE_SOURCE, ACCOUNT_TYPES } from '../../../src/lib/marketplace/constants.js';

export class AmazonDataNormalizer {
  static normalizeOrder(rawOrder, { organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in' } = {}) {
    const gross = Number(rawOrder.OrderTotal?.Amount || 0);
    const fulfilmentModel = rawOrder.FulfillmentChannel === 'AFN' ? 'MARKETPLACE_FULFILLED' : 'SELLER_FULFILLED';
    const orderDate = rawOrder.PurchaseDate ? rawOrder.PurchaseDate.split('T')[0] : new Date().toISOString().split('T')[0];

    return createCanonicalOrder({
      id: rawOrder.AmazonOrderId,
      marketplaceOrderId: rawOrder.AmazonOrderId,
      organizationId,
      marketplaceAccountId,
      channel: 'AMAZON',
      accountType: ACCOUNT_TYPES.SELLER_CENTRAL,
      orderDate,
      orderStatus: rawOrder.OrderStatus || 'Shipped',
      fulfilmentModel,
      currency: rawOrder.OrderTotal?.CurrencyCode || 'INR',
      grossAmount: gross,
      discountAmount: 0,
      netRevenue: gross,
      marketplaceFees: 0, // Enriched via financial events / fee estimation
      shippingCharge: 0,
      itemsCount: Number(rawOrder.NumberOfItemsShipped || 1),
      isReturn: false,
      provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
      sourceTimestamp: rawOrder.LastUpdateDate || rawOrder.PurchaseDate || new Date().toISOString()
    });
  }

  static normalizeOrderItem(rawItem, orderId, { organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in' } = {}) {
    const itemPrice = Number(rawItem.ItemPrice?.Amount || 0);
    const discount = Number(rawItem.PromotionDiscount?.Amount || 0);
    const quantity = Number(rawItem.QuantityShipped || rawItem.QuantityOrdered || 1);
    const netRevenue = itemPrice - discount;

    return createCanonicalOrderItem({
      id: rawItem.OrderItemId || `item_${orderId}_${rawItem.SellerSKU}`,
      orderId,
      productId: rawItem.SellerSKU || rawItem.ASIN,
      sku: rawItem.SellerSKU || '',
      title: rawItem.Title || 'Amazon Product',
      asin: rawItem.ASIN || '',
      quantity,
      listPrice: itemPrice / quantity,
      discount,
      netRevenue,
      cogs: 0, // COGS resolved from catalog master
      marketplaceFee: 0,
      fulfilmentFee: 0,
      shippingCost: 0,
      provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED
    });
  }

  static normalizeInventorySummary(rawSummary, { organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in', catalogCosts = {} } = {}) {
    const sku = rawSummary.sellerSku || rawSummary.asin;
    const details = rawSummary.inventoryDetails || {};
    const fulfillable = Number(details.fulfillableQuantity || 0);
    const inbound = Number((details.inboundWorkingQuantity || 0) + (details.inboundShippedQuantity || 0) + (details.inboundReceivingQuantity || 0));
    const reserved = Number(details.reservedQuantity?.totalReservedQuantity || 0);
    const unfulfillable = Number(details.unfulfillableQuantity?.totalUnfulfillableQuantity || 0);
    const unitCost = Number(catalogCosts[sku] || 450); // Mapped against product catalog cost

    return createCanonicalInventoryPosition({
      sku,
      asin: rawSummary.asin || '',
      title: rawSummary.productName || sku,
      fulfillableQuantity: fulfillable,
      inboundQuantity: inbound,
      reservedQuantity: reserved,
      unfulfillableQuantity: unfulfillable,
      totalUnits: fulfillable + inbound + reserved,
      unitCost,
      inventoryCapitalAtCost: fulfillable * unitCost,
      fulfilmentType: 'FBA',
      locationNode: 'Amazon FBA Fulfillment Center',
      provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
      lastUpdated: new Date().toISOString()
    });
  }

  static normalizeFinancialEvents(rawEventsPayload, { organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in' } = {}) {
    const events = [];
    const rawShipments = rawEventsPayload.FinancialEvents?.ShipmentEventList || [];
    const rawRefunds = rawEventsPayload.FinancialEvents?.RefundEventList || [];

    for (const shipment of rawShipments) {
      let totalAmount = 0;
      const feeComponents = [];

      for (const item of shipment.ShipmentItemList || []) {
        for (const charge of item.ItemChargeList || []) {
          totalAmount += Number(charge.ChargeAmount?.CurrencyAmount || 0);
        }
        for (const fee of item.ItemFeeList || []) {
          const feeAmount = Number(fee.FeeAmount?.CurrencyAmount || 0);
          totalAmount += feeAmount; // fees are negative
          feeComponents.push({
            type: fee.FeeType,
            amount: feeAmount,
            currency: fee.FeeAmount?.CurrencyCode || 'INR'
          });
        }
      }

      events.push(createCanonicalFinancialEvent({
        eventId: `fin_ship_${shipment.AmazonOrderId}`,
        eventType: 'ShipmentEvent',
        orderId: shipment.AmazonOrderId,
        postedDate: shipment.PostedDate || new Date().toISOString(),
        amount: totalAmount,
        currency: 'INR',
        feeComponents,
        description: `Shipment settlement for Amazon Order ${shipment.AmazonOrderId}`,
        provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED
      }));
    }

    for (const refund of rawRefunds) {
      let totalAmount = 0;
      const feeComponents = [];

      for (const item of refund.ShipmentItemAdjustmentList || []) {
        for (const charge of item.ItemChargeAdjustmentList || []) {
          totalAmount += Number(charge.ChargeAmount?.CurrencyAmount || 0);
        }
        for (const fee of item.ItemFeeAdjustmentList || []) {
          const feeAmount = Number(fee.FeeAmount?.CurrencyAmount || 0);
          totalAmount += feeAmount;
          feeComponents.push({
            type: fee.FeeType,
            amount: feeAmount,
            currency: fee.FeeAmount?.CurrencyCode || 'INR'
          });
        }
      }

      events.push(createCanonicalFinancialEvent({
        eventId: `fin_ref_${refund.AmazonOrderId}`,
        eventType: 'RefundEvent',
        orderId: refund.AmazonOrderId,
        postedDate: refund.PostedDate || new Date().toISOString(),
        amount: totalAmount,
        currency: 'INR',
        feeComponents,
        description: `Refund adjustment for Amazon Order ${refund.AmazonOrderId}`,
        provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED
      }));
    }

    return events;
  }

  static normalizeVendorPurchaseOrder(rawPO, { organizationId = 'org_atelier', marketplaceAccountId = 'mkt_amazon_in' } = {}) {
    const totalAmount = Number(rawPO.orderDetails?.orderTotal?.amount || 0);
    const orderDate = rawPO.purchaseOrderDate ? rawPO.purchaseOrderDate.split('T')[0] : new Date().toISOString().split('T')[0];

    return createCanonicalOrder({
      id: rawPO.purchaseOrderNumber,
      marketplaceOrderId: rawPO.purchaseOrderNumber,
      organizationId,
      marketplaceAccountId,
      channel: 'AMAZON',
      accountType: ACCOUNT_TYPES.VENDOR_CENTRAL,
      orderDate,
      orderStatus: rawPO.purchaseOrderStatus || 'Acknowledged',
      fulfilmentModel: 'VENDOR_DIRECT',
      currency: rawPO.orderDetails?.currencyCode || 'INR',
      grossAmount: totalAmount,
      discountAmount: 0,
      netRevenue: totalAmount,
      marketplaceFees: 0,
      shippingCharge: 0,
      itemsCount: (rawPO.orderDetails?.items || []).length,
      isReturn: false,
      provenance: DATA_PROVENANCE_SOURCE.AMAZON_OBSERVED,
      sourceTimestamp: rawPO.purchaseOrderDate || new Date().toISOString()
    });
  }
}
