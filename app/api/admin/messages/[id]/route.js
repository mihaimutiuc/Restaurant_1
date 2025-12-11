import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PUT - Editează un mesaj
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true, email: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    // Verifică dacă mesajul există și aparține utilizatorului curent
    const message = await prisma.message.findUnique({
      where: { id }
    })

    if (!message) {
      return NextResponse.json({ error: "Mesajul nu a fost găsit" }, { status: 404 })
    }

    // Doar autorul poate edita mesajul
    if (message.senderEmail !== currentUser.email) {
      return NextResponse.json({ error: "Nu poți edita mesajele altora" }, { status: 403 })
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: {
        content: content?.trim() || message.content,
        isEdited: true
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Șterge un mesaj
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true, email: true, isSuperAdmin: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Verifică dacă mesajul există
    const message = await prisma.message.findUnique({
      where: { id }
    })

    if (!message) {
      return NextResponse.json({ error: "Mesajul nu a fost găsit" }, { status: 404 })
    }

    // Doar autorul sau super admin poate șterge mesajul
    if (message.senderEmail !== currentUser.email && !currentUser.isSuperAdmin) {
      return NextResponse.json({ error: "Nu poți șterge mesajele altora" }, { status: 403 })
    }

    await prisma.message.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
