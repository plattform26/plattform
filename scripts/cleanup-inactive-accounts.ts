import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getAccountDeletionWarningTemplate } from '../src/lib/mail-templates/account-deletion-warning';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const DRY_RUN = process.argv.includes('--execute') ? false : true;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://plattform.mx';

const PROTECTED_EMAILS = [
  'soporte@plattform.mx',
  'diego@plattform.mx',
  'plattform26@gmail.com',
];

async function main() {
  console.log(`\n=== INICIANDO LIMPIEZA DE CUENTAS INACTIVAS ===`);
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN (Solo lectura)' : 'EXECUTE (Eliminación y envío real)'}\n`);

  const now = new Date();
  
  // 75 días
  const warningThresholdDays = 75;
  // 90 días
  const deletionThresholdDays = 90;
  // 15 días (tiempo desde que se envió el aviso)
  const warningSentThreshold = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));

  // Obtener todos los usuarios con sus relaciones
  const allUsers = await prisma.user.findMany({
    include: {
      enrollments: true,
      instructorProfile: {
        include: {
          subscriptions: {
            where: {
              status: { in: ['ACTIVE', 'PAUSED'] }
            }
          }
        }
      }
    }
  });

  const usersToWarn = [];
  const usersToDelete = [];

  for (const user of allUsers) {
    // Excluir cuentas protegidas o ADMINs
    if (PROTECTED_EMAILS.includes(user.email) || user.role === 'ADMIN') {
      continue;
    }

    const hasPurchases = user.enrollments.length > 0;
    const isInstructor = user.role === 'INSTRUCTOR' || user.instructorProfile != null;
    const hasActiveSub = isInstructor && (user.instructorProfile?.subscriptions?.length ?? 0) > 0;

    // Protegidos si tienen compras o subs activas
    if (hasPurchases || hasActiveSub) {
      continue;
    }

    // Calcular inactividad usando lastLoginAt o createdAt si nunca entró
    const referenceDate = user.lastLoginAt || user.createdAt;
    const daysInactive = Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysInactive >= deletionThresholdDays) {
      if (user.deletionWarningSentAt && user.deletionWarningSentAt < warningSentThreshold) {
        usersToDelete.push(user);
      } else if (!user.deletionWarningSentAt) {
        usersToWarn.push(user);
      }
    } else if (daysInactive >= warningThresholdDays && !user.deletionWarningSentAt) {
      usersToWarn.push(user);
    }
  }

  // --- FASE 1: AVISOS ---
  console.log(`--- FASE 1: AVISOS ---`);
  console.log(`Usuarios a notificar: ${usersToWarn.length}`);
  
  for (const user of usersToWarn) {
    const reference = user.lastLoginAt ? user.lastLoginAt.toISOString().split('T')[0] : 'Nunca (Registro: ' + user.createdAt.toISOString().split('T')[0] + ')';
    if (DRY_RUN) {
      console.log(`[DRY RUN] Se enviaría aviso a: ${user.email} (Último acceso: ${reference} | Rol: ${user.role})`);
    } else {
      try {
        await resend.emails.send({
          from: 'Plattform <no-reply@plattform.mx>',
          to: user.email,
          subject: 'Tu cuenta de Plattform será eliminada en 15 días',
          html: getAccountDeletionWarningTemplate(user.name, BASE_URL),
        });
        
        await prisma.user.update({
          where: { id: user.id },
          data: { deletionWarningSentAt: new Date() }
        });
        
        console.log(`[EXECUTE] Aviso enviado a: ${user.email}`);
      } catch (error) {
        console.error(`[ERROR] Falló el aviso a ${user.email}:`, error);
      }
    }
  }

  // --- FASE 2: ELIMINACIÓN ---
  console.log(`\n--- FASE 2: ELIMINACIÓN ---`);
  console.log(`Usuarios a eliminar: ${usersToDelete.length}`);

  for (const user of usersToDelete) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Se eliminaría permanentemente a: ${user.email}`);
    } else {
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`[EXECUTE] Usuario eliminado: ${user.email}`);
      } catch (error) {
        console.error(`[ERROR] Falló la eliminación de ${user.email}:`, error);
      }
    }
  }

  console.log(`\n=== PROCESO FINALIZADO ===`);
  if (DRY_RUN) {
    console.log(`Para ejecutar los cambios, corre el script con el flag --execute`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
