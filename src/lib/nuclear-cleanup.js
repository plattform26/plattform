const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'diego.castellanos.maya@hotmail.com';
  console.log(`--- NUCLEAR CLEANUP: ${email} ---`);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('Usuario no encontrado. El sistema ya está limpio.');
    process.exit(0);
  }

  const userId = user.id;

  // Deletion in order to respect dependencies if cascade is not perfect
  await prisma.verificationToken.deleteMany({ where: { email } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.systemAlert.deleteMany({ where: { message: { contains: userId } } }); // Just in case
  
  // Tables linked to profile
  const profile = await prisma.instructorProfile.findUnique({ where: { userId } });
  if (profile) {
      await prisma.instructorSubscription.deleteMany({ where: { instructorId: profile.id } });
      await prisma.instructorSubscriptionHistory.deleteMany({ where: { instructorId: profile.id } });
  }

  // Enrollment and progress
  await prisma.enrollment.deleteMany({ where: { userId } });
  await prisma.progress.deleteMany({ where: { userId } });
  await prisma.quizAttempt.deleteMany({ where: { userId } });
  await prisma.certification.deleteMany({ where: { userId } });

  // Transactions
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.subscriptionRecord.deleteMany({ where: { userId } });

  // Delete User (Cascades InstructorProfile if configured)
  await prisma.user.delete({ where: { id: userId } });

  console.log('--- BORRADO EXITOSO ---');

  const check = await prisma.user.findUnique({ where: { email } });
  if (check === null) {
    console.log('CONFIRMACIÓN: findUnique devolvió NULL.');
  }
}

main()
  .catch((e) => {
    console.error('Error durante la limpieza:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
