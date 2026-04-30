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
    const targetMonth = filterMonth === 'all' ? 'all' : parseInt(filterMonth || now.getMonth().toString());
    const targetYear = filterYear === 'all' ? 'all' : parseInt(filterYear || now.getFullYear().toString());

    // 1. Cálculos de Métricas (KPIs) basados en Suscripciones Activas
    const activeSubscriptions = await prisma.instructorSubscription.findMany({
      where: { 
        status: 'ACTIVE'
      },
      include: { plan: true }
    });

    const totalIncome = activeSubscriptions.reduce((acc, sub) => acc + Number(sub.plan.monthlyPrice), 0);
    
    // Métricas de Utilidad (Stripe MX Fees: (Monto * 0.034 + 3) * 1.16)
    const calcNetUtility = (amt: number) => {
      if (amt <= 0) return 0;
      const stripeFee = ((amt * 0.034) + 3) * 1.16;
      return amt - stripeFee;
    };

    const netPlatformUtility = activeSubscriptions.reduce((acc, sub) => {
      return acc + calcNetUtility(Number(sub.plan.monthlyPrice));
    }, 0);

    // REGLA: Excluir de "Críticas" a quienes tengan cortesía activa
    const expiredCount = await prisma.instructorSubscription.count({
      where: { 
        status: { in: ['PAST_DUE', 'EXPIRED', 'CANCELLED'] },
        instructor: {
          user: { isCourtesy: false }
        }
      }
    });

    // 2. Detalle de Suscripciones (Aplicar Filtros Temporales solo si no son 'all')
    const whereClause: any = {};
    if (targetYear !== 'all') {
      const firstDay = new Date(targetYear, targetMonth === 'all' ? 0 : targetMonth, 1);
      const lastDay = new Date(targetYear, targetMonth === 'all' ? 12 : targetMonth + 1, 0, 23, 59, 59);
      whereClause.createdAt = {
        gte: firstDay,
        lte: lastDay
      };
    }

    const subscriptions = await prisma.instructorSubscription.findMany({
      where: whereClause,
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
        rentThisMonth: totalIncome,
        netRevenueThisMonth: netPlatformUtility,
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
