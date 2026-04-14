import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emails = ['diego.castellanos.maya@hotmail.com', 'azulno26@hotmail.com'];

  for (const email of emails) {
    console.log(`--- Investigating email: ${email} ---`);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        instructorProfile: {
          include: {
            subscriptions: true,
            subscriptionHistory: true,
          }
        },
        enrollments: true,
        transactions: true,
        progressRecords: true,
        quizAttempts: true,
        certifications: true,
        subscriptionRecords: true,
        courses: true,
      }
    });

    if (!user) {
      console.log(`User not found for email: ${email}`);
      // Check verification tokens just in case
      const tokens = await prisma.verificationToken.findMany({ where: { email } });
      console.log(`Verification tokens found: ${tokens.length}`);
      continue;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Role: ${user.role}`);
    console.log(`Enrollments: ${user.enrollments.length}`);
    console.log(`Transactions: ${user.transactions.length}`);
    console.log(`Quiz Attempts: ${user.quizAttempts.length}`);
    console.log(`Certifications: ${user.certifications.length}`);
    console.log(`Instructor Profile: ${user.instructorProfile ? 'YES' : 'NO'}`);
    if (user.instructorProfile) {
        console.log(`  Subscriptions: ${user.instructorProfile.subscriptions.length}`);
        console.log(`  Stripe Connect ID: ${user.instructorProfile.stripeConnectId}`);
    }
    console.log(`Courses owned: ${user.courses.length}`);
    console.log(`Subscription Records: ${user.subscriptionRecords.length}`);

    // Check Stripe Customer IDs in subscriptions
    const stripeCustomerIds = user.instructorProfile?.subscriptions.map(s => s.stripeCustomerId).filter(Boolean) || [];
    if (stripeCustomerIds.length > 0) {
        console.log(`Stripe Customer IDs (Subscriptions): ${Array.from(new Set(stripeCustomerIds)).join(', ')}`);
    }

    const manualEnrollments = await prisma.adminManualEnrollment.findMany({
      where: {
        OR: [
          { adminId: user.id },
          { studentId: user.id }
        ]
      }
    });
    console.log(`Admin Manual Enrollments: ${manualEnrollments.length}`);

    const verificationTokens = await prisma.verificationToken.findMany({ where: { email } });
    console.log(`Verification tokens: ${verificationTokens.length}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
