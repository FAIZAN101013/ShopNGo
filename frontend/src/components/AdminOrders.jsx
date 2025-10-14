import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import { adminFetchOrders, adminSetOrderStatus, imageUrl } from '../services/api'

// The order a parcel actually moves through, plus the way out.
const STATUSES = ['CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_STYLE = {
  AWAITING_PAYMENT: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKING: 'bg-amber-50 text-amber-700',
  SHIPPED: 'bg-purple-50 text-purple-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-600'
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  // Which order is mid-save, so only its dropdown is disabled rather than
  // the whole page.
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    let cancelled = false

    adminFetchOrders()
      .then((list) => { if (!cancelled) setOrders(list) })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  const counts = useMemo(() => {
    const tally = { ALL: orders.length }
    for (const status of STATUSES) tally[status] = orders.filter((o) => o.status === status).length
    return tally
  }, [orders])

  const visible = useMemo(
    () => (filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  )

  /*
    Only orders that were paid for, or will be on delivery. An abandoned card
    payment is not revenue, and counting it would make this number a lie.
  */
  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'CANCELLED' && o.status !== 'AWAITING_PAYMENT')
        .reduce((sum, o) => sum + o.total, 0),
    [orders]
  )

  const changeStatus = async (order, status) => {
    if (status === order.status) return

    setSaving(order.reference)
    try {
      const { order: updated } = await adminSetOrderStatus(order.reference, status)
      // Patch the one row rather than refetching all 200.
      setOrders((prev) => prev.map((o) => (o.reference === order.reference ? { ...o, ...updated } : o)))
      toast.success(`${order.reference} is now ${status.toLowerCase()}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>

  if (orders.length === 0) {
    return <p className="text-sm text-gray-500">No orders yet.</p>
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Orders', value: counts.ALL },
          { label: 'To pack', value: counts.CONFIRMED + counts.PACKING },
          { label: 'Delivered', value: counts.DELIVERED },
          { label: 'Revenue', value: money(revenue) }
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-xl font-medium text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {['ALL', ...STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === status
                ? 'bg-brand text-white'
                : 'border border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()} ({counts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((order) => (
          <div key={order.reference} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{order.reference}</p>
                <p className="text-sm text-gray-500">
                  {order.shipping.fullName} &bull; {order.shipping.email}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()} &bull;{' '}
                  {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Card'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{money(order.total)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
                {/* Whether the money arrived is a different question from
                    where the parcel is, so it gets its own badge. */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    order.paid ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  title={order.paidAt ? `Paid ${new Date(order.paidAt).toLocaleString()}` : undefined}
                >
                  {order.paid
                    ? order.demoPayment ? 'Paid (demo)' : 'Paid'
                    : order.paymentMethod === 'COD'
                      ? 'Cash on delivery'
                      : 'Unpaid'}
                </span>
                {/* An unpaid card order has nothing to pack. Stripe moves it
                    out of AWAITING_PAYMENT; an admin doing it by hand is the
                    exact mistake this flow exists to prevent. */}
                <select
                  value={order.status}
                  disabled={saving === order.reference || order.status === 'AWAITING_PAYMENT'}
                  onChange={(e) => changeStatus(order, e.target.value)}
                  aria-label={`Status for ${order.reference}`}
                  className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none transition-colors hover:border-gray-900 disabled:opacity-50"
                >
                  {order.status === 'AWAITING_PAYMENT' && (
                    <option value="AWAITING_PAYMENT">AWAITING PAYMENT</option>
                  )}
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${index}`} className="flex items-center gap-2">
                  <img src={imageUrl(item.image)} alt="" className="h-10 w-10 rounded bg-gray-100 object-cover" />
                  <div className="text-xs">
                    <p className="max-w-[14rem] truncate text-gray-800">{item.name}</p>
                    <p className="text-gray-500">{item.size} &times;{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              {order.shipping.address}, {order.shipping.city}, {order.shipping.state}{' '}
              {order.shipping.postalCode}, {order.shipping.country} &bull; {order.shipping.phone}
            </p>
            {order.notes && (
              <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                Note: {order.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOrders
