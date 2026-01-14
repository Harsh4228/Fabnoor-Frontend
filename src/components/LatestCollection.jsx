import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  const [wishlist, setWishlist] = useState({});

  useEffect(() => {
    if (products?.length) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setLatestProducts(shuffled.slice(0, 6));
    }
  }, [products]);

  const getImage = (p) =>
    p?.variants?.[0]?.images?.[0] || assets.placeholder_image;

  const getPrice = (p) =>
    p?.variants?.[0]?.sizes?.[0]?.price || 0;

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="my-12 md:my-16 py-8 md:py-12 bg-white">
      {/* Title Section */}
      <div className="text-center pb-8 md:pb-12 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-rose-300" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900">
              LATEST <span className="text-rose-500">COLLECTION</span>
            </h2>
            <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
          Discover the latest trends, fresh styles, and exclusive picks designed just for you
        </p>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {latestProducts.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`}
              className="group"
            >
              {/* Product Card */}
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-50 mb-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-pink-100">
                {/* New Badge */}
                <div className="absolute top-2 md:top-3 left-2 md:left-3 z-10">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] md:text-xs font-medium px-2 md:px-3 py-1 rounded-full shadow-md">
                    NEW
                  </span>
                </div>

                {/* Wishlist Button */}
                {/* <button
                  onClick={(e) => toggleWishlist(item._id, e)}
                  className="absolute top-2 md:top-3 right-2 md:right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 md:p-2 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-md group/wishlist"
                >
                  {wishlist[item._id] ? (
                    <FaHeart className="w-3 h-3 md:w-4 md:h-4 text-rose-500 group-hover/wishlist:text-white" />
                  ) : (
                    <FaRegHeart className="w-3 h-3 md:w-4 md:h-4" />
                  )}
                </button> */}

                {/* Product Image */}
                <div className="w-full h-48 md:h-56 overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick View Button */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="bg-white/95 backdrop-blur-sm p-2 text-center">
                    <span className="text-xs text-rose-500 font-medium">Quick View</span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="text-center px-1">
                <h3 className="text-xs md:text-sm font-medium text-gray-800 mb-1 truncate group-hover:text-rose-500 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm md:text-base font-serif text-rose-500">
                  ₹{getPrice(item).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-sm md:text-base">EXPLORE ALL PRODUCTS</span>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestCollection;