const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emailsToDelete = [
  'azulno26@hotmail.com',
  'diego.castellanos.maya@hotmail.com'
];

async function cleanup() {
  console.log('🚀 Iniciando limpieza quirúrgica de cuentas de prueba...');

  for (const email of emailsToDelete) {
    try {
      console.log(`\n--- Procesando: ${email} ---`);

      // 1. Borrar tokens de verificación (tabla separada)
      const deletedTokens = await prisma.verificationToken.deleteMany({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
      console.log(`✅ Tokens de verificación eliminados: ${deletedTokens.count}`);

      // 2. Borrar el usuario (Cascada borrará sesiones, profiles, reset tokens, etc.)
      // Buscamos primero para confirmar existencia y ver el ID
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (user) {
        await prisma.user.delete({
          where: { id: user.id }
        });
        console.log(`✅ Usuario [${user.id}] eliminado totalmente.`);
      } else {
        console.log(`ℹ️ El usuario no fue encontrado en la tabla 'users'.`);
      }

    } catch (error) {
      console.error(`❌ Error al procesar ${email}:`, error.message);
    }
  }

  console.log('\n✨ Limpieza completada.');
}

cleanup()
  .catch((e) => {
    console.error('💥 Error crítico en el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
