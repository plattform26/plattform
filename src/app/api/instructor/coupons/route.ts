import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    where: {
      course: {
        instructorId: session.userId
      }
    },
    include: {
      course: {
        select: { title: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, discountPercent, courseId, expiresAt, maxUses } = await req.json();

  if (!code || !discountPercent || !courseId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify course ownership
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  if (!course || course.instructorId !== session.userId) {
    return NextResponse.json({ error: 'Unauthorized course' }, { status: 401 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountPercent,
      courseId,
      expirationDate: expiresAt ? new Date(expiresAt) : null,
      usageLimit: maxUses ? parseInt(maxUses) : null,
    }
  });

  return NextResponse.json(coupon);
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  // Verify ownership via course
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { course: true }
  });

  if (!coupon || !coupon.course || coupon.course.instructorId !== session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.coupon.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
