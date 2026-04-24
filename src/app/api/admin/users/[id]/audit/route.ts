import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId.toLowerCase() },
      select: { id: true, role: true, email: true }
    });

    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 1. Auditoría como Alumno (Inscripciones Globales)
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            _count: { select: { lessons: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const studentAudit = await Promise.all(enrollments.map(async (en) => {
      const completedLessons = await prisma.progress.count({
        where: { userId, courseId: en.courseId, completed: true }
      });
      const totalLessons = en.course._count?.lessons || 0;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      const hasCertificate = (await prisma.certification.count({
        where: { userId, courseId: en.courseId }
      })) > 0;

      let paymentSource = 'INSCRIPCIÓN';
      const manualRecord = await prisma.adminManualEnrollment.findFirst({
        where: { studentId: userId, courseId: en.courseId }
      });

      if (manualRecord) {
        paymentSource = 'BYPASS ADMIN';
      } else {
        try {
          const transaction = await prisma.transaction.findFirst({
            where: { userId, courseId: en.courseId, paymentStatus: 'SUCCESS' },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            paymentSource = transaction.grossAmount.toNumber() === 0 ? 'GRATIS / CUPÓN' : 'STRIPE';
          }
        } catch (err) {
          console.warn(`[AUDIT] Error fetching transaction for ${en.courseId}:`, err);
        }
      }

      return {
        courseId: en.courseId,
        courseTitle: en.course.title,
        enrolledAt: en.createdAt,
        progress: progressPercent,
        hasCertificate,
        paymentSource,
        type: 'ENROLLMENT'
      };
    }));

    // 2. Auditoría como Instructor (Cursos Creados)
    let instructorAudit: any[] = [];
    if (targetUser.role === 'INSTRUCTOR' || targetUser.role === 'ADMIN') {
       const createdCourses = await prisma.course.findMany({
         where: { instructorId: userId, deletedAt: null },
         include: {
           _count: { select: { enrollments: true } }
         },
         orderBy: { createdAt: 'desc' }
       });

       instructorAudit = createdCourses.map(c => ({
         courseId: c.id,
         courseTitle: `[AUTOR] ${c.title}`,
         enrolledAt: c.createdAt,
         progress: c.status === 'PUBLISHED' ? 100 : 0, 
         paymentSource: `STATUS: ${c.status}`,
         studentsCount: c._count.enrollments,
         type: 'CREATION'
       }));
    }

    const combined = [...instructorAudit, ...studentAudit];
    console.log(`[AUDIT v4.3] Identity Synced for ${targetUser.email} (${targetUser.role}) - Found ${combined.length} records.`);
    return NextResponse.json(combined);
  } catch (error: any) {
    console.error('Audit Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
