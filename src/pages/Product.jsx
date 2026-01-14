import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
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

  /* ===== Preview & Zoom (ADDITIVE ONLY) ===== */
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

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

  /* ================= CART ================= */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="border-t pt-10 px-4 md:px-10">
        <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">

          {/* ================= IMAGES ================= */}
          <div className="flex-1 flex flex-col-reverse sm:flex-row gap-4">
            <div className="flex sm:flex-col gap-3 sm:w-[20%]">
              {selectedVariant.images.map((img, i) => (
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
                }}
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </div>
          </div>

          {/* ================= INFO ================= */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8">

            {/* TITLE + WISHLIST */}
            <div className="flex justify-between mb-2">
              <h1 className="text-3xl font-serif">{productData.name}</h1>
              <button
                onClick={handleWishlist}
                disabled={!selectedSize}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  !selectedSize
                    ? "bg-gray-100 opacity-40"
                    : "bg-pink-50 hover:scale-110"
                }`}
              >
                {liked ? (
                  <FaHeart className="text-pink-500 text-2xl" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-2xl" />
                )}
              </button>
            </div>

            {/* TYPE */}
            <p className="text-sm text-gray-600 mb-4">
              <b>Type:</b> {selectedVariant.type}
            </p>

            {/* PRICE */}
            <p className="text-4xl font-bold text-pink-500 mb-6">
              {currency}
              {selectedPrice}
            </p>

            {/* ✅ DESCRIPTION (RESTORED & VERIFIED) */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {productData.description}
            </p>

            {/* COLORS */}
            <div className="mb-6">
              <p className="font-semibold mb-2">Select Color</p>
              <div className="flex gap-3 flex-wrap">
                {productData.variants.map((v) => (
                  <button
                    key={v.color}
                    onClick={() => {
                      setSelectedVariant(v);
                      setSelectedImage(v.images[0]);
                      setSelectedSize(null);
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

            {/* SIZES */}
            <div className="mb-8">
              <p className="font-semibold mb-2">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {selectedVariant.sizes.map((s) => (
                  <button
                    key={s.size}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-4 py-2 border rounded-lg ${
                      selectedSize === s.size
                        ? "border-pink-500 bg-pink-50"
                        : s.stock === 0
                        ? "opacity-40 cursor-not-allowed"
                        : "border-gray-200"
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold"
            >
              ADD TO CART
            </button>
          </div>
        </div>

        {/* RELATED */}
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
          onClick={() => {
            setIsPreviewOpen(false);
            setZoom(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl h-[85vh] overflow-hidden flex items-center justify-center"
          >
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
                transformOrigin: "center center",
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
