import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import Title from "../components/Title";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const context = useContext(ShopContext);

  // ✅ Ensure these exist
  const wishlist = context?.wishlist;
  const removeFromWishlist = context?.removeFromWishlist;

  // ✅ always convert to array
  const safeWishlist = useMemo(() => {
    if (Array.isArray(wishlist)) return wishlist;
    return [];
  }, [wishlist]);

  // ✅ EMPTY WISHLIST UI
  if (safeWishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-16 h-16 text-pink-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <p className="text-gray-500 text-xl mb-2">
            Your wishlist is empty ❤️
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Add items you love to your wishlist
          </p>

          <Link
            to="/collection"
            className="inline-block w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  // ✅ WISHLIST ITEMS UI
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <Title text1="MY" text2="WISHLIST" />
          <p className="text-gray-500 text-xs md:text-sm mt-2">
            You have {safeWishlist.length} items in your wishlist
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {safeWishlist.map((item, index) => {
            const product = item?.productId;
            if (!product) return null;

            // Find the correct variant
            const variant = product.variants?.find(v => v.color === item.color) || product.variants?.[0];

            return (
              <ProductCard 
                key={`${product._id}-${item.color}-${index}`} 
                item={product} 
                variant={variant} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
