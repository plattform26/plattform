import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function get() {
  const users = await prisma.user.findMany();
  console.log('Users found:', JSON.stringify(users.map(u => ({ email: u.email, role: u.role, id: u.id })), null, 2));
}

get().finally(() => prisma.$disconnect());
