import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { AuthContext } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import OtpInput from '../components/OtpInput'
import Alert from '../components/Alert'

const RESEND_SECONDS = 60

/*
  The screen between "create account" and being signed in.

  The account already exists at this point; what is missing is proof that
  the email address belongs to the person who typed it.
*/
const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendCode, loading } = useContext(AuthContext)

  // Passed along by Register and by a login that hit an unverified account.
  const email = location.state?.email || ''
  const redirectTo = location.state?.from || '/'

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)

  // Guards against submitting the same code twice - the boxes fill up, the
  // effect fires, and a slow network would let a second press through.
  const submitting = useRef(false)

  useEffect(() => {
    document.title = 'Confirm your email | ShopNGo'
  }, [])

  // Counts down to when "Send a new code" becomes available. The server has
  // the same cooldown; this is so the button does not lie about it.
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const submit = async (value) => {
    if (submitting.current) return
    submitting.current = true
    try {
      const session = await verifyEmail({ email, code: value })
      toast.success(`Welcome to ShopNGo, ${session.name}`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      submitting.current = false
    }
  }

  // Six digits is the whole form. Making someone reach for a button after
  // typing the last one is a step that does not need to exist.
  const onChange = (value) => {
    setCode(value)
    setError('')
    if (value.length === 6) submit(value)
  }

  const onResend = async () => {
    setResending(true)
    setError('')
    try {
      const message = await resendCode({ email, purpose: 'verify' })
      toast.info(message)
      setSecondsLeft(RESEND_SECONDS)
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  // Landing here directly, with no email to verify, is a dead end. Send
  // them to the form that produces one.
  if (!email) return <Navigate to="/register" replace />

  return (
    <AuthLayout
      eyebrow="One last step"
      heading="Check your inbox for a six digit code."
      points={[
        'Confirms the address is really yours',
        'Keeps your order updates going somewhere you read',
        'The code expires in 10 minutes'
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="prata-regular text-2xl text-gray-900">Confirm your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          We sent a code to <span className="font-medium text-gray-900">{email}</span>
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit(code)
          }}
        >
          <OtpInput value={code} onChange={onChange} disabled={loading} />

          <Alert>{error}</Alert>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Checking…' : 'Verify email'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {secondsLeft > 0 ? (
            <span>
              Did not get it? You can ask for another in{' '}
              <span className="font-medium text-gray-900">{secondsLeft}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600 disabled:opacity-60"
            >
              {resending ? 'Sending…' : 'Send a new code'}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Wrong address?{' '}
          <Link to="/register" className="underline underline-offset-4 hover:text-gray-600">
            Start again
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
