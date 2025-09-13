import React, { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import Title from '../components/Title'
import AdminProducts from '../components/AdminProducts'
import AdminOrders from '../components/AdminOrders'

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' }
]

const Admin = () => {
  const { user } = useContext(AuthContext)

  // The tab lives in the URL rather than in state, so a reload keeps you
  // where you were and the two panels can be linked to directly.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = TABS.some((t) => t.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'orders'

  useEffect(() => {
    document.title = 'Admin | ShopNGo'
  }, [])

  return (
    <div className="py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Title text1={'SHOP'} text2={'ADMIN'} />
          <p className="mt-2 text-sm text-gray-500">Signed in as {user.email}</p>
        </div>
      </div>

      <div className="mb-8 flex gap-1 border-b border-gray-200">
        {TABS.map((item) => (
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

      {tab === 'orders' ? <AdminOrders /> : <AdminProducts />}
    </div>
  )
}

export default Admin
