const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetUser = await prisma.user.findUnique({
    where: { email: 'tabata.avila.22@outlook.com' },
    include: {
      courses: { select: { id: true, title: true, status: true } },
      instructorProfile: true,
      enrollments: true
    }
  });

  console.log('TARGET_USER (tabata.avila.22@outlook.com):', JSON.stringify(targetUser, null, 2));

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, lastName: true, email: true, role: true, status: true }
  });
  console.log('ALL_USERS_LIST:', JSON.stringify(allUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
