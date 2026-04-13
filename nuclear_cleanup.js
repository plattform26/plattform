const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const email = 'diego.castellanos.maya@hotmail.com';
  console.log(`Checking for user: ${email}`);
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      instructorProfile: true
    }
  });
  
  if (user) {
    console.log(`User found with ID: ${user.id}. Starting nuclear delete...`);
    
    const instructorProfileId = user.instructorProfile?.id;

    // 1. Delete Instructor-related children
    if (instructorProfileId) {
      console.log(`Deleting instructor profile data for profile ID: ${instructorProfileId}`);
      await prisma.instructorSubscription.deleteMany({ where: { instructorId: instructorProfileId } });
      await prisma.instructorSubscriptionHistory.deleteMany({ where: { instructorId: instructorProfileId } });
    }

    // 2. Delete User-related children
    console.log('Deleting user-related data...');
    await prisma.enrollment.deleteMany({ where: { userId: user.id } });
    await prisma.subscriptionRecord.deleteMany({ where: { userId: user.id } });
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.course.deleteMany({ where: { instructorId: user.id } });
    await prisma.courseRating.deleteMany({ where: { OR: [{ userId: user.id }, { instructorId: user.id }] } });
    await prisma.transaction.deleteMany({ where: { userId: user.id } });
    await prisma.progress.deleteMany({ where: { userId: user.id } });
    await prisma.quizAttempt.deleteMany({ where: { userId: user.id } });
    await prisma.certification.deleteMany({ where: { userId: user.id } });
    await prisma.auditLog.deleteMany({ where: { actorUserId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.verificationToken.deleteMany({ where: { email: user.email } });

    // 3. Delete Profile and User
    if (user.instructorProfile) {
      await prisma.instructorProfile.delete({ where: { id: user.instructorProfile.id } });
    }
    await prisma.user.delete({ where: { id: user.id } });
    
    console.log('User and all associated data deleted successfully.');
  } else {
    console.log('User not found. Ground is already clean.');
  }
}

clean()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
