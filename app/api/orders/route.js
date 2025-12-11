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
  // RECEIVED: 0-15% (primele 3-5 minute)
  // PREPARING: 15-50% (preparare)
  // READY: 50-65% (gata de livrare)
  // OUT_DELIVERY: 65-95% (în curs de livrare)
  // DELIVERED: 95%+ (livrat)
  
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

// GET - Obține toate comenzile utilizatorului
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    })

    // Calculează și actualizează stage-urile pentru comenzile active
    const ordersWithTimeRemaining = await Promise.all(orders.map(async (order) => {
      const now = new Date()
      const createdAt = new Date(order.createdAt)
      const elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60))
      const remainingMinutes = Math.max(0, order.estimatedTime - elapsedMinutes)
      
      // Calculează stage-ul corect bazat pe timp
      const expectedStage = calculateStage(
        elapsedMinutes, 
        order.estimatedTime, 
        order.stage, 
        order.status
      )

      // Actualizează stage-ul în baza de date dacă s-a schimbat
      if (expectedStage !== order.stage && order.status !== "CANCELLED") {
        try {
          await prisma.order.update({
            where: { id: order.id },
            data: { 
              stage: expectedStage,
              stageUpdatedAt: new Date(),
              status: expectedStage === "DELIVERED" ? "COMPLETED" : order.status
            }
          })
        } catch (e) {
          console.error("Error updating order stage:", e)
        }
      }

      return {
        ...order,
        stage: expectedStage,
        status: expectedStage === "DELIVERED" ? "COMPLETED" : order.status,
        elapsedMinutes,
        remainingMinutes,
        progress: Math.min(100, Math.round((elapsedMinutes / order.estimatedTime) * 100))
      }
    }))

    return NextResponse.json({ orders: ordersWithTimeRemaining })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Creează o comandă nouă
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { deliveryAddress, phone, notes, paymentMethod = "card" } = await request.json()

    // Obține coșul utilizatorului
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Coșul este gol" }, { status: 400 })
    }

    // Calculează subtotalul
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Calculează taxa de livrare: gratis peste 100 RON, altfel 20 RON
    const DELIVERY_FEE = 20
    const FREE_DELIVERY_THRESHOLD = 100
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    
    // Totalul final include taxa de livrare
    const total = subtotal + deliveryFee

    // Obține timpii de preparare pentru fiecare produs din baza de date
    const productIds = cart.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, preparationTime: true }
    })

    // Creează un map de timpii de preparare
    const prepTimeMap = {}
    products.forEach(p => {
      prepTimeMap[p.productId] = p.preparationTime
    })

    // Calculează timpul total de preparare
    // Timpul maxim de preparare dintre produse + 5 min per produs adițional + 15 min livrare
    let maxPrepTime = 0
    let totalPrepTime = 0
    
    cart.items.forEach(item => {
      const prepTime = prepTimeMap[item.productId] || 10 // default 10 min
      maxPrepTime = Math.max(maxPrepTime, prepTime)
      totalPrepTime += prepTime * item.quantity
    })

    // Estimare: timpul maxim de preparare + timp suplimentar pentru cantitate + livrare
    // Formula: max(prepTime) + (totalItems - 1) * 2 min + 15 min livrare
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedTime = maxPrepTime + Math.max(0, (totalItems - 1) * 2) + 15

    // Creează comanda cu timpii de preparare incluși
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        deliveryFee,
        estimatedTime,
        deliveryAddress,
        phone,
        notes,
        paymentMethod,
        isPaid: paymentMethod === "card", // Presupunem plata cu cardul e procesată
        status: "CONFIRMED",
        stage: "RECEIVED",
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            preparationTime: prepTimeMap[item.productId] || 10
          }))
        }
      },
      include: { items: true }
    })

    // Golește coșul
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
