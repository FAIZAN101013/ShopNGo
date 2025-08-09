import React, { useState } from 'react'
import Title from '../components/Title'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    try {
      setSubmitting(true)
      // Mock auth: check registration data from localStorage
      const reg = JSON.parse(localStorage.getItem('registered_user') || 'null')
      if (!reg || reg.email !== form.email || reg.password !== form.password) {
        toast.error('Invalid credentials. Please register first or try again.')
        return
      }
      localStorage.setItem('user', JSON.stringify({ email: reg.email, name: reg.name || 'User' }))
      toast.success('Logged in successfully')
      navigate('/')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={'SIGN'} text2={'IN'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 !gap-8 items-center">
        <div className="order-2 md:order-1 border border-gray-200 rounded-xl !p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Welcome back</h2>
          <form className="!space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 !mb-1">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 !mb-1">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="!w-full bg-black text-white !py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-gray-600 !mt-4">
            Don&apos;t have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700">Create one</Link>
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl !p-6">
            <h3 className="text-gray-900 font-medium !mb-2">Demo credentials</h3>
            <p className="text-sm text-gray-600">Register first, then sign in using the same email and password.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
