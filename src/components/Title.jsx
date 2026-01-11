import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex gap-3 items-center mb-6'>
      <p className='text-gray-600 text-2xl font-serif'>
        {text1} <span className='text-pink-500 font-bold'>{text2}</span>
      </p>
      <div className='w-12 sm:w-16 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full'></div>
    </div>
  )
}

export default Title