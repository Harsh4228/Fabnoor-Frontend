import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";
import ProductCard from "./ProductCard";
import axios from "axios";

const BestSeller = () => {
  const { getProductDiscount, addProductsToCache } = useContext(ShopContext);
  const [bestSellers, setBestSellers] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/list`, {
          params: { bestseller: "true", limit: 6 }
        });
        if (data.success && data.products) {
          setBestSellers(data.products);
          addProductsToCache(data.products);
        }
      } catch (err) {
        console.error("Bestseller fetch error", err);
      }
    };
    fetchBestSellers();
  }, [backendUrl]);

  const getImage = (p) =>
    p?.variants?.[0]?.images?.[0] || assets.placeholder_image;



  return (
    <section className="my-12 md:my-16 py-8 md:py-12 bg-gradient-to-b from-white to-pink-50/10">
      {/* Title Section */}
      <div className="text-center pb-8 md:pb-12 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-rose-300" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900">
            BEST <span className="text-rose-500">SELLER</span>
          </h2>
          <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-rose-300" />
        </div>
        <p className="mt-3 text-sm md:text-base text-gray-600 max-w-xl mx-auto">
          Discover our most-loved pieces, handpicked by customers who embraced their style
        </p>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {bestSellers.flatMap((item) =>
            (item.variants || []).map((variant) => {
              const variantImage = variant.images?.[0] || assets.placeholder_image;
              const linkTo = `/product/${item._id}?color=${encodeURIComponent(variant.color || "")}&code=${encodeURIComponent(variant.code || "")}`;
              return (
                <ProductCard
                  key={`${item._id}-${variant.code || variant.color}`}
                  item={item}
                  variant={variant}
                  tag="BESTSELLER"
                />
              );
            })
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 md:mt-12">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-sm md:text-base">VIEW ALL COLLECTION</span>
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;