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

// GET - Obține toate categoriile
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

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { order: "asc" }
    })

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      productCount: cat._count.products
    }))

    return NextResponse.json({ categories: categoriesWithCount })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Creează o categorie nouă
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await checkFullAdminAccess(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Acces interzis. Doar administratorii pot crea categorii." }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, icon, image, order } = body

    if (!name || !slug) {
      return NextResponse.json({ error: "Numele și slug-ul sunt obligatorii" }, { status: 400 })
    }

    // Verifică dacă slug-ul există deja
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json({ error: "O categorie cu acest slug există deja" }, { status: 400 })
    }

    // Obține următorul order dacă nu este specificat
    let categoryOrder = order
    if (categoryOrder === undefined) {
      const lastCategory = await prisma.category.findFirst({
        orderBy: { order: "desc" },
        select: { order: true }
      })
      categoryOrder = (lastCategory?.order || 0) + 1
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || "🍽️",
        image: image || null,
        order: categoryOrder
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
