import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/transactions
 * Lista transacciones globales.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // COURSE_PURCHASE, INSTRUCTOR_SUBSCRIPTION
  const status = searchParams.get('status');

  try {
    const where: any = {};
    if (type) where.paymentType = type;
    if (status) where.paymentStatus = status;

    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
         user: { 
           select: { 
             name: true, 
             lastName: true, 
             email: true, 
             role: true,
             instructorProfile: {
               include: {
                 subscriptions: {
                   where: { status: 'ACTIVE' },
                   include: { plan: { select: { displayName: true } } },
                   take: 1
                 }
               }
             }
           } 
         },
         course: { select: { title: true } }
      }
    });

    return NextResponse.json(txs);
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
