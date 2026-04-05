import { useContext } from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const ProductItem = ({ id, name, price, image, variants }) => {
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    token,
  } = useContext(ShopContext);

  // 👉 Default variant (first color + first size)
  const defaultColor = variants?.[0]?.color;
  const defaultSize = variants?.[0]?.sizes?.[0]?.size;

  const liked =
    defaultColor &&
    defaultSize &&
    isInWishlist(id, defaultColor, defaultSize);

  /* ================= WISHLIST HANDLER ================= */
  const handleWishlist = (e) => {
    e.preventDefault(); // ⛔ stop navigation
    e.stopPropagation();

    if (!defaultColor || !defaultSize) {
      toast.error("Product unavailable");
      return;
    }

    if (liked) {
      removeFromWishlist(id, defaultColor, defaultSize);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(id, defaultColor, defaultSize);
      toast.success("Added to wishlist ❤️");
    }
  };

  return (
    <Link
      to={`/product/${id}`}
      className="border rounded-lg overflow-hidden block hover:shadow-lg transition relative"
    >
      {/* ❤️ Wishlist Icon – only for logged-in users */}
      {token && (
      <button
        onClick={handleWishlist}
        className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow"
      >
        {liked ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-600" />
        )}
      </button>
      )}

      {/* Image */}
      <div className="w-full aspect-[3/4] bg-gray-100">
        <img
          src={image || assets.placeholder_image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = assets.placeholder_image;
          }}
        />
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        <p className="text-sm font-medium truncate">{name}</p>
        {token ? (
          <p className="font-semibold">₹{price}</p>
        ) : (
          <p className="text-xs text-gray-400 italic">Login to see price</p>
        )}
      </div>
    </Link>
  );
};

ProductItem.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  image: PropTypes.string,
  variants: PropTypes.array,
};

export default ProductItem;
