const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAllUsers() {
  try {
    const result = await prisma.user.updateMany({
      where: {
        emailVerifiedAt: null,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`✅ Éxito: Se han verificado ${result.count} usuarios.`);
  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllUsers();
