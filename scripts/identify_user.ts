import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const u = await prisma.user.findUnique({ where: { id: 'e1aaa45d-fb67-43e8-945a-a305d213623c' } });
  if (u) console.log('User email for ID e1aaa...:', u.email);
  else console.log('User not found');
}
run();
