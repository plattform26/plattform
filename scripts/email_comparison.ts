import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stripeEmail = 'diego.castellanos.maya@hotmail.com';
  const userId = '494a100f-c125-4739-afce-a01016bfcf07';

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    console.log('Error: Usuario no encontrado en la base de datos.');
    return;
  }

  const dbEmail = user.email;

  console.log('--- COMPARACIÓN DE EMAILS (BIT A BIT) ---');
  console.log(`Stripe: [${stripeEmail}] (Length: ${stripeEmail.length})`);
  console.log(`DB:     [${dbEmail}] (Length: ${dbEmail.length})`);

  const match = stripeEmail === dbEmail;
  console.log(`\n¿Coincidencia exacta?: ${match ? '✅ SÍ' : '❌ NO'}`);

  if (!match) {
    console.log('\nAnálisis de diferencias:');
    for (let i = 0; i < Math.max(stripeEmail.length, dbEmail.length); i++) {
      const charS = stripeEmail[i] || '';
      const charD = dbEmail[i] || '';
      const codeS = charS.charCodeAt(0) || '-';
      const codeD = charD.charCodeAt(0) || '-';
      
      if (charS !== charD) {
        console.log(`Posición ${i}: Stripe='${charS}'(${codeS}) vs DB='${charD}'(${codeD}) <--- DIFERENCIA`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
