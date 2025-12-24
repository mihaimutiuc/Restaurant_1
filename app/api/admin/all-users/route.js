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

    // Verifică dacă utilizatorul este admin
    const hasAccess = await isAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    // Construim filtrul de căutare
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    // Obținem utilizatorii cu paginare
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({ 
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    })
  } catch (error) {
    console.error("Error fetching all users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
