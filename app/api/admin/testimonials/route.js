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

export async function GET() {
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

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verifică acces complet (doar ADMIN și SUPER_ADMIN pot crea testimoniale)
    const hasAccess = await checkFullAdminAccess(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Acces interzis. Doar administratorii pot crea testimoniale." }, { status: 403 })
    }

    const body = await request.json()
    
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role || "",
        text: body.content,
        rating: body.rating || 5,
        avatar: body.avatar || ""
      }
    })

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 })
  }
}
