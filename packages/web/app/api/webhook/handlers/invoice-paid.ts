import { createWebhookHandler } from '../handler-factory';
import { db, UserUsageTable } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { trackLoopsEvent } from '@/lib/services/loops';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

async function resetUserUsageAndSetLastPayment(userId: string) {
  console.log('resetUserUsageAndSetLastPayment', userId);
  // Reset usage to 0 but set max tokens and audio transcription to monthly allotment
  // Preserve remaining top-up tokens (one-time purchases that deplete when used)
  const monthlyTokenLimit = 5000 * 1000; // 5M tokens per month
  await db
    .update(UserUsageTable)
    .set({
      tokenUsage: 0,
      maxTokenUsage: sql`
        ${monthlyTokenLimit} + GREATEST(
          GREATEST(${UserUsageTable.maxTokenUsage} - ${monthlyTokenLimit}, 0) -
          GREATEST(${UserUsageTable.tokenUsage} - ${monthlyTokenLimit}, 0),
          0
        )
      `,
      audioTranscriptionMinutes: 0,
      maxAudioTranscriptionMinutes: 300, // 300 minutes per month for paid users
      lastPayment: new Date(),
    })
    .where(eq(UserUsageTable.userId, userId));
}

export const handleInvoicePaid = createWebhookHandler(
  async (event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('invoice paid', invoice);

    // Try multiple sources for userId metadata:
    // 1. invoice.parent.subscription_details.metadata (newer Stripe API structure)
    // 2. Fetch subscription directly if we have subscription ID
    // 3. invoice.metadata (fallback)
    let userId: string | undefined;
    let metadata: Record<string, string> | undefined;

    // Check parent.subscription_details.metadata first (where it actually is)
    // Note: parent is not in Stripe.Invoice type but exists in webhook payloads
    const invoiceWithParent = invoice as Stripe.Invoice & {
      parent?: {
        subscription_details?: {
          metadata?: Record<string, string>;
        };
      };
    };
    if (invoiceWithParent.parent?.subscription_details?.metadata) {
      metadata = invoiceWithParent.parent.subscription_details.metadata;
      userId = metadata.userId;
    }

    // If not found, try fetching the subscription directly
    if (!userId && invoice.subscription) {
      try {
        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        if (subscription.metadata?.userId) {
          metadata = subscription.metadata;
          userId = subscription.metadata.userId;
        }
      } catch (error) {
        console.warn('Failed to fetch subscription metadata:', error);
      }
    }

    // Fallback to invoice.metadata
    if (!userId && invoice.metadata) {
      metadata = invoice.metadata;
      userId = metadata.userId;
    }

    if (!userId) {
      console.warn(
        'No userId found in invoice metadata, parent.subscription_details.metadata, or subscription metadata'
      );
      return {
        success: true,
        message: 'Skipped invoice without userId',
      };
    }

    if (!metadata) {
      return {
        success: false,
        message: 'No metadata found in invoice',
      };
    }

    // Note: This sets subscription tokens but preserves remaining top-up tokens
    // Top-up tokens are one-time purchases that deplete when used
    const monthlyTokenLimit = 5000 * 1000; // 5M tokens per month
    await db
      .insert(UserUsageTable)
      .values({
        userId: userId,
        subscriptionStatus: invoice.status,
        paymentStatus: invoice.status,
        billingCycle: metadata.type as 'monthly' | 'yearly' | 'lifetime',
        maxTokenUsage: monthlyTokenLimit, // For new users, set to subscription limit
        maxAudioTranscriptionMinutes: 300, // 300 minutes per month for paid users
        lastPayment: new Date(),
        currentProduct: metadata.product,
        currentPlan: metadata.plan,
      })
      .onConflictDoUpdate({
        target: [UserUsageTable.userId],
        set: {
          subscriptionStatus: invoice.status,
          paymentStatus: invoice.status,
          maxTokenUsage: sql`
            ${monthlyTokenLimit} + GREATEST(
              GREATEST(${UserUsageTable.maxTokenUsage} - ${monthlyTokenLimit}, 0) -
              GREATEST(${UserUsageTable.tokenUsage} - ${monthlyTokenLimit}, 0),
              0
            )
          `,
          maxAudioTranscriptionMinutes: 300, // 300 minutes per month for paid users
          billingCycle: metadata.type as 'monthly' | 'yearly' | 'lifetime',
          lastPayment: new Date(),
          currentProduct: metadata.product,
          currentPlan: metadata.plan,
        },
      });

    // Only reset usage for monthly subscriptions
    // Yearly subscriptions get reset by the monthly cron job (they need monthly resets)
    // Lifetime subscriptions don't need resets
    const billingCycle = metadata.type as 'monthly' | 'yearly' | 'lifetime';
    if (billingCycle === 'monthly') {
      await resetUserUsageAndSetLastPayment(userId);
    } else {
      // For yearly/lifetime, just update lastPayment without resetting usage
      // Yearly subscriptions will be reset by the monthly cron on the 1st
      await db
        .update(UserUsageTable)
        .set({
          lastPayment: new Date(),
        })
        .where(eq(UserUsageTable.userId, userId));
    }

    await trackLoopsEvent({
      email: invoice.customer_email || '',
      userId: userId,
      eventName: 'invoice_paid',
      data: {
        amount: invoice.amount_paid,
        product:
          invoice.lines.data[0].price?.metadata?.srm_product_key || 'default',
        plan: invoice.lines.data[0].price?.metadata?.srm_price_key || 'default',
      },
    });

    return {
      success: true,
      message: 'Invoice paid',
    };
  },
  {
    requiredMetadata: [],
  }
);
