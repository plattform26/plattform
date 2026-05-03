import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- ESQUEMA COMPLETO DE TABLAS Y COLUMNAS ---');
  
  const schema: any[] = await prisma.$queryRaw`
    SELECT 
      table_name,
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;

  if (schema.length > 0) {
    // Formatear como tabla para que el usuario pueda copiarlo
    console.log('table_name | column_name | data_type | is_nullable');
    console.log('----------------------------------------------------');
    schema.forEach(row => {
      console.log(`${row.table_name} | ${row.column_name} | ${row.data_type} | ${row.is_nullable}`);
    });
  } else {
    console.log('No se encontraron tablas en el esquema public.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
