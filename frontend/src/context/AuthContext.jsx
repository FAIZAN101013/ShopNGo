import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import {
  registerAccount,
  verifyEmailCode,
  resendCode as resendCodeRequest,
  loginAccount,
  requestPasswordReset,
  submitPasswordReset,
  fetchProfile,
  saveProfile,
  getToken,
  setToken,
  clearToken
} from '../services/api'

export const AuthContext = createContext()

/*
  Accounts used to live in localStorage: the list of users, the password
  hashes, all of it sitting in a place the person using the browser can open
  and edit. It was a placeholder and it is gone.

  Now the server owns accounts. bcrypt hashes the password, an emailed code
  proves the address is real, and the browser holds exactly one thing - a
  signed token that says which account this is.

  The method names and their behaviour (async, throwing an Error with a
  readable message) are unchanged, which is why the pages calling them barely
  had to move.
*/
// What the browser-only version left behind. Anyone who used the site
// before this change still has their old account list and order history
// sitting in storage, where it is now both useless and slightly alarming.
const RETIRED_KEYS = ['shopngo_users', 'registered_user', 'user', 'orders', 'last_order']

const forgetOldStorage = () => {
  try {
    RETIRED_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch { /* storage blocked - nothing to clean up anyway */ }
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  // Two different waits. `booting` is "we are checking the stored token" and
  // happens once; `loading` is "a button was pressed". Sharing one flag made
  // every form look busy on first paint.
  const [booting, setBooting] = useState(Boolean(getToken()))
  const [loading, setLoading] = useState(false)

  // A stored token is a claim, not proof - it may have expired or the
  // account may be gone. Ask the server who it belongs to before trusting it.
  useEffect(() => {
    forgetOldStorage()

    if (!getToken()) return

    let cancelled = false

    fetchProfile()
      .then(({ user: profile }) => {
        if (!cancelled) setUser(profile)
      })
      .catch(() => {
        // Expired or invalid: drop it rather than leaving a dead token
        // around to fail every later request.
        clearToken()
      })
      .finally(() => {
        if (!cancelled) setBooting(false)
      })

    return () => { cancelled = true }
  }, [])

  // Signing in and verifying both end the same way, so they share this.
  const startSession = useCallback((token, profile) => {
    setToken(token)
    setUser(profile)
    return profile
  }, [])

  /*
    Registering no longer signs you in. It creates the account and sends a
    code, and the page moves on to the screen that asks for it.
  */
  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    try {
      const data = await registerAccount({ name: name.trim(), email: email.trim(), password })
      return { requiresVerification: true, email: data.email, message: data.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyEmail = useCallback(async ({ email, code }) => {
    setLoading(true)
    try {
      const data = await verifyEmailCode({ email: email.trim(), code: String(code).trim() })
      return startSession(data.token, data.user)
    } finally {
      setLoading(false)
    }
  }, [startSession])

  const resendCode = useCallback(async ({ email, purpose = 'verify' }) => {
    const data = await resendCodeRequest({ email: email.trim(), purpose })
    return data.message
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await loginAccount({ email: email.trim(), password })
      return startSession(data.token, data.user)
    } finally {
      setLoading(false)
    }
  }, [startSession])

  const forgotPassword = useCallback(async ({ email }) => {
    setLoading(true)
    try {
      const data = await requestPasswordReset({ email: email.trim() })
      return data.message
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async ({ email, code, password }) => {
    setLoading(true)
    try {
      const data = await submitPasswordReset({ email: email.trim(), code: String(code).trim(), password })
      return data.message
    } finally {
      setLoading(false)
    }
  }, [])

  /*
    Signing out is a local act: throw the token away. There is no request to
    make, because the server does not keep a list of who is signed in - that
    is the trade a JWT makes.
  */
  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async ({ name }) => {
    setLoading(true)
    try {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Name cannot be empty')

      const data = await saveProfile({ name: trimmed })
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      booting,
      loading,
      register,
      verifyEmail,
      resendCode,
      login,
      forgotPassword,
      resetPassword,
      logout,
      updateProfile
    }),
    [user, booting, loading, register, verifyEmail, resendCode, login, forgotPassword, resetPassword, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
