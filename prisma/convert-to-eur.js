const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Curs de schimb aproximativ RON -> EUR
const RON_TO_EUR = 0.20

async function convertPricesToEUR() {
  console.log('🔄 Conversie prețuri din RON în EUR...\n')
  
  try {
    // Obține toate produsele
    const products = await prisma.product.findMany()
    
    console.log(`📦 Găsite ${products.length} produse\n`)
    
    for (const product of products) {
      const oldPrice = product.price
      const newPrice = Math.round(oldPrice * RON_TO_EUR * 100) / 100 // Rotunjire la 2 zecimale
      
      await prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice }
      })
      
      console.log(`✅ ${product.name}: ${oldPrice} RON → ${newPrice} EUR`)
    }
    
    // Actualizează și prețurile din coșuri
    const cartItems = await prisma.cartItem.findMany()
    console.log(`\n🛒 Actualizare ${cartItems.length} items din coșuri...`)
    
    for (const item of cartItems) {
      const newPrice = Math.round(item.price * RON_TO_EUR * 100) / 100
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { price: newPrice }
      })
    }
    
    console.log('\n✅ Conversie completă!')
    console.log('💡 Toate prețurile sunt acum în EUR')
    
  } catch (error) {
    console.error('❌ Eroare:', error)
  } finally {
    await prisma.$disconnect()
  }
}

convertPricesToEUR()
