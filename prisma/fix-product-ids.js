const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixProductIds() {
  try {
    // Get all products ordered by createdAt
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    })

    console.log(`Found ${products.length} products`)

    // Check for duplicates
    const productIdCount = {}
    const duplicates = []
    
    for (const product of products) {
      if (productIdCount[product.productId]) {
        duplicates.push(product)
        console.log(`Duplicate productId ${product.productId}: ${product.name} (${product.id})`)
      } else {
        productIdCount[product.productId] = product
      }
    }

    if (duplicates.length === 0) {
      console.log('No duplicate productIds found!')
      return
    }

    console.log(`\nFound ${duplicates.length} products with duplicate productIds`)

    // Get the highest productId
    const maxProductId = Math.max(...products.map(p => p.productId))
    console.log(`Highest productId: ${maxProductId}`)

    // Fix duplicates by assigning new unique productIds
    let nextId = maxProductId + 1
    for (const product of duplicates) {
      console.log(`Fixing ${product.name}: ${product.productId} -> ${nextId}`)
      await prisma.product.update({
        where: { id: product.id },
        data: { productId: nextId }
      })
      nextId++
    }

    console.log('\nAll duplicate productIds have been fixed!')
    
    // Verify
    const updatedProducts = await prisma.product.findMany({
      select: { id: true, productId: true, name: true }
    })
    console.log('\nUpdated products:')
    updatedProducts.forEach(p => console.log(`  ${p.productId}: ${p.name}`))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductIds()
