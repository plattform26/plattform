import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.platformPlan.findMany();
  console.log('--- PLANES EN BASE DE DATOS ---');
  console.dir(plans, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
