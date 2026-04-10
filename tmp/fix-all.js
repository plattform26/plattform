const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAll() {
  const password = 'Plattform2025';
  const hash = await bcrypt.hash(password, 12);

  const emails = ['admin@plattform.com', 'alumno@plattform.com', 'alejandro@plattform.com'];

  for (const email of emails) {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        passwordHash: hash,
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    });
    console.log(`✅ ${email} credentials FIXED.`);
  }

  await prisma.$disconnect();
}

fixAll().catch(console.error);
