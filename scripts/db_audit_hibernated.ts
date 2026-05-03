import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE AUDIT: HIBERNATED BUG ---\n');

  console.log('1. COURSES TABLE STRUCTURE:');
  const coursesColumns: any[] = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'courses' 
    ORDER BY ordinal_position
  `;
  coursesColumns.forEach(c => console.log(`${c.column_name}: ${c.data_type} (Nullable: ${c.is_nullable})`));

  console.log('\n2. ENROLLMENTS TABLE STRUCTURE:');
  const enrollmentColumns: any[] = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'enrollments' 
    ORDER BY ordinal_position
  `;
  enrollmentColumns.forEach(c => console.log(`${c.column_name}: ${c.data_type} (Nullable: ${c.is_nullable})`));

  console.log('\n3. SPECIFIC COURSE DATA (Curso Prueba):');
  const data: any[] = await prisma.$queryRaw`
    SELECT 
      c.id, 
      c.title, 
      c.status, 
      e.status as enrollment_status, 
      u.email 
    FROM courses c 
    LEFT JOIN enrollments e ON c.id = e.course_id 
    LEFT JOIN users u ON e.user_id = u.id 
    WHERE c.title LIKE '%Curso Prueba%'
  `;
  console.dir(data, { depth: null });

  await prisma.$disconnect();
}

main().catch(console.error);
