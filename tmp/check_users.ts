import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('User list:', users.map(u => ({ email: u.email, role: u.role })));
}

check().finally(() => prisma.$disconnect());
