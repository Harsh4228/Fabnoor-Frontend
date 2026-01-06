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
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.length > 0 ? (
          related.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`}
              className="border p-2 hover:shadow"
            >
              {/* IMAGE */}
              <div className="w-full h-52 bg-gray-100 overflow-hidden">
                <img
                  src={getImage(item)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = assets.placeholder_image;
                  }}
                />
              </div>

              {/* INFO */}
              <div className="pt-2">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-sm text-gray-600">₹{getPrice(item)}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center col-span-5 text-gray-500">
            No related products found.
          </p>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
