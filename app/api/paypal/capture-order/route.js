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
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.error('PayPal credentials missing')
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
    const errorText = await response.text()
    console.error('PayPal auth error:', response.status, errorText)
    throw new Error(`Failed to get PayPal access token: ${response.status}`)
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
      console.error('PayPal capture error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Eroare la procesarea plății',
        details: error.message || error.details?.[0]?.description
      }, { status: 500 })
    }

    const captureData = await captureResponse.json()
    console.log('PayPal capture status:', captureData.status)

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Plata nu a fost finalizată' }, { status: 400 })
    }

    // SECURITATE: Obține coșul și prețurile din baza de date
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Coșul este gol" }, { status: 400 })
    }

    // SECURITATE: Verifică prețurile produselor din baza de date
    const productIds = cart.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, price: true, preparationTime: true }
    })

    const productMap = {}
    products.forEach(p => {
      productMap[p.productId] = { price: p.price, preparationTime: p.preparationTime || 10 }
    })

    // Calculează subtotalul folosind prețurile din DB (nu din coș)
    let subtotal = 0
    const verifiedItems = []
    
    for (const item of cart.items) {
      const product = productMap[item.productId]
      if (!product) {
        console.error('Invalid product:', item.productId)
        return NextResponse.json({ error: `Produs invalid: ${item.name}` }, { status: 400 })
      }
      subtotal += product.price * item.quantity
      verifiedItems.push({
        ...item,
        price: product.price, // Folosește prețul din DB
        preparationTime: product.preparationTime
      })
    }
    
    // Calculează taxa de livrare
    const DELIVERY_FEE = 20
    const FREE_DELIVERY_THRESHOLD = 100
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    
    const total = subtotal + deliveryFee

    // Calculează timpul estimat
    let maxPrepTime = 0
    verifiedItems.forEach(item => {
      maxPrepTime = Math.max(maxPrepTime, item.preparationTime)
    })

    const totalItems = verifiedItems.reduce((sum, item) => sum + item.quantity, 0)
    const estimatedTime = maxPrepTime + Math.max(0, (totalItems - 1) * 2) + 15

    // Creează comanda în baza de date cu prețurile verificate
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
          create: verifiedItems.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price, // Preț verificat din DB
            image: item.image,
            quantity: item.quantity,
            preparationTime: item.preparationTime
          }))
        }
      },
      include: { items: true }
    })

    // Golește coșul
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    console.log('Order created:', order.id)

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
