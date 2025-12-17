const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Setează ambii ca SUPER_ADMIN
  const emails = ['racustefan34@gmail.com', 'mihaimutiuc@gmail.com']
  
  for (const email of emails) {
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { 
          role: 'SUPER_ADMIN', 
          isAdmin: true 
        }
      })
      console.log(`✅ User ${user.email} is now ${user.role}`)
    } catch (e) {
      console.log(`⚠️ User ${email} not found or error:`, e.message)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
