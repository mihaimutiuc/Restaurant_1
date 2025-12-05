const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setAdmin() {
  try {
    // Set mihaimutiuc@gmail.com as admin
    const user = await prisma.user.updateMany({
      where: { email: "mihaimutiuc@gmail.com" },
      data: { isAdmin: true }
    })

    if (user.count > 0) {
      console.log("✅ mihaimutiuc@gmail.com a fost setat ca admin!")
    } else {
      console.log("⚠️  Utilizatorul mihaimutiuc@gmail.com nu a fost găsit.")
      console.log("   Conectează-te mai întâi cu acest cont Google, apoi rulează din nou scriptul.")
    }

  } catch (error) {
    console.error("Eroare la setarea adminului:", error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()
