import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

import { AuthContext } from '../context/AuthContext'
import { acceptAdminInvite } from '../services/api'
import OtpInput from './OtpInput'
import Alert from './Alert'

/*
  The back office door.

  Signing in uses the same accounts and the same endpoint as the shop - a
  second set of credentials would only mean a second set of passwords to
  leak, and the role on the account already decides what you can do.

  What differs is the framing. No "Welcome back", no offer to create an
  account: if you are looking at this and cannot get in, the answer is to ask
  the owner, not to sign up. The one way in from cold is an invitation.
*/

const field =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'

const label = 'mb-1.5 block text-sm font-medium text-gray-700'

const AdminLogin = () => {
  const { login, loading } = useContext(AuthContext)

  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [code, setCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const switchTo = (next) => {
    setMode(next)
    setError('')
    setCode('')
  }

  const onSignIn = async (e) => {
    e.preventDefault()
    try {
      await login(form)
      // No redirect needed. RequireAdmin re-renders the moment the user
      // lands in context, showing the back office or "staff only".
    } catch (err) {
      setError(err.message)
    }
  }

  const onAccept = async (e) => {
    e.preventDefault()

    if (code.length < 6) return setError('Enter the six digit code from your invitation')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')

    setBusy(true)
    try {
      const { user } = await acceptAdminInvite({
        email: form.email,
        code,
        password: form.password,
        name: form.name
      })
      toast.success(`Welcome, ${user.name}`)
      // The token is stored by the API layer; a reload is the simplest way
      // to let the whole app pick up the new session.
      window.location.reload()
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand px-4 py-12">
      {/* Two soft glows, purely decoration, kept out of the reading order. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/[0.04] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/5">
            <svg className="h-5 w-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-[11px] font-medium tracking-[0.35em] text-white/40">SHOPNGO</p>
          <h1 className="prata-regular mt-2 text-3xl text-white">Back office</h1>
          <p className="mt-2 text-sm text-white/45">
            {mode === 'signin' ? 'Staff sign in' : 'Set up your admin account'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-2xl shadow-black/30 sm:p-8">
          {mode === 'signin' ? (
            <form onSubmit={onSignIn} className="space-y-5" noValidate>
              <div>
                <label htmlFor="admin-email" className={label}>Email</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onChange}
                  className={field}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="rounded text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  className={field}
                  placeholder="Your password"
                />
              </div>

              <Alert>{error}</Alert>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

              <div className="border-t border-gray-100 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => switchTo('invite')}
                  className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                >
                  I have an invite
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={onAccept} className="space-y-5" noValidate>
              <p className="text-sm text-gray-500">
                Enter the address the invitation was sent to, the code from that email, and
                choose a password.
              </p>

              <div>
                <label htmlFor="invite-email" className={label}>Email</label>
                <input
                  id="invite-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onChange}
                  className={field}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <span className={label}>Invitation code</span>
                <OtpInput
                  value={code}
                  onChange={(v) => { setCode(v); setError('') }}
                  disabled={busy}
                  autoFocus={false}
                />
              </div>

              <div>
                <label htmlFor="invite-name" className={label}>
                  Your name <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="invite-name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={onChange}
                  className={field}
                  placeholder="How your name appears in the shop"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="invite-password" className="text-sm font-medium text-gray-700">
                    Choose a password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="rounded text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="invite-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={onChange}
                  className={field}
                  placeholder="At least 8 characters"
                />
              </div>

              <Alert>{error}</Alert>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Setting up…' : 'Accept invitation'}
              </button>

              <div className="border-t border-gray-100 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => switchTo('signin')}
                  className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/35">
          <Link to="/" className="transition-colors hover:text-white/70">Back to the shop</Link>
          <span aria-hidden="true">&bull;</span>
          <Link to="/forgot-password" className="transition-colors hover:text-white/70">
            Forgot your password?
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-white/25">
          Access is granted by the shop owner.
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
