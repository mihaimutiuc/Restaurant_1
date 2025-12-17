"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import navigationData from "../data/navigation.json"

export default function Navbar({ cartItemsCount = 0 }) {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const { logo, links, authLinks, cartLabel, orderLabel, mobileMenuTitle, welcomeText } = navigationData

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!session) {
        setIsAdmin(false)
        return
      }
      try {
        const res = await fetch('/api/admin/check')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.isAdmin || false)
        }
      } catch (error) {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [session])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Detect active section
      const sections = links.map(link => link.href.replace("#", ""))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [links])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const pathname = usePathname()

  // Generează href-ul corect pentru link-uri
  const getHref = (href) => {
    if (href.startsWith("#")) {
      // Dacă suntem pe homepage, folosește anchor direct
      if (pathname === "/") {
        return href
      }
      // Altfel, navighează la homepage + anchor
      return "/" + href
    }
    return href
  }

  const handleNavClick = (e, href) => {
    // Dacă suntem pe pagina principală și link-ul este un anchor
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault()
      const element = document.getElementById(href.replace("#", ""))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    // Dacă nu suntem pe homepage, lasă browser-ul să navigheze normal cu href-ul generat
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
            : "bg-white/90 backdrop-blur-sm shadow-md py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">🍅</span>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-800">La</span>
                  <span className="text-lg font-bold text-orange-500 italic">Casa</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-medium">
                  {logo.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-gray-100">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={getHref(link.href)}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeSection === link.href.replace("#", "")
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                        : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {session ? (
                <>
                  {/* Orders Button */}
                  <Link
                    href="/orders"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span>{orderLabel}</span>
                  </Link>

                  {/* Admin Button - Only for admins */}
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Admin</span>
                    </Link>
                  )}

                  {/* Cart Button */
                  <Link
                    href="/checkout"
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{cartLabel}</span>
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-gray-100"
                    >
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={36}
                          height={36}
                          className="w-9 h-9 rounded-full shadow-lg object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <svg
                        className={`w-4 h-4 transition-all duration-300 text-gray-600 ${isUserMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
                        <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600">
                          <p className="text-white/80 text-xs">{welcomeText}</p>
                          <p className="text-white font-semibold truncate">
                            {session.user.name || session.user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>Comenzile mele</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Admin Panel</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false)
                              signOut()
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{authLinks.logout.label}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href={authLinks.login.href}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                  >
                    {authLinks.login.label}
                  </Link>
                  <Link
                    href={authLinks.register.href}
                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {authLinks.register.label}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="flex lg:hidden items-center gap-2">
              {session && (
                <Link
                  href="/checkout"
                  className="relative p-2.5 rounded-xl transition-all duration-300 bg-orange-50 text-orange-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              )}
              <button
                className="p-2.5 rounded-xl transition-all duration-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-5 h-5 relative">
                  <span
                    className={`absolute left-0 w-5 h-0.5 bg-current transition-all duration-300 ${
                      isMenuOpen ? "top-2 rotate-45" : "top-0.5"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2 w-5 h-0.5 bg-current transition-all duration-300 ${
                      isMenuOpen ? "opacity-0 scale-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 w-5 h-0.5 bg-current transition-all duration-300 ${
                      isMenuOpen ? "top-2 -rotate-45" : "top-3.5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white z-50 lg:hidden transition-transform duration-500 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍅</span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-bold">La</span>
                    <span className="text-white font-bold italic">Casa</span>
                  </div>
                  <p className="text-white/70 text-xs">{logo.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {session && (
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold">
                    {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs">{welcomeText}</p>
                  <p className="text-white font-medium truncate">
                    {session.user.name || session.user.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Links */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              {mobileMenuTitle}
            </p>
            <div className="space-y-1">
              {links.map((link, index) => (
                <a
                  key={link.id}
                  href={getHref(link.href)}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    activeSection === link.href.replace("#", "")
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NavIcon name={link.icon} />
                  <span className="font-medium">{link.label}</span>
                  {activeSection === link.href.replace("#", "") && (
                    <span className="ml-auto w-2 h-2 bg-orange-500 rounded-full"></span>
                  )}
                </a>
              ))}
            </div>

            {session && (
              <>
                <div className="h-px bg-gray-200 my-4" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                  Cont
                </p>
                <div className="space-y-1">
                  <Link
                    href="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium">{orderLabel}</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    href="/checkout"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">{cartLabel}</span>
                    {cartItemsCount > 0 && (
                      <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t bg-gray-50">
            {session ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{authLinks.logout.label}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  href={authLinks.login.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3.5 text-center text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  {authLinks.login.label}
                </Link>
                <Link
                  href={authLinks.register.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full px-4 py-3.5 text-center bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  {authLinks.register.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function NavIcon({ name }) {
  const icons = {
    home: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    menu: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    star: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    phone: (
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  }
  return icons[name] || null
}
