import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { AuthContext } from '../context/AuthContext'

// Rough strength read purely so the meter has something to show. It is a
// hint for the person choosing a password, not a security control.
const scorePassword = (password) => {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const STRENGTH = [
  { label: 'Too short', bar: 'bg-red-500', width: 'w-1/5' },
  { label: 'Weak', bar: 'bg-red-500', width: 'w-2/5' },
  { label: 'Fair', bar: 'bg-amber-500', width: 'w-3/5' },
  { label: 'Good', bar: 'bg-lime-500', width: 'w-4/5' },
  { label: 'Strong', bar: 'bg-green-600', width: 'w-full' }
]

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, isLoggedIn, loading } = useContext(AuthContext)

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from || '/'

  useEffect(() => {
    document.title = 'Create Account | ShopNGo'
  }, [])

  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn, navigate, redirectTo])

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in every field')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('That does not look like a valid email address')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match')
      return
    }

    try {
      const session = await register(form)
      // Registering signs you in, so there is no second form to fill in.
      toast.success(`Welcome to ShopNGo, ${session.name}`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  const strength = STRENGTH[scorePassword(form.password)]
  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900'

  return (
    <div className="pt-10 pb-16">
      <div className="mb-8">
        <Title text1={'CREATE'} text2={'ACCOUNT'} />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-medium text-gray-900">Join ShopNGo</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Faster checkout, order tracking and early access to sales.
          </p>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm text-gray-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={onChange}
                className={inputClass}
                placeholder="Faizan Patel"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={onChange}
                  className={`${inputClass} pr-16`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {form.password && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div className={`h-full ${strength.bar} ${strength.width} transition-all`} />
                  </div>
                  <span className="text-xs text-gray-500">{strength.label}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm text-gray-700">
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm}
                onChange={onChange}
                className={inputClass}
                placeholder="Type it again"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: redirectTo }}
              className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Accounts are stored in this browser only, for the demo.
        </p>
      </div>
    </div>
  )
}

export default Register
