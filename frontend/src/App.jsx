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
import NotFound from './pages/NotFound'
import NavBar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import ScrollToTop from './components/ScrollToTop'
import RequireAuth from './components/RequireAuth'
import { ToastContainer } from 'react-toastify';

// The auth pages stand on their own. A nav bar full of ways to leave, and a
// footer of links, are both invitations to abandon a two field form.
const AUTH_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password']

const App = () => {
  const { pathname } = useLocation()
  const showChrome = !AUTH_ROUTES.includes(pathname)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ToastContainer position="bottom-right" autoClose={2500} newestOnTop />
      <ScrollToTop />
      {showChrome && <NavBar />}
      {showChrome && <SearchBar />}
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

        <Route path='*' element={<NotFound />} />
      </Routes>
      {showChrome && <Footer />}

    </div>
  )
}

export default App
