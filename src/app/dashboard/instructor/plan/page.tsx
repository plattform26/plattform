import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { serialize } from '@/lib/utils';
import PlanClient from './PlanClient';

const PLAN_ICONS: Record<string, string> = {
  starter: '🚀',
  growth: '📈',
  scale: '⚡',
};

export default async function PlanPage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
        take: 1,
      },
    }
  });

  const activeSub = profile?.subscriptions[0];
  const allPlans = await prisma.platformPlan.findMany({ where: { status: 'ACTIVE' }, orderBy: { monthlyPrice: 'asc' } });
  
  // Misión: Sanitización radical de Decimal (Prisma) para Componentes de Cliente
  const serializedPlans = serialize(allPlans || []);
  const serializedActivePlanId = serialize(activeSub?.plan.id || null);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-space-grotesk font-bold">Mi plan 💎</h1>
        <p className="text-gray-400 text-sm mt-1">Gestiona tu suscripción y límites de la plataforma.</p>
      </div>

      {activeSub ? (
        <div className="bg-gradient-to-br from-[#06B6D4]/10 to-[#3B82F6]/10 border border-cyan-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                {PLAN_ICONS[activeSub.plan.name] ?? '💎'}
              </div>
              <div>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-0.5">Plan actual</div>
                <div className="text-xl font-bold text-white">{activeSub.plan.displayName}</div>
                <div className="text-sm text-gray-400">
                  ${Number(activeSub.plan.monthlyPrice).toLocaleString('es-MX')} MXN/mes · {activeSub.plan.commissionRate}% comisión
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Estado</div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20">
                <span className="w-1.5 h-1.5 rounded-full bg-current" /> ACTIVO
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#070d1a]/60 rounded-xl p-4 border border-blue-500/10">
              <div className="text-xs text-gray-500 mb-1">Límite de alumnos</div>
              <div className="text-lg font-bold text-white">
                {activeSub.plan.studentLimit === -1 ? 'Ilimitado' : `${activeSub.activeStudentCount}/${activeSub.plan.studentLimit}`}
              </div>
            </div>
            <div className="bg-[#070d1a]/60 rounded-xl p-4 border border-blue-500/10">
              <div className="text-xs text-gray-500 mb-1">IA incluida</div>
              <div className="text-lg font-bold text-white">{activeSub.plan.aiEnabled ? '✓ Sí' : '✗ No'}</div>
            </div>
            <div className="bg-[#070d1a]/60 rounded-xl p-4 border border-blue-500/10">
              <div className="text-xs text-gray-500 mb-1">Vence</div>
              <div className="text-lg font-bold text-white">
                {activeSub.expiresAt ? new Date(activeSub.expiresAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Indefinido'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-center" id="no-sub-banner">
          <div className="text-3xl mb-3">⚠️</div>
          <div className="text-red-400 font-semibold mb-1">Sin suscripción activa</div>
          <div className="text-gray-400 text-sm">Necesitas una suscripción activa para publicar cursos y recibir alumnos.</div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Planes disponibles</div>
        <Suspense fallback={<div className="p-10 text-center animate-pulse text-cyan-500 font-mono text-xs uppercase tracking-widest">Sincronizando catálogo...</div>}>
          <PlanClient 
            plans={serializedPlans} 
            activePlanId={serializedActivePlanId} 
            expirationDate={serialize(activeSub?.expiresAt || null)}
          />
        </Suspense>
      </div>
    </>
  );
}
