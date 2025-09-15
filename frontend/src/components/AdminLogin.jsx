import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import Alert from './Alert'

/*
  The back office door.

  Signing in here uses the same accounts and the same endpoint as the shop -
  a second set of credentials would mean a second set of passwords to leak,
  and the role on the account already decides what you can do.

  What is different is the framing. It does not say "Welcome back" or offer
  to create an account, because neither applies: if you are looking at this
  and cannot get in, the answer is to ask the owner, not to sign up.
*/
const AdminLogin = () => {
  const { login, loading } = useContext(AuthContext)

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form)
      // No redirect. RequireAdmin re-renders as soon as the user lands in
      // context, and shows either the admin pages or "staff only".
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="text-sm font-medium tracking-[0.3em] text-white/60 transition-colors hover:text-white">
            SHOPNGO
          </Link>
          <h1 className="prata-regular mt-4 text-2xl text-white">Back office</h1>
          <p className="mt-2 text-sm text-white/50">Staff sign in</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-xl sm:p-8" noValidate>
          <div className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
              />
            </div>

            <Alert>{error}</Alert>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Access is granted by the shop owner.{' '}
          <Link to="/forgot-password" className="underline underline-offset-4 hover:text-white/70">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
