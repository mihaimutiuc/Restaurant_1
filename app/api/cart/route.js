import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Obține coșul utilizatorului
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    return NextResponse.json({ cart: cart || { items: [] } })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// POST - Adaugă produs în coș
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const body = await request.json()
    const productId = parseInt(body.productId)
    const { name, price, image, quantity = 1 } = body

    if (isNaN(productId)) {
      return NextResponse.json({ error: "ProductId invalid" }, { status: 400 })
    }

    // Obține timpul de preparare din baza de date
    const product = await prisma.product.findUnique({
      where: { productId },
      select: { preparationTime: true }
    })
    const preparationTime = product?.preparationTime || 10

    // Găsește sau creează coșul
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
          items: {
            create: {
              productId,
              name,
              price,
              image,
              quantity,
              preparationTime
            }
          }
        },
        include: { items: true }
      })
    } else {
      // Verifică dacă produsul există deja în coș
      const existingItem = cart.items.find(item => item.productId === productId)

      if (existingItem) {
        // Actualizează cantitatea
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        })
      } else {
        // Adaugă produs nou
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            name,
            price,
            image,
            quantity,
            preparationTime
          }
        })
      }

      // Reîncarcă coșul
      cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: { items: true }
      })
    }

    return NextResponse.json({ cart })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// PUT - Actualizează cantitatea unui produs
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (quantity <= 0) {
      // Șterge produsul dacă cantitatea e 0
      await prisma.cartItem.delete({
        where: { id: itemId }
      })
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    return NextResponse.json({ cart })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}

// DELETE - Șterge produs din coș sau golește coșul
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizat" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const clearAll = searchParams.get("clearAll")

    if (clearAll === "true") {
      // Golește tot coșul
      const cart = await prisma.cart.findUnique({
        where: { userId: session.user.id }
      })

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        })
      }
    } else if (itemId) {
      // Șterge un singur produs
      await prisma.cartItem.delete({
        where: { id: itemId }
      })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true }
    })

    return NextResponse.json({ cart: cart || { items: [] } })
  } catch (error) {
    console.error("Error deleting from cart:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
