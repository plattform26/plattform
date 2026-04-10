const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Forzar uso de Direct URL para evitar problemas de pgbouncer en escrituras rápidas
process.env.DATABASE_URL = process.env.DIRECT_URL;

const p = new PrismaClient();

async function run() {
  console.log('Intentando reseteo con DIRECT_URL...');
  const passwordHash = await bcrypt.hash('Plattform2025', 10);
  
  const emails = ['admin@plattform.com', 'alejandro@plattform.com', 'alumno@plattform.com'];
  
  for (const email of emails) {
    const user = await p.user.upsert({
      where: { email },
      update: { passwordHash, emailVerifiedAt: new Date(), status: 'ACTIVE' },
      create: {
        email,
        name: email.split('@')[0],
        lastName: 'Prueba',
        passwordHash,
        role: email.includes('admin') ? 'ADMIN' : email.includes('alejandro') ? 'INSTRUCTOR' : 'STUDENT',
        status: 'ACTIVE',
        emailVerifiedAt: new Date()
      }
    });
    console.log(`User ${email} upserted. ID: ${user.id}`);
  }
}

run()
  .catch(e => console.error('Error:', e))
  .finally(() => p.$disconnect());
