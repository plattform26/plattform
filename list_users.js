const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function check() {
  const users = await p.user.findMany({
    select: { email: true, role: true }
  });
  console.log('--- Usuarios en BD ---');
  users.forEach(u => console.log(`${u.email} (${u.role})`));
}

check()
  .catch(e => console.error(e))
  .finally(() => p.$disconnect());
