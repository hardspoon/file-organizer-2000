import { UserUsageTable, db } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface SubscriptionStatus {
  subscriptionStatus: string;
  paymentStatus: string;
  currentProduct: string | null;
  billingCycle: string;
  active: boolean;
}

/**
 * Get the subscription status for a user
 * @param userId - The user's ID
 * @returns The user's subscription status
 */
export async function getUserSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  if (!userId) {
    return {
      subscriptionStatus: "inactive",
      paymentStatus: "unpaid",
      currentProduct: null,
      billingCycle: "none",
      active: false
    };
  }

  try {
    // Fetch the user subscription status from the database
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1)
      .execute();

    // If no user usage record found, return default values
    if (!userUsage.length) {
      return {
        subscriptionStatus: "inactive",
        paymentStatus: "unpaid",
        currentProduct: null,
        billingCycle: "none",
        active: false
      };
    }

    // Return the subscription data
    const { subscriptionStatus, paymentStatus, currentProduct, billingCycle } = userUsage[0];

    // Determine if the subscription is active
    // Lifetime licenses are always active
    // Invoice-paid webhook sets subscriptionStatus to Stripe invoice.status ("paid"), not "active"
    const subscriptionOk =
      subscriptionStatus === "active" ||
      subscriptionStatus === "paid" ||
      subscriptionStatus === "succeeded" ||
      subscriptionStatus === "trialing";
    const paymentOk =
      paymentStatus === "paid" ||
      paymentStatus === "succeeded" ||
      paymentStatus === "free";
    const active =
      billingCycle === "lifetime" || (subscriptionOk && paymentOk);

    return {
      subscriptionStatus,
      paymentStatus,
      currentProduct: currentProduct || null,
      billingCycle,
      active
    };
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return {
      subscriptionStatus: "inactive",
      paymentStatus: "error",
      currentProduct: null,
      billingCycle: "none",
      active: false
    };
  }
}
