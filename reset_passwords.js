const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const emails = [
    'admin@plattform.com',
    'alejandro@plattform.com',
    'alumno@plattform.com'
  ];
  const newPassword = 'Plattform2025';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log('--- Iniciando reseteo de contraseñas ---');

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
          emailVerifiedAt: new Date(),
          status: 'ACTIVE'
        }
      });
      console.log(`✅ Contraseña reseteada para: ${email}`);
    } else {
      console.log(`⚠️ Usuario no encontrado: ${email}`);
    }
  }

  console.log('--- Proceso finalizado ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
