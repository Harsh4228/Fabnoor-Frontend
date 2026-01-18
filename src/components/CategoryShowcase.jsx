import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const CategoryShowcase = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!p.category || map[p.category]) return;
      map[p.category] = {
        name: p.category,
        image: p?.variants?.[0]?.images?.[0] || assets.placeholder_image,
      };
    });
    return Object.values(map);
  }, [products]);

  return (
    <section className="my-10 md:my-12 py-6 md:py-8 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-6 md:w-10 bg-gradient-to-r from-transparent to-rose-300" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-serif text-gray-900">
              SHOP BY <span className="text-rose-500">CATEGORY</span>
            </h2>
            <div className="h-px w-6 md:w-10 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed for every occasion
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-3 px-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/collection?category=${cat.name}`)}
              className="min-w-[90px] md:min-w-[100px] text-center cursor-pointer group"
            >
              {/* Image */}
              <div className="relative mx-auto mb-2">
                {/* Glow */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-rose-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-105 blur-md" />

                {/* Small Rectangle Card */}
                <div className="relative w-24 h-32 md:w-28 md:h-36 mx-auto rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:border-rose-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Small Arrow Icon */}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-rose-500 rounded-md shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Name */}
              <p className="text-xs md:text-sm font-medium text-gray-800 group-hover:text-rose-500 transition-colors capitalize">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CategoryShowcase;
