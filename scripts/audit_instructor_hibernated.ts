import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: 'e1aaa45d-fb67-43e8-945a-a305d213623c' },
    include: { subscriptions: true }
  });
  console.log('--- PERFIL INSTRUCTOR ---');
  console.log(JSON.stringify(instructor, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
