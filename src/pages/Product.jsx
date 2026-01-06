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
    selectedVariant.sizes.find((s) => s.size === selectedSize)?.price ??
    selectedVariant.sizes[0]?.price ??
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
    isInWishlist(
      productData._id,
      selectedVariant.color,
      selectedSize
    );

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
    <div className="border-t pt-10 px-4 md:px-10">
      <div className="flex flex-col sm:flex-row gap-12">

        {/* ================= IMAGES ================= */}
        <div className="flex-1 flex flex-col-reverse sm:flex-row gap-3">
          <div className="flex sm:flex-col gap-2 sm:w-[20%]">
            {(selectedVariant.images || []).map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-20 sm:w-full cursor-pointer border ${
                  selectedImage === img ? "border-black" : ""
                }`}
                onError={(e) => {
                  e.target.src = assets.placeholder_image;
                }}
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img
              src={selectedImage || assets.placeholder_image}
              alt={productData.name}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="flex-1">

          {/* Title + Wishlist */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">
              {productData.name}
            </h1>

            <button
              onClick={handleWishlist}
              disabled={!selectedSize}
              className={`text-xl ${
                !selectedSize ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {liked ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          </div>

          {/* Price */}
          <p className="mt-5 text-3xl font-bold">
            {currency}
            {selectedPrice}
          </p>

          {/* Description */}
          <p className="mt-4 text-gray-600">
            {productData.description}
          </p>

          {/* ================= COLORS ================= */}
          <div className="mt-6">
            <p className="mb-2 font-medium">Select Color</p>
            <div className="flex gap-3 flex-wrap">
              {productData.variants.map((variant, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setSelectedImage(variant.images?.[0] || "");
                    setSelectedSize(null);
                  }}
                  className={`px-4 py-2 border ${
                    variant.color === selectedVariant.color
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                >
                  {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* ================= SIZES ================= */}
          <div className="mt-6">
            <p className="mb-2 font-medium">Select Size</p>
            <div className="flex gap-3 flex-wrap">
              {selectedVariant.sizes.map((s) => (
                <button
                  key={s.size}
                  disabled={s.stock === 0}
                  onClick={() => setSelectedSize(s.size)}
                  className={`px-4 py-2 border ${
                    selectedSize === s.size
                      ? "border-orange-500"
                      : "border-gray-300"
                  } ${
                    s.stock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* ================= ADD TO CART ================= */}
          <button
            onClick={handleAddToCart}
            className="mt-8 bg-black text-white px-8 py-3 text-sm"
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
  );
};

export default Product;
