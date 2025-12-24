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

// Obține un mesaj specific
export async function GET(request, { params }) {
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

    const message = await prisma.contactMessage.findUnique({
      where: { id }
    })

    if (!message) {
      return NextResponse.json({ error: "Mesajul nu a fost găsit" }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error fetching contact message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Actualizează un mesaj (marcare citit, note, etc.)
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
    const { isRead, isReplied, notes } = body

    const updateData = {}
    if (typeof isRead === 'boolean') updateData.isRead = isRead
    if (typeof isReplied === 'boolean') updateData.isReplied = isReplied
    if (notes !== undefined) updateData.notes = notes

    const message = await prisma.contactMessage.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Șterge un mesaj
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

    await prisma.contactMessage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
