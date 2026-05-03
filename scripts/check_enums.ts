import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- INSPECCIÓN DE ENUMS ---');
  
  try {
    const paymentTypes: any[] = await prisma.$queryRaw`
      SELECT n.nspname as schema, t.typname as type, e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'PaymentType'
    `;
    console.log('Valores permitidos para PaymentType:');
    console.table(paymentTypes.map(p => p.value));

    const paymentStatus: any[] = await prisma.$queryRaw`
      SELECT n.nspname as schema, t.typname as type, e.enumlabel as value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'PaymentStatus'
    `;
    console.log('\nValores permitidos para PaymentStatus:');
    console.table(paymentStatus.map(p => p.value));

  } catch (err: any) {
    console.error('Error consultando enums:', err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
