import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// Funcție pentru a calcula stage-ul bazat pe timp
function calculateStage(elapsedMinutes, totalTime, currentStage, status) {
  // Nu actualiza dacă comanda e anulată sau finalizată
  if (status === "CANCELLED" || status === "COMPLETED") {
    return currentStage
  }

  // Progresia stage-urilor bazată pe procentajul timpului trecut
  const progressPercent = (elapsedMinutes / totalTime) * 100

  if (progressPercent < 15) {
    return "RECEIVED"
  } else if (progressPercent < 50) {
    return "PREPARING"
  } else if (progressPercent < 65) {
    return "READY"
  } else if (progressPercent < 95) {
    return "OUT_DELIVERY"
  } else {
    return "DELIVERED"
  }
}

// GET - Obține detaliile unei comenzi specifice
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.order.findFirst({
      where: { 
        id,
        userId: session.user.id 
      },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: "Comanda nu a fost găsită" }, { status: 404 })
    }

    // Calculează timpul rămas și actualizează stage-ul automat
    const now = new Date()
    const createdAt = new Date(order.createdAt)
    const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60))
    const remainingMinutes = Math.max(0, order.estimatedTime - elapsedMinutes)

    // Calculează stage-ul bazat pe timp
    const expectedStage = calculateStage(
      elapsedMinutes, 
      order.estimatedTime, 
      order.stage, 
      order.status
    )

    // Actualizează stage-ul dacă s-a schimbat
    if (expectedStage !== order.stage && order.status !== "CANCELLED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          stage: expectedStage,
          stageUpdatedAt: new Date(),
          status: expectedStage === "DELIVERED" ? "COMPLETED" : order.status
        }
      })
    }

    return NextResponse.json({ 
      order: {
        ...order,
        stage: expectedStage,
        status: expectedStage === "DELIVERED" ? "COMPLETED" : order.status,
        elapsedMinutes,
        remainingMinutes,
        progress: Math.min(100, Math.round((elapsedMinutes / order.estimatedTime) * 100))
      }
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PUT - Actualizează statusul comenzii (pentru admin/restaurant)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { id } = await params
    const { stage, status } = await request.json()

    const order = await prisma.order.update({
      where: { id },
      data: { 
        ...(stage && { stage, stageUpdatedAt: new Date() }),
        ...(status && { status })
      },
      include: { items: true }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
