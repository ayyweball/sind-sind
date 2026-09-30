// Abstract Base Class for Marketplace Providers (Amazon, Shopify, Flipkart, etc.)

export class MarketplaceProvider {
  constructor(providerName) {
    this.providerName = providerName;
  }

  async testConnection(credentials) {
    throw new Error('testConnection() must be implemented by provider');
  }

  async fetchOrders(params) {
    throw new Error('fetchOrders() must be implemented by provider');
  }

  async fetchOrderItems(orderId, params) {
    throw new Error('fetchOrderItems() must be implemented by provider');
  }

  async fetchInventory(params) {
    throw new Error('fetchInventory() must be implemented by provider');
  }

  async fetchFinancialEvents(params) {
    throw new Error('fetchFinancialEvents() must be implemented by provider');
  }

  async fetchFeeEstimates(skus, params) {
    throw new Error('fetchFeeEstimates() must be implemented by provider');
  }
}
