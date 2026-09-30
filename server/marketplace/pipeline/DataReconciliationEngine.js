// Data Reconciliation & Discrepancy Detection Engine
import { DATA_PROVENANCE_SOURCE } from '../../../src/lib/marketplace/constants.js';

export class DataReconciliationEngine {
  static reconcileOrdersWithFinances(orders, financialEvents) {
    const settlementMap = new Map();
    for (const event of financialEvents) {
      if (event.orderId) {
        if (!settlementMap.has(event.orderId)) {
          settlementMap.set(event.orderId, []);
        }
        settlementMap.get(event.orderId).push(event);
      }
    }

    const discrepancies = [];
    let totalSettled = 0;
    let totalUnsettled = 0;
    let feeDiscrepancyAmount = 0;

    for (const order of orders) {
      const events = settlementMap.get(order.marketplaceOrderId || order.id);
      if (!events || events.length === 0) {
        discrepancies.push({
          type: 'UNSETTLED_ORDER',
          orderId: order.marketplaceOrderId || order.id,
          orderDate: order.orderDate,
          grossAmount: order.grossAmount,
          severity: 'MEDIUM',
          explanation: 'Order has shipped on Amazon but no financial settlement event has been posted in the current settlement cycle.'
        });
        totalUnsettled += order.grossAmount;
      } else {
        totalSettled += order.grossAmount;
        // Check for fee discrepancy
        const netSettled = events.reduce((sum, e) => sum + e.amount, 0);
        const expectedNet = order.grossAmount - (order.grossAmount * 0.15 + 125); // Estimated fee baseline
        const variance = Math.abs(netSettled - expectedNet);
        if (variance > 100) {
          discrepancies.push({
            type: 'FEE_VARIANCE',
            orderId: order.marketplaceOrderId || order.id,
            expectedNet,
            actualNetSettled: netSettled,
            variance,
            severity: variance > 300 ? 'HIGH' : 'LOW',
            explanation: `Actual settled payout (${netSettled.toFixed(2)}) deviates from standard fee estimate (${expectedNet.toFixed(2)}) by INR ${variance.toFixed(2)}.`
          });
          feeDiscrepancyAmount += variance;
        }
      }
    }

    return {
      totalOrdersEvaluated: orders.length,
      settledOrdersCount: orders.length - discrepancies.filter(d => d.type === 'UNSETTLED_ORDER').length,
      unsettledOrdersCount: discrepancies.filter(d => d.type === 'UNSETTLED_ORDER').length,
      totalSettledAmount: totalSettled,
      totalUnsettledAmount: totalUnsettled,
      feeDiscrepancyAmount,
      discrepancies,
      reconciliationRatePercent: orders.length > 0 ? ((orders.length - discrepancies.filter(d => d.type === 'UNSETTLED_ORDER').length) / orders.length) * 100 : 100
    };
  }

  static reconcileInventory(canonicalPositions, localStock = {}) {
    const variances = [];

    for (const pos of canonicalPositions) {
      const localUnits = localStock[pos.sku] !== undefined ? localStock[pos.sku] : pos.fulfillableQuantity;
      const fbaUnits = pos.fulfillableQuantity;
      const difference = fbaUnits - localUnits;

      if (difference !== 0) {
        variances.push({
          sku: pos.sku,
          localUnits,
          fbaUnits,
          difference,
          inboundUnits: pos.inboundQuantity,
          reservedUnits: pos.reservedQuantity,
          unfulfillableUnits: pos.unfulfillableQuantity,
          capitalImpact: Math.abs(difference) * (pos.unitCost || 450),
          severity: Math.abs(difference) > 20 ? 'HIGH' : 'LOW',
          explanation: difference < 0 
            ? `FBA available stock (${fbaUnits}) is lower than local warehouse record (${localUnits}). Possible inbound delay or unrecorded shrinkage.`
            : `FBA stock exceeds local ERP count.`
        });
      }
    }

    return {
      skusEvaluated: canonicalPositions.length,
      variancesCount: variances.length,
      variances,
      inventoryHealthStatus: variances.length === 0 ? 'SYNCHRONIZED' : variances.length < 3 ? 'MODERATE_VARIANCE' : 'HIGH_DISCREPANCY'
    };
  }
}
