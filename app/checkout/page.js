"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "card",
  })

  // Actualizează numele când sesiunea se încarcă
  useEffect(() => {
    if (session?.user?.name) {
      setFormData(prev => ({ ...prev, name: session.user.name }))
    }
  }, [session?.user?.name])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!session) {
      router.push("/auth/login")
      return
    }

    setIsOrdering(true)
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress: formData.address,
          phone: formData.phone,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirecționează la pagina de comenzi
        router.push(`/orders?newOrder=${data.order.id}`)
      } else {
        const error = await response.json()
        alert(error.error || "Eroare la plasarea comenzii")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Eroare la plasarea comenzii")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar cartItemsCount={getCartItemsCount()} />
      
      <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Coșul tău</h1>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Se încarcă coșul...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Coșul tău este gol
              </h2>
              <p className="text-gray-600 mb-6">
                Adaugă produse din meniu pentru a plasa o comandă.
              </p>
              <Link
                href="/#menu"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
              >
                Vezi meniul
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-4 shadow-md flex items-center gap-4"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                          <span className="text-3xl">
                            {getCategoryEmoji(item.category)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-500 text-sm">{item.price} RON</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right w-24">
                      <p className="font-bold text-orange-500">
                        {item.price * item.quantity} RON
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-lg sticky top-24">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    Sumar comandă
                  </h2>

                  {/* Free delivery progress */}
                  {getAmountUntilFreeDelivery() > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-700">
                        🚚 Mai adaugă <span className="font-bold">{getAmountUntilFreeDelivery()} RON</span> pentru livrare gratuită!
                      </p>
                      <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (getCartTotal() / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Summary Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{getCartTotal()} RON</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Livrare</span>
                      {getDeliveryFee() === 0 ? (
                        <span className="text-green-600 font-medium">Gratis</span>
                      ) : (
                        <span>{getDeliveryFee()} RON</span>
                      )}
                    </div>
                    {getDeliveryFee() === 0 && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Ai livrare gratuită!</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-orange-500">{getOrderTotal()} RON</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Form */}
                  {session ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nume complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresa de livrare
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Metoda de plată
                        </label>
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        >
                          <option value="card">Card (plată online)</option>
                          <option value="cash">Numerar la livrare</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notițe (opțional)
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Ex: Etaj 3, apartament 12"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isOrdering}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isOrdering ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Se procesează...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Plasează comanda
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Trebuie să fii autentificat pentru a plasa o comandă.
                      </p>
                      <Link
                        href="/auth/login"
                        className="block w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors text-center"
                      >
                        Autentifică-te
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
