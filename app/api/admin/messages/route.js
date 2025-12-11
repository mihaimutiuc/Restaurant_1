import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

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
    const before = searchParams.get("before") // pentru paginare

    let whereClause = {}

    if (receiverId) {
      // Mesaje private între utilizatorul curent și receiverId
      whereClause = {
        OR: [
          { senderId: currentUser.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: currentUser.id }
        ]
      }
    } else {
      // Mesaje de grup (receiverId este null)
      whereClause = { receiverId: null }
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
    const { content, receiverId, imageUrl } = body

    if ((!content || content.trim() === "") && !imageUrl) {
      return NextResponse.json({ error: "Mesajul nu poate fi gol" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        content: content?.trim() || '',
        senderId: currentUser.id,
        senderName: currentUser.name || session.user.email,
        senderEmail: currentUser.email,
        senderImage: currentUser.image || session.user.image,
        receiverId: receiverId || null,
        imageUrl: imageUrl || null
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
