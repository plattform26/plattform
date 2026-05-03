import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.user.findUnique({ where: { email: 'azulno26@hotmail.com' } });
  if (u) console.log(u.id);
  else console.log('User not found');
}
run();
