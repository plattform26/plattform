const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const p = new PrismaClient();

async function check() {
  const users = await p.user.findMany();
  const output = users.map(u => `${u.email} | ${u.role} | ${u.status}`).join('\n');
  fs.writeFileSync('db_users.txt', output || 'NO USERS');
  console.log('Done');
}

check()
  .catch(e => fs.writeFileSync('db_users.txt', e.message))
  .finally(() => p.$disconnect());
