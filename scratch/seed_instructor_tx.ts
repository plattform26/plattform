import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'alejandro@plattform.com' },
    include: { instructorProfile: { include: { subscriptions: { include: { plan: true } } } } }
  });

  if (!user) {
    console.error('Error: No se encontró al instructor Alejandro.');
    return;
  }

  const subscription = user.instructorProfile?.subscriptions[0];
  if (!subscription) {
     console.error('Error: Alejandro no tiene una suscripción activa.');
     return;
  }

  const planName = subscription.plan.displayName;
  const planPrice = subscription.plan.monthlyPrice;

  console.log(`Creando transacción para ${user.name} (${planName}) por $${planPrice}...`);

  const tx = await prisma.transaction.create({
    data: {
      userId: user.id,
      paymentType: 'INSTRUCTOR_SUBSCRIPTION',
      grossAmount: planPrice,
      platformCommissionAmount: 0,
      netAmountToInstructor: 0,
      paymentStatus: 'SUCCESS',
      paymentProvider: 'STRIPE',
      stripePaymentIntentId: 'pi_manual_test_diag_' + Date.now(),
      createdAt: new Date(),
    }
  });

  console.log(`✓ Transacción creada exitosamente. ID: ${tx.id}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
