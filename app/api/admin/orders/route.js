import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit")) || 20
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where = {}
    
    if (status && status !== "ALL") {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { phone: { contains: search, mode: "insensitive" } },
        { deliveryAddress: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } }
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, image: true }
        },
        items: true  // OrderItem already contains name, price, image, quantity
      },
      orderBy: { createdAt: "desc" },
      take: limit
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
