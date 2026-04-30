import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- ACTUALIZANDO PLANES ---');
    await prisma.platformPlan.update({ 
      where: { name: 'starter' }, 
      data: { courseLimit: 2, studentLimit: 20 } 
    });
    console.log('✅ Starter: 2 cursos, 20 alumnos');

    await prisma.platformPlan.update({ 
      where: { name: 'growth' }, 
      data: { courseLimit: 10, studentLimit: 100 } 
    });
    console.log('✅ Growth: 10 cursos, 100 alumnos');

    await prisma.platformPlan.update({ 
      where: { name: 'scale' }, 
      data: { courseLimit: -1, studentLimit: -1 } 
    });
    console.log('✅ Scale: Ilimitado (-1)');

    console.log('\n--- CORRIGIENDO DIANA ---');
    const scalePlan = await prisma.platformPlan.findUnique({ where: { name: 'scale' } });
    if (scalePlan) {
      await prisma.user.update({ 
        where: { email: 'diana.garflo@hotmail.com' }, 
        data: { isCourtesy: true, courtesyPlanId: scalePlan.id } 
      });
      console.log('✅ Diana actualizada a CORTESÍA SCALE');
    } else {
      console.error('❌ No se encontró el plan Scale');
    }

    console.log('\n--- VERIFICACIÓN ---');
    const diana = await prisma.user.findUnique({
      where: { email: 'diana.garflo@hotmail.com' },
      include: { courtesyPlan: true }
    });
    console.log('Estado Final Diana:', JSON.stringify({
      isCourtesy: diana?.isCourtesy,
      plan: diana?.courtesyPlan?.displayName,
      courseLimit: diana?.courtesyPlan?.courseLimit,
      studentLimit: diana?.courtesyPlan?.studentLimit
    }, null, 2));

  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
