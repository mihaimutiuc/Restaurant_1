import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Obține toate produsele cu categoriile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get("category")
    const search = searchParams.get("search")

    // Obține categoriile
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" }
    })

    // Construiește filtrul pentru produse
    const where = {
      isAvailable: true
    }

    if (categorySlug && categorySlug !== "all") {
      const category = categories.find(c => c.slug === categorySlug)
      if (category) {
        where.categoryId = category.id
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    // Obține produsele
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { isPopular: "desc" },
        { productId: "asc" }
      ]
    })

    // Formatează produsele pentru frontend
    const formattedProducts = products.map(product => ({
      id: product.id,  // Use MongoDB ObjectId as unique identifier
      productId: product.productId,
      name: product.name,
      description: product.description,
      longDescription: product.longDescription,
      price: product.price,
      image: product.image,
      category: product.category.slug,
      categoryName: product.category.name,
      categoryImage: product.category.image,
      isPopular: product.isPopular,
      isNew: product.isNew,
      ingredients: product.ingredients,
      allergens: product.allergens,
      preparationTime: product.displayTime,
      preparationTimeMinutes: product.preparationTime,
      calories: product.calories,
      isAvailable: product.isAvailable
    }))

    // Formatează categoriile pentru frontend - adaugă "Toate" la început
    const formattedCategories = [
      { id: "all", name: "Toate", image: null },
      ...categories.map(cat => ({
        id: cat.slug,
        name: cat.name,
        image: cat.image
      }))
    ]

    return NextResponse.json({
      categories: formattedCategories,
      items: formattedProducts,
      currency: "EUR",
      addToCartLabel: "Adaugă",
      viewDetailsLabel: "Vezi detalii",
      sectionTitle: "Meniul Nostru",
      sectionSubtitle: "Descoperă preparatele noastre delicioase, gătite cu pasiune și ingrediente proaspete"
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
