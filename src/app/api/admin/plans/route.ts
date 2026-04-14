import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plans = await prisma.platformPlan.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { monthlyPrice: 'asc' }
    });

    return NextResponse.json(plans);
  } catch (error: any) {
    console.error('Error fetching plans for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
