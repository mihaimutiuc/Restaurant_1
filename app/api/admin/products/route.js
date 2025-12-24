import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verifică dacă utilizatorul are acces complet (ADMIN sau SUPER_ADMIN)
async function checkFullAdminAccess(session) {
  if (!session) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true, role: true }
  })
  
  // Permite doar ADMIN și SUPER_ADMIN (nu MODERATOR)
  return user?.isAdmin && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role)
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Pentru GET, permitem și moderatorilor să vadă produsele (readonly)
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: { name: "asc" }
    })

    // Map field names for frontend compatibility
    const mappedProducts = products.map(p => ({
      ...p,
      available: p.isAvailable,
      prepTime: p.preparationTime
    }))

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ products: mappedProducts, categories })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifică acces complet (doar ADMIN și SUPER_ADMIN pot crea produse)
    const hasAccess = await checkFullAdminAccess(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Acces interzis. Doar administratorii pot crea produse." }, { status: 403 })
    }

    const body = await request.json()
    
    // Get the highest productId to generate a new one
    const lastProduct = await prisma.product.findFirst({
      orderBy: { productId: "desc" },
      select: { productId: true }
    })
    const newProductId = (lastProduct?.productId || 0) + 1

    const prepTime = body.prepTime || 15
    
    const product = await prisma.product.create({
      data: {
        productId: newProductId,
        name: body.name,
        description: body.description || "",
        longDescription: body.description || "",
        price: body.price,
        image: body.image || "/uploads/default-product.jpg",
        preparationTime: prepTime,
        displayTime: `${prepTime} min`,
        isAvailable: body.available ?? true,
        isPopular: false,
        isNew: true,
        ingredients: [],
        allergens: [],
        calories: body.calories || 0,
        categoryId: body.categoryId
      },
      include: { category: true }
    })

    // Return with mapped field names for frontend compatibility
    return NextResponse.json({
      ...product,
      available: product.isAvailable,
      prepTime: product.preparationTime
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 })
  }
}
