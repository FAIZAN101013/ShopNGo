import React, { useContext } from 'react'
import { Link } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import AdminLogin from './AdminLogin'

/*
  Like RequireAuth, but also checks the role.

  Signed out gets its own sign in screen rather than the shop's, because the
  shop's offers to create an account, and creating an account is not how
  anybody gets in here.

  Signed in but not staff gets told so, rather than bounced to a login form
  they have already passed - that would read as "your password is wrong"
  when the truth is quite different.

  Again: this is politeness, not security. Every admin route on the server
  checks the role for itself.
*/
const RequireAdmin = ({ children }) => {
  const { user, isLoggedIn, booting } = useContext(AuthContext)

  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  if (!isLoggedIn) return <AdminLogin />

  if (!['manager', 'admin', 'owner'].includes(user.role)) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="prata-regular mt-5 text-2xl text-gray-900">Staff only</h1>
          <p className="mt-2 text-sm text-gray-500">
            You are signed in as {user.email}, which is not a staff account.
            The shop owner can grant access.
          </p>
          <Link
            to="/"
            className="mt-7 inline-block rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Back to the shop
          </Link>
        </div>
      </div>
    )
  }

  return children
}

export default RequireAdmin
