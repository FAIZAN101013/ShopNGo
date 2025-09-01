/*
  The single place that knows where the API lives and how to talk to it.

  Everything goes through here rather than calling fetch from a component, so
  the base URL, the error handling and the { success, ... } convention are
  defined once instead of being repeated at every call site.
*/

// Falls back to the local API so the app still runs without a .env file.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

/*
  Products store an image path like "/images/p_img1.webp", not a full URL, so
  that moving the API to a real domain does not mean rewriting every row in
  the database. A few products carry a remote URL instead; those pass through
  untouched.
*/
export const imageUrl = (src) => {
  if (!src) return ''
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`
}

const request = async (path, options = {}) => {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    })
  } catch {
    // fetch only rejects when the request never happened at all, which in
    // practice means the API is not running.
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`The server sent a response we could not read (${response.status})`)
  }

  // The API answers every route with { success, ... }, so one check covers
  // all of them. Check the status too, in case something fails before the
  // route is ever reached.
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`)
  }

  return data
}

export const fetchProducts = async () => {
  const data = await request('/api/products')
  return data.products || []
}
