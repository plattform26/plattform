import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.user.findUnique({ 
    where: { email: 'azulno26@hotmail.com' },
    include: { instructorProfile: true }
  });
  console.dir(u, { depth: null });
}
run();
