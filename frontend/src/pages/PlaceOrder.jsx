import React, { useContext, useEffect, useMemo, useState } from 'react'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'
import { AuthContext } from '../context/AuthContext'
import { createOrder, confirmDemoPayment, imageUrl } from '../services/api'
import { payForOrder } from '../services/payments'
import DemoPaymentSheet from '../components/DemoPaymentSheet'
import { toast } from 'react-toastify'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const PlaceOrder = () => {
  const { products, cartItems, currency, delivery_fee, clearCart } = useContext(ShopContext)
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Stripe sends people back here when they close the payment page. Their
  // basket is still intact, so say what happened rather than leaving them to
  // wonder whether they were charged.
  useEffect(() => {
    if (searchParams.get('cancelled')) {
      toast.info('Payment cancelled. Your basket is still here.')
    }
  }, [searchParams])

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
    // products belongs here. Without it the summary stayed empty when the
    // catalogue arrived after the cart did, which is the usual order.
  }, [cartItems, products])

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

  // Set when the server says there is no payment provider, so the online
  // flow runs as a demonstration instead.
  const [demo, setDemo] = useState(null)

  // You are signed in to be here, so we already know two of these. Typing
  // your own name and address into a form that has them is busywork.
  useEffect(() => {
    if (!user) return
    setShipping((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || '',
      email: prev.email || user.email || ''
    }))
  }, [user])

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

  /*
    Paying online.

    This used to be a payment link read from an env var: it sent the customer
    to a page that knew nothing about their basket, and told this shop nothing
    when they paid. Now the server opens a real payment against the priced
    order, and the provider reports back to the server directly.

    The cart is deliberately NOT cleared here. Nothing has been bought until
    the payment clears, and emptying the basket of somebody who then closes
    the payment window is a good way to lose the sale.
  */
  const handlePayOnline = () => submitOrder('CARD')

  const handlePlaceOrderCOD = () => submitOrder('COD')

  const submitOrder = async (paymentMethod) => {
    if (!validate()) {
      toast.error('Please complete shipping details and ensure cart is not empty')
      return
    }
    try {
      setSubmitting(true)

      // Only what was bought, never what it costs. The server looks every
      // price up again and works out the total itself, because anything the
      // browser sends about money is a suggestion from a stranger.
      const { order, payment } = await createOrder({
        items: cartItemsWithDetails.map((item) => ({
          productId: item._id,
          size: item.size,
          quantity: item.quantity
        })),
        shipping,
        notes,
        paymentMethod
      })

      if (payment?.demo) {
        // Hand over to the demo sheet. The order is already saved and
        // waiting; nothing is confirmed until the server says so.
        setDemo({ ...payment, reference: order.reference })
        return
      }

      if (payment) {
        // The payment window. It resolves when they finish and rejects if
        // they close it, in which case the basket is still theirs.
        await payForOrder({
          payment,
          order,
          customer: { name: shipping.fullName, email: shipping.email, phone: shipping.phone }
        })

        clearCart()
        // Deliberately not "paid" - the provider tells the server that, in a
        // signed message. This page only knows the window closed happily.
        toast.success('Payment sent. We will confirm it in a moment.')
        navigate(`/orders?ref=${order.reference}&paid=1`)
        return
      }

      clearCart()
      toast.success('Order placed. Check your email for the confirmation.')
      navigate(`/orders?ref=${order.reference}`)
    } catch (error) {
      // The real reason, not a generic one - "one of the items in your cart
      // is no longer available" is something you can act on.
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const onDemoPaid = async () => {
    try {
      await confirmDemoPayment(demo.reference)
      clearCart()
      toast.success('Payment successful. Check your email for the confirmation.')
      navigate(`/orders?ref=${demo.reference}`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDemo(null)
    }
  }

  return (
    <div className="pt-10 pb-16">
      {demo && (
        <DemoPaymentSheet
          amountUsd={demo.amountUsd}
          rate={demo.rate}
          reference={demo.reference}
          onPaid={onDemoPaid}
          onFailed={() => setDemo(null)}
          onClose={() => {
            setDemo(null)
            toast.info('Payment cancelled. Your basket is still here.')
          }}
        />
      )}

      <div className="mb-6">
        <Title text1={"CHECK"} text2={"OUT"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Details */}
        <div className="lg:col-span-2 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Shipping Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-700 mb-1">Full Name</label>
              <input id="fullName" name="fullName" value={shipping.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">Email</label>
              <input id="email" name="email" type="email" value={shipping.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="john@example.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">Phone</label>
              <input id="phone" name="phone" value={shipping.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="+91-8805910192" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm text-gray-700 mb-1">Address</label>
              <input id="address" name="address" value={shipping.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="123 Shopping Street" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm text-gray-700 mb-1">City</label>
              <input id="city" name="city" value={shipping.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="Mumbai" />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm text-gray-700 mb-1">State</label>
              <input id="state" name="state" value={shipping.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="MH" />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm text-gray-700 mb-1">Postal Code</label>
              <input id="postalCode" name="postalCode" value={shipping.postalCode} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="400001" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm text-gray-700 mb-1">Country</label>
              <input id="country" name="country" value={shipping.country} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="India" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm text-gray-700 mb-1">Order Notes (optional)</label>
            <textarea id="notes" rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="Any specific delivery instructions?" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-auto pr-1">
              {cartItemsWithDetails.length === 0 ? (
                <p className="text-sm text-gray-500">Your cart is empty.</p>
              ) : (
                cartItemsWithDetails.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={imageUrl(item.image[0])} alt={item.name} className="w-12 h-12 rounded object-cover" />
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

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{currency}{delivery_fee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{currency}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Cash on delivery is first because it is the one that works
                today. Paying online is wired up and waiting on an account
                with a payment provider. */}
            <button
              onClick={handlePlaceOrderCOD}
              disabled={cartItemsWithDetails.length === 0 || submitting}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Cash on Delivery'}
            </button>

            <button
              onClick={handlePayOnline}
              disabled={cartItemsWithDetails.length === 0 || submitting}
              className="mt-3 w-full rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
              title="Card or UPI"
            >
              Pay online (card or UPI)
            </button>

            <Link to="/cart" className="block text-center mt-3 text-sm text-gray-600 underline underline-offset-4 hover:text-gray-900 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2">Back to cart</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder
