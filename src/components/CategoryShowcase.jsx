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
    <section className="my-12 md:my-16 py-8 md:py-12 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-rose-300" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900">
              SHOP BY <span className="text-rose-500">CATEGORY</span>
            </h2>
            <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed for every occasion
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide pb-4 px-2">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => navigate(`/collection?category=${cat.name}`)}
              className="min-w-[130px] md:min-w-[150px] text-center cursor-pointer group"
            >
              {/* Image */}
              <div className="relative mx-auto mb-4">
                {/* Glow (RECTANGLE) */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-200 to-pink-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-105 blur-md" />

                {/* RECTANGLE CARD */}
                <div className="relative w-36 h-52 md:w-44 md:h-64 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:border-rose-300 transition-all duration-300 shadow-md group-hover:shadow-xl">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Arrow Icon */}
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-rose-500 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
              <p className="text-sm md:text-base font-medium text-gray-800 group-hover:text-rose-500 transition-colors capitalize">
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
