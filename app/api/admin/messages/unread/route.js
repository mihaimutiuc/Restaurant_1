import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Obține numărul de mesaje necitite și detalii
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
    const unreadMessages = await prisma.message.findMany({
      where: {
        isRead: false,
        senderId: { not: currentUser.id }, // Nu mesajele proprii
        OR: [
          { receiverId: null }, // Mesaje de grup
          { receiverId: currentUser.id } // Mesaje private pentru mine
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Grupează pe chat (general sau per sender)
    const unreadByChat = {}
    unreadMessages.forEach(msg => {
      const chatId = msg.receiverId === null ? 'general' : msg.senderId
      if (!unreadByChat[chatId]) {
        unreadByChat[chatId] = {
          count: 0,
          lastMessage: null,
          senderName: msg.senderName,
          senderImage: msg.senderImage
        }
      }
      unreadByChat[chatId].count++
      if (!unreadByChat[chatId].lastMessage) {
        unreadByChat[chatId].lastMessage = msg
      }
    })

    return NextResponse.json({ 
      unreadCount: unreadMessages.length,
      unreadByChat
    })
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
