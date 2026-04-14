import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed de los 3 planes
  await prisma.platformPlan.createMany({
    data: [
      { name: 'starter', displayName: 'Starter', description: 'Builder manual. Límite: 20 alumnos-materia. Comisión 15%.', monthlyPrice: 199, studentLimit: 20, commissionRate: 15, aiEnabled: false },
      { name: 'growth', displayName: 'Growth', description: 'IA Básica. Límite: 100 alumnos-materia. Comisión 10%.', monthlyPrice: 299, studentLimit: 100, commissionRate: 10, aiEnabled: true },
      { name: 'scale', displayName: 'Scale', description: 'IA Pro (Docs) + Alumnos ilimitados. Comisión 7%.', monthlyPrice: 999, studentLimit: -1, commissionRate: 7, aiEnabled: true },
    ],
    skipDuplicates: true,
  })

  const passwordHash = await bcrypt.hash('Plattform2025', 12);

  // Usuario admin inicial
  await prisma.user.upsert({
    where: { email: 'admin@plattform.com' },
    update: {
      passwordHash,
    },
    create: {
      name: 'Admin',
      lastName: 'Plattform',
      email: 'admin@plattform.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  const instructorUser = await prisma.user.upsert({
    where: { email: 'alejandro@plattform.com' },
    update: {
      passwordHash,
    },
    create: {
      name: 'Dr. Alejandro',
      lastName: 'Ríos',
      email: 'alejandro@plattform.com',
      passwordHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  const instructorProfile = await prisma.instructorProfile.upsert({
    where: { userId: instructorUser.id },
    update: {},
    create: {
      userId: instructorUser.id,
      academyName: 'Dr. Alejandro Ríos · UNAM',
      slug: 'alejandro-rios',
      description: 'Experto en negocios, enseñando a escalar startups.',
      commissionRate: 10,
    },
  });

  // Provide an Active Subscription
  const planGrowth = await prisma.platformPlan.findUnique({ where: { name: 'growth' } });
  if (planGrowth) {
    // Delete existing so seed is idempotent
    await prisma.instructorSubscription.deleteMany({
      where: { instructorId: instructorProfile.id }
    });
    
    await prisma.instructorSubscription.create({
      data: {
        instructorId: instructorProfile.id,
        planId: planGrowth.id,
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      }
    });
  }

  // Alumno de prueba
  const studentUser = await prisma.user.upsert({
    where: { email: 'alumno@plattform.com' },
    update: { passwordHash },
    create: {
      name: 'Estudiante',
      lastName: 'Prueba',
      email: 'alumno@plattform.com',
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  })

  // Course 1
  const c1 = await prisma.course.upsert({
    where: { instructorId_slug: { instructorId: instructorUser.id, slug: 'estrategia-empresarial-era-digital' } },
    update: {},
    create: {
      instructorId: instructorUser.id,
      title: 'Estrategia Empresarial en la Era Digital',
      slug: 'estrategia-empresarial-era-digital',
      description: 'Aprende a escalar tu negocio usando tecnología y herramientas digitales modernas. De 0 a 100.',
      category: 'BUSINESS_ENTREPRENEURSHIP',
      level: 'INTERMEDIATE',
      price: 1499,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      durationHours: 18,
    }
  })

  if (c1) {
    // Add modules for course 1
    const m1 = await prisma.courseModule.create({ data: { courseId: c1.id, title: 'Conceptos Clave', orderIndex: 1 } })
    await prisma.courseLesson.create({ data: { courseId: c1.id, moduleId: m1.id, title: 'Fundamentos de la Era Digital', contentText: 'Aprende las bases.', contentType: 'TEXT', orderIndex: 1, isPreview: true } })
  }

  // Course 2 (Claude IA) - CONTENIDO COMPLETO PARA SPRINT 7
  const c2 = await prisma.course.upsert({
    where: { instructorId_slug: { instructorId: instructorUser.id, slug: 'introduccion-claude-ia' } },
    update: {},
    create: {
      instructorId: instructorUser.id,
      title: 'Introducción al Uso de Claude — IA Práctica',
      slug: 'introduccion-claude-ia',
      description: 'Domina los LLMs en tu día a día, ahorra 10hrs a la semana.',
      category: 'TECH_INNOVATION',
      level: 'BEGINNER',
      price: 899,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      durationHours: 8,
    }
  })

  if (c2) {
    // Eliminar contenido previo para evitar duplicados en seed recurrente
    await prisma.courseLesson.deleteMany({ where: { courseId: c2.id } });
    await prisma.courseModule.deleteMany({ where: { courseId: c2.id } });
    await prisma.quiz.deleteMany({ where: { courseId: c2.id } });

    const m2 = await prisma.courseModule.create({ data: { courseId: c2.id, title: 'Fundamentos de Claude', orderIndex: 1 } })
    
    // Lección 1: Texto
    await prisma.courseLesson.create({ 
      data: { 
        courseId: c2.id, moduleId: m2.id, title: '¿Qué es Claude y Anthropic?', 
        contentText: 'Claude es una IA desarrollada por Anthropic enfocada en la seguridad y la honestidad.', 
        contentType: 'TEXT', orderIndex: 1, isPreview: true 
      } 
    })

    // Lección 2: Video (Simulado)
    await prisma.courseLesson.create({ 
      data: { 
        courseId: c2.id, moduleId: m2.id, title: 'Configura tu primer proyecto', 
        contentText: 'En este video aprenderás a usar los Projects en Claude 3.5 Sonnet.', 
        videoUrl: 'https://vimeo.com/76979871', // Video de ejemplo
        contentType: 'VIDEO', orderIndex: 2 
      } 
    })

    // Lección 3: Quiz Intermedio
    const l3 = await prisma.courseLesson.create({ 
      data: { 
        courseId: c2.id, moduleId: m2.id, title: 'Evaluación rápida: Modelos', 
        contentText: 'Demuestra lo que sabes sobre los modelos de Anthropic.', 
        contentType: 'QUIZ', orderIndex: 3 
      } 
    })

    const q1 = await prisma.quiz.create({
      data: {
        courseId: c2.id,
        lessonId: l3.id,
        title: 'Quiz de Modelos',
        passingScore: 70,
        totalScore: 100,
      }
    })

    await prisma.quizQuestion.create({
      data: {
        quizId: q1.id,
        questionText: '¿Cuál es el modelo más potente de Anthropic actualmente?',
        questionType: 'SINGLE',
        points: 100,
        orderIndex: 1,
        options: {
          create: [
            { optionText: 'Claude 3.5 Sonnet', isCorrect: true, orderIndex: 1 },
            { optionText: 'Claude 3 Haiku', isCorrect: false, orderIndex: 2 },
            { optionText: 'Claude 2.1', isCorrect: false, orderIndex: 3 },
          ]
        },
        correctAnswer: 'will-be-id-from-options' // Backward compatibility or placeholder
      }
    })

    const m3 = await prisma.courseModule.create({ data: { courseId: c2.id, title: 'Prompt Engineering', orderIndex: 2 } })
    
    // Lección 4: Texto
    await prisma.courseLesson.create({ 
      data: { 
        courseId: c2.id, moduleId: m3.id, title: 'Técnica de Role Play', 
        contentText: 'Asignar un rol a la IA mejora drásticamente los resultados.', 
        contentType: 'TEXT', orderIndex: 4 
      } 
    })

    // Lección 5: EVALUACIÓN FINAL
    const l5 = await prisma.courseLesson.create({ 
      data: { 
        courseId: c2.id, moduleId: m3.id, title: 'Examen Final de Certificación', 
        contentText: 'Aprobar este examen genera tu certificado automáticamente.', 
        contentType: 'QUIZ', orderIndex: 5 
      } 
    })

    const qFinal = await prisma.quiz.create({
      data: {
        courseId: c2.id,
        lessonId: l5.id,
        title: 'Evaluación Final Plattform',
        passingScore: 80,
        totalScore: 100,
      }
    })

    await prisma.quizQuestion.create({
      data: {
        quizId: qFinal.id,
        questionText: '¿Qué componente de Plattform permite generar certificados?',
        questionType: 'SINGLE',
        points: 100,
        orderIndex: 1,
        options: {
          create: [
            { optionText: 'Sprint 7 Engine', isCorrect: true, orderIndex: 1 },
            { optionText: 'Stripe Webhook', isCorrect: false, orderIndex: 2 },
            { optionText: 'IA Generator', isCorrect: false, orderIndex: 3 },
          ]
        },
        correctAnswer: 'placeholder'
      }
    })

    // Inscribir al alumno para pruebas
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: studentUser.id, courseId: c2.id } },
      update: { status: 'ACTIVE' },
      create: {
        userId: studentUser.id,
        courseId: c2.id,
        status: 'ACTIVE',
        accessType: 'PURCHASE'
      }
    })
  }

  // Course 3
  const c3 = await prisma.course.upsert({
    where: { instructorId_slug: { instructorId: instructorUser.id, slug: 'finanzas-personales' } },
    update: {},
    create: {
      instructorId: instructorUser.id,
      title: 'Finanzas Personales e Inversión desde Cero',
      slug: 'finanzas-personales',
      description: 'Controla tu dinero, crea presupuesto y empieza a invertir en ETFs.',
      category: 'FINANCE_ECONOMY',
      level: 'BEGINNER',
      price: 799,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      durationHours: 10,
    }
  })

  // Cupones de prueba
  if (c2) {
    await prisma.coupon.upsert({
      where: { code: 'PROMO20' },
      update: {},
      create: {
        courseId: c2.id,
        code: 'PROMO20',
        discountPercent: 20,
        usageLimit: 100,
      }
    });
  }

  // Course for Admin
  const cAdmin = await prisma.course.upsert({
    where: { instructorId_slug: { instructorId: (await prisma.user.findUnique({where:{email:'admin@plattform.com'}}))!.id, slug: 'masterclass-saas-admin' } },
    update: {},
    create: {
      instructorId: (await prisma.user.findUnique({where:{email:'admin@plattform.com'}}))!.id,
      title: 'Masterclass: Arquitectura SaaS con Next.js',
      slug: 'masterclass-saas-admin',
      description: 'Como administrador, enseño las tripas de Plattform.',
      category: 'TECH_INNOVATION',
      level: 'ADVANCED',
      price: 2499,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      durationHours: 25,
    }
  })

  // Inscribir al alumno en el curso de Alejandro también si no lo está
  if (c1) {
    await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: studentUser.id, courseId: c1.id } },
        update: {},
        create: {
            userId: studentUser.id,
            courseId: c1.id,
            status: 'ACTIVE',
            accessType: 'PURCHASE'
        }
    })
  }

  // Generar Transacciones Mock para Dashboard
  const adminId = (await prisma.user.findUnique({where:{email:'admin@plattform.com'}}))!.id;
  const alejandroId = instructorUser.id;

  const mockTransactions = [
    { userId: studentUser.id, instructorId: alejandroId, courseId: c1.id, grossAmount: 1499, netAmountToInstructor: 1349.1, platformCommissionAmount: 149.9, paymentStatus: 'SUCCESS', paymentType: 'COURSE_PURCHASE', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
    { userId: studentUser.id, instructorId: alejandroId, courseId: c2.id, grossAmount: 899, netAmountToInstructor: 809.1, platformCommissionAmount: 89.9, paymentStatus: 'SUCCESS', paymentType: 'COURSE_PURCHASE', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) },
    { userId: studentUser.id, instructorId: adminId, courseId: cAdmin.id, grossAmount: 2499, netAmountToInstructor: 2249.1, platformCommissionAmount: 249.9, paymentStatus: 'SUCCESS', paymentType: 'COURSE_PURCHASE', createdAt: new Date() },
  ];

  for (const tx of mockTransactions) {
    await prisma.transaction.create({
        data: {
            ...tx as any,
            currency: 'MXN',
            paymentProvider: 'STRIPE'
        }
    });
  }

  console.log('✅ Seed completado: Planes, Cursos, Alumno y Transacciones Mock.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
