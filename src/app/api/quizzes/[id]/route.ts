import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        },
        course: {
          select: { title: true }
        }
      }
    });

    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: { course: true, questions: true }
    });
    
    if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    if (session.role !== 'ADMIN' && quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate totalScore if being changed
    if (body.totalScore !== undefined) {
      const ts = Number(body.totalScore);
      if (ts !== 10 && ts !== 100) {
        return NextResponse.json({ error: 'totalScore must be 10 or 100' }, { status: 400 });
      }
    }

    // If MANUAL distribution, validate SUM(points) === totalScore
    const newDistribution = body.scoreDistribution ?? quiz.scoreDistribution;
    const newTotalScore = body.totalScore !== undefined ? Number(body.totalScore) : quiz.totalScore;
    if (newDistribution === 'MANUAL' && quiz.questions.length > 0) {
      const sum = quiz.questions.reduce((acc, q) => acc + q.points, 0);
      if (sum !== newTotalScore) {
        return NextResponse.json(
          { error: `La suma de puntos (${sum}) no coincide con el puntaje total (${newTotalScore})` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        title: body.title ?? quiz.title,
        passingScore: body.passingScore !== undefined ? Number(body.passingScore) : quiz.passingScore,
        totalScore: newTotalScore,
        scoreDistribution: newDistribution,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
