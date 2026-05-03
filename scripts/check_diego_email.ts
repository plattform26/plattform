import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { name: { contains: 'Diego' } },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('--- USUARIOS ENCONTRADOS ---');
  console.table(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
