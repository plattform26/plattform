import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findDiego() {
  console.log('Searching for Diego...');
  const users = await prisma.user.findMany({
    where: { 
      OR: [
        { email: { contains: 'azulno26', mode: 'insensitive' } },
        { name: { contains: 'Diego', mode: 'insensitive' } }
      ]
    }
  });
  
  users.forEach(u => {
    console.log(`Found User: ID=${u.id}, Email=${u.email}, Name=${u.name}`);
  });
}

findDiego()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
