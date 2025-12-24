import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verifică dacă utilizatorul este admin
async function isAdmin(session) {
  if (!session) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, isAdmin: true }
  })
  
  return user?.isAdmin || ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role)
}

// Actualizează un abonat (activare/dezactivare)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await isAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    const updateData = {}
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
      updateData.unsubscribedAt = isActive ? null : new Date()
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(subscriber)
  } catch (error) {
    console.error("Error updating subscriber:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Șterge un abonat
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await isAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    await prisma.subscriber.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscriber:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
