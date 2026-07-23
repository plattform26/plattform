
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function monitor() {
  console.log('--- TRANSACTION MONITORING STARTED ---');
  let lastCount = -1;

  for (let i = 0; i < 30; i++) { // Run for ~5 minutes (30 * 10s)
    const currentCount = await prisma.transaction.count();
    
    if (currentCount !== lastCount) {
      if (lastCount !== -1) {
        console.log(`\n🎉 NEW TRANSACTION DETECTED! Total: ${currentCount} (Added: ${currentCount - lastCount})`);
        const latest = await prisma.transaction.findFirst({
          orderBy: { createdAt: 'desc' }
        });
        console.log(`Latest: $${latest?.grossAmount} ${latest?.currency} - ${latest?.paymentType} (${latest?.stripePaymentIntentId || latest?.stripeSessionId})`);
      } else {
        console.log(`Initial count: ${currentCount}`);
      }
      lastCount = currentCount;
    }
    
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

monitor()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
