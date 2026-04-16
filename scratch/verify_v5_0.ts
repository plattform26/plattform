import { getEffectivePlan } from '../src/lib/plan-utils';
import prisma from '../src/lib/prisma';

async function verify() {
  const diego = await prisma.user.findUnique({
    where: { email: 'azulno26@hotmail.com' }
  });

  if (!diego) {
    console.log('Diego not found.');
    return;
  }

  console.log(`--- VERIFYING DIEGO (${diego.id}) ---`);
  
  // 1. Current Plan
  const current = await getEffectivePlan(diego.id);
  console.log('Current Effective Plan:', current?.name || 'NONE');

  // 2. Simulate NOT Courtesy
  console.log('\n--- SIMULATING REVERSION (isCourtesy: false) ---');
  const starterPlan = (await prisma.platformPlan.findFirst({
        where: { name: { contains: 'STARTER', mode: 'insensitive' } }
      }))?.name || 'STARTER';
      
  console.log(`Expectation: If I toggle isCourtesy off, it should return ${starterPlan} or Stripe.`);
  
  // 3. Test API Logic for Audit
  console.log('\n--- TESTING AUDIT API LOGIC ---');
  try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: diego.id },
        include: { course: true }
      });
      console.log(`Found ${enrollments.length} enrollments for Diego.`);
      for (const en of enrollments) {
          const completed = await prisma.progress.count({
              where: { userId: diego.id, courseId: en.courseId, completed: true }
          });
          console.log(`Course: ${en.course.title} | Completed: ${completed}`);
      }
  } catch (err) {
      console.error('Audit Logic Error:', err);
  }
}

verify();
