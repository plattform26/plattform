import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Plattform2025', 12)
  
  const emails = [
    'admin@plattform.com',
    'alejandro@plattform.com', 
    'alumno@plattform.com'
  ]
  
  for (const email of emails) {
    try {
      await prisma.user.update({
        where: { email },
        data: { 
          passwordHash: hash,
          emailVerifiedAt: new Date()
        }
      })
      console.log(`✅ Reset: ${email}`)
    } catch (e: any) {
      console.log(`❌ Error con ${email}: ${e.message}`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
