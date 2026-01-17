import React, { useContext, useEffect, useState, useRef } from "react";
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

  /* ===== Preview & Zoom ===== */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [showZoomHint, setShowZoomHint] = useState(false);

  /* ================= LOAD PRODUCT ================= */
  useEffect(() => {
    const product = products.find((p) => p._id === productId);

    if (product && product.variants?.length) {
      setProductData(product);
      setSelectedVariant(product.variants[0]);
      setSelectedImage(product.variants[0].images?.[0] || "");
    }
  }, [productId, products]);

  if (!productData || !selectedVariant) {
    return <div className="min-h-screen" />;
  }

  const selectedPrice = Number(selectedVariant.price || 0);

  /* ================= CART (ADD 1 PACK ONLY) ================= */
  const handleAddToCart = () => {
    if (Number(selectedVariant.stock || 0) <= 0) {
      toast.error("Out of stock");
      return;
    }

    // ✅ IMPORTANT: send variant info also
    addToCart(productData._id, selectedVariant.color, selectedVariant.type);

    toast.success("Pack added to cart 🛒");
  };

  /* ================= WISHLIST ================= */
  const liked = isInWishlist(productData._id, selectedVariant.color);

  const handleWishlist = () => {
    if (liked) {
      removeFromWishlist(productData._id, selectedVariant.color);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(productData._id, selectedVariant.color);
      toast.success("Added to wishlist ❤️");
    }
  };

  /* ================= IMAGE ZOOM ================= */
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2.5);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const startDrag = (e) => {
    if (zoom === 1) return;
    setIsDragging(true);
    const p = e.touches ? e.touches[0] : e;
    dragStart.current = {
      x: p.clientX - position.x,
      y: p.clientY - position.y,
    };
  };

  const onDrag = (e) => {
    if (!isDragging || zoom === 1) return;
    const p = e.touches ? e.touches[0] : e;
    setPosition({
      x: p.clientX - dragStart.current.x,
      y: p.clientY - dragStart.current.y,
    });
  };

  const endDrag = () => setIsDragging(false);

  const closePreview = () => {
    setIsPreviewOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="border-t pt-10 px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
          {/* ================= IMAGES ================= */}
          <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 sm:w-[20%]">
              {(selectedVariant.images || []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 sm:w-full aspect-square rounded-lg border-2 ${
                    selectedImage === img
                      ? "border-pink-500 ring-2 ring-pink-200"
                      : "border-gray-200"
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="w-full sm:w-[80%] bg-white rounded-2xl shadow-lg overflow-hidden">
              <img
                src={selectedImage || assets.placeholder_image}
                alt={productData.name}
                onClick={() => {
                  setIsPreviewOpen(true);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                  setShowZoomHint(true);
                  setTimeout(() => setShowZoomHint(false), 2000);
                }}
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </div>
          </div>

          {/* ================= INFO ================= */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex justify-between mb-2">
              <h1 className="text-3xl font-serif">{productData.name}</h1>

              <button
                onClick={handleWishlist}
                className="w-12 h-12 rounded-full flex items-center justify-center bg-pink-50 hover:scale-110 transition"
              >
                {liked ? (
                  <FaHeart className="text-pink-500 text-2xl" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-2xl" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              <b>Type:</b> {selectedVariant.type}
            </p>

            <p className="text-4xl font-bold text-pink-500 mb-2">
              {currency}
              {selectedPrice}
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Stock:{" "}
              <span className="font-semibold">
                {Number(selectedVariant.stock || 0) > 0
                  ? selectedVariant.stock
                  : "Out of stock"}
              </span>
            </p>

            <p className="text-gray-600 leading-relaxed mb-8">
              {productData.description}
            </p>

            {/* COLORS */}
            <div className="mb-6">
              <p className="font-semibold mb-2">Select Color</p>
              <div className="flex gap-3 flex-wrap">
                {productData.variants.map((v) => (
                  <button
                    key={`${v.color}-${v.type}`}
                    onClick={() => {
                      setSelectedVariant(v);
                      setSelectedImage(v.images?.[0] || "");
                    }}
                    className={`px-4 py-2 border rounded-lg ${
                      v.color === selectedVariant.color
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200"
                    }`}
                  >
                    {v.color}
                  </button>
                ))}
              </div>
            </div>

            {/* PACK SIZES */}
            <div className="mb-8">
              <p className="font-semibold mb-2">Pack Includes Sizes</p>

              <div className="flex gap-3 flex-wrap">
                {(selectedVariant.sizes || []).map((size) => (
                  <span
                    key={size}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Wholesale Pack: all sizes are included automatically.
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={Number(selectedVariant.stock || 0) <= 0}
              className={`w-full py-4 rounded-xl font-semibold text-white transition ${
                Number(selectedVariant.stock || 0) <= 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-rose-500"
              }`}
            >
              ADD PACK TO CART
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

      {/* ================= IMAGE PREVIEW ================= */}
      {isPreviewOpen && (
        <div
          onClick={closePreview}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[85vh] overflow-hidden flex items-center justify-center"
          >
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 hover:bg-red-50 hover:text-red-500"
            >
              ×
            </button>

            {showZoomHint && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                Double tap to zoom
              </div>
            )}

            <img
              src={selectedImage}
              onDoubleClick={handleDoubleClick}
              onMouseDown={startDrag}
              onMouseMove={onDrag}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={startDrag}
              onTouchMove={onDrag}
              onTouchEnd={endDrag}
              className="select-none max-w-full max-h-full object-contain"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.2s ease",
                touchAction: "none",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
