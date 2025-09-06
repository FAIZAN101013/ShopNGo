import React, { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'

/*
  Wraps a route that only makes sense when you are signed in.

  This is convenience, not security - anyone can edit the JavaScript running
  in their own browser. The actual protection is the middleware on the
  server, which will not hand over an order to a request with no valid
  token no matter what the page thinks. This just saves you from watching a
  page load and then fail.
*/
const RequireAuth = ({ children }) => {
  const { isLoggedIn, booting } = useContext(AuthContext)
  const location = useLocation()

  // On a refresh there is a stored token that has not been checked yet.
  // Redirecting during that moment would bounce a signed-in person to the
  // login page every time they hit F5.
  if (booting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      </div>
    )
  }

  // `from` is where they were heading, so signing in can drop them back
  // there rather than at the home page.
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}

export default RequireAuth
