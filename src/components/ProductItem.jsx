import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, price}) => {
    const {currency} = useContext(ShopContext);
    const [isWished, setIsWished] = useState(false);
    
    // Check if image exists and if it is an array
    const imageUrl = image && Array.isArray(image) && image.length > 0 ? image[0] : '';

    return (
        <Link className='group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100' to={`/product/${id}`}>
            
            {/* Wishlist Button */}
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    setIsWished(!isWished);
                }}
                className='absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300'
            >
                <svg 
                    className={`w-5 h-5 ${isWished ? 'fill-pink-500 stroke-pink-500' : 'fill-none stroke-gray-600'}`} 
                    viewBox="0 0 24 24" 
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>

            {/* Product Image */}
            <div className='relative overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50'>
                {imageUrl ? (
                    <img
                        className='w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                        src={imageUrl}
                        alt={name}
                    />
                ) : (
                    <div className='w-full h-72 bg-gray-200 flex items-center justify-center'>
                        <p className='text-gray-400 text-sm'>No Image</p>
                    </div>
                )}
                
                {/* Overlay on Hover */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
            </div>

            {/* Product Info */}
            <div className='p-4'>
                <p className='text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-pink-500 transition-colors duration-300'>{name}</p>
                <div className='flex items-center justify-between'>
                    <p className='text-lg font-bold text-pink-500'>{currency}{price}</p>
                    <button className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 py-1.5 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600'>
                        View
                    </button>
                </div>
            </div>
        </Link>
    )
}

export default ProductItem