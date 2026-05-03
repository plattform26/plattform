import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const lessonId = 'b8573a34-7281-421f-af11-bff33a2211d8';
async function main() {
  const progress = await prisma.progress.findMany({
    where: { lessonId },
    include: { user: { select: { email: true, name: true, role: true } } }
  });
  console.log(`Progress for lesson ${lessonId}:`);
  progress.forEach(p => {
    console.log(`User: ${p.user.name} (${p.user.email}) | Role: ${p.user.role} | Completed: ${p.completed}`);
  });
  await prisma.$disconnect();
}
main();
