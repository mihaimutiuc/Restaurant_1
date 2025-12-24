import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, source = "footer" } = body

    // Validare email
    if (!email) {
      return NextResponse.json(
        { error: "Email-ul este obligatoriu" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresa de email nu este validă" },
        { status: 400 }
      )
    }

    // Verificăm dacă email-ul există deja
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      // Dacă e dezabonat, îl reabonăm
      if (!existingSubscriber.isActive) {
        await prisma.subscriber.update({
          where: { email },
          data: {
            isActive: true,
            unsubscribedAt: null
          }
        })
        return NextResponse.json({
          success: true,
          message: "Te-ai reabonat cu succes!"
        })
      }
      return NextResponse.json({
        success: true,
        message: "Ești deja abonat la newsletter!"
      })
    }

    // Creăm un nou abonat
    await prisma.subscriber.create({
      data: {
        email,
        source
      }
    })

    return NextResponse.json({
      success: true,
      message: "Te-ai abonat cu succes la newsletter!"
    })
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json(
      { error: "Eroare la abonare" },
      { status: 500 }
    )
  }
}
