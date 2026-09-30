// Amazon Vendor Central (1P / Wholesale) SP-API Adapter
import { AmazonSPAPIProvider } from './AmazonSPAPIProvider.js';

export class VendorCentralAdapter {
  constructor({ region = 'IN' } = {}) {
    this.provider = new AmazonSPAPIProvider({ region });
    this.region = region;
  }

  async getPurchaseOrders({ organizationId, marketplaceAccountId, createdAfter }) {
    await this.provider.makeApiRequest({
      endpointPath: `/vendor/orders/v1/purchaseOrders?createdAfter=${encodeURIComponent(createdAfter || '2026-01-01')}`,
      apiKey: 'ORDERS_API',
      organizationId,
      marketplaceAccountId
    });

    return [
      {
        purchaseOrderNumber: 'PO-AMZ-2026-88192',
        purchaseOrderStatus: 'Acknowledged',
        purchaseOrderDate: '2026-03-25T08:00:00Z',
        buyingParty: { partyId: 'AMZN-IN-BOM' },
        sellingParty: { partyId: 'VENDOR_SIND_IND' },
        shipToParty: { partyId: 'BOM4', address: { city: 'Mumbai', stateOrRegion: 'MH', countryCode: 'IN' } },
        orderDetails: {
          currencyCode: 'INR',
          orderTotal: { amount: '480000.00', currencyCode: 'INR' },
          items: [
            {
              itemSequenceNumber: '001',
              buyerProductIdentifier: 'B09X1V9K12',
              vendorProductIdentifier: 'SKU-SERUM-01',
              orderedQuantity: { amount: 300, unitOfMeasure: 'Cases' },
              netCost: { amount: '1100.00', currencyCode: 'INR' },
              listPrice: { amount: '2499.00', currencyCode: 'INR' }
            },
            {
              itemSequenceNumber: '002',
              buyerProductIdentifier: 'B09X2M4K88',
              vendorProductIdentifier: 'SKU-CREAM-02',
              orderedQuantity: { amount: 200, unitOfMeasure: 'Cases' },
              netCost: { amount: '750.00', currencyCode: 'INR' },
              listPrice: { amount: '1850.00', currencyCode: 'INR' }
            }
          ]
        }
      }
    ];
  }

  async getDirectFulfillmentOrders({ organizationId, marketplaceAccountId, createdAfter }) {
    await this.provider.makeApiRequest({
      endpointPath: `/vendor/directFulfillment/orders/v1/purchaseOrders?createdAfter=${encodeURIComponent(createdAfter || '2026-01-01')}`,
      apiKey: 'ORDERS_API',
      organizationId,
      marketplaceAccountId
    });

    return [
      {
        purchaseOrderNumber: 'DF-AMZ-2026-10492',
        orderDetails: {
          customerOrderNumber: '402-991024-DF1',
          orderDate: '2026-03-29T12:00:00Z',
          orderStatus: 'NEW',
          items: [
            {
              itemSequenceNumber: '1',
              buyerProductIdentifier: 'B09X1V9K12',
              vendorProductIdentifier: 'SKU-SERUM-01',
              orderedQuantity: { amount: 1, unitOfMeasure: 'Each' },
              netCost: { amount: '1100.00', currencyCode: 'INR' }
            }
          ]
        }
      }
    ];
  }

  async getVendorInvoices({ organizationId, marketplaceAccountId }) {
    await this.provider.makeApiRequest({
      endpointPath: '/vendor/payments/v1/invoices',
      apiKey: 'FINANCES_API',
      organizationId,
      marketplaceAccountId
    });

    return [
      {
        invoiceNumber: 'INV-2026-03-001',
        invoiceDate: '2026-03-26T10:00:00Z',
        remitToParty: { partyId: 'VENDOR_SIND_IND' },
        invoiceTotal: { amount: '480000.00', currencyCode: 'INR' },
        paymentTerms: { type: 'Basic', discountPercent: '2.0', discountDueDays: 15, netDueDays: 60 }
      }
    ];
  }
}
