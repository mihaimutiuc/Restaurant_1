import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Server-Sent Events pentru mesaje în timp real
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, id: true }
    })

    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const lastMessageId = searchParams.get("lastId")

    // Creăm un stream pentru SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        const sendMessage = (data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        // Trimite ping inițial
        sendMessage({ type: "connected", userId: currentUser.id })

        // Polling la fiecare 2 secunde pentru mesaje noi
        let lastCheckedId = lastMessageId
        const interval = setInterval(async () => {
          try {
            const whereClause = lastCheckedId 
              ? { id: { gt: lastCheckedId } }
              : {}

            const newMessages = await prisma.message.findMany({
              where: whereClause,
              orderBy: { createdAt: "asc" },
              take: 20
            })

            if (newMessages.length > 0) {
              lastCheckedId = newMessages[newMessages.length - 1].id
              sendMessage({ type: "messages", messages: newMessages })
            }

            // Obține statusurile online
            const onlineStatuses = await prisma.adminStatus.findMany({
              where: {
                updatedAt: {
                  gte: new Date(Date.now() - 60000) // Activ în ultimul minut
                }
              }
            })
            
            sendMessage({ type: "status", statuses: onlineStatuses })

          } catch (error) {
            console.error("SSE polling error:", error)
          }
        }, 2000)

        // Cleanup când conexiunea se închide
        request.signal.addEventListener("abort", () => {
          clearInterval(interval)
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    })
  } catch (error) {
    console.error("Error in SSE stream:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
