import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
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

    // Get today's start and end
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get statistics
    const [ordersToday, revenueToday, totalProducts, pendingOrders, totalOrders, totalUsers] = await Promise.all([
      // Orders today
      prisma.order.count({
        where: {
          createdAt: { gte: today, lt: tomorrow }
        }
      }),
      
      // Revenue today
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { not: "CANCELLED" }
        },
        _sum: { total: true }
      }),
      
      // Total active products
      prisma.product.count({
        where: { isAvailable: true }
      }),
      
      // Pending orders
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      
      // Total orders all time
      prisma.order.count(),
      
      // Total users
      prisma.user.count()
    ])

    return NextResponse.json({
      ordersToday,
      revenueToday: revenueToday._sum.total || 0,
      totalProducts,
      pendingOrders,
      totalOrders,
      totalUsers
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
