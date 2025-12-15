import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

// GET - Obține toate grupurile la care utilizatorul are acces
export async function GET(request) {
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

    const isSuperAdmin = currentUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    // Super admin vede toate grupurile, alții văd doar cele din care fac parte
    let groups
    if (isSuperAdmin) {
      groups = await prisma.chatGroup.findMany({
        orderBy: { createdAt: "desc" }
      })
    } else {
      groups = await prisma.chatGroup.findMany({
        where: {
          memberIds: { has: currentUser.id }
        },
        orderBy: { createdAt: "desc" }
      })
    }

    // Adaugă informații despre membri
    const groupsWithMembers = await Promise.all(groups.map(async (group) => {
      const members = await prisma.user.findMany({
        where: { id: { in: group.memberIds } },
        select: { id: true, name: true, email: true, image: true }
      })
      return { ...group, members }
    }))

    return NextResponse.json({ groups: groupsWithMembers })
  } catch (error) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Creează un grup nou (doar super admin)
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

    // Doar super admin poate crea grupuri
    if (currentUser.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Doar Super Admin poate crea grupuri" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, image, memberIds } = body

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Numele grupului este obligatoriu" }, { status: 400 })
    }

    // Asigură-te că super admin-ul este întotdeauna membru
    const allMemberIds = Array.from(new Set([currentUser.id, ...(memberIds || [])]))

    const group = await prisma.chatGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        image: image || null,
        createdBy: currentUser.id,
        memberIds: allMemberIds
      }
    })

    // Obține informații despre membri
    const members = await prisma.user.findMany({
      where: { id: { in: group.memberIds } },
      select: { id: true, name: true, email: true, image: true }
    })

    return NextResponse.json({ group: { ...group, members } })
  } catch (error) {
    console.error("Error creating group:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
