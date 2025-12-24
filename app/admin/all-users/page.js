"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"

export default function AllUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchUsers = async (page = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch })
      })

      const res = await fetch(`/api/admin/all-users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [debouncedSearch])

  const handlePageChange = (newPage) => {
    fetchUsers(newPage)
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

  const getRoleBadge = (role, isAdmin) => {
    if (role === 'SUPER_ADMIN') {
      return (
        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Super Admin
        </span>
      )
    }
    if (role === 'ADMIN' || isAdmin) {
      return (
        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          Admin
        </span>
      )
    }
    if (role === 'MODERATOR') {
      return (
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          Moderator
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
        Utilizator
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Toți Utilizatorii</h1>
            <p className="text-gray-500 mt-1">
              {pagination.totalCount} utilizatori înregistrați
            </p>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Caută utilizator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-72"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
              <p className="text-xs text-gray-500">Total Utilizatori</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u._count?.orders > 0).length}
              </p>
              <p className="text-xs text-gray-500">Cu Comenzi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isAdmin || ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(u.role)).length}
              </p>
              <p className="text-xs text-gray-500">Admini</p>
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
                {users.filter(u => {
                  const date = new Date(u.createdAt)
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-500">Se încarcă utilizatorii...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchTerm ? 'Niciun rezultat găsit' : 'Nu există utilizatori'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Încearcă să modifici criteriile de căutare' : 'Utilizatorii vor apărea aici când se vor înregistra'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Utilizator
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Comenzi
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Înregistrat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || "Fără nume"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role, user.isAdmin)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${user._count?.orders > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {user._count?.orders || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 text-sm">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={48}
                        height={48}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name || "Fără nume"}
                        </p>
                        {getRoleBadge(user.role, user.isAdmin)}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{user._count?.orders || 0} comenzi</span>
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
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
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
