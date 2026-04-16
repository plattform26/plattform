import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function auditAllUsers() {
  console.log('--- GLOBAL AUDIT REPORT ---');
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          enrollments: true,
          courses: true
        }
      }
    }
  });

  users.forEach(u => {
    console.log(`[USER] ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
    console.log(`       Enrollments: ${u._count.enrollments} | Creations: ${u._count.courses}`);
  });
}

auditAllUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
