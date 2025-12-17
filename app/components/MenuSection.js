"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export default function MenuSection({ onAddToCart }) {
  const [menuData, setMenuData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [hoveredItem, setHoveredItem] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchMenu() {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setMenuData(data)
        }
      } catch (error) {
        console.error("Error fetching menu:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMenu()
  }, [])

  if (isLoading || !menuData) {
    return (
      <section id="menu" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă meniul...</p>
          </div>
        </div>
      </section>
    )
  }

  const { sectionTitle, sectionSubtitle, categories, items, currency, addToCartLabel } = menuData

  const filteredItems = activeCategory === "all" 
    ? items 
    : items.filter(item => item.category === activeCategory)

  const handleAddToCart = (item) => {
    if (!session) {
      setShowAuthModal(true)
      return
    }
    onAddToCart && onAddToCart(item)
  }

  return (
    <section id="menu" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Autentificare necesară
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Pentru a adăuga produse în coș și a plasa o comandă, trebuie să fii autentificat în contul tău.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Conectează-te
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 w-full py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-orange-500 hover:text-orange-500 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Creează cont nou
              </Link>
            </div>

            {/* Benefits */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">Avantajele contului:</p>
              <div className="flex justify-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Istoric comenzi
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Oferte speciale
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Puncte fidelitate
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            🍽️ Descoperă gusturile noastre
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Category Tabs - Modern Pills */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-white rounded-2xl shadow-lg shadow-gray-200/50">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.image && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Image Container */}
              <Link href={`/menu/${item.id}`} className="block relative h-56 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.isPopular && (
                    <span className="flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Popular
                    </span>
                  )}
                  {item.isNew && (
                    <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                      Nou
                    </span>
                  )}
                </div>

                {/* Quick View Button */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                  hoveredItem === item.id ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}>
                  <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Vezi detalii
                  </span>
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                {/* Category Tag */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    {categories.find(c => c.id === item.category)?.name || item.category}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {item.preparationTime}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/menu/${item.id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                
                {/* Description */}
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {item.price} {currency}
                    </span>
                    <span className="text-xs text-gray-400">{item.calories} kcal</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToCart(item)
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {addToCartLabel}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-full font-semibold hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Vezi tot meniul
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
