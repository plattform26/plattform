import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/revenue/rent
 * Lista rentas de instructores.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const filterMonth = url.searchParams.get('month');
    const filterYear = url.searchParams.get('year');

    const now = new Date();
    const targetMonth = filterMonth ? parseInt(filterMonth) : now.getMonth();
    const targetYear = filterYear ? parseInt(filterYear) : now.getFullYear();

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const firstDayYear = new Date(targetYear, 0, 1);

    // 1. Cálculos de Métricas (KPIs)
    const [periodRent, yearRent, expiredCount] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { grossAmount: true },
        where: {
          paymentType: 'INSTRUCTOR_SUBSCRIPTION',
          paymentStatus: 'SUCCESS',
          createdAt: { gte: firstDay, lte: lastDay }
        }
      }),
      prisma.transaction.aggregate({
        _sum: { grossAmount: true },
        where: {
          paymentType: 'INSTRUCTOR_SUBSCRIPTION',
          paymentStatus: 'SUCCESS',
          createdAt: { gte: firstDayYear, lte: lastDay }
        }
      }),
      prisma.instructorSubscription.count({
        where: { status: { in: ['PAST_DUE', 'EXPIRED', 'CANCELLED'] } }
      })
    ]);

    // 2. Detalle de Suscripciones con Conteo de Alumnos (Uso Real)
    const subscriptions = await prisma.instructorSubscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                name: true,
                lastName: true,
                email: true,
                createdAt: true,
                courses: {
                  select: {
                    _count: { select: { enrollments: true } }
                  }
                }
              }
            }
          }
        },
        plan: true
      }
    });

    return NextResponse.json({
      metrics: {
        rentThisMonth: Number(periodRent._sum.grossAmount || 0),
        accumulatedYear: Number(yearRent._sum.grossAmount || 0),
        expiredCount,
        selectedPeriod: { month: targetMonth, year: targetYear }
      },
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching admin revenue rent:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
