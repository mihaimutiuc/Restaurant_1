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

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hasAccess = await isAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const filter = searchParams.get('filter') || 'all' // all, unread, read
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Construim filtrul
    let whereClause = {}
    
    if (filter === 'unread') {
      whereClause.isRead = false
    } else if (filter === 'read') {
      whereClause.isRead = true
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [messages, totalCount, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.contactMessage.count({ where: whereClause }),
      prisma.contactMessage.count({ where: { isRead: false } })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      },
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
