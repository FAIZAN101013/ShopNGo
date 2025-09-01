import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Title from '../components/Title'
import { imageUrl } from '../services/api'

const readOrders = () => {
  try {
    const all = JSON.parse(localStorage.getItem('orders') || '[]')
    if (Array.isArray(all) && all.length > 0) return all
    // Orders placed before the history existed only ever wrote last_order.
    const last = JSON.parse(localStorage.getItem('last_order') || 'null')
    return last ? [last] : []
  } catch {
    return []
  }
}

const OrderSummary = ({ order }) => (
  <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Subtotal</span>
      <span className="font-medium">${order.subtotal.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">Shipping</span>
      <span className="font-medium">${order.delivery_fee.toFixed(2)}</span>
    </div>
    <div className="flex justify-between font-medium">
      <span>Total</span>
      <span>${order.total.toFixed(2)}</span>
    </div>
  </div>
)

const OrderItems = ({ items }) => (
  <div className="mt-6 space-y-3">
    {items.map((item) => (
      <div key={`${item._id}-${item.size}`} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={imageUrl(item.image[0])} alt={item.name} className="w-12 h-12 rounded object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-gray-800 truncate">{item.name}</p>
            <p className="text-xs text-gray-500">Size: {item.size} &bull; Qty: {item.quantity}</p>
          </div>
        </div>
        <div className="text-sm font-medium shrink-0">${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    ))}
  </div>
)

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    document.title = 'My Orders | ShopNGo'
    setOrders(readOrders())
  }, [])

  const selected = useMemo(
    () => (orderId ? orders.find((o) => o.id === orderId) || null : null),
    [orders, orderId]
  )

  if (orders.length === 0) {
    return (
      <div className="pt-10 pb-16">
        <Title text1={'YOUR'} text2={'ORDERS'} />
        <p className="text-gray-600 mt-4">You haven&rsquo;t placed any orders yet.</p>
        <Link
          to="/collection"
          className="inline-block mt-6 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Start shopping
        </Link>
      </div>
    )
  }

  // Arriving straight from checkout: show that one order as a confirmation.
  if (selected) {
    return (
      <div className="pt-10 pb-16">
        <div className="mb-6">
          <Title text1={'ORDER'} text2={'CONFIRMED'} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">{selected.id}</p>
            </div>
            <span className="self-start bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              {selected.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Placed on {new Date(selected.createdAt).toLocaleString()}
          </p>

          <OrderItems items={selected.items} />
          <OrderSummary order={selected} />

          <div className="border-t border-gray-200 mt-6 pt-4">
            <h3 className="text-gray-900 font-medium mb-2">Shipping to</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>{selected.shipping.fullName}</p>
              <p>{selected.shipping.address}</p>
              <p>
                {selected.shipping.city}, {selected.shipping.state} {selected.shipping.postalCode}
              </p>
              <p>{selected.shipping.country}</p>
              <p className="text-gray-500">
                Email: {selected.shipping.email} &bull; Phone: {selected.shipping.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/collection"
              className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Continue shopping
            </Link>
            <Link
              to="/orders"
              className="border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 px-5 py-2.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              View all orders
            </Link>
            {/* This was an <a> pointing at /orders with preventDefault on it -
                a link built to go nowhere. It is a label, so it is a span. */}
            <span className="self-center text-sm text-gray-500">
              Paid by {selected.paymentMethod === 'COD' ? 'Cash on Delivery' : selected.paymentMethod}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Every order ever placed. PlaceOrder has been saving these all along; the
  // page just never read them and showed only the most recent one.
  return (
    <div className="pt-10 pb-16">
      <Title text1={'YOUR'} text2={'ORDERS'} />
      <p className="text-gray-500 text-sm mt-4 mb-8">
        {orders.length} {orders.length === 1 ? 'order' : 'orders'}
      </p>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  {' '}&bull;{' '}
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  {order.status}
                </span>
                <span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <OrderItems items={order.items} />

            <div className="mt-6">
              <Link
                to={`/orders?orderId=${order.id}`}
                className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 rounded"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders
