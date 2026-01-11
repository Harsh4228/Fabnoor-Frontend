// ============= About.jsx =============
import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import Newsletter from '../components/Newsletter'

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 py-16">
        <div className='text-center mb-12'>
          <Title text1={'ABOUT'} text2={'US'} />
        </div>

        <div className='flex flex-col md:flex-row gap-12 items-center mb-16'>
          <div className="w-full md:w-1/2">
            <img 
              className='w-full rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500' 
              src={assets.about_img} 
              alt="About Us" 
            />
          </div>
          <div className='flex flex-col justify-center gap-6 md:w-1/2'>
            <p className='text-gray-700 text-lg leading-relaxed'>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Tenetur, ipsum sed. Nam maxime, consequatur saepe illo qui iusto quisquam autem nesciunt nulla voluptate hic eius ipsum neque aperiam atque optio.
            </p>
            <p className='text-gray-700 text-lg leading-relaxed'>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptatem temporibus dolore nam, soluta, ducimus sapiente est quos maxime itaque, vero unde consequatur sint blanditiis quisquam cum eaque quidem iusto voluptates?
            </p>
            <div className="mt-4">
              <h3 className='text-2xl font-serif text-pink-500 mb-3 flex items-center gap-2'>
                <span className="w-1 h-6 bg-pink-500 rounded"></span>
                Our Mission
              </h3>
              <p className='text-gray-700 text-lg leading-relaxed'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit pariatur eos odit nisi enim quod quisquam harum odio culpa, laboriosam beatae corrupti ipsam sequi nesciunt similique doloribus atque illo ea!
              </p>
            </div>
          </div>
        </div>

        <div className='text-center mb-8'>
          <Title text1={'WHY'} text2={'CHOOSE US'}/>
        </div>

        <div className='grid md:grid-cols-3 gap-6 mb-16'>
          <div className='bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100'>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>Quality Assurance</h3>
            <p className='text-gray-600 text-center leading-relaxed'>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Soluta velit odit aliquam perspiciatis et libero, architecto necessitatibus? Quos obcaecati sint at cumque!
            </p>
          </div>

          <div className='bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100'>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>Convenience</h3>
            <p className='text-gray-600 text-center leading-relaxed'>
              Velit odit aliquam perspiciatis et libero, architecto necessitatibus? Quos obcaecati sint at cumque! Rem at sapiente perferendis officiis inventore.
            </p>
          </div>

          <div className='bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100'>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3 text-center'>Exceptional Customer Service</h3>
            <p className='text-gray-600 text-center leading-relaxed'>
              Adipisicing elit. Soluta velit odit aliquam perspiciatis et libero, architecto necessitatibus? Quos obcaecati sint at cumque!
            </p>
          </div>
        </div>

        <Newsletter/>
      </div>
    </div>
  )
}

export default About