import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditInstructor() {
  const email = 'diana.garflo@hotmail.com';
  console.log(`--- AUDITORÍA INSTRUCTOR: ${email} ---`);

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        instructorProfile: {
          include: {
            subscriptions: {
              include: { plan: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        courtesyPlan: true
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado.');
      return;
    }

    console.log('\n[1. USER DATA]');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`isCourtesy: ${user.isCourtesy}`);
    console.log(`courtesyPlanId: ${user.courtesyPlanId}`);
    console.log(`Plan Cortesía Name: ${user.courtesyPlan?.displayName || 'N/A'}`);

    console.log('\n[2. INSTRUCTOR PROFILE]');
    if (user.instructorProfile) {
      console.log(`Profile ID: ${user.instructorProfile.id}`);
      // Nota: ip.isPlan e ip.planType no existen en el schema actual de Prisma según lo visto antes, 
      // pero revisaré el objeto completo por si acaso.
      console.log(`Academy Name: ${user.instructorProfile.academyName}`);
    } else {
      console.log('❌ No tiene instructor_profile.');
    }

    console.log('\n[3. SUBSCRIPTIONS]');
    if (user.instructorProfile?.subscriptions && user.instructorProfile.subscriptions.length > 0) {
      const sub = user.instructorProfile.subscriptions[0];
      console.log(`Tier (Plan Name): ${sub.plan.name}`);
      console.log(`Display Name: ${sub.plan.displayName}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Expires At: ${sub.expiresAt}`);
      console.log(`Stripe Sub ID: ${sub.stripeSubscriptionId || 'N/A'}`);
    } else {
      console.log('ℹ️ No tiene instructor_subscriptions registradas.');
    }

  } catch (error) {
    console.error('❌ Error durante la auditoría:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditInstructor();
