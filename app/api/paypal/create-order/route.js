import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

const PAYPAL_API = process.env.PAYPAL_MODE === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// Curs de schimb RON -> EUR (aproximativ)
const RON_TO_EUR = 0.20

// Obține access token pentru PayPal API
async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    console.error('PayPal credentials missing:', { clientId: !!clientId, clientSecret: !!clientSecret })
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

// POST - Creează o comandă PayPal
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    // Obține coșul utilizatorului direct din baza de date (SECURITATE: prețurile vin din DB, nu din client)
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
      select: { productId: true, price: true, name: true }
    })

    const productPriceMap = {}
    products.forEach(p => {
      productPriceMap[p.productId] = p.price
    })

    // Calculează subtotalul folosind prețurile din baza de date (nu din coș)
    let subtotal = 0
    const verifiedItems = cart.items.map(item => {
      const dbPrice = productPriceMap[item.productId]
      if (!dbPrice) {
        throw new Error(`Produs invalid: ${item.productId}`)
      }
      subtotal += dbPrice * item.quantity
      return {
        name: item.name,
        price: dbPrice,
        quantity: item.quantity
      }
    })
    
    // Calculează taxa de livrare
    const DELIVERY_FEE = 20
    const FREE_DELIVERY_THRESHOLD = 100
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    
    // Totalul final în RON
    const totalRON = subtotal + deliveryFee
    
    // Convertește în EUR pentru PayPal (PayPal sandbox nu suportă RON)
    const subtotalEUR = (subtotal * RON_TO_EUR).toFixed(2)
    const deliveryFeeEUR = (deliveryFee * RON_TO_EUR).toFixed(2)
    const totalEUR = (totalRON * RON_TO_EUR).toFixed(2)

    // Obține access token
    const accessToken = await getPayPalAccessToken()

    // Creează comanda PayPal cu EUR
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        description: `Comandă restaurant - ${totalRON.toFixed(2)} RON`,
        amount: {
          currency_code: 'EUR',
          value: totalEUR,
          breakdown: {
            item_total: {
              currency_code: 'EUR',
              value: subtotalEUR
            },
            shipping: {
              currency_code: 'EUR',
              value: deliveryFeeEUR
            }
          }
        },
        items: verifiedItems.map(item => ({
          name: item.name.substring(0, 127), // PayPal limit
          unit_amount: {
            currency_code: 'EUR',
            value: (item.price * RON_TO_EUR).toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }]
    }

    console.log('Creating PayPal order:', JSON.stringify(orderData, null, 2))

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
      console.error('PayPal order creation error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Eroare la crearea comenzii PayPal',
        details: error.message || error.details?.[0]?.description
      }, { status: 500 })
    }

    const paypalOrder = await response.json()
    console.log('PayPal order created:', paypalOrder.id)
    
    return NextResponse.json({ 
      id: paypalOrder.id,
      status: paypalOrder.status 
    })
  } catch (error) {
    console.error("Error creating PayPal order:", error)
    return NextResponse.json({ error: error.message || "Eroare server" }, { status: 500 })
  }
}
