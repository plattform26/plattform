import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Reparación de Datos ---');

  // 1. Crear perfiles faltantes para Instructores
  const instructorsWithoutProfile = await prisma.user.findMany({
    where: {
      role: 'INSTRUCTOR',
      instructorProfile: null
    }
  });

  console.log(`Detectados ${instructorsWithoutProfile.length} instructores sin perfil.`);

  for (const user of instructorsWithoutProfile) {
    const slug = slugify(`${user.name} ${user.lastName}`, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(7);
    
    await prisma.instructorProfile.create({
      data: {
        userId: user.id,
        academyName: `Academia de ${user.name}`,
        slug: slug,
        description: 'Perfil creado automáticamente durante el proceso de estabilización.',
        commissionRate: 10,
      }
    });
    console.log(`Perfil creado para: ${user.email} con slug: ${slug}`);
  }

  // 2. Inscribir a alumno@plattform.com
  const student = await prisma.user.findUnique({ where: { email: 'alumno@plattform.com' } });
  
  if (student) {
    // Buscar un curso disponible (de Alejandro o Admin)
    const course = await prisma.course.findFirst({
        where: { 
            instructor: { email: { in: ['admin@plattform.com', 'alejandro@plattform.com'] } }
        }
    });

    if (course) {
      const existingEnrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: student.id, courseId: course.id } }
      });

      if (!existingEnrollment) {
          await prisma.enrollment.create({
              data: {
                  userId: student.id,
                  courseId: course.id,
                  status: 'ACTIVE'
              }
          });
          console.log(`Inscripción creada para alumno@plattform.com en el curso: ${course.title}`);
      } else {
          console.log('El alumno ya está inscrito en un curso.');
      }
    } else {
        console.log('No se encontró un curso de Alejandro o Admin para la inscripción.');
    }
  } else {
    console.log('Usuario alumno@plattform.com no encontrado.');
  }

  console.log('--- Reparación de Datos Finalizada ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
