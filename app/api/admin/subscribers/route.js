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
    const filter = searchParams.get('filter') || 'all' // all, active, inactive
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Construim filtrul
    let whereClause = {}
    
    if (filter === 'active') {
      whereClause.isActive = true
    } else if (filter === 'inactive') {
      whereClause.isActive = false
    }

    if (search) {
      whereClause.email = { contains: search, mode: 'insensitive' }
    }

    const [subscribers, totalCount, activeCount] = await Promise.all([
      prisma.subscriber.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.subscriber.count({ where: whereClause }),
      prisma.subscriber.count({ where: { isActive: true } })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      subscribers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      },
      activeCount
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
