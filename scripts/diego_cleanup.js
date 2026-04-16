const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const email = 'diego.castellanos.maya@hotmail.com';
  console.log(`🧹 Iniciando limpieza nuclear para: ${email}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado. Saltando limpieza.');
      return;
    }

    console.log(`ID de usuario: ${user.id}`);

    // Borrado en Cascada Manual (por seguridad)
    await prisma.$transaction([
      // 1. Sesiones y Tokens
      prisma.session.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.verificationToken.deleteMany({ where: { email } }),

      // 2. Transacciones y Compras
      prisma.transaction.deleteMany({ where: { instructorId: user.id } }), // Si era instructor
      prisma.transaction.deleteMany({ where: { userId: user.id } }),       // Si era alumno
      prisma.enrollment.deleteMany({ where: { userId: user.id } }),
      prisma.couponUsage.deleteMany({ where: { userId: user.id } }),

      // 3. Actividad de Instructor (si existe)
      prisma.course.updateMany({ 
        where: { instructorId: user.id },
        data: { status: 'DRAFT' }
      }),
      prisma.instructorSubscription.deleteMany({ where: { instructor: { userId: user.id } } }),
      prisma.instructorProfile.deleteMany({ where: { userId: user.id } }),
      
      // 4. EL USUARIO
      prisma.user.delete({ where: { id: user.id } })
    ]);

    console.log('✅ Limpieza completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
