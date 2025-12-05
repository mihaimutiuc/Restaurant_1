import Image from "next/image"
import heroData from "../data/hero.json"

export default function HeroSection() {
  const { title, subtitle, description, primaryButton, secondaryButton, stats } = heroData

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
          alt="Restaurant ambiance"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">Deschiși acum • Livrare gratuită</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {title.split(" ").map((word, index) => (
                <span key={index}>
                  {word === "La" || word === "Casa" ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{word}</span>
                  ) : (
                    word
                  )}{" "}
                </span>
              ))}
            </h1>
            
            <p className="text-xl sm:text-2xl text-orange-400 font-medium mb-4 tracking-wide">
              {subtitle}
            </p>
            
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a
                href={primaryButton.href}
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105"
              >
                {primaryButton.text}
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href={secondaryButton.href}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {secondaryButton.text}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center lg:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Images Grid */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main large image */}
              <div className="relative w-80 h-80 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=600&q=80"
                    alt="Sarmale tradiționale"
                    fill
                    sizes="320px"
                    className="object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Floating food cards */}
              <div className="absolute -top-4 -left-8 bg-white rounded-2xl p-2 shadow-2xl animate-hero-float">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=80"
                    alt="Ciorbă de burtă"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-800 mt-1 text-center">Ciorbă de burtă</p>
              </div>

              <div className="absolute -bottom-4 -left-12 bg-white rounded-2xl p-2 shadow-2xl animate-hero-float-delayed">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80"
                    alt="Mici la grătar"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-800 mt-1 text-center">Mici la grătar</p>
              </div>

              <div className="absolute top-10 -right-8 bg-white rounded-2xl p-2 shadow-2xl animate-hero-float-slow">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&q=80"
                    alt="Papanași"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-800 mt-1 text-center">Papanași</p>
              </div>

              <div className="absolute -bottom-8 right-0 bg-white rounded-2xl p-2 shadow-2xl animate-hero-float">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=200&q=80"
                    alt="Platou aperitive"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <p className="text-xs font-medium text-gray-800 mt-1 text-center">Aperitive</p>
              </div>

              {/* Rating badge */}
              <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-lg font-bold text-gray-800">4.9</p>
                <p className="text-xs text-gray-500">500+ recenzii</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <a href="#features" className="flex flex-col items-center text-white/60 hover:text-white transition-colors group">
          <span className="text-sm mb-2 tracking-wider">Descoperă mai mult</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center group-hover:border-white/60 transition-colors">
            <div className="w-1.5 h-3 bg-white/60 rounded-full mt-2 animate-bounce group-hover:bg-white"></div>
          </div>
        </a>
      </div>

    </section>
  )
}
