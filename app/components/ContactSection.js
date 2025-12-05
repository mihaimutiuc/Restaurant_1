"use client"

import { useState } from "react"
import contactData from "../data/contact.json"

export default function ContactSection() {
  const { sectionTitle, sectionSubtitle, info, form, socialMedia } = contactData
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [focusedField, setFocusedField] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setSubmitStatus("success")
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    setIsSubmitting(false)
    
    setTimeout(() => setSubmitStatus(null), 5000)
  }

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-100 to-red-100 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-100 to-yellow-100 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl opacity-60"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
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

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2"></div>
              
              <h3 className="text-2xl font-bold mb-2 relative z-10">
                Contactează-ne
              </h3>
              <p className="text-white/80 mb-8 relative z-10">
                Suntem aici să te ajutăm cu orice întrebare
              </p>

              <div className="space-y-6 relative z-10">
                {/* Address */}
                <a 
                  href={info.address.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{info.address.label}</p>
                    <p className="font-medium group-hover:translate-x-1 transition-transform">
                      {info.address.value}
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a 
                  href={info.phone.link}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{info.phone.label}</p>
                    <p className="font-medium group-hover:translate-x-1 transition-transform">
                      {info.phone.value}
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href={info.email.link}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{info.email.label}</p>
                    <p className="font-medium group-hover:translate-x-1 transition-transform">
                      {info.email.value}
                    </p>
                  </div>
                </a>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">{info.hours.label}</p>
                    <p className="font-medium">
                      {info.hours.value}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-10 pt-8 border-t border-white/20 relative z-10">
                <p className="text-white/80 mb-4 text-sm">Urmărește-ne pe social media</p>
                <div className="flex gap-3">
                  {socialMedia.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white hover:text-orange-500 transition-all hover:scale-110"
                      aria-label={social.name}
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Map Preview Card */}
            <div className="bg-gray-100 rounded-3xl overflow-hidden h-48 relative group cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Locație restaurant"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <a 
                href={info.address.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-white">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">Deschide în Google Maps</span>
                </div>
                <svg className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {form.title}
                </h3>
              </div>
              <p className="text-gray-500 mb-8">
                Completează formularul și îți vom răspunde în cel mai scurt timp
              </p>

              {submitStatus === "success" && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Mesaj trimis cu succes!</p>
                    <p className="text-sm text-green-600">Îți vom răspunde în maximum 24 de ore.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <label 
                      htmlFor="name" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'name' || formData.name 
                          ? 'top-2 text-xs text-orange-500 font-medium' 
                          : 'top-4 text-gray-400'
                      }`}
                    >
                      {form.fields.name.label} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-4 pt-7 pb-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white text-gray-900 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <label 
                      htmlFor="email" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'email' || formData.email 
                          ? 'top-2 text-xs text-orange-500 font-medium' 
                          : 'top-4 text-gray-400'
                      }`}
                    >
                      {form.fields.email.label} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-4 pt-7 pb-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white text-gray-900 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="relative">
                    <label 
                      htmlFor="phone" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'phone' || formData.phone 
                          ? 'top-2 text-xs text-orange-500 font-medium' 
                          : 'top-4 text-gray-400'
                      }`}
                    >
                      {form.fields.phone.label}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 pt-7 pb-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white text-gray-900 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <label 
                      htmlFor="subject" 
                      className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                        focusedField === 'subject' || formData.subject 
                          ? 'top-2 text-xs text-orange-500 font-medium' 
                          : 'top-4 text-gray-400'
                      }`}
                    >
                      {form.fields.subject.label} *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('subject')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full px-4 pt-7 pb-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white text-gray-900 transition-all"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label 
                    htmlFor="message" 
                    className={`absolute left-4 transition-all duration-200 pointer-events-none ${
                      focusedField === 'message' || formData.message 
                        ? 'top-2 text-xs text-orange-500 font-medium' 
                        : 'top-4 text-gray-400'
                    }`}
                  >
                    {form.fields.message.label} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={5}
                    className="w-full px-4 pt-7 pb-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white resize-none text-gray-900 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se trimite...
                    </>
                  ) : (
                    <>
                      {form.submitButton}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Protejăm datele tale. Citește{" "}
                  <span className="text-orange-500 hover:underline cursor-pointer">Politica de confidențialitate</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
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
  }

  return icons[name] || null
}
