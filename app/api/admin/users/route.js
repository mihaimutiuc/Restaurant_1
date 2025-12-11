import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
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

    const users = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
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

// Super admin email
const SUPER_ADMIN_EMAIL = "mihaimutiuc@gmail.com"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Doar super admin poate crea alți admini
    if (session.user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Doar Super Admin poate adăuga administratori" }, { status: 403 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, method } = body

    if (!email) {
      return NextResponse.json({ error: "Email este obligatoriu" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // If user exists, just make them admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { isAdmin: true },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isAdmin: true,
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
          isAdmin: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isAdmin: true,
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
          isAdmin: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isAdmin: true,
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
