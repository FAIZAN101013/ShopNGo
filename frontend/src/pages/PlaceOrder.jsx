import React, { useContext, useMemo, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { products, assets } from '../assets/assets'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const { cartItems, currency, delivery_fee } = useContext(ShopContext)

  const cartItemsWithDetails = useMemo(() => {
    const items = []
    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId)
      if (!product) continue
      for (const size in cartItems[itemId]) {
        const quantity = cartItems[itemId][size]
        if (quantity > 0) {
          items.push({ ...product, size, quantity })
        }
      }
    }
    return items
  }, [cartItems])

  const subtotal = useMemo(() => {
    return cartItemsWithDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cartItemsWithDetails])

  const total = useMemo(() => subtotal + delivery_fee, [subtotal, delivery_fee])

  const [shipping, setShipping] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setShipping((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country']
    for (const key of required) {
      if (!shipping[key]) return false
    }
    return cartItemsWithDetails.length > 0
  }

  const handleStripePay = () => {
    if (!validate()) {
      toast.error('Please complete shipping details and ensure cart is not empty')
      return
    }
    const stripeLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK
    if (stripeLink) {
      window.location.href = stripeLink
    } else {
      toast.info('Stripe payment link not configured. Falling back to COD flow.')
    }
  }

  const handlePlaceOrderCOD = async () => {
    if (!validate()) {
      toast.error('Please complete shipping details and ensure cart is not empty')
      return
    }
    try {
      setSubmitting(true)
      // Simulate order placement
      await new Promise((r) => setTimeout(r, 800))

      const order = {
        id: `ORD${Date.now()}`,
        createdAt: new Date().toISOString(),
        items: cartItemsWithDetails,
        shipping,
        notes,
        paymentMethod: 'COD',
        status: 'CONFIRMED',
        subtotal: Number(subtotal.toFixed(2)),
        delivery_fee: Number(delivery_fee.toFixed(2)),
        total: Number((subtotal + delivery_fee).toFixed(2))
      }
      try {
        localStorage.setItem('last_order', JSON.stringify(order))
        const existing = JSON.parse(localStorage.getItem('orders') || '[]')
        localStorage.setItem('orders', JSON.stringify([order, ...existing]))
      } catch {}

      toast.success('Order placed with Cash on Delivery')
      window.location.href = `/orders?orderId=${order.id}`
    } catch (e) {
      toast.error('Failed to place order, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={"CHECK"} text2={"OUT"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 !gap-8">
        {/* Shipping Details */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl !p-6">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Shipping Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 !gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-700 !mb-1">Full Name</label>
              <input id="fullName" name="fullName" value={shipping.fullName} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 !mb-1">Email</label>
              <input id="email" name="email" type="email" value={shipping.email} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="john@example.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-700 !mb-1">Phone</label>
              <input id="phone" name="phone" value={shipping.phone} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="+91-8805910192" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm text-gray-700 !mb-1">Address</label>
              <input id="address" name="address" value={shipping.address} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="123 Shopping Street" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm text-gray-700 !mb-1">City</label>
              <input id="city" name="city" value={shipping.city} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="Mumbai" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm text-gray-700 !mb-1">State</label>
              <input id="state" name="state" value={shipping.state} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="MH" />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm text-gray-700 !mb-1">Postal Code</label>
              <input id="postalCode" name="postalCode" value={shipping.postalCode} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="400001" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm text-gray-700 !mb-1">Country</label>
              <input id="country" name="country" value={shipping.country} onChange={handleChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="India" />
            </div>
          </div>

          <div className="!mt-4">
            <label htmlFor="notes" className="block text-sm text-gray-700 !mb-1">Order Notes (optional)</label>
            <textarea id="notes" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="Any specific delivery instructions?" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 !p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 !mb-4">Order Summary</h2>

            <div className="!space-y-3 !mb-4 max-h-64 overflow-auto pr-1">
              {cartItemsWithDetails.length === 0 ? (
                <p className="text-sm text-gray-500">Your cart is empty.</p>
              ) : (
                cartItemsWithDetails.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex items-center justify-between">
                    <div className="flex items-center !gap-3">
                      <img src={item.image[0]} alt={item.name} className="!w-12 !h-12 rounded object-cover" />
                      <div>
                        <p className="text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{currency}{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="!space-y-2 !mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{currency}{delivery_fee.toFixed(2)}</span>
              </div>
              <div className="border-t !pt-3">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{currency}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStripePay}
              disabled={cartItemsWithDetails.length === 0 || submitting}
              className={`!w-full flex items-center justify-center !gap-2 !py-3 rounded-lg !text-sm text-white transition-colors ${cartItemsWithDetails.length === 0 || submitting ? 'bg-[#a8a3ff] cursor-not-allowed' : 'bg-[#635BFF] hover:bg-[#5561F5]'}`}
              title="Pay securely with Stripe"
            >
              <img src={assets.stripe_logo} alt="Stripe" className="!w-12 !h-auto" />
              Pay with Stripe
            </button>

            <button
              onClick={handlePlaceOrderCOD}
              disabled={cartItemsWithDetails.length === 0 || submitting}
              className="!w-full !mt-3 bg-black text-white !py-3 rounded-lg hover:bg-gray-800 transition-colors !text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Cash on Delivery'}
            </button>

            <a href="/cart" className="block text-center !mt-3 text-blue-600 hover:text-blue-700 !text-sm">Back to cart</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
