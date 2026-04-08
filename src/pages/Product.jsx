import { useContext, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import {
  FaHeart,
  FaRegHeart,
  FaShieldAlt,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { formatNumber } from "../utils/price";
import axios from "axios";
import SetInfo from "../components/SetInfo";

const SIZE_ORDER = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "Free Size",
];
const sortSizes = (sizes) =>
  [...(sizes || [])].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );

const StarRating = ({ rating, size = "text-base" }) => (
  <div className={`flex gap-0.5 ${size}`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}
      >
        ★
      </span>
    ))}
  </div>
);

const Product = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();

  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    navigate,
    setShowCartDrawer,
    getProductDiscount,
    addProductsToCache,
    token,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showZoomHint, setShowZoomHint] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastWheelRef = useRef(0);
  const touchStartX = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/product/${productId}`,
        );
        if (data.success && data.product) {
          const product = data.product;
          if (product && product.variants?.length) {
            setProductData(product);
            // Auto-select variant from URL params (?color=&code=)
            const urlCode = searchParams.get("code");
            const urlColor = searchParams.get("color");
            const matched =
              (urlCode && product.variants.find((v) => v.code === urlCode)) ||
              (urlColor &&
                product.variants.find((v) => v.color === urlColor)) ||
              product.variants[0];
            setSelectedVariant(matched);
            setSelectedImageIndex(0);
            setSelectedImage(matched.images?.[0] || "");
            if (addProductsToCache) addProductsToCache([product]);
          }
        }
      } catch {
        toast.error("Failed to load product details");
      }
    };
    if (productId) fetchProduct();
  }, [productId, backendUrl, addProductsToCache]);

  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(
          `${backendUrl}/api/review/product/${productId}`,
        );
        if (res.data.success) {
          setReviews(res.data.reviews || []);
          setAvgRating(res.data.avgRating || 0);
          setReviewsTotal(res.data.total || 0);
        }
      } catch {
        /* silent */
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [productId, backendUrl]);

  useEffect(() => {
    if (!selectedVariant) return;
    const imgs = selectedVariant.images || [];
    const idx = Math.min(
      Math.max(0, selectedImageIndex),
      Math.max(0, imgs.length - 1),
    );
    setSelectedImage(imgs[idx] || "");
  }, [selectedVariant, selectedImageIndex]);

  const prevImage = () => {
    const imgs = selectedVariant?.images || [];
    if (!imgs.length) return;
    setSelectedImageIndex((s) => (s - 1 + imgs.length) % imgs.length);
  };

  const nextImage = () => {
    const imgs = selectedVariant?.images || [];
    if (!imgs.length) return;
    setSelectedImageIndex((s) => (s + 1) % imgs.length);
  };

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 180) return;
    lastWheelRef.current = now;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 0) nextImage();
    else if (delta < 0) prevImage();
  };

  const handleKey = (e) => {
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedVariant]);

  if (!productData || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const sizesArr = sortSizes(selectedVariant?.sizes);
  const discount = getProductDiscount(productData);
  const perPiecePrice = Number(selectedVariant?.price || 0);
  const piecesCount = sizesArr.length || 1;
  const packPrice = perPiecePrice * piecesCount;
  const discountedPerPiece = perPiecePrice * (1 - discount / 100);
  const discountedPack = packPrice * (1 - discount / 100);
  const stock = Number(selectedVariant.stock || 0);
  const images = selectedVariant.images || [];

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    addToCart(
      productData._id,
      selectedVariant.color,
      selectedVariant.fabric,
      selectedVariant.code,
    );
    toast.success("Pack added to cart!");
  };

  const handleBuyNow = async () => {
    if (stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    await addToCart(
      productData._id,
      selectedVariant.color,
      selectedVariant.fabric,
      selectedVariant.code,
    );
    setShowCartDrawer(false);
    navigate("/place-order");
  };

  const liked = isInWishlist(productData._id, selectedVariant.color);
  const handleWishlist = () => {
    if (liked) {
      removeFromWishlist(productData._id, selectedVariant.color);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(productData._id, selectedVariant.color);
      toast.success("Added to wishlist!");
    }
  };

  const handleWhatsAppOrder = () => {
    addToCart(
      productData._id,
      selectedVariant.color,
      selectedVariant.fabric || selectedVariant.type,
      selectedVariant.code,
    );
    navigate("/place-order");
  };

  const handleWhatsAppInquiry = () => {
    const phone = (import.meta.env.VITE_WHATSAPP_NUMBER || "919979624404").replace(/\D/g, "");
    let msg = `Hi! I'm interested in this product:\n\n*${productData.name}*\nColor: ${selectedVariant.color}`;
    if (selectedVariant.fabric) msg += `\nFabric: ${selectedVariant.fabric}`;
    msg += `\nSizes: ${sortSizes(selectedVariant.sizes).join(", ")}`;
    if (token) {
      msg += `\n\nPrice: \u20B9${formatNumber(discountedPerPiece)} per piece`;
      msg += `\nPack Total: \u20B9${formatNumber(discountedPack)}`;
      if (discount > 0) msg += ` (${discount}% off)`;
    }
    msg += `\n\nPlease share more details.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleDoubleClick = () => {
    if (zoom === 1) setZoom(2.5);
    else {
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
    <div className="min-h-screen bg-[#faf9f7] overflow-x-hidden">
      <div className="border-t pt-6 pb-16">
        <div>
          {/* ── MAIN PRODUCT ROW ── */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* ── LEFT: GALLERY ── */}
            <div className="w-full md:w-[46%] flex-shrink-0 min-w-0">
              {/* Main Image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-white shadow-lg group cursor-pointer"
                style={{ aspectRatio: "3/4", width: "100%" }}
                onWheel={handleWheel}
                onTouchStart={(e) =>
                  (touchStartX.current = e.touches?.[0]?.clientX)
                }
                onTouchEnd={(e) => {
                  const endX = e.changedTouches?.[0]?.clientX;
                  if (touchStartX.current == null || endX == null) return;
                  const diff = touchStartX.current - endX;
                  if (Math.abs(diff) > 40) {
                    if (diff > 0) nextImage();
                    else prevImage();
                  }
                  touchStartX.current = null;
                }}
                onClick={() => {
                  setIsPreviewOpen(true);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                  setShowZoomHint(true);
                }}
              >
                {discount > 0 && (
                  <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                    -{discount}% OFF
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlist();
                  }}
                  className="absolute bottom-3 right-3 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  {liked ? (
                    <FaHeart className="text-pink-500 text-base" />
                  ) : (
                    <FaRegHeart className="text-gray-500 text-base" />
                  )}
                </button>

                {stock > 0 && stock < 6 && (
                  <span className="absolute bottom-10 left-3 z-10 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow pointer-events-none">
                    Only {stock} left!
                  </span>
                )}
                {stock === 0 && (
                  <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="bg-white text-gray-800 font-bold text-sm px-5 py-2.5 rounded-full shadow-xl">
                      Out of Stock
                    </span>
                  </div>
                )}

                <img
                  src={selectedImage || assets.placeholder_image}
                  alt={productData.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 shadow hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-700 shadow hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-full transition-all duration-300 ${selectedImageIndex === i ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div
                  className="flex gap-2 mt-3 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`flex-shrink-0 w-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === i ? "border-pink-400 shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                      style={{ aspectRatio: "3/4" }}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              <p className="text-center text-[11px] text-gray-400 mt-2 tracking-wide">
                Tap to expand · Swipe to browse
              </p>
            </div>

            {/* ── RIGHT: INFO ── */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Categories / Breadcrumb */}
              <p className="text-[10px] tracking-[0.1em] text-pink-500 font-bold uppercase mb-2 flex flex-wrap gap-x-2 gap-y-1">
                {(Array.isArray(productData.category)
                  ? productData.category
                  : [productData.category]
                ).map((cat, i) => (
                  <span
                    key={i}
                    className="bg-pink-50 px-2 py-0.5 rounded border border-pink-100"
                  >
                    {cat}
                  </span>
                ))}
                <span className="text-gray-300">/</span>
                {(Array.isArray(productData.subCategory)
                  ? productData.subCategory
                  : [productData.subCategory]
                ).map((sub, i) => (
                  <span key={i} className="text-gray-400">
                    {sub}
                  </span>
                ))}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-2">
                {productData.name}
              </h1>

              {reviewsTotal > 0 && (
                <button
                  onClick={() =>
                    document
                      .getElementById("reviews-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="flex items-center gap-1.5 hover:opacity-80 transition group mb-3 w-fit"
                >
                  <StarRating rating={avgRating} size="text-sm" />
                  <span className="text-sm font-semibold text-gray-700">
                    {avgRating}
                  </span>
                  <span className="text-sm text-pink-500 underline group-hover:text-pink-600">
                    ({formatNumber(reviewsTotal)} reviews)
                  </span>
                </button>
              )}

              <div className="h-px bg-gradient-to-r from-pink-200 via-gray-200 to-transparent mb-4" />

              {/* ── Guest gate ── */}
              {!token && (
                <div className="flex flex-col items-center gap-3 py-8 px-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-gray-700 font-semibold">Login to see price &amp; full product details</p>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="mt-1 px-6 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition"
                  >
                    Login / Sign Up
                  </button>
                  <div className="flex items-center gap-2 w-full mt-1">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                  </div>
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-[#25D366] text-[#25D366] hover:bg-[#f0fdf4] flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <FaWhatsapp className="text-base" />
                    INQUIRE ON WHATSAPP
                  </button>
                </div>
              )}

              {token && (
                <>
              {/* Price */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl px-4 py-3.5 mb-4 border border-pink-100">
                <div className="flex items-end flex-wrap gap-x-2 gap-y-0.5 mb-1">
                  <span className="text-base font-bold text-pink-500 leading-none">
                    ₹
                  </span>
                  <span className="text-3xl font-extrabold text-gray-900 leading-none">
                    {formatNumber(discountedPerPiece)}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm text-gray-400 line-through self-end">
                      ₹{formatNumber(perPiecePrice)}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 self-end">
                    per piece
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <span className="text-sm text-gray-700">
                    Pack Total:{" "}
                    <strong className="text-gray-900">
                      ₹{formatNumber(discountedPack)}
                    </strong>
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{formatNumber(packPrice)}
                      </span>
                      <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        SAVE {discount}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Variants */}
              <div className="mb-6">
                <div className="flex gap-2 flex-wrap">
                  {productData.variants.map((v, idx) => {
                    const isSelected =
                      v.code === selectedVariant.code ||
                      (v.color === selectedVariant.color &&
                        v.fabric === selectedVariant.fabric &&
                        !v.code);
                    return (
                      <button
                        key={v.code || `${v.color}-${idx}`}
                        onClick={() => {
                          setSelectedVariant(v);
                          setSelectedImageIndex(0);
                          setSelectedImage(v.images?.[0] || "");
                        }}
                        className={`flex flex-col items-center w-[66px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${isSelected ? "border-pink-400 shadow-md shadow-pink-100" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <img
                          src={v.images?.[0] || assets.placeholder_image}
                          className="w-full object-contain bg-gray-50"
                          style={{ aspectRatio: "3/4" }}
                          alt={v.color}
                        />
                        <div
                          className={`w-full py-1 text-center ${isSelected ? "bg-pink-500" : "bg-gray-50"}`}
                        >
                          <p
                            className={`text-[9px] truncate px-1 uppercase ${isSelected ? "text-white font-bold" : "text-gray-400 font-medium"}`}
                          >
                            {v.color}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Pack */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    SIZE PACK{" "}
                    <span className="text-gray-400 normal-case font-medium">
                      ({piecesCount} pcs)
                    </span>
                  </p>
                  <SetInfo compact={true} />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {sortSizes(selectedVariant.sizes).map((size) => (
                    <div
                      key={size}
                      className="px-3 py-1.5 bg-gray-50/50 border border-gray-100 rounded-lg text-sm font-medium text-gray-400"
                    >
                      {size}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  One pack contains all sizes listed above
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-pink-200 via-gray-200 to-transparent mb-4" />

              {/* Stock */}
              <div className="mb-4">
                {stock === 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-red-500 font-semibold text-sm">
                      Currently Unavailable
                    </span>
                  </div>
                ) : stock < 6 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
                    <span className="text-amber-600 font-semibold text-sm">
                      Only {stock} packs left — order soon!
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-600 font-semibold text-sm">
                      In Stock · Ready to Ship
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2.5 mb-5">
                <button
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide border-2 transition-all duration-200 ${stock <= 0 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-pink-500 text-pink-600 hover:bg-pink-50 hover:shadow-md"}`}
                >
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={stock <= 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${stock <= 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-200"}`}
                >
                  BUY NOW
                </button>
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 rounded-xl font-bold text-sm tracking-wide border-2 border-[#25D366] text-[#25D366] hover:bg-[#f0fdf4] flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <FaWhatsapp className="text-base" />
                  ORDER ON WHATSAPP
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm overflow-hidden">
                  <FaShieldAlt className="text-pink-400 text-sm flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-600 truncate">
                    Secure Payment
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm overflow-hidden">
                  <FaTruck className="text-pink-400 text-sm flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-600 truncate">
                    Fast Delivery
                  </span>
                </div>
              </div>
                </>
              )}
            </div>
          </div>

          {/* ── TABS ── */}
          {token && <div className="mt-12">
            <div
              className="flex border-b border-gray-200 mb-6 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {["details", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-5 py-2.5 text-sm font-semibold capitalize tracking-wide transition-all duration-200 border-b-2 -mb-px whitespace-nowrap ${activeTab === tab ? "border-pink-500 text-pink-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  {tab === "reviews"
                    ? `Reviews (${reviewsTotal})`
                    : "Product Details"}
                </button>
              ))}
            </div>

            {activeTab === "details" && (
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50 bg-gradient-to-r from-pink-50 to-white">
                    <h2 className="text-sm font-bold text-gray-800">
                      Product Specifications
                    </h2>
                  </div>
                  <div className="px-5 py-3">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-50">
                        {[
                          [
                            "Fabric",
                            selectedVariant.fabric || "Rayon / Cotton",
                          ],
                          ["Color", selectedVariant.color],
                          [
                            "Sizes",
                            sortSizes(selectedVariant.sizes).join(", "),
                          ],
                          ["Pack Size", `${piecesCount} Pieces`],
                          [
                            "Category",
                            `${productData.category} › ${productData.subCategory}`,
                          ],
                          ...(selectedVariant.code
                            ? [["Code", selectedVariant.code]]
                            : []),
                        ].map(([label, value]) => (
                          <tr key={label}>
                            <td className="py-2.5 pr-4 text-gray-500 font-medium whitespace-nowrap text-xs w-24">
                              {label}
                            </td>
                            <td className="py-2.5 text-gray-800 font-semibold capitalize text-sm break-words">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50 bg-gradient-to-r from-pink-50 to-white">
                    <h2 className="text-sm font-bold text-gray-800">
                      About This Item
                    </h2>
                  </div>
                  <ul className="px-5 py-3 space-y-2">
                    {productData.description
                      .split("\n")
                      .filter((l) => l.trim())
                      .map((line, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0 mt-1.5" />
                          <span>{line.trim().replace(/^[-*•]\s*/, "")}</span>
                        </li>
                      ))}
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0 mt-1.5" />
                      <span>
                        Pack of {piecesCount} pcs:{" "}
                        {sortSizes(selectedVariant.sizes).join(", ")}.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div id="reviews-section" className="scroll-mt-24">
                {reviewsTotal > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {avgRating}
                      </span>
                      <StarRating rating={avgRating} size="text-base" />
                      <span className="text-xs text-gray-400">
                        {reviewsTotal} reviews
                      </span>
                    </div>
                    <div className="h-px sm:h-12 sm:w-px bg-gray-100 flex-shrink-0" />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setShowAllReviews(true)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${showAllReviews ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        All ({reviews.length})
                      </button>
                      <button
                        onClick={() => setShowAllReviews(false)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${!showAllReviews ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-600 hover:bg-pink-100"}`}
                      >
                        This Variant (
                        {
                          reviews.filter(
                            (r) =>
                              (selectedVariant?.code &&
                                r.variantCode === selectedVariant.code) ||
                              (!selectedVariant?.code &&
                                r.variantColor?.toLowerCase() ===
                                  selectedVariant?.color?.toLowerCase()),
                          ).length
                        }
                        )
                      </button>
                    </div>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    Loading reviews...
                  </div>
                ) : (
                  (() => {
                    const displayed = showAllReviews
                      ? reviews
                      : reviews.filter(
                          (r) =>
                            (selectedVariant?.code &&
                              r.variantCode === selectedVariant.code) ||
                            (!selectedVariant?.code &&
                              r.variantColor?.toLowerCase() ===
                                selectedVariant?.color?.toLowerCase()),
                        );
                    if (!displayed.length)
                      return (
                        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
                          <p className="text-4xl mb-3">⭐</p>
                          <p className="text-gray-500 text-sm">
                            {showAllReviews
                              ? "No reviews yet."
                              : "No reviews for this variant yet."}
                          </p>
                        </div>
                      );
                    return (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {displayed
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((review) => {
                            const isCurrent =
                              (selectedVariant?.code &&
                                review.variantCode === selectedVariant.code) ||
                              (!selectedVariant?.code &&
                                review.variantColor?.toLowerCase() ===
                                  selectedVariant?.color?.toLowerCase());
                            return (
                              <div
                                key={review._id}
                                className={`bg-white rounded-xl p-4 border shadow-sm ${isCurrent ? "border-pink-200 bg-pink-50/30" : "border-gray-100"}`}
                              >
                                <div className="flex items-start justify-between mb-2.5 gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      {(review.userName ||
                                        "A")[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm text-gray-800 truncate">
                                        {review.userName || "Anonymous"}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {new Date(
                                          review.createdAt,
                                        ).toLocaleDateString("en-IN", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  <StarRating
                                    rating={review.rating}
                                    size="text-sm"
                                  />
                                </div>
                                {review.comment && (
                                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                    {review.comment}
                                  </p>
                                )}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {(review.variantColor ||
                                    review.variantCode) && (
                                    <span className="text-xs text-pink-500 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full font-medium">
                                      {review.variantColor}
                                      {review.variantCode
                                        ? ` · ${review.variantCode}`
                                        : ""}
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                                      ✓ Your Variant
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>}

          {/* ── RELATED ── */}
          <div className="mt-16">
            <RelatedProducts
              category={productData.category}
              subCategory={productData.subCategory}
              currentProductId={productData._id}
            />
          </div>
        </div>
      </div>

      {/* ── PREVIEW MODAL ── */}
      {isPreviewOpen && (
        <div
          onClick={closePreview}
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
        >
          {showZoomHint && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 bg-white/10 text-white px-4 py-1.5 rounded-full text-xs font-medium border border-white/20 whitespace-nowrap">
              Double-tap to zoom · Swipe to browse
            </div>
          )}
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              if (e.ctrlKey || e.metaKey || zoom > 1 || e.deltaY) {
                e.preventDefault();
                let newZoom = Math.min(Math.max(1, zoom - e.deltaY * 0.01), 5);
                setZoom(newZoom);
                if (newZoom === 1) setPosition({ x: 0, y: 0 });
              } else {
                handleWheel(e);
              }
            }}
            onTouchStart={(e) =>
              (touchStartX.current = e.touches?.[0]?.clientX)
            }
            onTouchEnd={(e) => {
              const endX = e.changedTouches?.[0]?.clientX;
              if (touchStartX.current == null || endX == null) return;
              const diff = touchStartX.current - endX;
              if (Math.abs(diff) > 40 && zoom === 1) {
                if (diff > 0) nextImage();
                else prevImage();
              }
              touchStartX.current = null;
            }}
            className="relative w-full max-w-4xl h-[85vh] overflow-hidden flex items-center justify-center group"
          >
            <button
              onClick={closePreview}
              className="absolute top-2 right-3 z-50 w-9 h-9 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white border border-white/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`absolute left-3 z-40 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition ${zoom > 1 ? "hidden" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                    setZoom(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className={`absolute right-3 z-40 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition ${zoom > 1 ? "hidden" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`rounded-full transition-all ${selectedImageIndex === i ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`}
                  />
                ))}
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
              className={`select-none max-w-full max-h-full object-contain ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.2s ease",
                touchAction: "none",
              }}
              alt={productData.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
