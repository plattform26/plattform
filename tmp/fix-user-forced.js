const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixUserForced() {
  const email = 'diego.castellanos.maya@hotmail.com';
  console.log(`🔍 Iniciando reparación FORZADA para: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('❌ Error: Usuario no encontrado.');
    return;
  }

  const passwordHash = await bcrypt.hash('Plattform2025', 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      emailVerifiedAt: user.emailVerifiedAt || new Date(),
      status: 'ACTIVE'
    },
  });

  console.log(`✅ Reparación FORZADA completada.`);
  console.log(`Email: ${user.email}`);
  console.log(`Estado: ACTIVE`);
  console.log(`Contraseña reseteada a: Plattform2025`);

  await prisma.$disconnect();
}

fixUserForced().catch(console.error);
