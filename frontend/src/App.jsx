import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

import Home from './pages/Home'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Product from './pages/Product'
import About from './pages/About'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import NavBar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import ScrollToTop from './components/ScrollToTop'
import WakingNotice from './components/WakingNotice'
import RequireAuth from './components/RequireAuth'
import RequireAdmin from './components/RequireAdmin'
import { ToastContainer } from 'react-toastify';

// The auth pages stand on their own. A nav bar full of ways to leave, and a
// footer of links, are both invitations to abandon a two field form.
const AUTH_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password']

const App = () => {
  const { pathname } = useLocation()

  // The back office gets no shop chrome either. It is a different job from
  // shopping, and a header full of Collection and Contact links belongs to
  // the other one.
  const showChrome = !AUTH_ROUTES.includes(pathname) && !pathname.startsWith('/admin')

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={2500} newestOnTop />
      <ScrollToTop />
      {showChrome && <NavBar />}
      {showChrome && <SearchBar />}
      {/* Only appears when the catalogue has been loading for a few seconds,
          which in practice means the free host is waking up. */}
      {showChrome && <WakingNotice />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />

        {/* Orders belong to an account, so these three need one. Checkout is
            in here too: an order with nobody to send it to is not an order. */}
        <Route path='/placeorder' element={<RequireAuth><PlaceOrder /></RequireAuth>} />
        <Route path='/orders' element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path='/profile' element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Running the shop, rather than shopping in it. */}
        <Route path='/admin' element={<RequireAdmin><Admin /></RequireAdmin>} />

        <Route path='*' element={<NotFound />} />
      </Routes>
      {showChrome && <Footer />}

    </div>
  )
}

export default App
