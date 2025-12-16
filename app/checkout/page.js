"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount, 
    getDeliveryFee,
    getOrderTotal,
    getAmountUntilFreeDelivery,
    FREE_DELIVERY_THRESHOLD,
    isLoading 
  } = useCart()
  const [isOrdering, setIsOrdering] = useState(false)
  const [paypalClientId, setPaypalClientId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [formValid, setFormValid] = useState(false)

  // Obține PayPal Client ID
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (clientId) {
      setPaypalClientId(clientId)
    }
  }, [])

  // Actualizează numele când sesiunea se încarcă
  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user.name }))
    }
  }, [session?.user?.name])

  // Validează formularul
  useEffect(() => {
    const isValid = formData.name.trim() && formData.phone.trim() && formData.address.trim()
    setFormValid(isValid)
  }, [formData])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Creează comanda PayPal
  const createOrder = async () => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Eroare la crearea comenzii")
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      console.error("Error creating PayPal order:", error)
      alert(error.message || "Eroare la crearea comenzii PayPal")
      throw error
    }
  }

  // Capturează plata PayPal
  const onApprove = async (data) => {
    setIsOrdering(true)
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderID: data.orderID,
          deliveryAddress: formData.address,
          phone: formData.phone,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Eroare la procesarea plății")
      }

      const result = await response.json()
      
      // Redirecționează la pagina de comenzi
      router.push(`/orders?newOrder=${result.order.id}`)
    } catch (error) {
      console.error("Error capturing PayPal payment:", error)
      alert(error.message || "Eroare la procesarea plății")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Navbar cartItemsCount={getCartItemsCount()} />
      
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🛒</span>
              Coșul tău
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {cartItems.length > 0 ? `${getCartItemsCount()} produse în coș` : 'Coșul este gol'}
            </p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl text-center border border-gray-100">
              <div className="animate-spin w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Se încarcă coșul...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xl text-center border border-gray-100">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-4xl sm:text-5xl">🛒</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Coșul tău este gol
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
                Adaugă produse delicioase din meniul nostru pentru a plasa o comandă.
              </p>
              <Link
                href="/#menu"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Vezi meniul
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {/* Cart Items - Takes 3 columns on large screens */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                {/* Items Header */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-gray-100 hidden sm:flex items-center justify-between">
                  <span className="text-gray-600 font-medium text-sm">Produse ({cartItems.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Golește coșul
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
                  >
                    {/* Mobile Layout */}
                    <div className="flex gap-3 sm:hidden">
                      {/* Image */}
                      <div className="w-16 h-16 relative rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                            <span className="text-2xl">{getCategoryEmoji(item.category)}</span>
                          </div>
                        )}
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-orange-600 font-bold text-sm mt-0.5">{item.price} EUR</p>
                        
                        {/* Quantity & Total Row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-gray-700 transition-all font-bold text-sm shadow-sm"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 transition-all font-bold text-sm shadow-sm"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-gray-900 text-base">
                            {item.price * item.quantity} <span className="text-orange-500">EUR</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Desktop/Tablet Layout */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                            <span className="text-3xl">{getCategoryEmoji(item.category)}</span>
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-grow min-w-0">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg truncate">{item.name}</h3>
                        <p className="text-orange-600 font-bold mt-1">{item.price} EUR / buc</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 text-white rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all font-bold text-lg shadow-md hover:shadow-lg"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center hover:from-orange-600 hover:to-amber-600 transition-all font-bold text-lg shadow-md hover:shadow-lg"
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right w-24 md:w-28">
                        <p className="font-bold text-xl text-gray-900">
                          {item.price * item.quantity} <span className="text-orange-500 text-sm">EUR</span>
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 md:p-2.5 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all"
                        title="Șterge"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mobile Clear Cart */}
                <button
                  onClick={clearCart}
                  className="sm:hidden w-full py-3 text-red-500 font-medium text-sm border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
                >
                  🗑️ Golește coșul
                </button>
              </div>

              {/* Order Summary - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100 lg:sticky lg:top-24">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    Sumar comandă
                  </h2>

                  {/* Free delivery progress */}
                  {getAmountUntilFreeDelivery() > 0 && (
                    <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">
                        🚚 Mai adaugă <span className="font-bold text-orange-600">{getAmountUntilFreeDelivery()} EUR</span> pentru livrare gratuită!
                      </p>
                      <div className="mt-2 w-full bg-orange-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (getCartTotal() / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Summary Details */}
                  <div className="space-y-3 mb-5 sm:mb-6 bg-gray-50 rounded-xl p-3 sm:p-4">
                    <div className="flex justify-between text-gray-700">
                      <span className="text-sm sm:text-base">Subtotal</span>
                      <span className="font-semibold">{getCartTotal()} EUR</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="text-sm sm:text-base">Livrare</span>
                      {getDeliveryFee() === 0 ? (
                        <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-lg text-sm">GRATIS</span>
                      ) : (
                        <span className="font-semibold">{getDeliveryFee()} EUR</span>
                      )}
                    </div>
                    {getDeliveryFee() === 0 && (
                      <div className="flex items-center gap-1.5 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Ai livrare gratuită!</span>
                      </div>
                    )}
                    <div className="border-t-2 border-dashed border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
                        <span className="text-xl sm:text-2xl font-bold text-orange-600">{getOrderTotal()} EUR</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Form */}
                  {session ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">
                          👤 Nume complet *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Introdu numele tău complet"
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-gray-50 hover:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">
                          📱 Telefon *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Ex: 0712 345 678"
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-gray-50 hover:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">
                          📍 Adresa de livrare *
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Strada, numărul, bloc, scara, etaj, apartament"
                          required
                          rows={2}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-gray-50 hover:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-1.5">
                          📝 Notițe (opțional)
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Ex: Interfon stricat, sunați-mă când ajungeți"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-gray-900 text-sm sm:text-base placeholder:text-gray-400 bg-gray-50 hover:bg-white transition-all"
                        />
                      </div>

                      {/* PayPal Button */}
                      {!formValid ? (
                        <div className="p-4 sm:p-5 bg-amber-50 rounded-xl text-center border-2 border-amber-200">
                          <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm sm:text-base text-amber-800 font-medium">Completează toate câmpurile obligatorii (*) pentru a plăti</p>
                        </div>
                      ) : isOrdering ? (
                        <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl text-center border border-orange-200">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-orange-800 font-bold text-sm sm:text-base">Se procesează comanda...</p>
                          <p className="text-orange-600 text-xs sm:text-sm mt-1">Nu închide această pagină</p>
                        </div>
                      ) : paypalClientId ? (
                        <PayPalScriptProvider options={{ 
                          clientId: paypalClientId,
                          currency: "EUR",
                          intent: "capture"
                        }}>
                          <div className="paypal-button-container">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50 py-2 rounded-lg">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Plată securizată prin PayPal</span>
                            </div>
                            <PayPalButtons
                              key={`paypal-${getOrderTotal()}-${cartItems.map(i => `${i.productId}-${i.quantity}`).join('-')}`}
                              style={{ 
                                layout: "vertical",
                                color: "gold",
                                shape: "rect",
                                label: "paypal",
                                height: 45
                              }}
                              createOrder={createOrder}
                              onApprove={onApprove}
                              onError={(err) => {
                                console.error("PayPal error:", err)
                                alert("Eroare la procesarea plății. Încearcă din nou.")
                              }}
                              onCancel={() => {
                                console.log("Payment cancelled")
                              }}
                              forceReRender={[getOrderTotal(), cartItems.length, ...cartItems.map(i => i.quantity)]}
                          </div>
                        </PayPalScriptProvider>
                      ) : (
                        <div className="p-4 bg-red-50 rounded-xl text-center border border-red-200">
                          <p className="text-sm text-red-700 font-medium">⚠️ Plățile online nu sunt configurate momentan.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center bg-gray-50 rounded-xl p-5 sm:p-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-gray-700 mb-4 text-sm sm:text-base font-medium">
                        Trebuie să fii autentificat pentru a plasa o comandă.
                      </p>
                      <Link
                        href="/auth/login"
                        className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all text-center shadow-lg hover:shadow-xl text-sm sm:text-base"
                      >
                        🔑 Autentifică-te
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

function getCategoryEmoji(category) {
  const emojis = {
    appetizers: "🥗",
    main: "🍖",
    soups: "🍲",
    desserts: "🧁",
    drinks: "🥤",
  }
  return emojis[category] || "🍽️"
}
