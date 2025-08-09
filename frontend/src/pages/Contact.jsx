import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const Contact = () => {
  React.useEffect(() => { document.title = 'Contact | ShopNGo' }, [])

  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = React.useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return toast.error('Please fill required fields')
    try {
      setSubmitting(true)
      // TODO: send to backend or EmailJS
      toast.success('Message sent!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="!pt-10 !pb-16">
      <div className="!mb-6">
        <Title text1={"CONTACT"} text2={"US"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 !gap-8 items-start">
        <div>
          <img
            src={assets.contact_img}
            alt="Contact ShopNGo"
            loading="lazy"
            className="!w-full !h-auto rounded-xl shadow-sm"
          />
          <div className="!mt-6 grid grid-cols-1 sm:grid-cols-2 !gap-4">
            <a href="tel:+918805910192" className="border border-gray-200 rounded-lg !p-4 hover:bg-gray-50 transition-colors">
              <p className="text-gray-900 font-medium">Phone</p>
              <p className="text-sm text-gray-600">+91-8805910192</p>
            </a>
            <a href="mailto:info@shopngo.com" className="border border-gray-200 rounded-lg !p-4 hover:bg-gray-50 transition-colors">
              <p className="text-gray-900 font-medium">Email</p>
              <p className="text-sm text-gray-600">info@shopngo.com</p>
            </a>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl !p-6">
          <h2 className="text-xl font-medium text-gray-900 !mb-4">Send us a message</h2>
          <form className="!space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 !mb-1">Full Name</label>
              <input type="text" id="name" name="name" placeholder="John Doe" className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" value={form.name} onChange={onChange} required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 !mb-1">Email</label>
              <input type="email" id="email" name="email" placeholder="john@example.com" className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" value={form.email} onChange={onChange} required />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm text-gray-700 !mb-1">Subject</label>
              <input type="text" id="subject" name="subject" placeholder="I have a question about..." className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" value={form.subject} onChange={onChange} />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm text-gray-700 !mb-1">Message</label>
              <textarea rows="5" id="message" name="message" placeholder="Write your message here..." className="!w-full border border-gray-300 rounded-lg !px-4 !py-2 focus:outline-none focus:ring-1 focus:ring-black" value={form.message} onChange={onChange}></textarea>
            </div>
            <button type="submit" disabled={submitting} className="bg-black text-white !px-6 !py-2 rounded-lg hover:bg-gray-800 transition-colors">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="!mt-6 text-sm text-gray-500">
            We typically respond within 24-48 hours.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
