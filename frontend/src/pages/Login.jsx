import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Title from '../components/Title'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoggedIn, loading } = useContext(AuthContext)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Somewhere sent you here to sign in first; go back there afterwards.
  const redirectTo = location.state?.from || '/'

  useEffect(() => {
    document.title = 'Sign In | ShopNGo'
  }, [])

  // Nothing to do on this page if you are already signed in.
  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn, navigate, redirectTo])

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please enter your email and password')
      return
    }
    try {
      const session = await login(form)
      toast.success(`Welcome back, ${session.name}`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      // Shown inline rather than only as a toast: an error about a field
      // belongs next to the field, where it stays until it is fixed.
      setError(err.message)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900'

  return (
    <div className="pt-10 pb-16">
      <div className="mb-8">
        <Title text1={'SIGN'} text2={'IN'} />
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-medium text-gray-900">Welcome back</h2>
          <p className="mt-1 mb-6 text-sm text-gray-500">
            Sign in to track orders and check out faster.
          </p>

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  className={`${inputClass} pr-16`}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-xs font-medium text-gray-500 hover:text-gray-900"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              state={{ from: redirectTo }}
              className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
            >
              Create one
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

export default Login
