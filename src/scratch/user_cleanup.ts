import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emails = ['diego.castellanos.maya@hotmail.com', 'azulno26@hotmail.com'];

  console.log('🚀 INITIALIZING NUCLEAR CLEANUP...');

  for (const email of emails) {
    console.log(`\n--- Working on: ${email} ---`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, lastName: true }
    });

    if (!user) {
      console.log(`⚠️ User not found for email: ${email}. Skipping.`);
      continue;
    }

    console.log(`🎯 Targeted User: ${user.name} ${user.lastName} (${user.id})`);

    await prisma.$transaction(async (tx) => {
      // 1. Delete Manual Enrollments (No Cascade)
      const deletedManual = await tx.adminManualEnrollment.deleteMany({
        where: {
          OR: [
            { adminId: user.id },
            { studentId: user.id }
          ]
        }
      });
      console.log(`✅ Deleted Manual Enrollments: ${deletedManual.count}`);

      // 2. Delete Verification Tokens (by email)
      const deletedTokens = await tx.verificationToken.deleteMany({
        where: { email }
      });
      console.log(`✅ Deleted Verification Tokens: ${deletedTokens.count}`);

      // 3. Delete Audit Logs (No Cascade in some setups? Let's be sure)
      const deletedLogs = await tx.auditLog.deleteMany({
          where: { actorUserId: user.id }
      });
      console.log(`✅ Deleted Audit Logs: ${deletedLogs.count}`);

      // 4. Delete the User record (Triggers Cascade for Profile, Subs, Enrollments, Quizzes, etc.)
      await tx.user.delete({
        where: { id: user.id }
      });
      console.log(`🔥 USER RECORD DELETED (Cascading cleanup complete)`);
    });
  }

  console.log('\n✨ CLEANUP SUCCESSFUL. Verifying...');
  
  for (const email of emails) {
    const check = await prisma.user.findUnique({ where: { email } });
    if (!check) {
      console.log(`✅ Verified: Email ${email} is now free.`);
    } else {
      console.error(`❌ Error: Email ${email} still exists!`);
    }
  }
}

main()
  .catch((err) => {
    console.error('💥 CLEANUP FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
