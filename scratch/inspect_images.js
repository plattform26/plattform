const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectCourseImages() {
  const courseId = '05392716-c4ab-4a70-951f-3d8c903b1425';
  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    select: { id: true, title: true, contentText: true }
  });

  console.log(`Found ${lessons.length} lessons in course.`);
  for (const l of lessons) {
    console.log(`\n--- LESSON: ${l.title} (ID: ${l.id}) ---`);
    if (!l.contentText) {
      console.log('No contentText');
      continue;
    }
    // Find all img tags src
    const imgMatches = l.contentText.match(/<img[^>]+src=["']([^"']+)["']/g);
    if (imgMatches) {
      imgMatches.forEach(m => console.log('IMG TAG:', m));
    } else {
      console.log('No <img> tags found in this lesson.');
    }
  }
}

inspectCourseImages().catch(console.error).finally(() => prisma.$disconnect());
