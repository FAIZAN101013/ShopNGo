import React, { useEffect, useMemo, useState } from 'react'
import Title from '../components/Title'

const Orders = () => {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('orderId')

    let found = null
    try {
      const last = JSON.parse(localStorage.getItem('last_order') || 'null')
      const all = JSON.parse(localStorage.getItem('orders') || '[]')
      if (orderId) {
        found = all.find(o => o.id === orderId) || (last && last.id === orderId ? last : null)
      } else {
        found = last || all[0] || null
      }
    } catch {}
    setOrder(found)
  }, [])

  if (!order) {
    return (
      <div className="!pt-10 !pb-16">
        <Title text1={'YOUR'} text2={'ORDERS'} />
        <p className="text-gray-600">No recent orders found.</p>
        <a href="/collection" className="inline-block !mt-4 bg-blue-600 hover:bg-blue-700 text-white !px-4 !py-2 rounded-lg !text-sm">Continue Shopping</a>
      </div>
    )
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={'ORDER'} text2={'CONFIRMED'} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 !p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between !mb-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium text-gray-900">{order.id}</p>
          </div>
          <div className="!mt-3 sm:!mt-0">
            <span className="bg-green-50 text-green-700 !px-3 !py-1 rounded-full text-xs font-medium">{order.status}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>

        {/* Items */}
        <div className="!mt-6 !space-y-3">
          {order.items.map((item) => (
            <div key={`${item._id}-${item.size}`} className="flex items-center justify-between">
              <div className="flex items-center !gap-3">
                <img src={item.image[0]} alt={item.name} className="!w-12 !h-12 rounded object-cover" />
                <div>
                  <p className="text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t !mt-6 !pt-4 !space-y-2">
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

        {/* Shipping */}
        <div className="border-t !mt-6 !pt-4">
          <h3 className="text-gray-900 font-medium !mb-2">Shipping to</h3>
          <div className="text-sm text-gray-700 !space-y-1">
            <p>{order.shipping.fullName}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
            <p>{order.shipping.country}</p>
            <p className="text-gray-500">Email: {order.shipping.email} • Phone: {order.shipping.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row !gap-3 !mt-6">
          <a href="/collection" className="inline-block bg-blue-600 hover:bg-blue-700 text-white !px-4 !py-2 rounded-lg !text-sm">Continue Shopping</a>
          <a href="/orders" onClick={(e)=>e.preventDefault()} className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 !px-4 !py-2 rounded-lg !text-sm cursor-default">Cash on Delivery</a>
        </div>
      </div>
    </div>
  )
}

export default Orders
