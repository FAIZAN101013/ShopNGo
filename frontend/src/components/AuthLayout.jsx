import React from 'react'
import { Link } from 'react-router-dom'

/*
  Shared shell for sign in and create account.

  Both pages were a plain white card in the middle of a lot of empty page,
  and they were drifting apart from each other. Keeping the frame here means
  they stay identical and each page file holds only its own form.

  The dark panel is decoration and reassurance, so it is hidden below lg
  rather than stacked - on a phone it would just push the form off screen.
*/
const AuthLayout = ({ eyebrow, heading, points, children }) => {
  return (
    <div className="py-10 sm:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid lg:grid-cols-2">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-brand p-10 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Soft glow, kept behind the text and out of the accessibility tree. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/5 blur-2xl"
          />

          <Link to="/" className="relative z-10 text-sm font-medium tracking-[0.3em] text-white/70 transition-colors hover:text-white">
            SHOPNGO
          </Link>

          <div className="relative z-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              {eyebrow}
            </p>
            <h2 className="prata-regular text-3xl leading-snug xl:text-4xl">{heading}</h2>

            <ul className="mt-8 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-white/70">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-white/40">
            Passwords are hashed with bcrypt and never stored readable.
          </p>
        </aside>

        {/* Form panel */}
        <div className="p-6 sm:p-10">
          {/* The nav bar is hidden on these pages, and the brand link in the
              dark panel is hidden below lg - so on a phone this is the only
              way back to the shop. */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-gray-400 transition-colors hover:text-gray-900 lg:hidden"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            SHOPNGO
          </Link>

          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
