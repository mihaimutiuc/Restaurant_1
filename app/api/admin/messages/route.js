import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Obține mesajele
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const receiverId = searchParams.get("receiverId")
    const groupId = searchParams.get("groupId")
    const before = searchParams.get("before") // pentru paginare

    let whereClause = {}

    if (groupId) {
      // Mesaje dintr-un grup specific
      whereClause = { groupId: groupId }
    } else if (receiverId) {
      // Mesaje private între utilizatorul curent și receiverId
      whereClause = {
        groupId: null,
        OR: [
          { senderId: currentUser.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUser.id }
        ]
      }
    } else {
      // Mesaje de grup general (receiverId și groupId sunt null)
      whereClause = { receiverId: null, groupId: null }
    }

    if (before) {
      whereClause.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit
    })

    // Inversează pentru a avea mesajele în ordine cronologică
    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Trimite un mesaj nou
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true, name: true, image: true, email: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { content, receiverId, groupId, imageUrl } = body

    if ((!content || content.trim() === "") && !imageUrl) {
      return NextResponse.json({ error: "Mesajul nu poate fi gol" }, { status: 400 })
    }

    // Verifică accesul la grup dacă este specificat
    if (groupId) {
      const group = await prisma.chatGroup.findUnique({
        where: { id: groupId }
      })
      if (!group || !group.memberIds.includes(currentUser.id)) {
        return NextResponse.json({ error: "Nu ai acces la acest grup" }, { status: 403 })
      }
    }

    // Folosește datele din baza de date (actualizate de Google login)
    const message = await prisma.message.create({
      data: {
        content: content?.trim() || '',
        senderId: currentUser.id,
        senderName: currentUser.name || currentUser.email,
        senderEmail: currentUser.email,
        senderImage: currentUser.image, // Folosește imaginea din DB
        receiverId: receiverId || null,
        groupId: groupId || null,
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
