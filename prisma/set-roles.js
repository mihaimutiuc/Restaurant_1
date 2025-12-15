// Script pentru a seta rolul utilizatorilor existenți
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

async function main() {
  console.log("Actualizare roluri utilizatori...")
  
  // Setează SUPER_ADMIN pentru email-ul specificat
  const superAdmin = await prisma.user.updateMany({
    where: { 
      email: { equals: SUPER_ADMIN_EMAIL, mode: 'insensitive' }
    },
    data: { 
      role: 'SUPER_ADMIN',
      isAdmin: true
    }
  })
  console.log(`Super Admin actualizat: ${superAdmin.count} utilizatori`)
  
  // Setează ADMIN pentru toți ceilalți admini
  const admins = await prisma.user.updateMany({
    where: { 
      isAdmin: true,
      NOT: {
        email: { equals: SUPER_ADMIN_EMAIL, mode: 'insensitive' }
      }
    },
    data: { 
      role: 'ADMIN'
    }
  })
  console.log(`Admini actualizați: ${admins.count} utilizatori`)
  
  // Afișează toți utilizatorii cu roluri administrative
  const allAdmins = await prisma.user.findMany({
    where: {
      OR: [
        { isAdmin: true },
        { role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isAdmin: true
    }
  })
  
  console.log("\nUtilizatori cu acces administrativ:")
  console.table(allAdmins)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
