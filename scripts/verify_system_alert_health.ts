import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- AUDITORÍA DE SALUD: SystemAlert ---');

  // 1. Conteo inicial
  const count = await prisma.systemAlert.count();
  console.log(`1. Registros totales: ${count}`);

  // 2. Intento de Inserción Manual (Ajustado al esquema real)
  try {
    const testAlert = await prisma.systemAlert.create({
      data: {
        type: 'WEBHOOK_DEBUG',
        message: 'TEST_MANUAL_INSERT'
      }
    });
    console.log(`2. INSERT manual: ÉXITO (ID: ${testAlert.id})`);

    // 3. Verificación
    const check = await prisma.systemAlert.findFirst({
      where: { type: 'WEBHOOK_DEBUG', message: 'TEST_MANUAL_INSERT' }
    });
    console.log(`3. ¿Aparece en búsqueda?: ${check ? 'SÍ' : 'NO'}`);

    // 4. Limpieza
    if (check) {
      await prisma.systemAlert.delete({ where: { id: check.id } });
      console.log(`4. LIMPIEZA: Registro de prueba eliminado.`);
    }
  } catch (err: any) {
    console.error(`2. INSERT manual: FALLO - ${err.message}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
