import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITORÍA DE REGISTROS DE MAYO 2026 ---');
  
  const mayo1 = new Date('2026-05-01T00:00:00Z');

  // 1. Instructor Subscriptions
  const instSubs = await prisma.instructorSubscription.findMany({
    where: { updatedAt: { gte: mayo1 } },
    include: { instructor: { include: { user: true } } }
  });
  console.log(`\n[InstructorSubscriptions] (${instSubs.length} encontrados)`);
  console.table(instSubs.map(s => ({
    email: s.instructor?.user?.email,
    status: s.status,
    updatedAt: s.updatedAt,
    expiresAt: s.expiresAt
  })));

  // 2. Subscription Records (Alumnos/Otros)
  const subRecords: any[] = await prisma.$queryRaw`
    SELECT * FROM subscription_records 
    WHERE created_at >= '2026-05-01'
  `;
  console.log(`\n[SubscriptionRecords] (${subRecords.length} encontrados)`);
  console.table(subRecords.map(r => ({
    user_id: r.user_id,
    amount: r.amount_paid,
    status: r.status,
    createdAt: r.created_at
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
