import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Test2025', 12)
  
  // Admin de prueba
  await prisma.user.upsert({
    where: { email: 'test.admin@plattform.mx' },
    update: { passwordHash: hash, emailVerifiedAt: new Date() },
    create: {
      name: 'Test', lastName: 'Admin',
      email: 'test.admin@plattform.mx',
      passwordHash: hash, role: 'ADMIN',
      status: 'ACTIVE', emailVerifiedAt: new Date()
    }
  })

  // Instructor de prueba
  const instructor = await prisma.user.upsert({
    where: { email: 'test.instructor@plattform.mx' },
    update: { passwordHash: hash, emailVerifiedAt: new Date() },
    create: {
      name: 'Test', lastName: 'Instructor',
      email: 'test.instructor@plattform.mx',
      passwordHash: hash, role: 'INSTRUCTOR',
      status: 'ACTIVE', emailVerifiedAt: new Date()
    }
  })

  // Perfil de instructor + suscripción activa
  const profile = await prisma.instructorProfile.upsert({
    where: { userId: instructor.id },
    update: {},
    create: {
      userId: instructor.id,
      academyName: 'Academia Test',
      slug: 'academia-test',
      commissionRate: 10
    }
  })

  const plan = await prisma.platformPlan.findFirst({ where: { name: 'growth' } })
  if (plan) {
    // Check if subscription already exists for this instructor
    const existingSub = await prisma.instructorSubscription.findFirst({
        where: { instructorId: profile.id }
    })
    
    if (existingSub) {
      await prisma.instructorSubscription.update({
        where: { id: existingSub.id },
        data: { status: 'ACTIVE', planId: plan.id }
      })
    } else {
      await prisma.instructorSubscription.create({
        data: {
          instructorId: profile.id,
          planId: plan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
        }
      })
    }
  } else {
     console.log("No growth plan found, skipping subscription creation.")
  }

  // Alumno de prueba
  await prisma.user.upsert({
    where: { email: 'test.alumno@plattform.mx' },
    update: { passwordHash: hash, emailVerifiedAt: new Date() },
    create: {
      name: 'Test', lastName: 'Alumno',
      email: 'test.alumno@plattform.mx',
      passwordHash: hash, role: 'STUDENT',
      status: 'ACTIVE', emailVerifiedAt: new Date()
    }
  })

  console.log('✅ Cuentas de prueba creadas:')
  console.log('   test.admin@plattform.mx / Test2025')
  console.log('   test.instructor@plattform.mx / Test2025')
  console.log('   test.alumno@plattform.mx / Test2025')
}

main().catch(console.error).finally(() => prisma.$disconnect())
