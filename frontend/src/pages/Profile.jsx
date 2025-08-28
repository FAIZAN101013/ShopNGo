import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { AuthContext } from '../context/AuthContext'

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout, updateProfile, loading } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    document.title = 'My Profile | ShopNGo'
  }, [])

  // Keep the field in step with the signed-in user, including after a save
  // or a switch of account.
  useEffect(() => {
    setName(user?.name || '')
  }, [user])

  useEffect(() => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      setOrderCount(Array.isArray(orders) ? orders.length : 0)
    } catch { /* unreadable history just shows zero */ }
  }, [])

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

  if (!isLoggedIn) {
    return (
      <div className="pt-10 pb-16">
        <div className="mb-8">
          <Title text1={'MY'} text2={'PROFILE'} />
        </div>
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">You need to sign in to view your profile.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              state={{ from: '/profile' }}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              state={{ from: '/profile' }}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900'

  return (
    <div className="pt-10 pb-16">
      <div className="mb-8">
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      {/* Identity header, so the page opens by telling you who you are
          signed in as rather than starting with a form field. */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-lg font-medium text-white">
          {initialsOf(user.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-medium text-gray-900">{user.name}</p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-medium text-gray-900">{orderCount}</p>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {orderCount === 1 ? 'Order' : 'Orders'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Account details</h2>
          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-sm text-gray-700">
                Display name
              </label>
              <input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="profileEmail" className="mb-1.5 block text-sm text-gray-700">
                Email
              </label>
              <input
                id="profileEmail"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Your email identifies the account and cannot be changed.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || name.trim() === user.name}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Your orders</h2>
            <p className="text-sm text-gray-600">
              {orderCount === 0
                ? 'You have not placed any orders yet.'
                : `You have placed ${orderCount} ${orderCount === 1 ? 'order' : 'orders'}.`}
            </p>
            <Link
              to={orderCount === 0 ? '/collection' : '/orders'}
              className="mt-4 inline-block rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
              {orderCount === 0 ? 'Start shopping' : 'View my orders'}
            </Link>
          </div>

          {/* Signing out belonged on the profile page all along; it was only
              reachable from the header dropdown. */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium text-gray-900">Session</h2>
            <p className="text-sm text-gray-600">
              Signed in as {user.email} on this browser.
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
