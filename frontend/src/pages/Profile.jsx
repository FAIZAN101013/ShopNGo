import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import FormField, { fieldClass } from '../components/FormField'
import { fetchOrders } from '../services/api'

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile, loading } = useContext(AuthContext)

  const [name, setName] = useState('')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    document.title = 'My Profile | ShopNGo'
  }, [])

  // Keep the field in step with the signed-in user, including after a save.
  useEffect(() => {
    setName(user?.name || '')
  }, [user])

  // The order history is the account's, not the browser's, so it is asked
  // for rather than read out of storage. A failure here is quiet: it costs
  // three numbers on a card, and is not worth blocking the whole page over.
  useEffect(() => {
    let cancelled = false
    fetchOrders()
      .then((list) => { if (!cancelled) setOrders(list) })
      .catch(() => { if (!cancelled) setOrders([]) })
    return () => { cancelled = true }
  }, [])

  const stats = useMemo(() => {
    const spent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
    const items = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0)
    return { count: orders.length, spent, items }
  }, [orders])

  // The account itself knows when it was created. Guessing from the oldest
  // order was wrong for anyone who had signed up and not bought anything.
  const memberSince = useMemo(() => {
    if (!user?.createdAt) return null
    return new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  }, [user])

  const onSave = async (e) => {
    e.preventDefault()
    try {
      await updateProfile({ name })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const onLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="py-10 sm:py-14">
      {/* Identity banner. The page opens by telling you who you are signed in
          as, rather than starting cold at a form field. */}
      <div className="relative overflow-hidden rounded-2xl bg-brand p-8 text-white sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/5 blur-2xl"
        />
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-xl font-medium text-gray-900">
            {initialsOf(user.name)}
          </div>
          <div className="min-w-0">
            <h1 className="prata-regular truncate text-2xl sm:text-3xl">{user.name}</h1>
            <p className="mt-1 truncate text-sm text-white/60">{user.email}</p>
            {memberSince && (
              <p className="mt-1 text-xs text-white/40">Shopping with us since {memberSince}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: stats.count === 1 ? 'Order placed' : 'Orders placed', value: stats.count },
          { label: 'Items bought', value: stats.items },
          { label: 'Total spent', value: `$${stats.spent.toFixed(2)}` }
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm last:col-span-2 sm:last:col-span-1"
          >
            <p className="text-2xl font-medium text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Account details */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
          <h2 className="text-lg font-medium text-gray-900">Account details</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            This is the name we use on your orders.
          </p>

          <form className="space-y-5" onSubmit={onSave}>
            <FormField id="displayName" label="Display name">
              <input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                placeholder="Your name"
              />
            </FormField>

            <FormField id="profileEmail" label="Email">
              <input
                id="profileEmail"
                value={user.email}
                disabled
                className={`${fieldClass} cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-200`}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Your email identifies the account and cannot be changed.
              </p>
            </FormField>

            {/* Disabled until something actually changed, so the button is
                never offering to save nothing. */}
            <button
              type="submit"
              disabled={loading || name.trim() === user.name || !name.trim()}
              className="rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Recent orders */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-medium text-gray-900">Recent orders</h2>
              {orders.length > 0 && (
                <Link
                  to="/orders"
                  className="rounded text-xs font-medium text-gray-500 underline underline-offset-4 hover:text-gray-900"
                >
                  View all
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <>
                <p className="mt-4 text-sm text-gray-500">
                  You have not placed any orders yet.
                </p>
                <Link
                  to="/collection"
                  className="mt-5 inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
                >
                  Start shopping
                </Link>
              </>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {orders.slice(0, 3).map((order) => (
                  <li key={order.reference} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{order.reference}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-gray-900">
                      ${Number(order.total).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Session. Signing out belonged here all along; it was only
              reachable from a dropdown that opens on hover. */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-medium text-gray-900">Session</h2>
            <p className="mt-1 text-sm text-gray-500">
              Signing out forgets the token on this device. Your account and
              orders stay where they are.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-5 w-full rounded-lg border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Sign out
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
