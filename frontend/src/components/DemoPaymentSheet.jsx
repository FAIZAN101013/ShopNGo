import React, { useEffect, useState } from 'react'

/*
  The payment window, for a shop with no payment provider.

  It walks the same steps a real one does - choose a method, watch it
  process, get an outcome - so the checkout journey can be shown end to end.
  What it does not do is pretend. The banner says DEMO, the button says
  "simulate", and there is a button for failing on purpose, because a
  checkout that has never been seen to fail has not really been shown.

  Nothing here decides anything. It resolves, and the server decides whether
  that order may be marked paid.
*/

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Card', hint: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major banks' }
]

const DemoPaymentSheet = ({ amountUsd, rate, reference, onPaid, onFailed, onClose }) => {
  const [method, setMethod] = useState('upi')
  const [stage, setStage] = useState('choose')

  const inRupees = Math.round(amountUsd * (rate || 83))

  // Escape closes it, the way every real payment sheet behaves.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && stage === 'choose') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, onClose])

  const run = (outcome) => {
    setStage('processing')
    // A beat of delay, because an instant result does not read as a payment
    // and hides the loading state that a real one would show.
    setTimeout(() => {
      if (outcome === 'paid') {
        setStage('paid')
        setTimeout(onPaid, 700)
      } else {
        setStage('failed')
      }
    }, 1400)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Demo payment"
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        {/* Said first and said plainly. Anyone looking at this should know
            within a second that no money is involved. */}
        <div className="bg-amber-50 px-5 py-2.5 text-center text-xs font-medium text-amber-800">
          DEMO MODE &mdash; no real payment is taken
        </div>

        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">ShopNGo</p>
              <p className="text-xs text-gray-500">Order {reference}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-900">₹{inRupees.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">${amountUsd.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {stage === 'choose' && (
          <div className="p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              Pay using
            </p>
            <div className="space-y-2">
              {METHODS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    method === option.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="demoMethod"
                    checked={method === option.id}
                    onChange={() => setMethod(option.id)}
                    className="h-4 w-4 accent-black"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                    <span className="block text-xs text-gray-500">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => run('paid')}
              className="mt-5 w-full rounded-lg bg-brand py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Simulate successful payment
            </button>

            {/* A checkout nobody has watched fail has not been shown. */}
            <button
              type="button"
              onClick={() => run('failed')}
              className="mt-2 w-full rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900"
            >
              Simulate a failed payment
            </button>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel and keep my basket
            </button>
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex flex-col items-center gap-4 px-5 py-14">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            <p className="text-sm text-gray-600">Contacting your bank…</p>
            <p className="text-xs text-gray-400">Do not close this window</p>
          </div>
        )}

        {stage === 'paid' && (
          <div className="flex flex-col items-center gap-3 px-5 py-14">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Payment successful</p>
          </div>
        )}

        {stage === 'failed' && (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">Payment declined</p>
            <p className="mt-1 text-xs text-gray-500">
              Your basket is untouched and nothing has been charged.
            </p>
            <button
              type="button"
              onClick={() => setStage('choose')}
              className="mt-5 w-full rounded-lg bg-brand py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onFailed}
              className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600"
            >
              Back to checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DemoPaymentSheet
