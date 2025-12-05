"use client"

import { useCart } from "./context/CartContext"
import Navbar from "./components/Navbar"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import MenuSection from "./components/MenuSection"
import AboutSection from "./components/AboutSection"
import TestimonialsSection from "./components/TestimonialsSection"
import ContactSection from "./components/ContactSection"
import Footer from "./components/Footer"

export default function Home() {
  const { addToCart, getCartItemsCount } = useCart()

  const handleAddToCart = (item) => {
    addToCart(item)
  }

  return (
    <main className="min-h-screen">
      <Navbar cartItemsCount={getCartItemsCount()} />
      <HeroSection />
      <FeaturesSection />
      <MenuSection onAddToCart={handleAddToCart} />
      <AboutSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
