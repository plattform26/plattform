import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { isCourseLocked } from '@/lib/course-protection';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, questionText, questionType, optionsJson, correctAnswer, points, orderIndex } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    if (session.role !== 'ADMIN' && quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo (Seguridad en Producción)
    const lock = await isCourseLocked(quiz.courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ error: 'CURSO_BLOQUEADO', message: lock.reason }, { status: 403 });
    }

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        questionText,
        questionType: questionType || 'SINGLE',
        optionsJson: optionsJson || [],
        correctAnswer: String(correctAnswer || ''),
        points: parseInt(String(points)) || 10,
        orderIndex: parseInt(String(orderIndex)) || 0
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Error creating question' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();
    
    const questionToUpdate = await prisma.quizQuestion.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } }
    });

    if (!questionToUpdate) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    if (session.role !== 'ADMIN' && questionToUpdate.quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo (Seguridad en Producción)
    const lock = await isCourseLocked(questionToUpdate.quiz.courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ error: 'CURSO_BLOQUEADO', message: lock.reason }, { status: 403 });
    }

    const updateData: any = {};
    if (data.questionText !== undefined) updateData.questionText = data.questionText;
    if (data.questionType !== undefined) updateData.questionType = data.questionType;
    if (data.optionsJson !== undefined) updateData.optionsJson = data.optionsJson;
    if (data.correctAnswer !== undefined) updateData.correctAnswer = String(data.correctAnswer);
    if (data.points !== undefined) updateData.points = parseInt(String(data.points));
    if (data.orderIndex !== undefined) updateData.orderIndex = parseInt(String(data.orderIndex));

    const question = await prisma.quizQuestion.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Error updating question' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'INSTRUCTOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const questionToDelete = await prisma.quizQuestion.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } }
    });

    if (!questionToDelete) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    if (session.role !== 'ADMIN' && questionToDelete.quiz.course.instructorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Lógica de Bloqueo (Seguridad en Producción)
    const lock = await isCourseLocked(questionToDelete.quiz.courseId, session.role);
    if (lock.locked) {
        return NextResponse.json({ error: 'CURSO_BLOQUEADO', message: lock.reason }, { status: 403 });
    }

    await prisma.quizQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting question' }, { status: 500 });
  }
}
