import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import FormField, { fieldClass } from '../components/FormField'
import OtpInput from '../components/OtpInput'
import Alert from '../components/Alert'

const RESEND_SECONDS = 60

/*
  Forgotten password, in two steps on one page.

  Two steps rather than two pages, because the address typed in step one is
  needed in step two - and a page change is exactly where people go and
  check their email, then come back to a form that has forgotten them.
*/
const ForgotPassword = () => {
  const navigate = useNavigate()
  const { forgotPassword, resetPassword, loading } = useContext(AuthContext)

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    document.title = 'Reset your password | ShopNGo'
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const sendCode = async () => {
    const message = await forgotPassword({ email })
    setSecondsLeft(RESEND_SECONDS)
    return message
  }

  const onRequest = async (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('That does not look like a valid email address')
      return
    }
    try {
      toast.info(await sendCode())
      setStep('code')
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const onResend = async () => {
    try {
      toast.info(await sendCode())
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  const onReset = async (e) => {
    e.preventDefault()

    if (code.length < 6) {
      setError('Enter the six digit code from your email')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match')
      return
    }

    try {
      await resetPassword({ email, code, password })
      // Deliberately not signed in automatically. Typing the new password
      // once, now, is what makes it stick in your memory.
      toast.success('Password changed. Sign in with your new one.')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
      setCode('')
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      heading="Forgot it? That happens. Let's fix it."
      points={[
        'We email a code instead of a guessable link',
        'The code lasts 10 minutes and works once',
        'Changing it signs out anyone else who was in'
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="prata-regular text-2xl text-gray-900">Reset your password</h1>

        {step === 'email' ? (
          <>
            <p className="mt-2 text-sm text-gray-500">
              Tell us the address on your account and we will send a code to it.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onRequest} noValidate>
              <FormField id="email" label="Email">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </FormField>

              <Alert>{error}</Alert>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send reset code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-500">
              Enter the code we sent to <span className="font-medium text-gray-900">{email}</span> and
              choose a new password.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onReset} noValidate>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">Reset code</span>
                <OtpInput
                  value={code}
                  onChange={(value) => {
                    setCode(value)
                    setError('')
                  }}
                  disabled={loading}
                />
              </div>

              <FormField
                id="password"
                label="New password"
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  className={fieldClass}
                  placeholder="At least 8 characters"
                />
              </FormField>

              <FormField
                id="confirm"
                label="Confirm new password"
                error={confirm && password !== confirm ? 'Passwords do not match' : undefined}
              >
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    setError('')
                  }}
                  className={`${fieldClass} ${confirm && password !== confirm ? 'border-red-400' : ''}`}
                  placeholder="Type it again"
                />
              </FormField>

              <Alert>{error}</Alert>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Change password'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {secondsLeft > 0 ? (
                <span>
                  Need another code? Available in{' '}
                  <span className="font-medium text-gray-900">{secondsLeft}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                >
                  Send a new code
                </button>
              )}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Remembered it?{' '}
          <Link to="/login" className="underline underline-offset-4 hover:text-gray-600">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
