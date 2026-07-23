
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
  console.log('--- STARTING PAYMENT AUDIT ---');

  // 1. Audit Transactions (Course Purchases and Subscriptions)
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Total Transactions in DB: ${transactions.length}`);

  const summary = transactions.reduce((acc: any, tx) => {
    const type = tx.paymentType || 'UNKNOWN';
    if (!acc[type]) acc[type] = { count: 0, totalGross: 0, missingIds: 0 };
    acc[type].count++;
    acc[type].totalGross += Number(tx.grossAmount);
    if (!tx.stripePaymentIntentId && !tx.stripeSessionId) {
      acc[type].missingIds++;
    }
    return acc;
  }, {});

  console.log('Transaction Summary by Type:', JSON.stringify(summary, null, 2));

  // 2. Audit Instructor Subscriptions
  const subscriptions = await prisma.instructorSubscription.findMany({
    include: { plan: true, instructor: { include: { user: true } } }
  });

  console.log(`Total Instructor Subscriptions: ${subscriptions.length}`);
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  console.log(`Active Subscriptions: ${activeSubs.length}`);

  const subSummary = activeSubs.map(s => ({
    instructor: s.instructor.user.email,
    plan: s.plan.name,
    status: s.status,
    stripeSubscriptionId: s.stripeSubscriptionId,
    expiresAt: s.expiresAt
  }));

  console.log('Active Subscription Details:', JSON.stringify(subSummary, null, 2));

  // 3. Check for SubscriptionRecords
  const subRecords = await prisma.subscriptionRecord.findMany();
  console.log(`Total Subscription Records (Payments): ${subRecords.length}`);
  
  const recordsSummary = subRecords.reduce((acc: any, rec) => {
    acc.totalPaid += Number(rec.amountPaid);
    if (!rec.stripeSubscriptionId) acc.missingStripeId++;
    return acc;
  }, { totalPaid: 0, missingStripeId: 0 });

  console.log('Subscription Records Summary:', JSON.stringify(recordsSummary, null, 2));

  // 4. Verification Plan for Commissions (Logic Check)
  const plans = await prisma.platformPlan.findMany();
  console.log('\n--- COMMISSION CALCULATION (Theoretical) ---');
  plans.forEach(plan => {
    const price = Number(plan.monthlyPrice);
    const stripeFee = (price * 0.036) + 3;
    const netAfterStripe = price - stripeFee;
    console.log(`Plan ${plan.displayName}: Price $${price} -> Stripe Fee $${stripeFee.toFixed(2)} -> Net $${netAfterStripe.toFixed(2)}`);
  });

  console.log('--- AUDIT COMPLETED ---');
}

audit()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
