import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { getAccountDeletionWarningTemplate } from '../src/lib/mail-templates/account-deletion-warning';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const DRY_RUN = process.argv.includes('--execute') ? false : true;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://plattform.mx';

async function main() {
  console.log(`\n=== INICIANDO LIMPIEZA DE CUENTAS INACTIVAS ===`);
  console.log(`Modo: ${DRY_RUN ? 'DRY RUN (Solo lectura)' : 'EXECUTE (Eliminación y envío real)'}\n`);

  const now = new Date();
  
  // 2 meses y 15 días atrás (aprox 75 días)
  const warningThreshold = new Date(now.getTime() - (75 * 24 * 60 * 60 * 1000));
  
  // 3 meses atrás (aprox 90 días)
  const deletionThreshold = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  // 15 días atrás
  const warningSentThreshold = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));

  // 1. Fase de Aviso
  const usersToWarn = await prisma.user.findMany({
    where: {
      lastLoginAt: { lt: warningThreshold },
      deletionWarningSentAt: null,
      enrollments: { none: {} },
      instructorProfile: {
        is: null, // No instructor profile, meaning no subscriptions
      }
    }
  });

  console.log(`--- FASE 1: AVISOS ---`);
  console.log(`Usuarios a notificar: ${usersToWarn.length}`);
  
  for (const user of usersToWarn) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Se enviaría aviso a: ${user.email} (lastLogin: ${user.lastLoginAt})`);
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

  // 2. Fase de Eliminación
  const usersToDelete = await prisma.user.findMany({
    where: {
      lastLoginAt: { lt: deletionThreshold },
      deletionWarningSentAt: { lt: warningSentThreshold },
      enrollments: { none: {} },
      instructorProfile: {
        is: null,
      }
    }
  });

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
