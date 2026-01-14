import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/Relatedproducts";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";

const Product = () => {
  const { productId } = useParams();

  const {
    products,
    currency,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  // 🔹 NEW: image preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const product = products.find((p) => p._id === productId);

    if (product && product.variants?.length) {
      setProductData(product);
      setSelectedVariant(product.variants[0]);
      setSelectedImage(product.variants[0].images?.[0] || "");
      setSelectedSize(null);
    }
  }, [productId, products]);

  if (!productData || !selectedVariant) {
    return <div className="min-h-screen" />;
  }

  /* ================= PRICE ================= */
  const selectedPrice =
    selectedVariant.sizes?.find((s) => s.size === selectedSize)?.price ??
    selectedVariant.sizes?.[0]?.price ??
    0;

  /* ================= ADD TO CART ================= */
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    addToCart(productData._id, selectedSize);
    toast.success("Added to cart");
  };

  /* ================= WISHLIST ================= */
  const liked =
    selectedSize &&
    isInWishlist(productData._id, selectedVariant.color, selectedSize);

  const handleWishlist = () => {
    if (!selectedSize) {
      toast.error("Select size to add wishlist");
      return;
    }

    if (liked) {
      removeFromWishlist(
        productData._id,
        selectedVariant.color,
        selectedSize
      );
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(
        productData._id,
        selectedVariant.color,
        selectedSize
      );
      toast.success("Added to wishlist ❤️");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="border-t pt-10 px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

          {/* ================= IMAGES ================= */}
          <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 sm:w-[20%]">
              {(selectedVariant.images || []).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 sm:w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === img
                      ? "border-pink-500 ring-2 ring-pink-200"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = assets.placeholder_image;
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="w-full sm:w-[80%] bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative aspect-[3/4]">
                <img
                  src={selectedImage || assets.placeholder_image}
                  alt={productData.name}
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in"
                />
              </div>
            </div>
          </div>

          {/* ================= INFO ================= */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8">

            {/* Title + Wishlist */}
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-serif text-gray-900 flex-1 pr-4">
                {productData.name}
              </h1>

              <button
                onClick={handleWishlist}
                disabled={!selectedSize}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  !selectedSize
                    ? "bg-gray-100 opacity-40 cursor-not-allowed"
                    : "bg-pink-50 hover:bg-pink-100 hover:scale-110"
                }`}
              >
                {liked ? (
                  <FaHeart className="text-2xl text-pink-500" />
                ) : (
                  <FaRegHeart className="text-2xl text-gray-600" />
                )}
              </button>
            </div>

            {/* TYPE */}
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold text-gray-800">Type:</span>{" "}
              {selectedVariant.type}
            </p>

            {/* Price */}
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
              <p className="text-4xl font-bold text-pink-500">
                {currency}
                {selectedPrice}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8 text-base">
              {productData.description}
            </p>

            {/* COLORS */}
            <div className="mb-8">
              <p className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-pink-500 rounded"></span>
                Select Color
              </p>
              <div className="flex gap-3 flex-wrap">
                {productData.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setSelectedImage(variant.images?.[0] || "");
                      setSelectedSize(null);
                    }}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-300 ${
                      variant.color === selectedVariant.color
                        ? "border-pink-500 bg-pink-50 text-pink-600 shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>

            {/* SIZES */}
            <div className="mb-8">
              <p className="mb-3 font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-5 bg-pink-500 rounded"></span>
                Select Size
              </p>
              <div className="flex gap-3 flex-wrap">
                {selectedVariant.sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-300 ${
                      selectedSize === s.size
                        ? "border-pink-500 bg-pink-50 text-pink-600 shadow-md"
                        : s.stock === 0
                        ? "border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed line-through"
                        : "border-gray-200 text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    {s.size}
                    {s.stock === 0 && (
                      <span className="ml-2 text-xs">(Out of Stock)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl text-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              ADD TO CART
            </button>
          </div>
        </div>

        <div className="mt-20">
          <RelatedProducts
            category={productData.category}
            subCategory={productData.subCategory}
          />
        </div>
      </div>

      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {isPreviewOpen && (
        <div
          onClick={() => setIsPreviewOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full px-4"
          >
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-10 right-2 text-white text-3xl font-bold"
            >
              ×
            </button>

            <img
              src={selectedImage || assets.placeholder_image}
              className="w-full max-h-[85vh] object-contain rounded-xl bg-white"
              alt="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
