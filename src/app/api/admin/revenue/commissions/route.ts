import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/revenue/commissions
 * Lista comisiones por venta de cursos con soporte para vista histórica (all).
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const filterMonth = url.searchParams.get('month'); // "0"-"11" o "all"
    const filterYear = url.searchParams.get('year');   // "2024"+ o "all"

    const where: any = {
      paymentStatus: 'SUCCESS',
      paymentType: 'COURSE_PURCHASE',
    };

    let isHistorical = false;

    // Lógica de filtrado temporal dinámico
    if (filterYear && filterYear !== 'all') {
      const targetYear = parseInt(filterYear);
      if (filterMonth && filterMonth !== 'all') {
        // Rango mensual específico
        const targetMonth = parseInt(filterMonth);
        const firstDay = new Date(targetYear, targetMonth, 1);
        const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        where.createdAt = { gte: firstDay, lte: lastDay };
      } else {
        // Todo un año específico
        const firstDay = new Date(targetYear, 0, 1);
        const lastDay = new Date(targetYear, 11, 31, 23, 59, 59);
        where.createdAt = { gte: firstDay, lte: lastDay };
        isHistorical = true;
      }
    } else if (filterYear === 'all') {
      // Histórico Total: No añadimos filtro de createdAt
      isHistorical = true;
    } else {
      // Default: Mes actual si no se pasan parámetros
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      where.createdAt = { gte: firstDay, lte: lastDay };
    }

    // 1. Obtener transacciones del periodo seleccionado
    const allTransactions = await prisma.transaction.findMany({
      where,
      include: {
        course: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Obtener comisiones del periodo anterior para tendencia (solo si es mensual específico)
    let prevMonthCommissions = 0;
    if (!isHistorical && filterMonth !== 'all' && filterYear !== 'all') {
      const now = new Date();
      const targetMonth = filterMonth ? parseInt(filterMonth) : now.getMonth();
      const targetYear = filterYear ? parseInt(filterYear) : now.getFullYear();
      
      const firstDayPrev = new Date(targetYear, targetMonth - 1, 1);
      const lastDayPrev = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const prevMonthAgg = await prisma.transaction.aggregate({
        _sum: { platformCommissionAmount: true },
        where: {
          paymentStatus: 'SUCCESS',
          paymentType: 'COURSE_PURCHASE',
          createdAt: { gte: firstDayPrev, lte: lastDayPrev }
        }
      });
      prevMonthCommissions = Number(prevMonthAgg._sum.platformCommissionAmount || 0);
    }

    // 3. Cálculos de Métricas Globales (KPIs)
    const totalGross = allTransactions.reduce((acc, t) => acc + Number(t.grossAmount), 0);
    const totalCommissions = allTransactions.reduce((acc, t) => acc + Number(t.platformCommissionAmount), 0);
    const salesCount = allTransactions.length;

    // 4. Procesar y agrupar por Instructor
    const instructorMap = new Map();

    for (const t of allTransactions) {
      if (!t.instructorId) continue;

      if (!instructorMap.has(t.instructorId)) {
        instructorMap.set(t.instructorId, {
          instructorId: t.instructorId,
          salesCount: 0,
          grossAmount: 0,
          platformCommission: 0,
          netAmount: 0,
          transactions: []
        });
      }

      const inst = instructorMap.get(t.instructorId);
      inst.salesCount += 1;
      inst.grossAmount += Number(t.grossAmount);
      inst.platformCommission += Number(t.platformCommissionAmount);
      inst.netAmount += Number(t.netAmountToInstructor);
      inst.transactions.push({
        id: t.id,
        courseTitle: t.course?.title || 'Curso Eliminado',
        amount: Number(t.grossAmount),
        commission: Number(t.platformCommissionAmount),
        stripeId: t.stripePaymentIntentId || 'N/A',
        createdAt: t.createdAt
      });
    }

    // 5. Enriquecer con info de usuario/perfil/suscripción
    const instructorIds = Array.from(instructorMap.keys());
    const instructorInfo = await prisma.user.findMany({
      where: { id: { in: instructorIds } },
      select: { 
        id: true, 
        name: true, 
        lastName: true,
        instructorProfile: { 
          select: { 
            academyName: true, 
          } 
        },
        instructorSubscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1
        }
      }
    });

    const instructorsData = instructorIds.map(id => {
      const info = instructorInfo.find(i => i.id === id);
      const stats = instructorMap.get(id);
      const activeSub = info?.instructorSubscriptions?.[0];
      
      return {
        ...stats,
        instructorName: info ? `${info.name} ${info.lastName}` : 'Instructor Migrado',
        academyName: info?.instructorProfile?.academyName || 'N/A',
        commissionRate: activeSub?.plan?.commissionRate || 15
      };
    }).sort((a, b) => b.grossAmount - a.grossAmount);

    return NextResponse.json({
      metrics: {
        totalGross,
        totalCommissions,
        prevMonthCommissions,
        salesCount,
        averageSale: salesCount > 0 ? totalGross / salesCount : 0,
        isHistorical
      },
      instructors: instructorsData,
      selectedPeriod: { month: filterMonth, year: filterYear }
    });
  } catch (error) {
    console.error('Error fetching admin commissions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
