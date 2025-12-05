"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import featuresData from "../data/features.json"

// Component pentru animația de numărare
function AnimatedCounter({ end, duration = 2000, suffix = "", decimal = false }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    let animationFrame

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function pentru o animație mai naturală
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      if (decimal) {
        setCount(Number((easeOutQuart * end).toFixed(1)))
      } else {
        setCount(Math.floor(easeOutQuart * end))
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration, decimal])

  return (
    <span ref={ref}>
      {decimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  )
}

// Component pentru bara de progres animată
function AnimatedProgressBar({ targetWidth, delay = 0 }) {
  const [width, setWidth] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          // Delay mic pentru a asigura că DOM-ul e gata
          setTimeout(() => {
            setTimeout(() => {
              setWidth(targetWidth)
            }, delay)
          }, 100)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated, targetWidth, delay])

  return (
    <div ref={ref} className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
      <div 
        className="h-full bg-white rounded-full"
        style={{ 
          width: `${width}%`,
          transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </div>
  )
}

// Iconițe SVG profesionale pentru fiecare feature
const featureIcons = {
  1: ( // Ingrediente Proaspete
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  2: ( // Bucătari Profesioniști
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  3: ( // Livrare Rapidă
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  4: ( // Prețuri Accesibile
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  5: ( // Opțiuni Vegetariene
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  6: ( // Calitate Garantată
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

// Imagini reale pentru fiecare feature
const featureImages = {
  1: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80", // Ingrediente
  2: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80", // Bucătar
  3: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&q=80", // Livrare
  4: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80", // Restaurant
  5: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80", // Vegetarian
  6: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80"  // Calitate
}

export default function FeaturesSection() {
  const { sectionTitle, sectionSubtitle, features } = featuresData

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            DE CE NOI?
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {sectionSubtitle}
          </p>
        </div>

        {/* Features Grid - Top 3 with images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {features.slice(0, 3).map((feature) => (
            <div
              key={feature.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={featureImages[feature.id]}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                
                {/* Icon badge */}
                <div className="absolute bottom-4 left-4 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  {featureIcons[feature.id]}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-500/30 transition-colors pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Features Grid - Bottom 3 as cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.slice(3, 6).map((feature) => (
            <div
              key={feature.id}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon with gradient background */}
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  {featureIcons[feature.id]}
                </div>
                <div className="absolute -inset-2 bg-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {feature.description}
              </p>
              
              {/* Learn more link */}
              <div className="flex items-center text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm">Află mai multe</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              
              {/* Corner decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl shadow-orange-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={15} duration={2000} suffix="+" />
              </div>
              <div className="text-white/80 text-sm md:text-base">Ani de experiență</div>
              <AnimatedProgressBar targetWidth={100} delay={100} />
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={50} duration={2000} suffix="k+" />
              </div>
              <div className="text-white/80 text-sm md:text-base">Clienți mulțumiți</div>
              <AnimatedProgressBar targetWidth={100} delay={200} />
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={100} duration={2000} suffix="+" />
              </div>
              <div className="text-white/80 text-sm md:text-base">Preparate unice</div>
              <AnimatedProgressBar targetWidth={100} delay={300} />
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter end={4.9} duration={2000} decimal={true} />
              </div>
              <div className="text-white/80 text-sm md:text-base">Rating mediu</div>
              <AnimatedProgressBar targetWidth={100} delay={400} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
