import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Super admin email that cannot be deleted
const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Doar super admin poate elimina alți admini
    if (session.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Doar Super Admin poate elimina administratori" }, { status: 403 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Nu poți să te ștergi pe tine" }, { status: 400 })
    }

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 })
    }

    // Check if user is super admin (mihai mutiuc)
    if (userToDelete.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || 
        userToDelete.name?.toLowerCase() === "mihai mutiuc") {
      return NextResponse.json({ error: "Nu poți elimina drepturile de admin pentru Super Admin" }, { status: 403 })
    }

    // Remove admin status (don't delete the user, just remove admin rights)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
