"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [search, setSearch] = useState("")
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    order: 0
  })

  // Verifică permisiunile
  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/admin/check")
        if (res.ok) {
          const data = await res.json()
          setUserRole(data.role)
          if (data.role === 'MODERATOR') {
            router.push("/admin/dashboard")
          }
        }
      } catch (error) {
        console.error("Error checking access:", error)
      }
    }
    checkAccess()
  }, [router])

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      slug: "",
      image: "",
      order: categories.length
    })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
      order: category.order || 0
    })
    setShowModal(true)
  }

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name)
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const uploadFormData = new FormData()
    uploadFormData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      })

      if (res.ok) {
        const data = await res.json()
        setFormData(prev => ({ ...prev, image: data.url }))
      } else {
        alert("Eroare la încărcarea imaginii")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Eroare la încărcarea imaginii")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      name: formData.name,
      slug: formData.slug,
      image: formData.image || null,
      order: parseInt(formData.order)
    }

    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (res.ok) {
          const updated = await res.json()
          setCategories(categories.map(c => c.id === editingCategory.id ? { ...updated, productCount: editingCategory.productCount } : c))
          setShowModal(false)
        } else {
          const error = await res.json()
          alert(error.error || "Eroare la actualizare")
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        
        if (res.ok) {
          const newCategory = await res.json()
          setCategories([...categories, { ...newCategory, productCount: 0 }])
          setShowModal(false)
        } else {
          const error = await res.json()
          alert(error.error || "Eroare la creare")
        }
      }
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Eroare la salvare")
    }
  }

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    if (category?.productCount > 0) {
      alert(`Nu poți șterge această categorie. Are ${category.productCount} produse asociate. Mută produsele în altă categorie mai întâi.`)
      return
    }

    if (!confirm("Ești sigur că vrei să ștergi această categorie?")) return
    
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        setCategories(categories.filter(c => c.id !== categoryId))
      } else {
        const error = await res.json()
        alert(error.error || "Eroare la ștergere")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500">Se încarcă categoriile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
          <p className="text-gray-500 mt-1">Gestionează categoriile de produse</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Categorie Nouă
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Caută categorii..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 pl-11 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-500">Total Categorii</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-orange-500">
            {categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-500">Total Produse</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-500">
            {categories.filter(c => c.productCount > 0).length}
          </div>
          <div className="text-sm text-gray-500">Cu Produse</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-400">
            {categories.filter(c => !c.productCount).length}
          </div>
          <div className="text-sm text-gray-500">Goale</div>
        </div>
      </div>

      {/* Categories List - Compact */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Categorie</div>
          <div className="col-span-2">Slug</div>
          <div className="col-span-2 text-center">Produse</div>
          <div className="col-span-3 text-right">Acțiuni</div>
        </div>
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center"
          >
            {/* Order */}
            <div className="col-span-1">
              <span className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                {category.order}
              </span>
            </div>

            {/* Category Info */}
            <div className="col-span-4 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 flex-shrink-0">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
              </div>
            </div>

            {/* Slug */}
            <div className="col-span-2">
              <span className="text-sm text-gray-500 font-mono">/{category.slug}</span>
            </div>

            {/* Product Count */}
            <div className="col-span-2 text-center">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${category.productCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {category.productCount || 0}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-3 flex gap-1.5 justify-end">
              <button
                onClick={() => openEditModal(category)}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Editează"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => router.push(`/admin/products?category=${category.id}`)}
                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                title="Vezi produse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                disabled={category.productCount > 0}
                className={`p-2 rounded-lg transition-colors ${
                  category.productCount > 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
                title={category.productCount > 0 ? 'Nu poți șterge - are produse' : 'Șterge categoria'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {search ? "Nicio categorie găsită" : "Nicio categorie"}
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? "Încearcă un alt termen de căutare" : "Creează prima categorie pentru a începe"}
          </p>
          {!search && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Categorie Nouă
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? "Editează Categoria" : "Categorie Nouă"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume categorie *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="ex: Feluri principale"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                    /menu?category=
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="feluri-principale"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagine categorie
                </label>
                <div className="space-y-3">
                  {formData.image && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-colors"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Se încarcă...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formData.image ? "Schimbă imaginea" : "Încarcă imagine"}
                      </span>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordine afișare
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Categoriile sunt sortate în ordine crescătoare
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
                >
                  {editingCategory ? "Salvează" : "Creează"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
