const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  const email = 'admin@plattform.com';
  const rawPassword = 'Plattform2025';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('❌ El usuario No existe en la BD.');
    return;
  }

  console.log('✅ Usuario encontrado:', user.email);
  console.log('Rol:', user.role);
  console.log('Status:', user.status);
  console.log('Verificado el:', user.emailVerifiedAt);

  const isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
  if (isMatch) {
    console.log('🟢 La contraseña COINCIDE con el hash.');
  } else {
    console.log('🔴 La contraseña NO COINCIDE con el hash registrado.');
  }

  await prisma.$disconnect();
}

checkAdmin();
