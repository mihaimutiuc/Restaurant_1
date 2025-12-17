import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verifică dacă utilizatorul este SUPER_ADMIN
async function isSuperAdmin(session) {
  if (!session) return false
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })
  
  return user?.role === 'SUPER_ADMIN'
}

// PATCH - Update user role
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Doar super admin poate schimba roluri
    const hasAccess = await isSuperAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Doar Super Admin poate schimba rolurile" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { role } = body

    // Validează rolul
    const validRoles = ['USER', 'MODERATOR', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rol invalid" }, { status: 400 })
    }

    // Get the user to be updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true }
    })

    if (!userToUpdate) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 })
    }

    // Nu permite schimbarea rolului unui alt SUPER_ADMIN
    if (userToUpdate.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Nu poți schimba rolul unui Super Admin" }, { status: 403 })
    }

    // Actualizează rolul
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        role: role,
        isAdmin: ['MODERATOR', 'ADMIN'].includes(role)
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Doar super admin poate elimina alți admini
    const hasAccess = await isSuperAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Doar Super Admin poate elimina administratori" }, { status: 403 })
    }

    const { id } = await params

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true, name: true, role: true }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 })
    }

    // Nu permite ștergerea unui SUPER_ADMIN
    if (userToDelete.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Nu poți elimina drepturile de admin pentru Super Admin" }, { status: 403 })
    }

    // Remove admin status and reset role to USER
    await prisma.user.update({
      where: { id },
      data: { 
        isAdmin: false,
        role: 'USER'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
