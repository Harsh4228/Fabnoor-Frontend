// ============= Wishlist.jsx =============
import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import Title from "../components/Title";

const Wishlist = () => {
  const { wishlist = [], removeFromWishlist } = useContext(ShopContext);

  // ✅ SAFETY: Ensure wishlist is always an array
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  if (safeWishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
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
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <Title text1="MY" text2="WISHLIST" />
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeWishlist.map((item, index) => {
            // ✅ SAFETY GUARDS
            const product = item?.productId;
            const image =
              product?.variants?.[0]?.images?.[0];

            if (!product) return null;

            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                {/* Remove Button */}
                <button
                  onClick={() =>
                    removeFromWishlist(
                      product._id,
                      item.color,
                      item.size
                    )
                  }
                  className="absolute top-3 right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 hover:text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <Link to={`/product/${product._id}`}>
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
                    <img
                      src={image || "/placeholder.png"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={product.name}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <button className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 bg-white text-pink-500 text-sm rounded-full font-semibold hover:bg-pink-500 hover:text-white">
                      View Product
                    </button>
                  </div>
                </Link>

                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-pink-500">
                    {product.name}
                  </h2>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium">
                      {item.color}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      Size: {item.size}
                    </span>
                  </div>

                  <Link
                    to={`/product/${product._id}`}
                    className="block w-full py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 text-sm"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
