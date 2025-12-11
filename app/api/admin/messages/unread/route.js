import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Obține numărul de mesaje necitite
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

    // Numără mesajele necitite pentru utilizatorul curent
    // Include mesaje de grup (receiverId null) și mesaje private directe
    const unreadCount = await prisma.message.count({
      where: {
        isRead: false,
        senderId: { not: currentUser.id }, // Nu mesajele proprii
        OR: [
          { receiverId: null }, // Mesaje de grup
          { receiverId: currentUser.id } // Mesaje private pentru mine
        ]
      }
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Marchează mesajele ca citite
export async function POST(request) {
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

    const body = await request.json()
    const { chatId } = body // 'general' sau ID-ul adminului

    if (chatId === 'general') {
      // Marchează toate mesajele de grup ca citite
      await prisma.message.updateMany({
        where: {
          receiverId: null,
          isRead: false,
          senderId: { not: currentUser.id }
        },
        data: { isRead: true }
      })
    } else if (chatId) {
      // Marchează mesajele private de la un admin specific ca citite
      await prisma.message.updateMany({
        where: {
          senderId: chatId,
          receiverId: currentUser.id,
          isRead: false
        },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
