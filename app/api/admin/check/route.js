import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Super admin email
const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ isAdmin: false, role: null, error: "Database not configured" }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ isAdmin: false, role: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, role: true, email: true }
    })

    // Verifică dacă este super admin
    const isSuperAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
    
    // Determină rolul efectiv
    let effectiveRole = user?.role || 'USER'
    if (isSuperAdmin) {
      effectiveRole = 'SUPER_ADMIN'
    }
    
    // isAdmin rămâne true pentru MODERATOR, ADMIN și SUPER_ADMIN
    const hasAdminAccess = user?.isAdmin || ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(effectiveRole)

    return NextResponse.json({ 
      isAdmin: hasAdminAccess,
      role: effectiveRole,
      isSuperAdmin
    })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false, role: null }, { status: 500 })
  }
}
