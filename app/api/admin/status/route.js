import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// POST - Actualizează statusul online
export async function POST(request) {
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

    // Upsert status - creează sau actualizează
    const status = await prisma.adminStatus.upsert({
      where: { oderId: currentUser.id },
      update: {
        isOnline: true,
        lastSeen: new Date()
      },
      create: {
        oderId: currentUser.id,
        email: currentUser.email,
        isOnline: true,
        lastSeen: new Date()
      }
    })

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Marchează ca offline
export async function DELETE(request) {
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

    await prisma.adminStatus.updateMany({
      where: { oderId: currentUser.id },
      data: {
        isOnline: false,
        lastSeen: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Obține toate statusurile adminilor
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Obține toți adminii cu statusul lor
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })

    const statuses = await prisma.adminStatus.findMany()

    // Combină datele - verifică dacă lastSeen este în ultimele 30 secunde
    const adminsWithStatus = admins.map(admin => {
      const status = statuses.find(s => s.oderId === admin.id)
      const thirtySecondsAgo = Date.now() - 30000
      const isOnline = status?.isOnline && 
        status?.lastSeen && 
        new Date(status.lastSeen).getTime() > thirtySecondsAgo
      
      return {
        ...admin,
        isOnline: isOnline || false,
        lastSeen: status?.lastSeen || null
      }
    })

    return NextResponse.json({ admins: adminsWithStatus })
  } catch (error) {
    console.error("Error fetching statuses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
