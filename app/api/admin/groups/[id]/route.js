import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

// GET - Obține detalii despre un grup
export async function GET(request, { params }) {
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

    const { id } = await params

    const group = await prisma.chatGroup.findUnique({
      where: { id }
    })

    if (!group) {
      return NextResponse.json({ error: "Grupul nu a fost găsit" }, { status: 404 })
    }

    // Verifică dacă utilizatorul are acces
    const isSuperAdmin = currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
    if (!isSuperAdmin && !group.memberIds.includes(currentUser.id)) {
      return NextResponse.json({ error: "Nu ai acces la acest grup" }, { status: 403 })
    }

    // Obține informații despre membri
    const members = await prisma.user.findMany({
      where: { id: { in: group.memberIds } },
      select: { id: true, name: true, email: true, image: true }
    })

    return NextResponse.json({ ...group, members })
  } catch (error) {
    console.error("Error fetching group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Actualizează un grup (nume, descriere, imagine, membri)
export async function PATCH(request, { params }) {
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

    // Doar super admin poate modifica grupuri
    if (currentUser.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Doar Super Admin poate modifica grupuri" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, image, memberIds, removeMemberId, addMemberId } = body

    const group = await prisma.chatGroup.findUnique({
      where: { id }
    })

    if (!group) {
      return NextResponse.json({ error: "Grupul nu a fost găsit" }, { status: 404 })
    }

    const updateData = {}

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (image !== undefined) updateData.image = image

    // Actualizează lista de membri
    if (memberIds !== undefined) {
      // Asigură-te că super admin-ul rămâne membru
      updateData.memberIds = Array.from(new Set([currentUser.id, ...memberIds]))
    } else if (removeMemberId) {
      // Nu permite eliminarea super admin-ului
      if (removeMemberId === currentUser.id) {
        return NextResponse.json({ error: "Nu te poți elimina din grup" }, { status: 400 })
      }
      updateData.memberIds = group.memberIds.filter(id => id !== removeMemberId)
    } else if (addMemberId) {
      if (!group.memberIds.includes(addMemberId)) {
        updateData.memberIds = [...group.memberIds, addMemberId]
      }
    }

    const updatedGroup = await prisma.chatGroup.update({
      where: { id },
      data: updateData
    })

    // Obține informații despre membri
    const members = await prisma.user.findMany({
      where: { id: { in: updatedGroup.memberIds } },
      select: { id: true, name: true, email: true, image: true }
    })

    return NextResponse.json({ ...updatedGroup, members })
  } catch (error) {
    console.error("Error updating group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Șterge un grup
export async function DELETE(request, { params }) {
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

    // Doar super admin poate șterge grupuri
    if (currentUser.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Doar Super Admin poate șterge grupuri" }, { status: 403 })
    }

    const { id } = await params

    // Șterge toate mesajele din grup
    await prisma.message.deleteMany({
      where: { groupId: id }
    })

    // Șterge grupul
    await prisma.chatGroup.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
