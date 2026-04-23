import prisma from './prisma';

export type AiQuotaResult = {
  allowed: boolean;
  reason?: 'hourly_limit' | 'monthly_limit';
  resetAt?: Date;
};

// Configuración de cuotas
const MAX_HOURLY = 5;
const MAX_MONTHLY = 30;
const STALE_JOB_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutos para evitar bloqueo por crashes

/**
 * Calcula el inicio del mes actual en UTC basándose en CDMX.
 */
function getStartOfMonthCDMX(): Date {
  const now = new Date();
  const cdmxDateStr = now.toLocaleDateString('en-CA', { 
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const [year, month] = cdmxDateStr.split('-').map(Number);
  return new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00-06:00`);
}

function getNextMonthResetCDMX(): Date {
  const now = new Date();
  const cdmxDateStr = now.toLocaleDateString('en-CA', { 
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit'
  });
  const [year, month] = cdmxDateStr.split('-').map(Number);
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) { nextMonth = 1; nextYear++; }
  return new Date(`${nextYear}-${String(nextMonth).padStart(2, '0')}-01T00:00:00-06:00`);
}

/**
 * Filtro centralizado para contar consumos de cuota con lógica robusta:
 * - AND: createdAt >= since
 * - AND: (status: COMPLETED) OR (status: IN_PROGRESS AND createdAt >= activeThreshold)
 */
function getQuotaFilter(since: Date) {
  const activeThreshold = new Date(Date.now() - STALE_JOB_THRESHOLD_MS);
  return {
    AND: [
      { createdAt: { gte: since } },
      {
        OR: [
          { status: 'COMPLETED' },
          { 
            AND: [
              { status: { in: ['PROCESSING', 'PENDING'] } },
              { createdAt: { gte: activeThreshold } }
            ]
          }
        ]
      }
    ]
  };
}

export async function checkAiQuota(instructorId: string): Promise<AiQuotaResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
  const startOfMonth = getStartOfMonthCDMX();

  // 1. Check Horario (Freno de emergencia y paralelismo)
  const hourlyCount = await prisma.aIGenerationJob.count({
    where: { instructorId, ...getQuotaFilter(oneHourAgo) }
  });

  if (hourlyCount >= MAX_HOURLY) {
    const oldestJob = await prisma.aIGenerationJob.findFirst({
      where: { instructorId, ...getQuotaFilter(oneHourAgo) },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true }
    });
    const resetAt = oldestJob 
      ? new Date(oldestJob.createdAt.getTime() + 60 * 60 * 1000)
      : new Date(now.getTime() + 60 * 60 * 1000);
    return { allowed: false, reason: 'hourly_limit', resetAt };
  }

  // 2. Check Mensual (Cuota de negocio)
  const monthlyCount = await prisma.aIGenerationJob.count({
    where: { instructorId, ...getQuotaFilter(startOfMonth) }
  });

  if (monthlyCount >= MAX_MONTHLY) {
    return { allowed: false, reason: 'monthly_limit', resetAt: getNextMonthResetCDMX() };
  }

  return { allowed: true };
}
