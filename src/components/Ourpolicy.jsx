import React from 'react'
import { assets } from '../assets/assets'

const Ourpolicy = () => {
  return (
    <div className='bg-gradient-to-br from-pink-50 via-white to-rose-50 py-20'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-8 text-center text-xs sm:text-sm md:text-base text-gray-700'>

          <div className='group hover:scale-105 transition-transform duration-300'>
            <div className='bg-white rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300'>
              <img src={assets.exchange_icon} className='w-10 sm:w-12' alt="Exchange Icon" />
            </div>
            <p className='font-bold text-gray-900 mb-2 text-base sm:text-lg'>Easy Exchange Policy</p>
            <p className='text-gray-500 text-sm'>We offer hassle free exchange policy</p>
          </div>

          <div className='group hover:scale-105 transition-transform duration-300'>
            <div className='bg-white rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300'>
              <img src={assets.quality_icon} className='w-10 sm:w-12' alt="Quality Icon" />
            </div>
            <p className='font-bold text-gray-900 mb-2 text-base sm:text-lg'>7 Days Return Policy</p>
            <p className='text-gray-500 text-sm'>We provide 7 days return policy</p>
          </div>

          <div className='group hover:scale-105 transition-transform duration-300'>
            <div className='bg-white rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300'>
              <img src={assets.support_img} className='w-10 sm:w-12' alt="Support Icon" />
            </div>
            <p className='font-bold text-gray-900 mb-2 text-base sm:text-lg'>Best Customer Support</p>
            <p className='text-gray-500 text-sm'>We provide 24/7 customer support</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Ourpolicy