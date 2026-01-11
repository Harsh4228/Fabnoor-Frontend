import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(
        (item) => item.category === category && item.subCategory === subCategory
      );
      setRelated(filtered.slice(0, 5));
    }
  }, [products, category, subCategory]);

  // ✅ IMAGE FROM VARIANT
  const getImage = (product) => {
    return product?.variants?.[0]?.images?.[0] || assets.placeholder_image;
  };

  // ✅ PRICE FROM VARIANT
  const getPrice = (product) => {
    return product?.variants?.[0]?.sizes?.[0]?.price || 0;
  };

  return (
    <div className="my-24 bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-serif text-gray-900">RELATED</h2>
            <span className="text-3xl font-serif text-pink-500">PRODUCTS</span>
          </div>
          <div className="w-16 h-0.5 bg-pink-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {related.length > 0 ? (
            related.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                {/* IMAGE */}
                <div className="relative w-full h-52 bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = assets.placeholder_image;
                    }}
                  />
                  
                  {/* Overlay on Hover */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                  
                  {/* Quick View Button */}
                  <button className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 bg-white text-pink-500 text-sm rounded-full font-semibold hover:bg-pink-500 hover:text-white">
                    Quick View
                  </button>
                </div>

                {/* INFO */}
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-pink-500 transition-colors duration-300 mb-2">
                    {item.name}
                  </p>
                  <p className="text-lg font-bold text-pink-500">₹{getPrice(item)}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-5 text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;