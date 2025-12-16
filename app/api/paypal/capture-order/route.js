import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// Obține access token pentru PayPal API
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }
  
  const data = await response.json()
  return data.access_token
}

// POST - Capturează plata PayPal
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { orderID, deliveryAddress, phone, notes } = await request.json()

    if (!orderID) {
      return NextResponse.json({ error: "OrderID lipsă" }, { status: 400 })
    }

    // Obține access token
    const accessToken = await getPayPalAccessToken()

    // Capturează plata
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!captureResponse.ok) {
      const error = await captureResponse.json()
      console.error('PayPal capture error:', error)
      return NextResponse.json({ error: 'Eroare la procesarea plății' }, { status: 500 })
    }

    const captureData = await captureResponse.json()

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Plata nu a fost finalizată' }, { status: 400 })
    }

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
    
    // Calculează taxa de livrare
    const DELIVERY_FEE = 20
    const FREE_DELIVERY_THRESHOLD = 100
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    
    const total = subtotal + deliveryFee

    // Obține timpii de preparare pentru fiecare produs
    const productIds = cart.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, preparationTime: true }
    })

    const prepTimeMap = {}
    products.forEach(p => {
      prepTimeMap[p.productId] = p.preparationTime
    })

    // Calculează timpul estimat
    let maxPrepTime = 0
    cart.items.forEach(item => {
      const prepTime = prepTimeMap[item.productId] || 10
      maxPrepTime = Math.max(maxPrepTime, prepTime)
    })

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedTime = maxPrepTime + Math.max(0, (totalItems - 1) * 2) + 15

    // Creează comanda în baza de date
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        deliveryFee,
        estimatedTime,
        deliveryAddress,
        phone,
        notes,
        paymentMethod: 'paypal',
        isPaid: true,
        paypalOrderId: orderID,
        paypalCaptureId: captureData.purchase_units[0]?.payments?.captures?.[0]?.id,
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

    return NextResponse.json({ 
      success: true,
      order,
      captureId: captureData.purchase_units[0]?.payments?.captures?.[0]?.id
    })
  } catch (error) {
    console.error("Error capturing PayPal payment:", error)
    return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 })
  }
}
