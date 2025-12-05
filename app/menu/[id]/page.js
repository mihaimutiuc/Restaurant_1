"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "../../context/CartContext"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"

export default function ProductPage({ params }) {
  const router = useRouter()
  const { addToCart, getCartItemsCount } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [productData, setProductData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const resolvedParams = use(params)
  const productId = parseInt(resolvedParams.id)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const data = await response.json()
          setProductData(data)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar cartItemsCount={getCartItemsCount()} />
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Se încarcă produsul...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }
  
  if (!productData || !productData.product) {
    return (
      <main className="min-h-screen">
        <Navbar cartItemsCount={getCartItemsCount()} />
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Produs negăsit</h1>
            <p className="text-gray-600 mb-6">Ne pare rău, produsul nu a fost găsit.</p>
            <Link
              href="/#menu"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Înapoi la meniu
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const { product, relatedProducts, categories, currency } = productData
  const category = categories.find(c => c.id === product.category)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar cartItemsCount={getCartItemsCount()} />
      
      <div className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-orange-500 transition-colors">
                Acasă
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/#menu" className="text-gray-500 hover:text-orange-500 transition-colors">
                Meniu
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.isPopular && (
                    <span className="flex items-center gap-1.5 bg-red-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Popular
                    </span>
                  )}
                  {product.isNew && (
                    <span className="flex items-center gap-1.5 bg-emerald-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      ✨ Nou
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              {/* Category */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category?.icon}</span>
                <span className="text-orange-600 font-semibold">{category?.name}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.longDescription}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{product.preparationTime}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-gray-700 font-medium">{product.calories} kcal</span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingrediente</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              {product.allergens.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Alergeni</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((allergen, index) => (
                      <span
                        key={index}
                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        ⚠️ {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Add to Cart */}
              <div className="mt-auto pt-8 border-t">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <span className="text-gray-500 text-sm">Preț</span>
                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {product.price} {menuData.currency}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg ${
                        addedToCart
                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                          : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Adăugat!
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Adaugă în coș
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Produse similare</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/menu/${item.id}`}
                    className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xl font-bold text-orange-600">{item.price} {currency}</span>
                        <span className="text-orange-500 group-hover:translate-x-1 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  )
}
