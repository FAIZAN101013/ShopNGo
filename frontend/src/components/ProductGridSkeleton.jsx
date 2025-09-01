import React from 'react'

/*
  Placeholder cards shown while the catalogue is being fetched.

  They mirror the real card's 3:4 image and two text lines so the layout does
  not jump when the products arrive - the page is the same height before and
  after. An empty grid would just look like a shop with nothing in it.
*/
const ProductGridSkeleton = ({ count = 10, className = 'grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4' }) => (
  <div className={className} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col">
        <div className="aspect-[3/4] animate-pulse rounded-lg bg-gray-100" />
        <div className="mt-3 h-4 w-4/5 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    ))}
  </div>
)

export default ProductGridSkeleton
