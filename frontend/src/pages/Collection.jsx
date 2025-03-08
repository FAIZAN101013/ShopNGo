import React from 'react'
import { useState } from 'react'


const Collection = () => {
  const [showFilter, setShowFilter] = useState(true);

  return (
    <div className='flex flex-col  sm:flex-row  gap-1 sm:gap-10 pt-10 border-t'>
      
      {/** filter option */}
      <div className='min-w-60'>
        <p className='my-2 text-xl flex items-center cursor-pointer gap-2'>Filter </p>
        <br />
        {/** category option */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'}`}>

          <p className='mb-3 text-sm font-medium '>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={' Men'} />Men
              
            </p>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={'Women'} /> Women
              
            </p>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={'Kides'} /> Kids
              
            </p>
          
          </div>
        </div>
        {/** Subcategory */}
         <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'}`}>

          <p className='mb-3 text-sm font-medium '>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={'Top-wear'} /> Top-wear
              
            </p>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={'BOTTOM-WEAR'} /> Bottom-wear
              
            </p>
            <p className='flex gap-2'>
              <input  className='w-3' type='checkbox' value={'WINTER WEAR'} /> Winter-wear
              
            </p>
          
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
