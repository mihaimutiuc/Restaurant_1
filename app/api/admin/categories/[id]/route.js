import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verifică dacă utilizatorul are acces complet (ADMIN sau SUPER_ADMIN)
async function checkFullAdminAccess(session) {
  if (!session) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true, role: true }
  })
  
  return user?.isAdmin && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role)
}

// GET - Obține o categorie specifică
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true,
            isAvailable: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Actualizează o categorie
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await checkFullAdminAccess(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // Verifică dacă categoria există
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 })
    }

    // Verifică dacă slug-ul nou există deja (dacă se schimbă)
    if (body.slug && body.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: body.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: "O categorie cu acest slug există deja" }, { status: 400 })
      }
    }

    // Șterge imaginea veche dacă se încarcă una nouă
    if (body.image && existingCategory.image && body.image !== existingCategory.image) {
      if (existingCategory.image.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), 'public', existingCategory.image)
        if (fs.existsSync(oldImagePath)) {
          try {
            fs.unlinkSync(oldImagePath)
          } catch (err) {
            console.error("Error deleting old image:", err)
          }
        }
      }
    }

    const updateData = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.image !== undefined) updateData.image = body.image
    if (body.order !== undefined) updateData.order = body.order

    const category = await prisma.category.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Șterge o categorie
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await checkFullAdminAccess(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Acces interzis" }, { status: 403 })
    }

    const { id } = await params

    // Verifică dacă categoria există și are produse
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria nu a fost găsită" }, { status: 404 })
    }

    if (category._count.products > 0) {
      return NextResponse.json({ 
        error: `Nu poți șterge această categorie. Are ${category._count.products} produse asociate. Mută produsele în altă categorie mai întâi.` 
      }, { status: 400 })
    }

    // Șterge imaginea categoriei dacă există
    if (category.image && category.image.startsWith('/uploads/')) {
      const imagePath = path.join(process.cwd(), 'public', category.image)
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath)
        } catch (err) {
          console.error("Error deleting category image:", err)
        }
      }
    }

    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Categoria a fost ștearsă" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
