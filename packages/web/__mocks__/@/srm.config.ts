export const PRODUCTS = {
  SubscriptionMonthly: {
    metadata: {
      type: "subscription" as const,
      plan: "monthly" as const,
    },
  },
  SubscriptionYearly: {
    metadata: {
      type: "subscription" as const,
      plan: "yearly" as const,
    },
  },
  PayOnceTopUp: {
    metadata: {
      type: "pay-once" as const,
      plan: "top_up" as const,
    },
  },
} as const;

