/*
  The single place that knows where the API lives and how to talk to it.

  Everything goes through here rather than calling fetch from a component, so
  the base URL, the error handling, the login token and the { success, ... }
  convention are defined once instead of being repeated at every call site.
*/

// Falls back to the local API so the app still runs without a .env file.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const TOKEN_KEY = 'shopngo_token'

/*
  The token is the whole session. It is kept in localStorage so a refresh
  does not sign you out, and read back through these three functions so
  nothing else in the app has to know the key or that storage can throw.
*/
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* private mode - the session just will not survive a refresh */ }
}

export const clearToken = () => setToken(null)

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

const request = async (path, { auth = false, method = 'GET', body } = {}) => {
  const headers = { 'Content-Type': 'application/json' }

  // "Bearer <token>" is what the middleware on the server reads. Sent in a
  // header rather than the URL, because URLs end up in logs and history.
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
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
    const error = new Error(data.message || `Request failed (${response.status})`)
    // The body is carried along, not thrown away. Some failures are not
    // really failures - a login that answers "verify your email first" needs
    // that flag to know which screen to show next.
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/* ---------- catalogue ---------- */

export const fetchProducts = async () => {
  const data = await request('/api/products')
  return data.products || []
}

/* ---------- accounts ---------- */

export const registerAccount = (payload) =>
  request('/api/user/register', { method: 'POST', body: payload })

export const verifyEmailCode = (payload) =>
  request('/api/user/verify', { method: 'POST', body: payload })

export const resendCode = (payload) =>
  request('/api/user/resend-code', { method: 'POST', body: payload })

export const loginAccount = (payload) =>
  request('/api/user/login', { method: 'POST', body: payload })

export const requestPasswordReset = (payload) =>
  request('/api/user/forgot-password', { method: 'POST', body: payload })

export const submitPasswordReset = (payload) =>
  request('/api/user/reset-password', { method: 'POST', body: payload })

export const fetchProfile = () => request('/api/user/profile', { auth: true })

export const saveProfile = (payload) =>
  request('/api/user/profile', { method: 'PUT', auth: true, body: payload })

/* ---------- cart ---------- */

export const fetchCart = async () => {
  const data = await request('/api/cart', { auth: true })
  return data.cart || {}
}

// The whole cart, not one item. The browser already knows the finished
// state, so a dropped request loses a save rather than leaving the two
// copies disagreeing about a quantity forever.
export const saveCart = (cart) =>
  request('/api/cart', { method: 'PUT', auth: true, body: { cart } })

/* ---------- orders ---------- */

export const createOrder = (payload) =>
  request('/api/orders', { method: 'POST', auth: true, body: payload })

export const fetchOrders = async () => {
  const data = await request('/api/orders', { auth: true })
  return data.orders || []
}

/* ---------- admin ---------- */

// Every one of these is refused by the server for a non-admin. The admin
// pages hiding themselves is only so nobody is offered a button that would
// fail; it is not what stops anyone.

export const adminCreateProduct = (product) =>
  request('/api/products', { method: 'POST', auth: true, body: product })

export const adminUpdateProduct = (id, product) =>
  request(`/api/products/${id}`, { method: 'PUT', auth: true, body: product })

export const adminDeleteProduct = (id) =>
  request(`/api/products/${id}`, { method: 'DELETE', auth: true })

export const adminFetchOrders = async () => {
  const data = await request('/api/orders/all', { auth: true })
  return data.orders || []
}

export const adminSetOrderStatus = (reference, status) =>
  request(`/api/orders/${reference}/status`, { method: 'PATCH', auth: true, body: { status } })

// Owner only: who has the keys, and handing them out.
export const adminFetchStaff = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  const data = await request(`/api/user/staff${query}`, { auth: true })
  return data.users || []
}

export const adminSetUserRole = (id, role) =>
  request(`/api/user/${id}/role`, { method: 'PATCH', auth: true, body: { role } })

export const adminInviteAdmin = (payload) =>
  request('/api/user/invite-admin', { method: 'POST', auth: true, body: payload })

/*
  Claiming an invitation. Not an admin call despite living next to them - the
  person doing it has no account to authenticate with yet, which is exactly
  what the emailed code stands in for.
*/
export const acceptAdminInvite = async (payload) => {
  const data = await request('/api/user/accept-invite', { method: 'POST', body: payload })
  setToken(data.token)
  return data
}

/*
  Upload one product image.

  The file never touches our API. We ask it for a signature, then POST the
  image straight to Cloudinary - so a 4MB photo does not travel twice and
  does not sit in the memory of a small server that is also serving the shop.

  Not through request(): this is a different host, and it takes FormData
  rather than JSON, so setting Content-Type by hand would actually break it -
  the browser has to add the multipart boundary itself.
*/
export const uploadProductImage = async (file) => {
  const { upload } = await request('/api/upload/signature', { auth: true })

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', upload.apiKey)
  form.append('timestamp', upload.timestamp)
  form.append('folder', upload.folder)
  form.append('signature', upload.signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${upload.cloudName}/image/upload`,
    { method: 'POST', body: form }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error?.message || `Cloudinary refused the upload (${response.status})`)
  }

  // https, so imageUrl() passes it through untouched.
  return data.secure_url
}
