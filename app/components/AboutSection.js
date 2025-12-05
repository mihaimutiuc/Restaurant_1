import aboutData from "../data/about.json"

export default function AboutSection() {
  const { sectionTitle, sectionSubtitle, mainTitle, description, highlights, quote } = aboutData

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
            {sectionSubtitle}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {sectionTitle}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Chef pregătind mâncare"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
            {/* Secondary Image */}
            <div className="absolute -bottom-8 -right-8 w-64 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Interior restaurant"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Rating Card */}
            <div className="absolute top-6 -right-4 bg-white rounded-2xl p-5 shadow-xl hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <p className="text-gray-500 text-sm">2000+ recenzii</p>
                </div>
              </div>
            </div>

            {/* Experience Badge */}
            <div className="absolute -top-6 -left-6 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-xl">
              <p className="text-4xl font-bold">15+</p>
              <p className="text-sm text-white/90">Ani experiență</p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-100 rounded-full blur-3xl opacity-30"></div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {mainTitle}
            </h3>
            
            <div className="space-y-5 text-gray-600 mb-10">
              {description.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {highlights.map((item) => (
                <div 
                  key={item.id} 
                  className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">
                    {item.value}
                  </p>
                  <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 overflow-hidden">
              {/* Quote Mark */}
              <div className="absolute top-4 right-4 text-orange-200 text-8xl font-serif leading-none">"</div>
              
              <p className="text-gray-700 italic text-xl mb-6 relative z-10 leading-relaxed">
                "{quote.text}"
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1583394293214-28ez1c2cdc25?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
                  alt={quote.author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80";
                  }}
                />
                <div>
                  <p className="font-bold text-gray-900">{quote.author}</p>
                  <p className="text-orange-600 text-sm font-medium">{quote.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
