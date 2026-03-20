import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";
import ProductCard from "./ProductCard";
import axios from "axios";

import PropTypes from 'prop-types';

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const { getProductDiscount, addProductsToCache } = useContext(ShopContext);
  const [related, setRelated] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/list`, {
          params: { category, subCategory, limit: 6 }
        });
        if (data.success && data.products) {
          addProductsToCache(data.products);
          const filtered = data.products.filter(item => item._id !== currentProductId);
          setRelated(filtered.slice(0, 5));
        }
      } catch (err) {
        console.error("Related fetch error", err);
      }
    };

    if (category && subCategory) {
      fetchRelated();
    }
  }, [category, subCategory, currentProductId, backendUrl]);

  /* IMAGE FROM VARIANT */
  const getImage = (product) =>
    product?.variants?.[0]?.images?.[0] || assets.logo;



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
            related.flatMap((item) =>
              (item.variants || []).map((variant) => {
                const variantImage = variant.images?.[0] || assets.logo;
                const linkTo = `/product/${item._id}?color=${encodeURIComponent(variant.color || "")}&code=${encodeURIComponent(variant.code || "")}`;
                return (
                  <ProductCard
                    key={`${item._id}-${variant.code || variant.color}`}
                    item={item}
                    variant={variant}
                    tag={item.bestseller ? "BESTSELLER" : ""}
                  />
                );
              })
            )
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
