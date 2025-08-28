import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext()

const USERS_KEY = 'shopngo_users'
const SESSION_KEY = 'user'
const LEGACY_KEY = 'registered_user'

/*
  Passwords are hashed before they are stored so they are not sitting in
  localStorage in plain text.

  This is NOT real security: SHA-256 is fast and unsalted, so it does not
  resist an attacker with the stored data, and anything held in the browser
  is readable by the user anyway. It is a placeholder until the Express API
  handles auth properly with bcrypt and a JWT. The point is that the client
  should never hold a readable password even in a demo.
*/
const hashPassword = async (password) => {
  const salted = `shopngo:${password}`

  // crypto.subtle only exists in a secure context, so it is missing when the
  // dev server is opened over a plain-HTTP LAN address from a phone. Fall
  // back rather than throwing, since neither path is real security anyway.
  if (!globalThis.crypto?.subtle) {
    let hash = 0
    for (let i = 0; i < salted.length; i++) {
      hash = (hash << 5) - hash + salted.charCodeAt(i)
      hash |= 0
    }
    return `insecure-${hash.toString(16)}`
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null')
    return value ?? fallback
  } catch {
    return fallback
  }
}

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* storage blocked - state still works for this session */ }
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJSON(SESSION_KEY, null))
  const [loading, setLoading] = useState(false)

  // The old build stored a single `registered_user`, so only one account
  // could ever exist - registering again overwrote it. Carry any existing
  // account into the accounts list so nobody loses their login.
  useEffect(() => {
    const legacy = readJSON(LEGACY_KEY, null)
    if (!legacy?.email) return

    const users = readJSON(USERS_KEY, [])
    if (!users.some((u) => u.email === legacy.email)) {
      hashPassword(legacy.password || '').then((passwordHash) => {
        writeJSON(USERS_KEY, [
          ...users,
          { name: legacy.name || 'User', email: legacy.email, passwordHash }
        ])
        localStorage.removeItem(LEGACY_KEY)
      })
    } else {
      localStorage.removeItem(LEGACY_KEY)
    }
  }, [])

  /*
    Every method below is async and throws an Error with a readable message
    on failure. That is deliberate: when these move to the API the bodies
    become a fetch call and nothing that calls them has to change.
  */

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    try {
      const normalisedEmail = email.trim().toLowerCase()
      const users = readJSON(USERS_KEY, [])

      if (users.some((u) => u.email === normalisedEmail)) {
        throw new Error('An account with that email already exists')
      }

      const passwordHash = await hashPassword(password)
      const account = { name: name.trim(), email: normalisedEmail, passwordHash }
      writeJSON(USERS_KEY, [...users, account])

      // Registering signs you in. Sending someone to a login form to retype
      // the details they just entered is a pointless extra step.
      const session = { name: account.name, email: account.email }
      writeJSON(SESSION_KEY, session)
      setUser(session)
      return session
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const normalisedEmail = email.trim().toLowerCase()
      const users = readJSON(USERS_KEY, [])
      const account = users.find((u) => u.email === normalisedEmail)
      const passwordHash = await hashPassword(password)

      // One message for both cases, so this cannot be used to discover
      // which email addresses have accounts.
      if (!account || account.passwordHash !== passwordHash) {
        throw new Error('Email or password is incorrect')
      }

      const session = { name: account.name, email: account.email }
      writeJSON(SESSION_KEY, session)
      setUser(session)
      return session
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch { /* storage blocked - clearing state below is what matters */ }
    setUser(null)
  }, [])

  const updateProfile = useCallback(async ({ name }) => {
    setLoading(true)
    try {
      if (!user) throw new Error('You are not signed in')

      const trimmed = name.trim()
      if (!trimmed) throw new Error('Name cannot be empty')

      const users = readJSON(USERS_KEY, []).map((u) =>
        u.email === user.email ? { ...u, name: trimmed } : u
      )
      writeJSON(USERS_KEY, users)

      const session = { ...user, name: trimmed }
      writeJSON(SESSION_KEY, session)
      setUser(session)
      return session
    } finally {
      setLoading(false)
    }
  }, [user])

  const value = useMemo(
    () => ({ user, isLoggedIn: Boolean(user), loading, register, login, logout, updateProfile }),
    [user, loading, register, login, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
