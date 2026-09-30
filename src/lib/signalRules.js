// Centralized Deterministic Signal Thresholds & Engine Rules

export const SIGNAL_RULES = {
  // Inventory: Coverage runway below replenishment lead time
  STOCKOUT_COVERAGE_RATIO: 1.0, // coverageDays < leadTimeDays

  // Inventory: Excess inventory coverage threshold in days
  EXCESS_COVERAGE_DAYS: 90, // coverageDays > 90

  // Acquisition: Period-over-period CAC increase percentage threshold
  CAC_INCREASE_THRESHOLD_PCT: 15.0, // CAC delta > +15%

  // Commercial / Margin: Gross / Contribution Margin drop in percentage points
  MARGIN_DROP_THRESHOLD_PP: 10.0, // CM delta < -10pp or gross margin delta < -10pp

  // Commercial / Margin: Absolute discount threshold for single SKU in 28-day window
  SKU_DISCOUNT_THRESHOLD_INR: 4000,

  // Customer: SKU Return rate threshold in percent
  SKU_RETURN_RATE_THRESHOLD_PCT: 15.0, // returnRatePct > 15%

  // Fulfillment: Average transit days vs benchmark SLA (1.8 days)
  FULFILLMENT_SLA_DAYS: 1.8,
  FULFILLMENT_DELAYED_THRESHOLD_PCT: 15.0, // lane delayed % > 15%

  // Cross-Functional: Paid media scaling (> +25%) while SKU inventory coverage < supplier lead time
  CROSS_FUNCTIONAL_MEDIA_GROWTH_PCT: 25.0
};
