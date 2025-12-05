"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// Super admin that cannot be deleted
const SUPER_ADMIN_EMAIL = "mihai.mutiuc@gmail.com"

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    method: "google" // "google" or "credentials"
  })
  const [error, setError] = useState("")

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching admins:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (formData.method === "credentials" && !formData.password) {
      setError("Parola este obligatorie pentru autentificare cu email")
      return
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const newAdmin = await res.json()
        setAdmins([newAdmin, ...admins.filter(a => a.id !== newAdmin.id)])
        setShowModal(false)
        setFormData({ name: "", email: "", password: "", method: "google" })
      } else {
        const data = await res.json()
        setError(data.error || "Eroare la crearea adminului")
      }
    } catch (error) {
      console.error("Error creating admin:", error)
      setError("Eroare la crearea adminului")
    }
  }

  const handleRemoveAdmin = async (userId, userName, userEmail) => {
    // Check if super admin
    if (userEmail?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || 
        userName?.toLowerCase() === "mihai mutiuc") {
      alert("Nu poți elimina drepturile de admin pentru Super Admin!")
      return
    }

    if (!confirm(`Ești sigur că vrei să elimini drepturile de admin pentru ${userName}?`)) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setAdmins(admins.filter(a => a.id !== userId))
      } else {
        const data = await res.json()
        alert(data.error || "Eroare la eliminarea adminului")
      }
    } catch (error) {
      console.error("Error removing admin:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 h-20"></div>
        <div className="bg-white rounded-2xl p-6 h-96"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestionare Administratori</h1>
            <p className="text-gray-500 mt-1">Adaugă sau elimină admini care pot gestiona restaurantul</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adaugă admin
          </button>
        </div>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {admins.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => {
              const isSuperAdmin = admin.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || 
                                   admin.name?.toLowerCase() === "mihai mutiuc"
              return (
              <div key={admin.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {admin.image ? (
                    <Image
                      src={admin.image}
                      alt={admin.name || ""}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-semibold text-lg">
                        {admin.name?.charAt(0) || admin.email?.charAt(0) || "?"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{admin.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Admin din {new Date(admin.createdAt).toLocaleDateString('ro-RO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSuperAdmin ? (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Super Admin
                    </span>
                  ) : (
                    <>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Admin
                      </span>
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.name || admin.email, admin.email)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Elimină drepturi admin"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-500">Nu există administratori</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Cum funcționează</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Login cu Google:</strong> Introdu email-ul contului Google. Utilizatorul se va conecta folosind butonul "Continuă cu Google"</li>
              <li>• <strong>Login cu email & parolă:</strong> Creează un cont cu email și parolă. Utilizatorul se va conecta introducând email-ul și parola</li>
              <li>• Eliminarea unui admin nu șterge contul, doar elimină drepturile de administrator</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Adaugă administrator</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFormData({ name: "", email: "", password: "", method: "google" })
                  setError("")
                }}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Auth Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metodă de autentificare</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: "google", password: "" })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.method === "google"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium text-gray-900">Google</span>
                    </div>
                    <p className="text-xs text-gray-500">Se conectează cu Google</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: "credentials" })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.method === "credentials"
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-900">Email & Parolă</span>
                    </div>
                    <p className="text-xs text-gray-500">Se conectează cu email</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nume (opțional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="ex: Ion Popescu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>

              {formData.method === "credentials" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parolă *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Minim 6 caractere"
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ name: "", email: "", password: "", method: "google" })
                    setError("")
                  }}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Adaugă admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
