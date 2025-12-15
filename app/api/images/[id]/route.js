import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const image = await prisma.uploadedImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Convertim Base64 înapoi în buffer
    const buffer = Buffer.from(image.data, 'base64')

    // Returnăm imaginea cu header-ele corecte
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
