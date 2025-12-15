import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { existsSync } from "fs"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Verifică dacă suntem în producție (Vercel)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tip de fișier invalid. Doar imaginile sunt permise (JPG, PNG, WebP, GIF, AVIF)." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}-${originalName}`

    if (isProduction) {
      // În producție, stocăm în baza de date ca Base64
      const base64Data = buffer.toString('base64')
      
      const uploadedImage = await prisma.uploadedImage.create({
        data: {
          filename: filename,
          mimeType: file.type,
          data: base64Data,
          size: file.size
        }
      })

      // Return URL-ul API care va servi imaginea
      const url = `/api/images/${uploadedImage.id}`

      return NextResponse.json({ url, filename, imageId: uploadedImage.id })
    } else {
      // În development, stocăm local în public/uploads
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Save file
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)

      // Return the public URL
      const url = `/uploads/${filename}`

      return NextResponse.json({ url, filename })
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 })
  }
}
