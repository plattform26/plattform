import prisma from '../src/lib/prisma';

async function listPlans() {
  const plans = await prisma.platformPlan.findMany();
  console.log('--- PLATFORM PLANS ---');
  plans.forEach(p => {
    console.log(`ID: ${p.id} | Name: ${p.name} | Display: ${p.displayName} | Price: ${p.monthlyPrice}`);
  });
}

listPlans();
