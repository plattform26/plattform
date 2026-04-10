const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function fix() {
  // Find the instructor profile
  const profile = await p.instructorProfile.findFirst();
  console.log('Profile:', profile?.id, profile?.academyName);

  if (!profile) {
    console.log('No profile found');
    return;
  }

  // Find Growth plan
  const plan = await p.platformPlan.findUnique({ where: { name: 'growth' } });
  console.log('Plan:', plan?.id, plan?.displayName);

  if (!plan) {
    console.log('No plan found');
    return;
  }

  // Delete existing subscriptions
  await p.instructorSubscription.deleteMany({ where: { instructorId: profile.id } });

  // Create a new ACTIVE subscription
  const sub = await p.instructorSubscription.create({
    data: {
      instructorId: profile.id,
      planId: plan.id,
      status: 'ACTIVE',
      startedAt: new Date(),
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }
  });

  console.log('Created subscription:', sub.id, sub.status);
}

fix()
  .catch(e => console.error('Error:', e.message))
  .finally(() => p.$disconnect());
