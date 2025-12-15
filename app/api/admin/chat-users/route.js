import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Obține toți adminii/moderatorii pentru chat (disponibil pentru toți adminii)
export async function GET() {
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

    // Obține toți adminii și moderatorii
    const users = await prisma.user.findMany({
      where: { 
        isAdmin: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        role: true
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching chat users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
