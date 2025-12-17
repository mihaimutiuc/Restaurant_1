"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function MenuPage() {
  const { addToCart, getCartItemsCount } = useCart()
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [menuData, setMenuData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [addedItems, setAddedItems] = useState({})

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

  const handleAddToCart = (item) => {
    addToCart(item)
    setAddedItems(prev => ({ ...prev, [item.id]: true }))
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }))
    }, 1500)
  }

  if (isLoading || !menuData) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar cartItemsCount={getCartItemsCount()} />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-3 border-4 border-red-500 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <p className="text-gray-600 font-medium">Se încarcă meniul...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const { categories, items, currency, addToCartLabel } = menuData

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar cartItemsCount={getCartItemsCount()} />
      
      <div className="pt-20">
        {/* Hero Section */}
        <div className="relative min-h-[50vh] flex items-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80"
              alt="Restaurant interior"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-red-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center w-full">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-6 border border-white/20">
              🍽️ Descoperă gusturile autentice
            </span>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Meniul <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Nostru</span>
            </h1>
            
            <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Preparate tradiționale românești gătite cu pasiune, ingrediente locale și rețete transmise din generație în generație
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Caută preparatul tău preferat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 pl-14 rounded-2xl bg-white text-gray-900 placeholder-gray-400 shadow-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all"
                  />
                  <svg
                    className="absolute left-5 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex justify-center gap-8 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{items.length}+</div>
                <div className="text-white/60 text-sm">Preparate</div>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-white/60 text-sm">Categorii</div>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-white/60 text-sm">Rating</div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Categories & Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Category Tabs - Sticky */}
          <div className="sticky top-20 z-40 py-4 -mx-4 px-4 bg-gradient-to-b from-white via-white to-transparent">
            <div className="flex justify-center">
              <div className="inline-flex flex-wrap justify-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-gray-100">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeCategory === category.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-105"
                        : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                    }`}
                  >
                    {category.image ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-lg">{category.icon}</span>
                    )}
                    <span>{category.name}</span>
                    {activeCategory === category.id && (
                      <span className="ml-1 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                        {category.id === "all" ? items.length : items.filter(i => i.category === category.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-8 mt-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {activeCategory === "all" 
                  ? "Toate preparatele" 
                  : categories.find(c => c.id === activeCategory)?.name}
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredItems.length} {filteredItems.length === 1 ? "preparat" : "preparate"} 
                {searchQuery && ` pentru "${searchQuery}"`}
              </p>
            </div>
            
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Resetează căutarea
              </button>
            )}
          </div>

          {/* Products Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Container */}
                  <Link href={`/menu/${item.id}`} className="block relative h-56 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.isPopular && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Popular
                        </span>
                      )}
                      {item.isNew && (
                        <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                          ✨ Nou
                        </span>
                      )}
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm text-orange-600 font-bold px-4 py-2 rounded-xl shadow-lg">
                        {item.price} {currency}
                      </div>
                    </div>

                    {/* Quick view button */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
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
                    {/* Category & Time */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                        {categories.find(c => c.id === item.category)?.icon}
                        {categories.find(c => c.id === item.category)?.name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item.preparationTime}
                      </span>
                    </div>

                    {/* Title */}
                    <Link href={`/menu/${item.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">{item.description}</p>

                    {/* Footer */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addedItems[item.id]}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          addedItems[item.id]
                            ? "bg-green-500 text-white"
                            : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        {addedItems[item.id] ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Adăugat!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {addToCartLabel}
                          </>
                        )}
                      </button>
                      
                      <Link 
                        href={`/menu/${item.id}`}
                        className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Niciun rezultat găsit</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Nu am găsit preparate care să corespundă căutării tale. Încearcă alte cuvinte cheie sau explorează categoriile noastre.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resetează filtrele
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Nu găsești ce cauți?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Sună-ne și îți vom pregăti orice preparat special, adaptat gusturilor tale.
            </p>
            <a 
              href="tel:+40123456789" 
              className="inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Comandă telefonic
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
