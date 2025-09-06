import React, { useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import FormField, { fieldClass } from '../components/FormField'
import Alert from '../components/Alert'

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
      const { email, message } = await register(form)
      // Registering no longer signs you in. The account is not usable until
      // the code in the email comes back, so the next screen is the one that
      // asks for it - and it needs to be told which address to expect.
      toast.info(message)
      navigate('/verify-email', { state: { email, from: redirectTo } })
    } catch (err) {
      setError(err.message)
    }
  }

  const strength = STRENGTH[scorePassword(form.password)]
  // Only complain about a mismatch once there is something to compare.
  const mismatch = form.confirm.length > 0 && form.password !== form.confirm

  return (
    <AuthLayout
      eyebrow="Create your account"
      heading="A faster way to shop, from the second visit on."
      points={[
        'Save your details for one-tap checkout',
        'Follow every order from placed to delivered',
        'Early access to sales and new arrivals'
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="prata-regular text-2xl text-gray-900">Create account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Already registered?{' '}
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
          >
            Sign in
          </Link>
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
          <FormField id="name" label="Full name">
            <input
              id="name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={onChange}
              className={fieldClass}
              placeholder="Faizan Patel"
            />
          </FormField>

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
              autoComplete="new-password"
              value={form.password}
              onChange={onChange}
              className={fieldClass}
              placeholder="At least 8 characters"
            />
            {form.password && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full ${strength.bar} ${strength.width} transition-all duration-300`} />
                </div>
                <span className="w-16 text-right text-xs text-gray-500">{strength.label}</span>
              </div>
            )}
          </FormField>

          <FormField
            id="confirm"
            label="Confirm password"
            error={mismatch ? 'Passwords do not match' : undefined}
          >
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirm}
              onChange={onChange}
              className={`${fieldClass} ${mismatch ? 'border-red-400' : ''}`}
              placeholder="Type it again"
            />
          </FormField>

          <Alert>{error}</Alert>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400 lg:hidden">
          We email a 6 digit code to confirm the address is yours.
        </p>
      </div>
    </AuthLayout>
  )
}

export default Register
