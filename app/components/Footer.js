import Link from "next/link"
import Image from "next/image"
import footerData from "../data/footer.json"

export default function Footer() {
  const { logo, description, sections, socialMedia, copyright, paymentMethods } = footerData

  return (
    <footer className="relative bg-gray-950 text-gray-300 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
      
      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-gray-800/50">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Abonează-te la newsletter
              </h3>
              <p className="text-gray-400">
                Primește oferte exclusive și noutăți direct în inbox
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Adresa ta de email"
                    className="w-full sm:w-80 px-5 py-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
                >
                  Abonează-te
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Links Grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Logo & Description - Takes 4 columns */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110">🍅</span>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">La</span>
                  <span className="text-2xl font-bold text-orange-500 italic">Casa</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-orange-500 font-medium">
                  {logo.tagline}
                </span>
              </div>
            </Link>
            
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              {description}
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              {socialMedia.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/icon w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-orange-500 hover:to-red-500 hover:border-transparent hover:scale-110 transition-all duration-300"
                  aria-label={social.name}
                >
                  <span className="text-gray-400 group-hover/icon:text-white transition-colors">
                    <SocialIcon name={social.icon} />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className={`lg:col-span-${section.id === 3 ? '4' : '2'}`}>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                {section.title}
              </h3>
              {section.links ? (
                <ul className="space-y-4">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="group/link flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        <span className="w-0 group-hover/link:w-4 h-0.5 bg-orange-500 mr-0 group-hover/link:mr-2 transition-all duration-300 rounded-full"></span>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-4">
                  {section.content.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ContactIcon type={item.icon} />
                      </div>
                      <span className="text-gray-400 pt-2">{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* App Download Section */}
        <div className="py-8 border-t border-gray-800/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Descarcă aplicația</p>
                <p className="text-gray-500 text-sm">Comenzi mai rapide din aplicație</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-gray-800 transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500">Disponibil pe</p>
                  <p className="text-sm text-white font-medium -mt-0.5">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-gray-800 transition-all">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500">Disponibil pe</p>
                  <p className="text-sm text-white font-medium -mt-0.5">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-800/50">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>{copyright}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Făcut cu</span>
              <span className="hidden sm:inline text-red-500">❤️</span>
              <span className="hidden sm:inline">în România</span>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">Metode de plată:</span>
              <div className="flex gap-2">
                {paymentMethods.map((method, index) => (
                  <div 
                    key={index} 
                    className="h-8 px-3 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center hover:border-gray-700 transition-colors"
                  >
                    <PaymentIcon name={method} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl translate-x-1/2"></div>
    </footer>
  )
}

function SocialIcon({ name }) {
  const icons = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
  }

  return icons[name] || null
}

function ContactIcon({ type }) {
  const icons = {
    "📍": (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    "📞": (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    "✉️": (
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  }
  return icons[type] || null
}

function PaymentIcon({ name }) {
  const icons = {
    "Visa": (
      <svg className="h-4" viewBox="0 0 50 16" fill="none">
        <path d="M19.5 15.5L22 0.5H26L23.5 15.5H19.5Z" fill="#1434CB"/>
        <path d="M35.5 0.8C34.5 0.4 33 0 31 0C27 0 24 2.2 24 5.4C24 7.8 26.2 9.1 27.8 9.9C29.5 10.7 30.1 11.2 30.1 12C30.1 13.1 28.8 13.6 27.6 13.6C25.9 13.6 25 13.3 23.6 12.7L23 12.4L22.4 16C23.6 16.5 25.7 16.9 27.9 16.9C32.2 16.9 35.1 14.8 35.1 11.3C35.1 9.4 33.9 7.9 31.4 6.7C29.9 5.9 29 5.4 29 4.5C29 3.7 29.9 2.9 31.8 2.9C33.4 2.9 34.6 3.2 35.5 3.6L35.9 3.8L36.5 0.6L35.5 0.8Z" fill="#1434CB"/>
        <path d="M42 0.5C41 0.5 40.2 0.8 39.8 1.9L33.5 15.5H37.8L38.6 13.1H43.8L44.3 15.5H48L44.8 0.5H42ZM39.8 10.2C40.1 9.3 41.5 5.6 41.5 5.6C41.5 5.6 41.8 4.7 42 4.1L42.3 5.4C42.3 5.4 43.1 9 43.3 10.2H39.8Z" fill="#1434CB"/>
        <path d="M17 0.5L13 10.7L12.6 8.7C11.8 6 9.2 3.1 6.3 1.6L10 15.5H14.4L21.4 0.5H17Z" fill="#1434CB"/>
        <path d="M9 0.5H2.1L2 0.9C7.1 2.2 10.5 5.4 11.8 9.1L10.4 1.9C10.2 0.8 9.4 0.5 9 0.5Z" fill="#F9A533"/>
      </svg>
    ),
    "Mastercard": (
      <svg className="h-4" viewBox="0 0 32 20" fill="none">
        <circle cx="12" cy="10" r="8" fill="#EB001B"/>
        <circle cx="20" cy="10" r="8" fill="#F79E1B"/>
        <path d="M16 3.5C17.8 5 19 7.4 19 10C19 12.6 17.8 15 16 16.5C14.2 15 13 12.6 13 10C13 7.4 14.2 5 16 3.5Z" fill="#FF5F00"/>
      </svg>
    ),
    "Apple Pay": (
      <svg className="h-4" viewBox="0 0 40 16" fill="currentColor">
        <path d="M7.5 3.8C7 4.4 6.2 4.9 5.5 4.8C5.4 4.1 5.8 3.3 6.2 2.8C6.7 2.2 7.5 1.7 8.2 1.7C8.3 2.5 7.9 3.2 7.5 3.8ZM8.2 5C7 4.9 6 5.7 5.4 5.7C4.8 5.7 3.9 5 2.9 5C1.7 5 0.5 5.8 0 7C-0.5 8.2 0.3 10.7 1.4 12.4C1.9 13.2 2.5 14.1 3.4 14.1C4.2 14.1 4.6 13.6 5.6 13.6C6.6 13.6 7 14.1 7.8 14.1C8.7 14.1 9.2 13.3 9.8 12.5C10.4 11.6 10.7 10.8 10.7 10.7C10.7 10.7 8.5 9.8 8.5 7.3C8.5 5.2 10.2 4.2 10.3 4.1C9.3 2.7 7.8 2.5 7.4 2.5C6.2 2.4 5.2 3.2 4.6 3.2C4 3.2 3.1 2.5 2.1 2.5C0.9 2.6 -0.2 3.4 -0.8 4.6C-2 7.1 -1 10.7 0.8 12.8C1.9 14.1 3.2 15.5 4.9 15.5C6.5 15.4 7.1 14.5 9 14.5C10.9 14.5 11.5 15.4 13.1 15.4C14.8 15.4 16 14.1 17.1 12.7C17.8 11.7 18 11.2 18.6 10.1C13.9 8.2 13.1 1.8 17.7 0C16.5 -0.1 14.8 0.7 13.6 2C12.6 3.1 11.7 4.7 11.9 6.2C14.5 6.4 16.9 4.9 18.4 3.2"/>
        <path d="M23.5 14.8V5.1H26.9C29.1 5.1 30.6 6.6 30.6 8.9C30.6 11.2 29.1 12.7 26.8 12.7H25.3V14.8H23.5ZM25.3 11.2H26.4C27.9 11.2 28.7 10.4 28.7 8.9C28.7 7.4 27.9 6.6 26.4 6.6H25.3V11.2Z"/>
        <path d="M31.4 12.2C31.4 10.9 32.4 10.1 34.2 10L36.1 9.9V9.2C36.1 8.3 35.5 7.8 34.5 7.8C33.6 7.8 33 8.2 32.9 8.9H31.3C31.4 7.4 32.7 6.4 34.6 6.4C36.6 6.4 37.9 7.5 37.9 9.1V14.8H36.2V13.5H36.1C35.6 14.4 34.6 14.9 33.6 14.9C32.2 14.9 31.4 13.8 31.4 12.2ZM36.1 11.4V10.7L34.5 10.8C33.5 10.9 33 11.3 33 12C33 12.8 33.6 13.3 34.4 13.3C35.4 13.3 36.1 12.5 36.1 11.4Z"/>
        <path d="M39.2 17.2V15.8C39.4 15.8 39.8 15.8 40 15.8C40.7 15.8 41.1 15.5 41.3 14.8L41.5 14.2L38.6 6.5H40.5L42.4 12.7H42.5L44.4 6.5H46.3L43.2 15C42.5 17 41.7 17.5 40.2 17.5C40 17.5 39.4 17.4 39.2 17.2Z"/>
      </svg>
    ),
    "Google Pay": (
      <svg className="h-4" viewBox="0 0 40 16" fill="currentColor">
        <path d="M18.7 7.7V11.4H17.3V1.6H20.6C21.5 1.6 22.3 1.9 22.9 2.5C23.5 3.1 23.8 3.8 23.8 4.7C23.8 5.6 23.5 6.3 22.9 6.9C22.3 7.5 21.5 7.8 20.6 7.8H18.7V7.7ZM18.7 2.9V6.4H20.6C21.1 6.4 21.6 6.2 21.9 5.9C22.3 5.5 22.4 5.1 22.4 4.7C22.4 4.2 22.2 3.8 21.9 3.4C21.5 3.1 21.1 2.9 20.6 2.9H18.7Z"/>
        <path d="M27.7 4.6C28.7 4.6 29.5 4.9 30.1 5.5C30.7 6.1 31 6.9 31 7.9V11.4H29.6V10.3H29.5C29 11.1 28.3 11.5 27.4 11.5C26.6 11.5 25.9 11.3 25.4 10.8C24.9 10.3 24.6 9.7 24.6 9C24.6 8.2 24.9 7.6 25.5 7.1C26.1 6.6 26.9 6.4 27.8 6.4C28.6 6.4 29.3 6.5 29.7 6.8V6.5C29.7 6 29.5 5.6 29.1 5.2C28.7 4.9 28.3 4.7 27.7 4.7C26.9 4.7 26.3 5 25.9 5.6L24.7 4.8C25.3 4.3 26.3 4.6 27.7 4.6ZM26.1 9C26.1 9.4 26.3 9.7 26.6 9.9C26.9 10.2 27.3 10.3 27.7 10.3C28.3 10.3 28.8 10.1 29.2 9.7C29.6 9.3 29.8 8.8 29.8 8.3C29.4 8 28.9 7.8 28.1 7.8C27.5 7.8 27 7.9 26.6 8.2C26.3 8.4 26.1 8.7 26.1 9Z"/>
        <path d="M38.3 4.8L34.4 13.8H32.9L34.3 10.7L31.6 4.8H33.2L35.1 9.3L37 4.8H38.3Z"/>
        <path d="M13 6.4C13 6 13 5.6 12.9 5.2H7.2V7.4H10.4C10.3 8.2 9.9 8.9 9.3 9.4V11.1H11.2C12.4 10 13 8.3 13 6.4Z" fill="#4285F4"/>
        <path d="M7.2 12.7C8.9 12.7 10.3 12.1 11.2 11.1L9.3 9.4C8.7 9.8 8 10 7.2 10C5.5 10 4.1 8.8 3.6 7.2H1.7V8.9C2.6 11.2 4.7 12.7 7.2 12.7Z" fill="#34A853"/>
        <path d="M3.6 7.2C3.4 6.6 3.4 5.9 3.6 5.3V3.6H1.7C0.9 5.1 0.9 6.9 1.7 8.4L3.6 7.2Z" fill="#FBBC04"/>
        <path d="M7.2 2.5C8.1 2.5 8.9 2.8 9.5 3.4L11.3 1.6C10.2 0.6 8.8 0 7.2 0C4.7 0 2.6 1.5 1.7 3.8L3.6 5.5C4.1 3.9 5.5 2.5 7.2 2.5Z" fill="#EA4335"/>
      </svg>
    ),
  }
  return icons[name] || <span className="text-xs text-gray-400 font-medium">{name}</span>
}
