import React, { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import Title from '../components/Title'
import AdminProducts from '../components/AdminProducts'
import AdminOrders from '../components/AdminOrders'
import AdminTeam from '../components/AdminTeam'

/*
  Which tabs each job gets. A manager handles orders; the catalogue is an
  admin's job and the staff list is the owner's.

  The tabs are hidden rather than disabled, because a disabled tab is an
  invitation to wonder what you are missing. The endpoints behind each one
  refuse the wrong role regardless.
*/
const TABS = [
  { id: 'orders', label: 'Orders', roles: ['manager', 'admin', 'owner'] },
  { id: 'products', label: 'Products', roles: ['admin', 'owner'] },
  { id: 'team', label: 'Team', roles: ['owner'] }
]

const Admin = () => {
  const { user, logout } = useContext(AuthContext)
  const tabs = TABS.filter((t) => t.roles.includes(user.role))

  // The tab lives in the URL rather than in state, so a reload keeps you
  // where you were and the two panels can be linked to directly.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = tabs.some((t) => t.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'orders'

  useEffect(() => {
    document.title = 'Admin | ShopNGo'
  }, [])

  return (
    <div className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Title text1={'BACK'} text2={'OFFICE'} />
          <p className="mt-2 text-sm text-gray-500">
            {user.name} &bull; {user.email}
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {user.role}
            </span>
          </p>
        </div>

        {/* The shop's header is hidden here, so signing out needs its own
            way out of the back office. */}
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>

      <div className="mb-8 flex gap-1 border-b border-gray-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSearchParams({ tab: item.id })}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              tab === item.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.label}
            {tab === item.id && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-900" />}
          </button>
        ))}
      </div>

      {tab === 'orders' && <AdminOrders />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'team' && <AdminTeam />}
    </div>
  )
}

export default Admin
