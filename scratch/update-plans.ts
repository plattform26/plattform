import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Sincronización Estratégica de Planes Plattform ---');

  // Plan Starter
  await prisma.platformPlan.upsert({
    where: { name: 'starter' },
    update: {
      displayName: 'Starter',
      monthlyPrice: 199.00,
      studentLimit: 20,
      commissionRate: 15.00,
      aiEnabled: false,
    },
    create: {
      name: 'starter',
      displayName: 'Starter',
      monthlyPrice: 199.00,
      studentLimit: 20,
      commissionRate: 15.00,
      aiEnabled: false,
      status: 'ACTIVE',
    },
  });
  console.log('✓ Plan Starter actualizado ($199, 20 alumnos, 15% comm, No IA)');

  // Plan Growth
  await prisma.platformPlan.upsert({
    where: { name: 'growth' },
    update: {
      displayName: 'Growth',
      monthlyPrice: 299.00,
      studentLimit: 100,
      commissionRate: 10.00,
      aiEnabled: false,
    },
    create: {
      name: 'growth',
      displayName: 'Growth',
      monthlyPrice: 299.00,
      studentLimit: 100,
      commissionRate: 10.00,
      aiEnabled: false,
      status: 'ACTIVE',
    },
  });
  console.log('✓ Plan Growth actualizado ($299, 100 alumnos, 10% comm, No IA)');

  // Plan Scale
  await prisma.platformPlan.upsert({
    where: { name: 'scale' },
    update: {
      displayName: 'Scale',
      monthlyPrice: 999.00,
      studentLimit: -1, // Ilimitado
      commissionRate: 7.00,
      aiEnabled: true,
    },
    create: {
      name: 'scale',
      displayName: 'Scale',
      monthlyPrice: 999.00,
      studentLimit: -1,
      commissionRate: 7.00,
      aiEnabled: true,
      status: 'ACTIVE',
    },
  });
  console.log('✓ Plan Scale actualizado ($999, Ilimitado, 7% comm, Full IA)');

  console.log('--- Sincronización Finalizada de forma Exitosa ---');
}

main()
  .catch((e) => {
    console.error('Error durante la sincronización:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
