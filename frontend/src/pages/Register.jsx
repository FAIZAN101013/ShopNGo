import React, { useState } from 'react'
import Title from '../components/Title'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm) {
      toast.error('Please fill all fields')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    try {
      setSubmitting(true)
      const user = { name: form.name, email: form.email, password: form.password }
      localStorage.setItem('registered_user', JSON.stringify(user))
      toast.success('Registration successful. You can now sign in.')
      navigate('/login')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={'CREATE'} text2={'ACCOUNT'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 !gap-8 items-center">
        <div className="order-2 md:order-1 border border-gray-200 rounded-xl !p-6 bg-white shadow-sm">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Join ShopNGo</h2>
          <form className="!space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 !mb-1">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 !mb-1">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 !mb-1">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="••••••••" />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm text-gray-700 !mb-1">Confirm Password</label>
              <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={onChange} className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="!w-full bg-black text-white !py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60">
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-sm text-gray-600 !mt-4">
            Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700">Sign in</Link>
          </p>
        </div>
        <div className="order-1 md:order-2">
          <div className="bg-gray-50 border border-gray-200 rounded-xl !p-6">
            <h3 className="text-gray-900 font-medium !mb-2">Why create an account?</h3>
            <ul className="list-disc !pl-5 text-sm text-gray-600 !space-y-1">
              <li>Faster checkout</li>
              <li>Track your orders</li>
              <li>Exclusive offers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register 