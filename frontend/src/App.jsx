import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Product from './pages/Product'
import About from './pages/About'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Cart from './pages/Cart'
import Login from './pages/Login'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  return (
    <div className="!px-4 !sm:px-[5vw] md:px-[7vw] lg:px-[9vw] xl:px-[25vw]">
      <ToastContainer />
      <NavBar />
      <SearchBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/placeorder' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
      </Routes>
      <Footer />

    </div>
  )
}

export default App
