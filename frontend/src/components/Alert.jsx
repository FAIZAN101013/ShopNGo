import React from 'react'

/*
  The inline message strip on the auth forms.

  The red error box had been copied into three pages with its own svg each
  time, and they had already drifted apart. One component, two tones.
*/
const TONES = {
  error: {
    box: 'bg-red-50 text-red-600',
    path: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  success: {
    box: 'bg-green-50 text-green-700',
    path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

const Alert = ({ tone = 'error', children }) => {
  if (!children) return null
  const { box, path } = TONES[tone] || TONES.error

  return (
    <p
      // role="alert" is what makes a screen reader announce this the moment
      // it appears, instead of leaving it unread halfway up the form.
      role="alert"
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${box}`}
    >
      <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} />
      </svg>
      {children}
    </p>
  )
}

export default Alert
