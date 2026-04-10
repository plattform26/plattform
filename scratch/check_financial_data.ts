import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DIAGNÓSTICO FINANCIERO: SUBSCRIPCIONES ---');
  
  const subscriptions = await prisma.instructorSubscription.findMany({
    include: {
      instructor: {
        include: { user: true }
      },
      plan: true
    }
  });
  
  console.log(`Instructores con perfil de suscripción: ${subscriptions.length}`);
  subscriptions.forEach(sub => {
    console.log(`- Instructor: ${sub.instructor.user.name} ${sub.instructor.user.lastName} (${sub.instructor.user.email})`);
    console.log(`  Plan: ${sub.plan.displayName} | Status: ${sub.status}`);
  });

  console.log('\n--- DIAGNÓSTICO FINANCIERO: TRANSACCIONES ---');
  
  const transactions = await prisma.transaction.findMany({
    where: { paymentType: 'INSTRUCTOR_SUBSCRIPTION' },
    include: {
      user: true
    }
  });
  
  console.log(`Transacciones de tipo INSTRUCTOR_SUBSCRIPTION encontradas: ${transactions.length}`);
  transactions.forEach(tx => {
    console.log(`- TX ID: ${tx.id} | User: ${tx.user.name} | Amount: ${tx.grossAmount} | Status: ${tx.paymentStatus}`);
  });
  
  if (transactions.length === 0 && subscriptions.length > 0) {
    console.log('\n[!] HALLAZGO: Hay instructores suscritos pero NO hay registros en la tabla de Transacciones con ese tipo.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
