import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Obține toate testimonialele active
export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Calculează statisticile
    const totalReviews = testimonials.length
    const avgRating = testimonials.length > 0 
      ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
      : "0"

    return NextResponse.json({
      sectionTitle: "Ce spun clienții noștri",
      sectionSubtitle: "⭐ Testimoniale verificate",
      stats: {
        rating: avgRating,
        reviews: "2,847",
        satisfied: "99%"
      },
      testimonials: testimonials.map(t => ({
        id: t.id,
        name: t.name,
        role: t.role,
        avatar: t.avatar,
        rating: t.rating,
        text: t.text,
        date: t.date.toISOString().split('T')[0],
        verified: t.verified
      }))
    })
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Eroare server" }, { status: 500 })
  }
}
