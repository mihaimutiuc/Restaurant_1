"use client"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useCart } from "../context/CartContext"

// Stage-urile comenzii cu detalii
const ORDER_STAGES = {
  RECEIVED: {
    label: "Comandă primită",
    icon: "📋",
    description: "Comanda ta a fost primită și confirmată",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  PREPARING: {
    label: "Se prepară",
    icon: "👨‍🍳",
    description: "Bucătarii noștri pregătesc comanda ta",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  READY: {
    label: "Gata de livrare",
    icon: "✅",
    description: "Comanda este gata și așteaptă curierul",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  OUT_DELIVERY: {
    label: "În curs de livrare",
    icon: "🚴",
    description: "Curierul este pe drum spre tine",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  DELIVERED: {
    label: "Livrată",
    icon: "🎉",
    description: "Comanda a fost livrată cu succes!",
    color: "text-green-700",
    bgColor: "bg-green-200"
  }
}

const STAGE_ORDER = ["RECEIVED", "PREPARING", "READY", "OUT_DELIVERY", "DELIVERED"]

// Componenta pentru tracker-ul de stage
function OrderStageTracker({ stage, remainingMinutes, elapsedMinutes, estimatedTime, createdAt }) {
  const currentStageIndex = STAGE_ORDER.indexOf(stage)
  const stageInfo = ORDER_STAGES[stage]
  const [timeLeft, setTimeLeft] = useState({ minutes: remainingMinutes, seconds: 0 })
  
  // Timer care se actualizează în timp real
  useEffect(() => {
    const orderTime = new Date(createdAt).getTime()
    const totalMs = estimatedTime * 60 * 1000
    
    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - orderTime
      const remaining = Math.max(0, totalMs - elapsed)
      
      const mins = Math.floor(remaining / 60000)
      const secs = Math.floor((remaining % 60000) / 1000)
      
      setTimeLeft({ minutes: mins, seconds: secs })
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [createdAt, estimatedTime])
  
  // Calculează progresul în procentaj
  const progress = Math.min(100, Math.round((elapsedMinutes / estimatedTime) * 100))
  
  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-6">
      {/* Header cu status curent */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{stageInfo.icon}</span>
          <div>
            <h3 className={`font-bold text-lg ${stageInfo.color}`}>{stageInfo.label}</h3>
            <p className="text-gray-600 text-sm">{stageInfo.description}</p>
          </div>
        </div>
        {stage !== "DELIVERED" && (
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-bold text-orange-500">{timeLeft.minutes}</span>
              <span className="text-sm text-gray-500">min</span>
              <span className="text-3xl font-bold text-orange-500">:</span>
              <span className="text-3xl font-bold text-orange-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-sm text-gray-500">sec</span>
            </div>
            <div className="text-sm text-gray-500">timp rămas</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">{elapsedMinutes} min</span>
          <span className="text-xs text-gray-500">{estimatedTime} min total</span>
        </div>
      </div>

      {/* Stage steps */}
      <div className="flex justify-between items-center mt-6">
        {STAGE_ORDER.map((stageName, index) => {
          const isCompleted = index < currentStageIndex
          const isCurrent = index === currentStageIndex
          const stageData = ORDER_STAGES[stageName]
          
          return (
            <div key={stageName} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={`absolute top-4 right-1/2 w-full h-1 -z-10 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
              
              {/* Stage circle */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                      ? 'bg-orange-500 text-white ring-4 ring-orange-200 animate-pulse'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              
              {/* Stage label */}
              <span className={`text-xs mt-2 text-center hidden sm:block ${
                isCurrent ? 'font-bold text-orange-600' : 'text-gray-500'
              }`}>
                {stageData.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Componenta pentru o comandă
function OrderCard({ order, isNew }) {
  const stageInfo = ORDER_STAGES[order.stage] || ORDER_STAGES.RECEIVED
  const isActive = order.status !== "COMPLETED" && order.status !== "CANCELLED"
  
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 ${
      isNew ? 'ring-2 ring-orange-500 ring-offset-2' : ''
    }`}>
      {/* Order Header */}
      <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-800">
              Comanda #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-gray-500 text-sm">
              {new Date(order.createdAt).toLocaleDateString("ro-RO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {order.isPaid && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ✓ Achitat
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageInfo.bgColor} ${stageInfo.color}`}>
              {stageInfo.icon} {stageInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stage Tracker - doar pentru comenzile active */}
      {isActive && (
        <div className="p-6 border-b">
          <OrderStageTracker 
            stage={order.stage}
            remainingMinutes={order.remainingMinutes}
            elapsedMinutes={order.elapsedMinutes}
            estimatedTime={order.estimatedTime}
            createdAt={order.createdAt}
          />
        </div>
      )}

      {/* Order Items */}
      <div className="p-6">
        <h4 className="font-medium text-gray-700 mb-3">Produse comandate:</h4>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-gray-600">
              <span>{item.quantity}x {item.name}</span>
              <span>{(item.price * item.quantity).toFixed(2)} RON</span>
            </div>
          ))}
        </div>

        {/* Order Details */}
        {(order.deliveryAddress || order.phone) && (
          <div className="mt-4 pt-4 border-t">
            {order.deliveryAddress && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">📍 Adresa:</span> {order.deliveryAddress}
              </p>
            )}
            {order.phone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">📱 Telefon:</span> {order.phone}
              </p>
            )}
          </div>
        )}

        {/* Order Total */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="text-xl font-bold text-orange-500">{order.total.toFixed(2)} RON</span>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getCartItemsCount } = useCart()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newOrderId, setNewOrderId] = useState(null)

  // Funcție pentru a obține comenzile
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verifică dacă este o comandă nouă
  useEffect(() => {
    const newOrder = searchParams.get("newOrder")
    if (newOrder) {
      setNewOrderId(newOrder)
      // Șterge parametrul din URL după 5 secunde
      setTimeout(() => {
        router.replace("/orders")
        setNewOrderId(null)
      }, 5000)
    }
  }, [searchParams, router])

  // Redirect dacă nu este autentificat
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Încarcă comenzile inițial
  useEffect(() => {
    if (session) {
      fetchOrders()
    }
  }, [session, fetchOrders])

  // Auto-refresh la fiecare 30 de secunde pentru comenzile active
  useEffect(() => {
    if (!session) return

    const hasActiveOrders = orders.some(
      order => order.status !== "COMPLETED" && order.status !== "CANCELLED"
    )

    if (hasActiveOrders) {
      const interval = setInterval(fetchOrders, 30000) // 30 secunde
      return () => clearInterval(interval)
    }
  }, [session, orders, fetchOrders])

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar cartItemsCount={getCartItemsCount()} />
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Se încarcă comenzile...</div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Separă comenzile active de cele finalizate
  const activeOrders = orders.filter(
    order => order.status !== "COMPLETED" && order.status !== "CANCELLED"
  )
  const completedOrders = orders.filter(
    order => order.status === "COMPLETED" || order.status === "CANCELLED"
  )

  return (
    <main className="min-h-screen">
      <Navbar cartItemsCount={getCartItemsCount()} />
      
      <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Comenzile mele</h1>
            {orders.length > 0 && (
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizează
              </button>
            )}
          </div>

          {/* Banner pentru comandă nouă */}
          {newOrderId && (
            <div className="mb-6 bg-green-100 border border-green-300 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-green-800">Comanda a fost plasată cu succes!</p>
                <p className="text-sm text-green-700">Poți urmări statusul comenzii mai jos.</p>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Nu ai comenzi încă
              </h2>
              <p className="text-gray-600 mb-6">
                Plasează prima ta comandă din meniul nostru.
              </p>
              <Link
                href="/#menu"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Vezi meniul
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Comenzi active */}
              {activeOrders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Comenzi în curs ({activeOrders.length})
                  </h2>
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        isNew={order.id === newOrderId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Comenzi finalizate */}
              {completedOrders.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Istoric comenzi ({completedOrders.length})
                  </h2>
                  <div className="space-y-4">
                    {completedOrders.map((order) => (
                      <OrderCard key={order.id} order={order} isNew={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
