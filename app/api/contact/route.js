import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validare
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Toate câmpurile obligatorii trebuie completate" },
        { status: 400 }
      )
    }

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresa de email nu este validă" },
        { status: 400 }
      )
    }

    // Salvăm mesajul în baza de date
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message
      }
    })

    return NextResponse.json({
      success: true,
      message: "Mesajul a fost trimis cu succes!",
      id: contactMessage.id
    })
  } catch (error) {
    console.error("Error saving contact message:", error)
    return NextResponse.json(
      { error: "Eroare la salvarea mesajului" },
      { status: 500 }
    )
  }
}
