import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { AuthContext } from '../context/AuthContext'
import { adminFetchStaff, adminSetUserRole } from '../services/api'

const ROLE_STYLE = {
  owner: 'bg-gray-900 text-white',
  admin: 'bg-blue-50 text-blue-700',
  user: 'bg-gray-100 text-gray-600'
}

/*
  Who has the keys.

  With no search it lists only the owner and the admins, because that is the
  question being asked most of the time. Type an email and it searches every
  account, which is how somebody gets promoted in the first place.
*/
const AdminTeam = () => {
  const { user } = useContext(AuthContext)

  const [rows, setRows] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

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
  }, [query])

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
            : 'Showing the owner and admins. Search to find a customer to promote.'}
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

                  {!row.verified && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Unverified
                    </span>
                  )}

                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_STYLE[row.role]}`}>
                    {row.role}
                  </span>

                  {/* The owner cannot be changed here and cannot change
                      themselves, so those two rows get no button at all
                      rather than one that always fails. */}
                  {row.role !== 'owner' && !isMe && (
                    <button
                      type="button"
                      disabled={busyId === row.id}
                      onClick={() => changeRole(row, row.role === 'admin' ? 'user' : 'admin')}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        row.role === 'admin'
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                      }`}
                    >
                      {busyId === row.id
                        ? 'Saving…'
                        : row.role === 'admin'
                          ? 'Remove admin'
                          : 'Make admin'}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        An admin can manage products and orders. Only you can appoint them, and there is no
        way to create another owner from here — that takes the <code>make-admin</code> script
        and the database password.
      </p>
    </div>
  )
}

export default AdminTeam
