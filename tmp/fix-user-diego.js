const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUser() {
  const email = 'diego.castellanos.maya@hotmail.com';
  console.log(`🔍 Iniciando reparación para: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('❌ Error: Usuario no encontrado en la base de datos.');
    return;
  }

  const updates = {};
  let totalFixes = 0;

  // 1. Verificar Email
  if (!user.emailVerifiedAt) {
    console.log('📝 Marcando email como verificado...');
    updates.emailVerifiedAt = new Date();
    totalFixes++;
  }

  // 2. Verificar Hash de Contraseña
  const isValidHashFormat = user.passwordHash && (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$'));
  
  if (!isValidHashFormat) {
    console.log('📝 Formato de hash inválido o inexistente. Reseteando a "Plattform2025"...');
    updates.passwordHash = await bcrypt.hash('Plattform2025', 12);
    totalFixes++;
  }

  if (totalFixes > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
    console.log(`✅ Reparación completada: ${totalFixes} campos actualizados.`);
  } else {
    console.log('ℹ️ El usuario ya se encuentra en estado correcto.');
  }

  await prisma.$disconnect();
}

fixUser().catch(err => {
  console.error('❌ Error crítico durante la reparación:', err);
  process.exit(1);
});
