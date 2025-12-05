import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Obține un produs specific după ID (accepts both MongoDB ObjectId and productId)
export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    let product = null
    
    // Try to find by MongoDB ObjectId first
    if (id.length === 24) {
      try {
        product = await prisma.product.findUnique({
          where: { id },
          include: { category: true }
        })
      } catch (e) {
        // Not a valid ObjectId, try productId
      }
    }
    
    // If not found, try by numeric productId
    if (!product) {
      const productId = parseInt(id)
      if (!isNaN(productId)) {
        product = await prisma.product.findUnique({
          where: { productId },
          include: { category: true }
        })
      }
    }

    if (!product) {
      return NextResponse.json({ error: "Produsul nu a fost găsit" }, { status: 404 })
    }

    // Obține produse similare (aceeași categorie)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isAvailable: true
      },
      include: { category: true },
      take: 3
    })

    // Obține toate categoriile pentru navigare
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    })

    const formattedProduct = {
      id: product.id,  // MongoDB ObjectId as unique identifier
      productId: product.productId,
      name: product.name,
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      image: product.image,
      category: product.category.slug,
      categoryName: product.category.name,
      categoryIcon: product.category.icon,
      isPopular: product.isPopular,
      isNew: product.isNew,
      ingredients: product.ingredients,
      allergens: product.allergens,
      preparationTime: product.displayTime,
      preparationTimeMinutes: product.preparationTime,
      calories: product.calories,
      isAvailable: product.isAvailable
    }

    const formattedRelated = relatedProducts.map(p => ({
      id: p.id,
      productId: p.productId,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: p.category.slug
    }))

    const formattedCategories = categories.map(cat => ({
      id: cat.slug,
      name: cat.name,
      icon: cat.icon
    }))

    return NextResponse.json({
      product: formattedProduct,
      relatedProducts: formattedRelated,
      categories: formattedCategories,
      currency: "RON"
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
