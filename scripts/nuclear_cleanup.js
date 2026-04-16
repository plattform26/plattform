const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emailsToDelete = [
  'student1@plattform.com',
  'test_student_2@plattform.com',
  'student_test@example.com',
  'student3@test.com',
  'student@flowi.com',
  'test_student@test.com'
];

async function nuclearCleanup() {
  console.log('☢️  Iniciando Limpieza Nuclear del Búnker...\n');

  for (const email of emailsToDelete) {
    try {
      console.log(`--- Procesando: ${email} ---`);

      // 1. Borrar de VerificationToken (basado en email)
      const deletedTokens = await prisma.verificationToken.deleteMany({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
      console.log(`✅ Tokens de verificación eliminados: ${deletedTokens.count}`);

      // 2. Borrar el usuario (Cascada borrará Enrollment, Session, CouponUsage, etc.)
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });

      if (user) {
        await prisma.user.delete({
          where: { id: user.id }
        });
        console.log(`✅ Registro de usuario [${user.id}] y sus cascadas eliminados.`);
      } else {
        console.log(`ℹ️  El usuario no existe en la tabla 'users'.`);
      }
      console.log('-----------------------------------\n');

    } catch (error) {
      console.error(`❌ Error al limpiar ${email}:`, error.message);
    }
  }

  // Verificación final
  console.log('🔍 Verificando estado final del búnker...');
  for (const email of emailsToDelete) {
    const userCount = await prisma.user.count({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    const tokenCount = await prisma.verificationToken.count({
      where: { email: { equals: email, mode: 'insensitive' } }
    });

    if (userCount === 0 && tokenCount === 0) {
      console.log(`✅ ${email}: 100% LIMPIO`);
    } else {
      console.warn(`⚠️  ${email}: Aún existen registros (User: ${userCount}, Tokens: ${tokenCount})`);
    }
  }

  console.log('\n✨ Misión cumplida. El búnker está despejado.');
}

nuclearCleanup()
  .catch((e) => {
    console.error('💥 Error crítico en la misión:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
