import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { quizId, questionText, questionType, optionsJson, correctAnswer, points, orderIndex } = await req.json();

    const question = await prisma.quizQuestion.create({
      data: {
        quizId,
        questionText,
        questionType: questionType || 'SINGLE', // DEFAULT TO SINGLE
        optionsJson: optionsJson || [],
        correctAnswer: String(correctAnswer || ''),
        points: parseInt(String(points)) || 10, // Default 10 points per question
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
    const { id, ...data } = await req.json();
    
    // Clean data for Prisma
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.quizQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting question' }, { status: 500 });
  }
}
