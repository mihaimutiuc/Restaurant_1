"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function SubscribersPage() {
  const { data: session } = useSession()
  const [subscribers, setSubscribers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  })
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [activeCount, setActiveCount] = useState(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchSubscribers = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        filter,
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const res = await fetch(`/api/admin/subscribers?${params}`)
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
        setPagination(data.pagination)
        setActiveCount(data.activeCount || 0)
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers(1)
  }, [debouncedSearch, filter])

  const handlePageChange = (newPage) => {
    fetchSubscribers(newPage)
  }

  const handleToggleActive = async (id, isActive) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      if (res.ok) {
        setSubscribers(subscribers.map(s => s.id === id ? { ...s, isActive, unsubscribedAt: isActive ? null : new Date().toISOString() } : s))
        setActiveCount(prev => isActive ? prev + 1 : prev - 1)
      }
    } catch (error) {
      console.error("Error updating subscriber:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest abonat?')) return
    
    try {
      const res = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        const deleted = subscribers.find(s => s.id === id)
        setSubscribers(subscribers.filter(s => s.id !== id))
        if (deleted?.isActive) {
          setActiveCount(prev => prev - 1)
        }
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Status', 'Sursa', 'Data Abonare', 'Data Dezabonare']
    const rows = subscribers.map(s => [
      s.email,
      s.isActive ? 'Activ' : 'Dezabonat',
      s.source,
      formatDate(s.createdAt),
      s.unsubscribedAt ? formatDate(s.unsubscribedAt) : '-'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `abonati_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Abonați Newsletter</h1>
            <p className="text-gray-500 mt-1">
              {pagination.totalCount} abonați • {activeCount} activi
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Toți abonații</option>
              <option value="active">Activi</option>
              <option value="inactive">Dezabonați</option>
            </select>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Caută email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
              <p className="text-xs text-gray-500">Total Abonați</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-xs text-gray-500">Activi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount - activeCount}</p>
              <p className="text-xs text-gray-500">Dezabonați</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscribers.filter(s => {
                  const date = new Date(s.createdAt)
                  const now = new Date()
                  const diffDays = (now - date) / (1000 * 60 * 60 * 24)
                  return diffDays <= 7
                }).length}
              </p>
              <p className="text-xs text-gray-500">Noi (7 zile)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500">Se încarcă abonații...</p>
            </div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Niciun abonat găsit</h3>
            <p className="text-gray-500">Abonații la newsletter vor apărea aici</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sursa
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data Abonare
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {subscriber.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-900">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          subscriber.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${subscriber.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {subscriber.isActive ? 'Activ' : 'Dezabonat'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 capitalize">{subscriber.source}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 text-sm">{formatDate(subscriber.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(subscriber.id, !subscriber.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              subscriber.isActive
                                ? 'hover:bg-red-100 text-red-600'
                                : 'hover:bg-green-100 text-green-600'
                            }`}
                            title={subscriber.isActive ? 'Dezabonează' : 'Reabonează'}
                          >
                            {subscriber.isActive ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(subscriber.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Șterge"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {subscriber.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{subscriber.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            subscriber.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {subscriber.isActive ? 'Activ' : 'Dezabonat'}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(subscriber.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleActive(subscriber.id, !subscriber.isActive)}
                        className={`p-2 rounded-lg ${subscriber.isActive ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {subscriber.isActive ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="p-2 text-red-600 rounded-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Pagina {pagination.currentPage} din {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Următor
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
