import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Doar super admin poate vedea lista
    const hasAccess = await isSuperAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: { 
        OR: [
          { isAdmin: true },
          { role: { in: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'] } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching admin users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Doar super admin poate crea alți admini
    const hasAccess = await isSuperAdmin(session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Doar Super Admin poate adăuga administratori" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, method, role } = body

    if (!email) {
      return NextResponse.json({ error: "Email este obligatoriu" }, { status: 400 })
    }

    // Validează rolul
    const validRoles = ['MODERATOR', 'ADMIN']
    const selectedRole = validRoles.includes(role) ? role : 'ADMIN'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // If user exists, just make them admin/moderator
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { 
          isAdmin: true,
          role: selectedRole
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
    }

    // Create new admin user
    if (method === "credentials" && password) {
      // Create user with password for email/password login
      const hashedPassword = await bcrypt.hash(password, 12)
      
      const newUser = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          password: hashedPassword,
          isAdmin: true,
          role: selectedRole
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
      return NextResponse.json(newUser)
    } else {
      // Create user for Google login (no password needed)
      const newUser = await prisma.user.create({
        data: {
          name: name || email.split("@")[0],
          email,
          isAdmin: true,
          role: selectedRole
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
      return NextResponse.json(newUser)
    }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
