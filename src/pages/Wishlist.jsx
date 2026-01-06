import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useContext(ShopContext);

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Your wishlist is empty ❤️
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 py-10">
      <h1 className="text-2xl font-semibold mb-6">My Wishlist</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((item, index) => (
          <div key={index} className="border p-4 relative">

            <Link to={`/product/${item.productId._id}`}>
              <img
                src={item.productId.variants[0].images[0]}
                className="w-full h-64 object-cover"
                alt=""
              />
            </Link>

            <h2 className="mt-3 font-medium">
              {item.productId.name}
            </h2>

            <p className="text-sm text-gray-500">
              Color: {item.color} | Size: {item.size}
            </p>

            <button
              onClick={() =>
                removeFromWishlist(
                  item.productId._id,
                  item.color,
                  item.size
                )
              }
              className="absolute top-2 right-2 text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
