"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    avatar: ""
  })

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/testimonials")
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateModal = () => {
    setEditingTestimonial(null)
    setFormData({
      name: "",
      role: "",
      content: "",
      rating: 5,
      avatar: ""
    })
    setShowModal(true)
  }

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.text || "",
      rating: testimonial.rating,
      avatar: testimonial.avatar || ""
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      role: formData.role || null,
      content: formData.content,
      rating: formData.rating,
      avatar: formData.avatar || null
    }

    try {
      if (editingTestimonial) {
        const res = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (res.ok) {
          const updated = await res.json()
          setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? updated : t))
        }
      } else {
        const res = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (res.ok) {
          const newTestimonial = await res.json()
          setTestimonials([newTestimonial, ...testimonials])
        }
      }
      
      setShowModal(false)
    } catch (error) {
      console.error("Error saving testimonial:", error)
    }
  }

  const handleDelete = async (testimonialId) => {
    if (!confirm("Ești sigur că vrei să ștergi acest testimonial?")) return
    
    try {
      const res = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== testimonialId))
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 h-20"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl h-48"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestionare Testimoniale</h1>
            <p className="text-gray-500 mt-1">Recenziile clienților afișate pe pagina principală</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adaugă testimonial
          </button>
        </div>
      </div>

      {/* Testimonials Grid */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {testimonial.avatar ? (
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    )}
                  </div>
                </div>
                {renderStars(testimonial.rating)}
              </div>

              {/* Content */}
              <p className="text-gray-600 italic mb-4">"{testimonial.text}"</p>

              {/* Date */}
              <p className="text-xs text-gray-400 mb-4">
                Adăugat: {new Date(testimonial.createdAt).toLocaleDateString('ro-RO', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(testimonial)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">Nu există testimoniale</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            Adaugă primul testimonial
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTestimonial ? "Editează testimonial" : "Adaugă testimonial nou"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume client *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ex: Maria Popescu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol / Ocupație</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ex: Client fidel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recenzie *</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Ce a spus clientul despre restaurant..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <svg
                        className={`w-8 h-8 transition-colors ${
                          star <= formData.rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                
                {/* Image Preview */}
                {formData.avatar && (
                  <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Image
                      src={formData.avatar}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Avatar curent</p>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: "" })}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Șterge imaginea
                      </button>
                    </div>
                  </div>
                )}
                
                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      // Validare dimensiune (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        alert("Imaginea trebuie să fie mai mică de 5MB")
                        return
                      }
                      
                      setIsUploading(true)
                      
                      try {
                        const uploadFormData = new FormData()
                        uploadFormData.append("file", file)
                        
                        const res = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadFormData
                        })
                        
                        if (res.ok) {
                          const data = await res.json()
                          setFormData({ ...formData, avatar: data.url })
                        } else {
                          const error = await res.json()
                          alert(error.error || "Eroare la încărcarea imaginii")
                        }
                      } catch (error) {
                        console.error("Upload error:", error)
                        alert("Eroare la încărcarea imaginii")
                      } finally {
                        setIsUploading(false)
                      }
                    }}
                    className="hidden"
                    id="avatar-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Se încarcă...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600">Încarcă avatar din calculator</span>
                      </>
                    )}
                  </label>
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP, GIF, AVIF (max 5MB)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  {editingTestimonial ? "Salvează" : "Adaugă"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
