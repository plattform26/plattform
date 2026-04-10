const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAdmin() {
  const email = 'admin@plattform.com';
  const newPassword = 'Plattform2025';

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: { 
      passwordHash,
      status: 'ACTIVE',
      emailVerifiedAt: new Date() 
    }
  });

  console.log('✅ Admin credentials FIXED.');
  console.log('Email:', updatedUser.email);
  console.log('Hash:', updatedUser.passwordHash);

  await prisma.$disconnect();
}

fixAdmin().catch(err => {
    console.error('Error fixing admin:', err);
    process.exit(1);
});
