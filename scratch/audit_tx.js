const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.transaction.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Última hora
        }
      }
    });
    console.log('TX_COUNT:', count);
    
    if (count > 0) {
      const last = await prisma.transaction.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true, grossAmount: true }
      });
      console.log('LAST_TX:', last);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
