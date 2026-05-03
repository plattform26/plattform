import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.instructorProfile.findUnique({ where: { userId: 'd5d99c27-b6b6-418d-8b3a-5f586a79ac92' } });
  if (p) console.log('Profile ID for Diego:', p.id);
  else console.log('Profile not found');
}
run();
