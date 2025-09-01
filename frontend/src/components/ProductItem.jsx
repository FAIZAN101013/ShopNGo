import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { imageUrl } from '../services/api'

const ProductItem = ({ id, image, name, price }) => {
    const { currency } = useContext(ShopContext)

    return (
        // `group` lets the image react to a hover anywhere on the card, and
        // `flex flex-col` makes the link a block: as a default inline element
        // it ignored the vertical padding and sized itself around its text.
        <Link
            to={`/product/${id}`}
            className='group flex flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2'
        >
            {/* A fixed aspect ratio is what keeps the grid even. Without one,
                object-cover has no height to crop against and every card is a
                different size. */}
            <div className='aspect-[3/4] overflow-hidden rounded-lg bg-gray-50'>
                <img
                    className='h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
                    src={imageUrl(image[0])}
                    alt={name}
                    loading='lazy'
                    decoding='async'
                />
            </div>

            {/* Two lines rather than truncate: most of these names only differ
                near the end, so a single clipped line made them unreadable.
                The fixed height keeps every price on the same baseline. */}
            <p className='mt-3 line-clamp-2 min-h-[2.75rem] text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-600'>
                {name}
            </p>
            <p className='mt-1 text-sm font-semibold text-gray-900'>
                {currency}{price}
            </p>
        </Link>
    )
}

export default ProductItem
