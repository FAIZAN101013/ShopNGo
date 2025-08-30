import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import FormField, { fieldClass } from '../components/FormField'

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
      // Shown inline rather than only as a toast: an error about the form
      // belongs on the form, where it stays until it is fixed.
      setError(err.message)
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      heading="Pick up right where you left off."
      points={[
        'Your cart and orders, waiting for you',
        'Checkout without retyping your details',
        'Track every order in one place'
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="prata-regular text-2xl text-gray-900">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          New here?{' '}
          <Link
            to="/register"
            state={{ from: redirectTo }}
            className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
          >
            Create an account
          </Link>
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
          <FormField id="email" label="Email">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            hint={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          >
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={onChange}
              className={fieldClass}
              placeholder="Your password"
            />
          </FormField>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
          Accounts are stored in this browser only, for the demo.
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
