"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "ALL") params.set("status", filter)
      if (search) params.set("search", search)
      
      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filter, search])

  const handleUpdateOrder = async (orderId, updates) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      
      if (res.ok) {
        const updatedOrder = await res.json()
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder)
        }
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const statusOptions = [
    { value: "ALL", label: "Toate" },
    { value: "PENDING", label: "În așteptare" },
    { value: "CONFIRMED", label: "Confirmate" },
    { value: "COMPLETED", label: "Finalizate" },
    { value: "CANCELLED", label: "Anulate" }
  ]

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border-red-200"
  }

  const stageColors = {
    RECEIVED: "bg-gray-100 text-gray-700",
    PREPARING: "bg-yellow-100 text-yellow-700",
    READY: "bg-blue-100 text-blue-700",
    OUT_DELIVERY: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700"
  }

  const stageLabels = {
    RECEIVED: "Primită",
    PREPARING: "Se prepară",
    READY: "Gata",
    OUT_DELIVERY: "În livrare",
    DELIVERED: "Livrată"
  }

  const statusLabels = {
    PENDING: "În așteptare",
    CONFIRMED: "Confirmată",
    COMPLETED: "Finalizată",
    CANCELLED: "Anulată"
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Gestionare Comenzi</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Caută după ID, telefon, adresă, nume..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === option.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comandă</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Produse</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responsabil</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-mono font-medium text-gray-900">#{order.id.slice(-6)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('ro-RO', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.user?.image ? (
                          <Image 
                            src={order.user.image} 
                            alt={order.user.name || ""} 
                            width={36} 
                            height={36} 
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium text-sm">
                              {order.user?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.user?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{order.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                            {item.image ? (
                              <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={32} 
                                height={32} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-orange-100"></div>
                            )}
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{order.items.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{order.items?.length} produse</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{order.total} RON</p>
                      {order.deliveryFee > 0 && (
                        <p className="text-xs text-gray-500">+ {order.deliveryFee} RON livrare</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrder(order.id, { status: e.target.value })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusColors[order.status]} cursor-pointer w-full`}
                        >
                          <option value="PENDING">În așteptare</option>
                          <option value="CONFIRMED">Confirmată</option>
                          <option value="COMPLETED">Finalizată</option>
                          <option value="CANCELLED">Anulată</option>
                        </select>
                        {order.isOnHold && (
                          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            +{order.holdMinutes || 0} min
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Cine se ocupă?"
                        value={order.assignedTo || ""}
                        onChange={(e) => handleUpdateOrder(order.id, { assignedTo: e.target.value })}
                        className="w-32 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowModal(true)
                        }}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1"
                      >
                        Detalii
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">Nu există comenzi care să corespundă filtrelor</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Comandă #{selectedOrder.id.slice(-6)}
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

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                {selectedOrder.user?.image ? (
                  <Image 
                    src={selectedOrder.user.image} 
                    alt={selectedOrder.user.name || ""} 
                    width={48} 
                    height={48} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-medium">
                      {selectedOrder.user?.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{selectedOrder.user?.name || "N/A"}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Adresă de livrare</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedOrder.deliveryAddress || "N/A"}</p>
              </div>

              {/* Customer Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notă de la client</h3>
                  <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Products */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Produse comandate</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.image && (
                          <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={64} 
                            height={64} 
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.quantity} x {item.price} RON</p>
                      </div>
                      <p className="font-semibold text-gray-900">{item.quantity * item.price} RON</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-orange-50 p-4 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{selectedOrder.total - (selectedOrder.deliveryFee || 0)} RON</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Livrare</span>
                  <span className="font-medium">{selectedOrder.deliveryFee || 0} RON</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-orange-200">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-orange-600 text-lg">{selectedOrder.total} RON</span>
                </div>
              </div>

              {/* Status & Time Management */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status comandă</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="PENDING">În așteptare</option>
                    <option value="CONFIRMED">Confirmată</option>
                    <option value="COMPLETED">Finalizată</option>
                    <option value="CANCELLED">Anulată</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etapă comandă</label>
                  <select
                    value={selectedOrder.stage || "RECEIVED"}
                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { stage: e.target.value })}
                    className={`w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${stageColors[selectedOrder.stage] || ''}`}
                  >
                    <option value="RECEIVED">Primită</option>
                    <option value="PREPARING">Se prepară</option>
                    <option value="READY">Gata de livrare</option>
                    <option value="OUT_DELIVERY">În curs de livrare</option>
                    <option value="DELIVERED">Livrată</option>
                  </select>
                </div>
              </div>

              {/* Hold / Queue Management */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Gestionare coadă
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOrder.isOnHold || false}
                      onChange={(e) => handleUpdateOrder(selectedOrder.id, { isOnHold: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Comandă în așteptare</span>
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timp estimat (minute)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="ex: 45"
                      value={selectedOrder.estimatedTime || ""}
                      onChange={(e) => handleUpdateOrder(selectedOrder.id, { estimatedTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minute așteptare extra</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="ex: 15"
                      value={selectedOrder.holdMinutes || ""}
                      onChange={(e) => handleUpdateOrder(selectedOrder.id, { holdMinutes: e.target.value, isOnHold: parseInt(e.target.value) > 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Pentru comenzi multiple înaintea acesteia</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poziție în coadă (opțional)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="ex: 5 (comenzi înaintea acesteia)"
                    value={selectedOrder.queuePosition || ""}
                    onChange={(e) => handleUpdateOrder(selectedOrder.id, { queuePosition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsabil comandă</label>
                <input
                  type="text"
                  placeholder="Numele persoanei care se ocupă de comandă"
                  value={selectedOrder.assignedTo || ""}
                  onChange={(e) => handleUpdateOrder(selectedOrder.id, { assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notițe interne</label>
                <textarea
                  placeholder="Adaugă notițe pentru această comandă..."
                  value={selectedOrder.adminNotes || ""}
                  onChange={(e) => handleUpdateOrder(selectedOrder.id, { adminNotes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
