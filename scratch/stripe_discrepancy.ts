
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-03-25.dahlia' as any,
});

async function findDiscrepancies() {
  console.log('--- CHECKING FOR DISCREPANCIES (STRIPE vs DB) ---');

  try {
    // 1. Get recent charges from Stripe
    const charges = await stripe.charges.list({ limit: 50 });
    console.log(`Fetched ${charges.data.length} recent charges from Stripe.`);

    // 2. Get all stripe IDs from our DB
    const txs = await prisma.transaction.findMany({
      select: { stripePaymentIntentId: true, stripeSessionId: true }
    });
    const subRecords = await prisma.subscriptionRecord.findMany({
      select: { stripeSubscriptionId: true }
    });

    const dbStripeIds = new Set([
      ...txs.map(t => t.stripePaymentIntentId).filter(Boolean),
      ...txs.map(t => t.stripeSessionId).filter(Boolean)
    ]);

    // For subscriptions, we might need to check if the charge belongs to a subscription
    // that we have recorded.
    
    let discrepancies = 0;
    for (const charge of charges.data) {
      if (charge.status !== 'succeeded') continue;
      
      const piId = charge.payment_intent as string;
      const amount = charge.amount / 100;
      const date = new Date(charge.created * 1000).toISOString();

      if (!dbStripeIds.has(piId)) {
        // Double check if it's a subscription charge (which might be recorded by subscription ID)
        // In our DB, Transaction table stores stripePaymentIntentId for subscription renewals too (based on webhook code).
        
        console.warn(`[!] DISCREPANCY: Charge ${charge.id} (PI: ${piId}) of $${amount} ${charge.currency} on ${date} NOT found in DB.`);
        discrepancies++;
      }
    }

    if (discrepancies === 0) {
      console.log('✅ No discrepancies found in the last 50 successful charges.');
    } else {
      console.log(`❌ Found ${discrepancies} charges in Stripe that are missing in Supabase.`);
    }

  } catch (err: any) {
    console.error('Error fetching from Stripe:', err.message);
  }

  console.log('--- DISCREPANCY CHECK COMPLETED ---');
}

findDiscrepancies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
