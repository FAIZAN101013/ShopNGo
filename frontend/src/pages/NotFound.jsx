import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <p className="text-sm font-medium tracking-widest text-gray-400">404</p>
      <h1 className="prata-regular mt-4 text-3xl sm:text-4xl text-gray-900">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        The link may be broken, or the page may have been moved. Let&apos;s get
        you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/collection"
          className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Browse the collection
        </Link>
        <Link
          to="/"
          className="rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
