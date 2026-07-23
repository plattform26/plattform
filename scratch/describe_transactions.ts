
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function describeTable() {
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'transactions' 
    ORDER BY ordinal_position;
  `);
  console.log(JSON.stringify(columns, null, 2));
}

describeTable().finally(() => prisma.$disconnect());
