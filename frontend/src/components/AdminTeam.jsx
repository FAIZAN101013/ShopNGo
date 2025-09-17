import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { AuthContext } from '../context/AuthContext'
import { adminFetchStaff, adminSetUserRole, adminInviteStaff } from '../services/api'
import Alert from './Alert'

const ROLE_STYLE = {
  owner: 'bg-gray-900 text-white',
  admin: 'bg-blue-50 text-blue-700',
  manager: 'bg-teal-50 text-teal-700',
  user: 'bg-gray-100 text-gray-600'
}

// Said once, here, so the invite form and the list below cannot end up
// describing the same job differently.
const ROLE_DUTIES = {
  manager: 'Handles orders only',
  admin: 'Handles orders, and adds or edits products'
}

/*
  Who has the keys.

  With no search it lists the owner, the admins and the managers, because
  that is the question being asked most of the time. Type an email and it
  searches every account, which is how somebody gets promoted in the first
  place.
*/
const AdminTeam = () => {
  const { user } = useContext(AuthContext)

  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [invite, setInvite] = useState({ emails: '', role: 'manager' })
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [results, setResults] = useState([])

  // Bumped after an invitation so the list refetches and the new people
  // appear without a reload.
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // Waits for a pause in typing rather than searching on every keystroke.
    const timer = setTimeout(() => {
      adminFetchStaff(query)
        .then((list) => { if (!cancelled) setRows(list) })
        .catch((err) => { if (!cancelled) setError(err.message) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [query, reloadKey])

  const sendInvites = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setResults([])

    try {
      const data = await adminInviteStaff({ emails: invite.emails, role: invite.role })
      toast.success(data.message)
      // Kept per address: "3 of 4 sent" without saying which one failed is
      // the least useful sentence in software.
      setResults(data.results || [])
      setInvite({ ...invite, emails: '' })
      setReloadKey((n) => n + 1)
    } catch (err) {
      setInviteError(err.message)
      setResults(err.data?.results || [])
    } finally {
      setInviting(false)
    }
  }

  const changeRole = async (target, role) => {
    setBusyId(target.id)
    try {
      const { message, user: updated } = await adminSetUserRole(target.id, role)
      setRows((prev) => prev.map((r) => (r.id === target.id ? updated : r)))
      toast.success(message)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {/* Inviting comes first, because it is what an owner opens this tab to
          do. Reading the list is what you do afterwards. */}
      <form
        onSubmit={sendInvites}
        className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-medium text-gray-900">Invite people</h2>
        <p className="mt-1 mb-5 text-sm text-gray-500">
          Each one gets an email with a code and chooses their own password. Anyone who
          already shops here is simply given the role, and their password is untouched.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Two roles, as cards rather than a dropdown, because the
              difference between them is the part worth reading. */}
          {['manager', 'admin'].map((role) => (
            <label
              key={role}
              className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                invite.role === role
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="inviteRole"
                  value={role}
                  checked={invite.role === role}
                  onChange={() => setInvite({ ...invite, role })}
                  className="h-4 w-4 accent-black"
                />
                <span className="text-sm font-medium capitalize text-gray-900">{role}</span>
              </div>
              <p className="mt-1.5 pl-7 text-xs text-gray-500">{ROLE_DUTIES[role]}</p>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label htmlFor="invite-emails" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email addresses
          </label>
          <textarea
            id="invite-emails"
            required
            rows="2"
            value={invite.emails}
            onChange={(e) => {
              setInvite({ ...invite, emails: e.target.value })
              setInviteError('')
            }}
            placeholder="one@example.com, two@example.com"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Paste as many as you like, up to twenty. Commas, spaces or new lines all separate.
          </p>
        </div>

        <button
          type="submit"
          disabled={inviting}
          className="mt-4 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {inviting ? 'Sending…' : 'Send invitations'}
        </button>

        <div className="mt-4">
          <Alert>{inviteError}</Alert>
        </div>

        {results.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
            {results.map((r) => (
              <li key={r.email} className={`text-xs ${r.ok ? 'text-gray-600' : 'text-red-600'}`}>
                <span className="font-medium">{r.ok ? '✓' : '×'}</span> {r.message}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search every account by name or email"
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-colors hover:border-gray-400 focus:border-gray-900"
        />
        <p className="mt-2 text-xs text-gray-400">
          {query
            ? 'Searching all accounts.'
            : 'Showing everyone who works here. Search to find a customer to promote.'}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No accounts match that.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {rows.map((row) => {
              const isMe = row.id === user.id
              return (
                <li key={row.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {row.name}
                      {isMe && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">{row.email}</p>
                  </div>

                  {/* Someone invited who has not set a password yet. Worth
                      showing, so "has not accepted" can be told apart from
                      "accepted and quiet". */}
                  {!row.verified && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {row.role === 'user' ? 'Unverified' : 'Invite pending'}
                    </span>
                  )}

                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_STYLE[row.role]}`}>
                    {row.role}
                  </span>

                  {/* The owner cannot be changed here and cannot change
                      themselves, so those two rows get no control at all
                      rather than one that always fails. */}
                  {row.role !== 'owner' && !isMe && (
                    <select
                      value={row.role}
                      disabled={busyId === row.id}
                      onChange={(e) => changeRole(row, e.target.value)}
                      aria-label={`Role for ${row.email}`}
                      className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none transition-colors hover:border-gray-900 disabled:opacity-50"
                    >
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="user">No access</option>
                    </select>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        A manager handles orders; an admin also manages the catalogue. Only you can appoint
        them, and there is no way to create another owner from here — that takes the{' '}
        <code>make-admin</code> script and the database password.
      </p>
    </div>
  )
}

export default AdminTeam
