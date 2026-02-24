import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";

import PropTypes from 'prop-types';

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const { products, setSearch, setShowSearch } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(
        (item) =>
          item.category === category &&
          item.subCategory === subCategory &&
          item._id !== currentProductId
      );

      setRelated(filtered.slice(0, 5));
    }
  }, [products, category, subCategory, currentProductId]);

  /* IMAGE FROM VARIANT */
  const getImage = (product) =>
    product?.variants?.[0]?.images?.[0] || assets.placeholder_image;



  const handleClick = () => {
    // ✅ clear any filter/search state
    setSearch("");
    setShowSearch(false);

    // ✅ scroll top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="my-24 bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4">
        {/* TITLE */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <h2 className="text-3xl font-serif text-gray-900">RELATED</h2>
            <span className="text-3xl font-serif text-pink-500">PRODUCTS</span>
          </div>
          <div className="w-16 h-0.5 bg-pink-500 mx-auto"></div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {related.length > 0 ? (
            related.map((item) => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                onClick={handleClick}
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

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Quick View */}
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 px-4 py-2 bg-white text-pink-500 text-sm rounded-full font-semibold hover:bg-pink-500 hover:text-white">
                    Quick View
                  </span>
                </div>

                {/* INFO */}
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-pink-500 transition-colors mb-2">
                    {item.name}
                  </p>
                  <p className="text-lg font-bold text-pink-500">
                    <span className="font-semibold">₹{formatNumber(getPerPiecePrice(item))}</span>
                    <span className="text-sm text-gray-500 ml-2">(Full Set) ₹{formatNumber(getPackPrice(item))}</span>
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-5 text-center py-12">
              <p className="text-gray-500 text-lg">No related products found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RelatedProducts.propTypes = {
  category: PropTypes.string,
  subCategory: PropTypes.string,
  currentProductId: PropTypes.string,
};

export default RelatedProducts;
