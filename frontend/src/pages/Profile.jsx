import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { toast } from 'react-toastify'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(u)
      setName(u?.name || '')
    } catch {}
  }, [])

  const save = () => {
    if (!user) return
    const updated = { ...user, name: name || user.name }
    localStorage.setItem('user', JSON.stringify(updated))
    setUser(updated)
    toast.success('Profile updated')
  }

  if (!user) {
    return (
      <div className="!pt-10 !pb-16">
        <Title text1={'MY'} text2={'PROFILE'} />
        <p className="text-gray-600">You are not logged in.</p>
        <a href="/login" className="inline-block !mt-4 bg-black text-white !px-4 !py-2 rounded-lg">Sign In</a>
      </div>
    )
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 !gap-8">
        <div className="border border-gray-200 rounded-xl !p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Account Details</h2>
          <div className="!space-y-4">
            <div>
              <label className="block text-sm text-gray-700 !mb-1">Display Name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 !mb-1">Email</label>
              <input value={user.email} disabled className="!w-full border border-gray-200 bg-gray-50 rounded-lg !px-4 !py-2 text-gray-600" />
            </div>
            <button onClick={save} className="bg-black text-white !px-4 !py-2 rounded-lg hover:bg-gray-800">Save Changes</button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl !p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Security</h2>
          <p className="text-sm text-gray-600">For demo, password changes are not available.</p>
          <a href="/orders" className="inline-block !mt-4 bg-blue-600 hover:bg-blue-700 text-white !px-4 !py-2 rounded-lg !text-sm">View My Orders</a>
        </div>
      </div>
    </div>
  )
}

export default Profile 