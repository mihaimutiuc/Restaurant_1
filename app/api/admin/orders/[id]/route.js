import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
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

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        },
        items: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
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

    const { id } = await params
    const body = await request.json()
    
    const updateData = {}
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.stage !== undefined) {
      updateData.stage = body.stage
      updateData.stageUpdatedAt = new Date()
    }
    
    if (body.estimatedTime !== undefined) {
      updateData.estimatedTime = parseInt(body.estimatedTime)
    }
    
    if (body.assignedTo !== undefined) {
      updateData.assignedTo = body.assignedTo
    }
    
    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes
    }
    
    if (body.isOnHold !== undefined) {
      updateData.isOnHold = body.isOnHold
    }
    
    if (body.holdMinutes !== undefined) {
      updateData.holdMinutes = parseInt(body.holdMinutes)
    }
    
    if (body.queuePosition !== undefined) {
      updateData.queuePosition = body.queuePosition ? parseInt(body.queuePosition) : null
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true, image: true }
        },
        items: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId: id }
    })

    // Delete the order
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
