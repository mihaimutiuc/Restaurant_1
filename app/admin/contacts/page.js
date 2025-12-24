"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function ContactsPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
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
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchMessages = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        filter,
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const res = await fetch(`/api/admin/contacts?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setPagination(data.pagination)
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages(1)
  }, [debouncedSearch, filter])

  const handlePageChange = (newPage) => {
    fetchMessages(newPage)
  }

  const handleMarkAsRead = async (id, isRead) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead })
      })
      if (res.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, isRead } : m))
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, isRead })
        }
        setUnreadCount(prev => isRead ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error("Error updating message:", error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Ești sigur că vrei să ștergi acest mesaj?')) return
    
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        const deletedMessage = messages.find(m => m.id === id)
        setMessages(messages.filter(m => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
        if (!deletedMessage?.isRead) {
          setUnreadCount(prev => prev - 1)
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error)
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

  const openMessage = async (message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      handleMarkAsRead(message.id, true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesaje Contact</h1>
            <p className="text-gray-500 mt-1">
              {pagination.totalCount} mesaje • {unreadCount} necitite
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Toate mesajele</option>
              <option value="unread">Necitite</option>
              <option value="read">Citite</option>
            </select>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Caută mesaj..."
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
              <p className="text-xs text-gray-500">Total Mesaje</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              <p className="text-xs text-gray-500">Necitite</p>
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
              <p className="text-2xl font-bold text-gray-900">{pagination.totalCount - unreadCount}</p>
              <p className="text-xs text-gray-500">Citite</p>
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
                {messages.filter(m => {
                  const date = new Date(m.createdAt)
                  const now = new Date()
                  const diffDays = (now - date) / (1000 * 60 * 60 * 24)
                  return diffDays <= 7
                }).length}
              </p>
              <p className="text-xs text-gray-500">Ultimele 7 zile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500">Se încarcă mesajele...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Niciun mesaj găsit</h3>
            <p className="text-gray-500">Mesajele de contact vor apărea aici</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!message.isRead ? 'bg-orange-50/50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${!message.isRead ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {message.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.name}
                          </h3>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!message.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {message.message}
                      </p>
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

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <p className="text-gray-500 text-sm mt-1">De la {selectedMessage.name}</p>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <a href={`mailto:${selectedMessage.email}`} className="ml-2 text-orange-500 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <span className="text-gray-500">Telefon:</span>
                      <a href={`tel:${selectedMessage.phone}`} className="ml-2 text-orange-500 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Data:</span>
                    <span className="ml-2 text-gray-700">{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.isRead)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMessage.isRead 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {selectedMessage.isRead ? 'Marchează ca necitit' : 'Marchează ca citit'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  Răspunde
                </a>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
