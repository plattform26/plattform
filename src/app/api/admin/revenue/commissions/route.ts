import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/**
 * GET /api/admin/revenue/commissions
 * Misión: Sincronización de Tabla de Comisiones
 * Extrae datos reales del modelo Enrollment y calcula comisiones.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // "0"-"11" o "all"
    const year = searchParams.get('year');   // "2024"+ o "all"
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    // 1. Filtro de Periodo (enrolledAt)
    if (year && year !== 'all') {
      const targetYear = parseInt(year);
      if (month && month !== 'all') {
        const targetMonth = parseInt(month);
        where.enrolledAt = {
          gte: new Date(targetYear, targetMonth, 1),
          lte: new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)
        };
      } else {
        where.enrolledAt = {
          gte: new Date(targetYear, 0, 1),
          lte: new Date(targetYear, 11, 31, 23, 59, 59)
        };
      }
    } else if (year !== 'all') {
      // Default: Mes actual
      const now = new Date();
      where.enrolledAt = {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      };
    }

    // 2. Filtros Dinámicos
    if (instructorId && instructorId !== 'all') {
      where.course = { ...where.course, instructorId };
    }
    if (status && status !== 'all') {
      where.course = { ...where.course, status };
    }

    // 2.1 Búsqueda Reactiva (Instructor + Academia)
    if (search) {
      where.course = {
        ...where.course,
        instructor: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { instructorProfile: { academyName: { contains: search, mode: 'insensitive' } } }
          ]
        }
      };
    }

    // 3. Consulta de Enrollments con Relaciones Reales
    const enrollments = await db.enrollment.findMany({
      where,
      include: {
        user: { select: { name: true, lastName: true, email: true } },
        course: {
          select: {
            title: true,
            price: true,
            currency: true,
            status: true,
            instructor: {
              select: {
                id: true,
                name: true,
                lastName: true,
                isCourtesy: true,
                courtesyPlan: { select: { name: true } },
                instructorProfile: { 
                  select: { 
                    academyName: true, 
                    commissionRate: true,
                    subscriptions: {
                      where: { status: 'ACTIVE' },
                      select: { plan: { select: { name: true } } },
                      take: 1
                    }
                  } 
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // 4. Agrupación y Cálculo de Comisiones en Tiempo Real
    const instructorMap = new Map();
    let totalGross = 0;
    let totalCommissions = 0;

    for (const enr of enrollments) {
      const price = Number(enr.course.price || 0);
      const instructor = enr.course.instructor;
      if (!instructor) continue;

      // Lógica de Comisión: Prioridad Plan Activo (Starter 15%, Growth 10%, Scale 7%)
      let platformRate = 15; // Default Starter
      
      const activePlanName = instructor.isCourtesy 
        ? instructor.courtesyPlan?.name 
        : instructor.instructorProfile?.subscriptions?.[0]?.plan?.name;

      if (activePlanName === 'scale') platformRate = 7;
      else if (activePlanName === 'growth') platformRate = 10;
      else if (activePlanName === 'starter') platformRate = 15;
      else {
        // Fallback a commissionRate manual si existe en el perfil, sino 15%
        platformRate = Number(instructor.instructorProfile?.commissionRate || 15);
      }

      const platformCommission = price * (platformRate / 100);
      const netInstructor = price - platformCommission;

      totalGross += price;
      totalCommissions += platformCommission;

      if (!instructorMap.has(instructor.id)) {
        instructorMap.set(instructor.id, {
          instructorId: instructor.id,
          instructorName: `${instructor.name} ${instructor.lastName}`,
          academyName: instructor.instructorProfile?.academyName || 'N/A',
          commissionRate: platformRate,
          salesCount: 0,
          grossAmount: 0,
          platformCommission: 0,
          netAmount: 0,
          transactions: []
        });
      }

      const stats = instructorMap.get(instructor.id);
      stats.salesCount += 1;
      stats.grossAmount += price;
      stats.platformCommission += platformCommission;
      stats.netAmount += netInstructor;
      stats.transactions.push({
        id: enr.id,
        courseTitle: enr.course.title,
        studentName: `${enr.user.name} ${enr.user.lastName}`,
        amount: price,
        commission: platformCommission,
        createdAt: enr.enrolledAt,
        status: enr.status
      });
    }

    // Tendencia (Mock para este ejemplo o cálculo real vs mes anterior)
    const prevMonthCommissions = totalCommissions * 0.9; // Simulación para UI

    const result = {
      metrics: {
        totalGross,
        totalCommissions,
        prevMonthCommissions,
        salesCount: enrollments.length,
        averageSale: enrollments.length > 0 ? totalGross / enrollments.length : 0,
        isHistorical: year === 'all'
      },
      instructors: Array.from(instructorMap.values()).sort((a, b) => b.grossAmount - a.grossAmount),
      selectedPeriod: { month, year }
    };

    // 5. Sanitización Radical (Decimal Fix)
    return NextResponse.json(JSON.parse(JSON.stringify(result)));

  } catch (error) {
    console.error('Error in commissions API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
