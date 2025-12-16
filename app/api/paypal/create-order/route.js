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

// POST - Creează o comandă PayPal
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
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
    
    // Totalul final
    const total = subtotal + deliveryFee

    // Obține access token
    const accessToken = await getPayPalAccessToken()

    // Creează comanda PayPal
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'RON',
          value: total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'RON',
              value: subtotal.toFixed(2)
            },
            shipping: {
              currency_code: 'RON',
              value: deliveryFee.toFixed(2)
            }
          }
        },
        items: cart.items.map(item => ({
          name: item.name,
          unit_amount: {
            currency_code: 'RON',
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }]
    }

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('PayPal order creation error:', error)
      return NextResponse.json({ error: 'Eroare la crearea comenzii PayPal' }, { status: 500 })
    }

    const paypalOrder = await response.json()
    
    return NextResponse.json({ 
      id: paypalOrder.id,
      status: paypalOrder.status 
    })
  } catch (error) {
    console.error("Error creating PayPal order:", error)
    return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 })
  }
}
