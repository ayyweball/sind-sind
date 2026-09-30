// Ingestion Payload Validation for Raw SP-API Responses

export class RawIngestionValidator {
  static validateOrder(rawOrder) {
    const errors = [];
    if (!rawOrder || typeof rawOrder !== 'object') {
      return { valid: false, errors: ['Order payload must be a non-null object'] };
    }

    if (!rawOrder.AmazonOrderId && !rawOrder.purchaseOrderNumber) {
      errors.push('Missing unique order identifier (AmazonOrderId / purchaseOrderNumber)');
    }

    if (!rawOrder.PurchaseDate && !rawOrder.purchaseOrderDate && !rawOrder.orderDetails?.orderDate) {
      errors.push('Missing purchase date timestamp');
    }

    if (rawOrder.OrderTotal && isNaN(Number(rawOrder.OrderTotal.Amount))) {
      errors.push(`Invalid OrderTotal amount: ${rawOrder.OrderTotal.Amount}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateInventory(rawSummary) {
    const errors = [];
    if (!rawSummary || typeof rawSummary !== 'object') {
      return { valid: false, errors: ['Inventory payload must be an object'] };
    }

    if (!rawSummary.sellerSku && !rawSummary.asin) {
      errors.push('Missing sellerSku or asin identifier');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateFinancialEvents(rawEvents) {
    const errors = [];
    if (!rawEvents || typeof rawEvents !== 'object') {
      return { valid: false, errors: ['FinancialEvents payload must be an object'] };
    }
    return { valid: true, errors };
  }
}
