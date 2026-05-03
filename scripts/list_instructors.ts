import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const instructors = await prisma.user.findMany({ 
    where: { role: 'INSTRUCTOR' },
    select: { id: true, email: true, name: true }
  });
  console.dir(instructors, { depth: null });
}
run();
