import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const plans = await p.platformPlan.findMany();
  console.log(JSON.stringify(plans, null, 2));
}
main().catch(console.error).finally(()=>p.$disconnect());
