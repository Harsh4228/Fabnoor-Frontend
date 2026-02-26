import { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/Relatedproducts";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { formatNumber } from "../utils/price";
import SetInfo from "../components/SetInfo";
import axios from "axios";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "7XL", "Free Size"];
const sortSizes = (sizes) => [...(sizes || [])].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

const Product = () => {
  const { productId } = useParams();

  const {
    products,
    currency,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    navigate,
    setShowCartDrawer,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
      setSelectedImageIndex(0);
      setSelectedImage(product.variants[0].images?.[0] || "");
    }
  }, [productId, products]);

  /* ================= LOAD REVIEWS ================= */
  useEffect(() => {
    if (!productId) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`${backendUrl}/api/review/product/${productId}`);
        if (res.data.success) {
          setReviews(res.data.reviews || []);
          setAvgRating(res.data.avgRating || 0);
          setReviewsTotal(res.data.total || 0);
        }
      } catch (err) {
        // fail silently â€” reviews are supplementary
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [productId, backendUrl]);

  // Keep selectedImage in sync with selectedVariant + index
  useEffect(() => {
    if (!selectedVariant) return;
    const imgs = selectedVariant.images || [];
    const idx = Math.min(Math.max(0, selectedImageIndex), Math.max(0, imgs.length - 1));
    setSelectedImage(imgs[idx] || "");
  }, [selectedVariant, selectedImageIndex]);

  // Helpers to navigate images
  const lastWheelRef = useRef(0);
  const touchStartX = useRef(null);

  const prevImage = () => {
    const imgs = selectedVariant?.images || [];
    if (!imgs.length) return;
    setSelectedImageIndex((s) => {
      const next = (s - 1 + imgs.length) % imgs.length;
      return next;
    });
  };

  const nextImage = () => {
    const imgs = selectedVariant?.images || [];
    if (!imgs.length) return;
    setSelectedImageIndex((s) => (s + 1) % imgs.length);
  };

  const handleWheel = (e) => {
    // throttle rapid wheel events
    const now = Date.now();
    if (now - lastWheelRef.current < 180) return;
    lastWheelRef.current = now;

    // use horizontal or vertical delta
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 0) {
      // scrolled down / right -> next
      nextImage();
    } else if (delta < 0) {
      // scrolled up / left -> prev
      prevImage();
    }
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
    return <div className="min-h-screen" />;
  }

  const sizesArr = sortSizes(selectedVariant?.sizes);
  const perPiecePrice = Number(selectedVariant?.price || 0);
  const piecesCount = sizesArr.length || 1;
  const packPrice = perPiecePrice * piecesCount;


  /* ================= CART (ADD 1 PACK ONLY) ================= */
  const handleAddToCart = () => {
    if (Number(selectedVariant.stock || 0) <= 0) {
      toast.error("Out of stock");
      return;
    }

    // &#10003; IMPORTANT: send variant info also
    addToCart(productData._id, selectedVariant.color, selectedVariant.fabric, selectedVariant.code);

    toast.success("Pack added to cart ðŸ›’");
  };

  const handleBuyNow = async () => {
    if (Number(selectedVariant.stock || 0) <= 0) {
      toast.error("Out of stock");
      return;
    }

    await addToCart(productData._id, selectedVariant.color, selectedVariant.fabric, selectedVariant.code);
    setShowCartDrawer(false);
    navigate('/place-order');
  };

  /* ================= WISHLIST ================= */
  const liked = isInWishlist(productData._id, selectedVariant.color);

  const handleWishlist = () => {
    if (liked) {
      removeFromWishlist(productData._id, selectedVariant.color);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(productData._id, selectedVariant.color);
      toast.success("Added to wishlist â¤ï¸");
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
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-20 sm:w-full aspect-square rounded-lg border-2 ${selectedImageIndex === i
                    ? "border-pink-500 ring-2 ring-pink-200"
                    : "border-gray-200"
                    }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div
              onWheel={handleWheel}
              onTouchStart={(e) => (touchStartX.current = e.touches?.[0]?.clientX)}
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
              className="w-full sm:w-[80%] bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <img
                src={selectedImage || assets.placeholder_image}
                alt={productData.name}
                onClick={() => {
                  setIsPreviewOpen(true);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                  setShowZoomHint(true);
                }}
                className="w-full h-full object-cover cursor-zoom-in"
              />
            </div>
          </div>

          {/* ================= AMAZON STYLE INFO ================= */}
          <div className="flex-1 bg-white p-2 md:p-6 overflow-hidden">
            {/* Title & Brand */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <a href="#" className="text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium mb-1 inline-block">Visit the Fabnoor Store</a>
                <h1 className="text-2xl sm:text-[28px] leading-tight text-[#0F1111] font-medium">{productData.name}</h1>

                {/* Ratings */}
                {reviewsTotal > 0 && (
                  <div className="flex items-center mt-0 mb-2">
                    <div
                      className="flex items-center gap-1 cursor-pointer group"
                      onClick={() => {
                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span className="text-[#0F1111] font-medium text-[13px] mr-0.5">{avgRating}</span>
                      <div className="flex text-[#FFA41C] text-[15px]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s}>{s <= Math.round(avgRating) ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-gray-500 text-[9px] ml-0.5 mt-0.5">▼</span>
                      <span className="text-[#007185] group-hover:text-[#C7511F] group-hover:underline text-[13px] ml-1">
                        ({formatNumber(reviewsTotal)})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Added Wishlist Button inside the layout smoothly */}
              <button
                onClick={handleWishlist}
                className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition"
              >
                {liked ? <FaHeart className="text-pink-500 text-lg" /> : <FaRegHeart className="text-gray-500 text-lg" />}
              </button>
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Price Block */}
            <div className="mb-4 mt-2">
              <div className="flex items-baseline">
                <span className="text-sm font-medium relative top-[-0.5rem] text-pink-500">₹</span>
                <span className="text-4xl font-bold text-pink-500">{formatNumber(perPiecePrice)}</span>
                <span className="text-sm font-medium text-gray-500 ml-2">(Per piece)</span>
              </div>

              <div className="text-sm text-gray-600 mt-1 mb-1">Inclusive of all taxes</div>
              <div className="text-base font-bold text-gray-800">Total Packs Value: ₹{formatNumber(packPrice)}</div>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Color Selector */}
            <div className="mb-5">
              <p className="text-[#565959] text-sm mb-2">Colour: <span className="text-[#0F1111] font-bold">{selectedVariant.color}</span></p>
              <div className="flex gap-2.5 flex-wrap">
                {productData.variants.map((v, idx) => {
                  const isSelected = v.code === selectedVariant.code || (v.color === selectedVariant.color && v.fabric === selectedVariant.fabric && !v.code);
                  return (
                    <button
                      key={v.code || `${v.color}-${idx}`}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSelectedImage(v.images?.[0] || "");
                      }}
                      className={`flex flex-col items-center w-[75px] border ${isSelected ? "border-[#007185] shadow-[0_0_0_1px_#007185]" : "border-gray-300 hover:border-gray-400"} bg-white overflow-hidden group`}
                    >
                      <img src={v.images?.[0] || assets.placeholder_image} className="w-full aspect-[3/4] object-cover" alt="" />
                      <div className="py-1 w-full text-center bg-gray-50 border-t border-gray-100">
                        <p className="text-xs text-[#0F1111] font-medium">₹{formatNumber(v.price)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[#565959] text-sm">Size: <span className="text-[#0F1111] font-bold">Pack ({piecesCount} pcs)</span></p>
                <div className="flex items-center gap-2">
                  <SetInfo compact={true} />
                  <a href="#" className="flex items-center text-[#007185] hover:text-[#C7511F] hover:underline text-sm font-medium">
                    Size Chart <span className="ml-0.5 text-[10px]">▼</span>
                  </a>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {sortSizes(selectedVariant.sizes).map((size) => (
                  <div key={size} className="min-w-[42px] h-[38px] px-3 border border-gray-300 text-[#0F1111] text-sm flex items-center justify-center font-medium bg-gray-50 rounded-sm">
                    {size}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#565959]">Wholesale logic: You are buying a complete pack of {piecesCount} pieces ({sortSizes(selectedVariant.sizes).join(", ")}).</p>
            </div>

            {/* Buy Action Box */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
              <p className="text-xl font-medium text-[#0F1111] mb-1">₹{formatNumber(packPrice)} <span className="text-sm font-normal text-[#565959]">/ Pack</span></p>

              {/* STOCK STATUS */}
              {(() => {
                const stock = Number(selectedVariant.stock || 0);
                if (stock === 0) return <p className="text-[#B12704] text-lg font-medium mb-3">Currently unavailable.</p>;
                if (stock < 6) return <p className="text-[#B12704] text-lg font-medium mb-3">Only {stock} left in stock - order soon.</p>;
                return <p className="text-[#007600] text-lg font-medium mb-3">In stock</p>;
              })()}

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={Number(selectedVariant.stock || 0) <= 0}
                  className={`w-full py-2.5 rounded-full font-semibold transition shadow-sm ${Number(selectedVariant.stock || 0) <= 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-white text-pink-500 border-2 border-pink-500 hover:bg-pink-50"
                    }`}
                >
                  ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={Number(selectedVariant.stock || 0) <= 0}
                  className={`w-full py-2.5 rounded-full font-semibold transition shadow-sm ${Number(selectedVariant.stock || 0) <= 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 border-2 border-transparent"
                    }`}
                >
                  BUY NOW
                </button>
              </div>
              <div className="mt-4 text-sm text-[#565959] flex items-center gap-2 justify-center font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Secure transaction
              </div>
            </div>

            <hr className="my-5 border-gray-200" />

            {/* Product Details - Top Highlights */}
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#0F1111] mb-4">Product details</h2>

              <div className="grid grid-cols-[140px_1fr] md:grid-cols-[160px_1fr] gap-y-2.5 text-sm mb-5">
                <div className="font-bold text-[#0F1111]">Fabric</div>
                <div className="text-[#0F1111]">{selectedVariant.fabric || "Rayon / Cotton"}</div>

                <div className="font-bold text-[#0F1111]">Category</div>
                <div className="text-[#0F1111] capitalize">{productData.category} &gt; {productData.subCategory}</div>
              </div>

              <hr className="my-4 border-gray-200" />

              <h3 className="text-base font-bold text-[#0F1111] mb-2">About this item</h3>
              <ul className="list-disc pl-5 text-sm text-[#0F1111] space-y-1.5 leading-relaxed">
                {productData.description.split('\n').filter(line => line.trim() !== '').map((line, i) => (
                  <li key={i}>{line.trim().replace(/^[-*•]\s*/, '')}</li>
                ))}
                <li>Wholesale Deal: Pack of {piecesCount} containing sizes {sortSizes(selectedVariant.sizes).join(", ")}.</li>
                <li>Exclusive fabric: {selectedVariant.fabric || "Premium quality material"}.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        {reviewsTotal > 0 && (
          <div id="reviews-section" className="mt-16 mb-10 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif font-semibold">Customer Reviews</h2>
                <span className="text-sm text-gray-400">({reviewsTotal} total)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-xl ${s <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-200"}`}>&#9733;</span>
                ))}
                <span className="font-bold text-gray-700 ml-1">{avgRating}</span>
                <span className="text-sm text-gray-400">all variants</span>
              </div>
            </div>

            {/* Variant summary banner */}
            {(() => {
              const vr = reviews.filter(
                (r) =>
                  (selectedVariant?.code && r.variantCode === selectedVariant.code) ||
                  (!selectedVariant?.code && r.variantColor?.toLowerCase() === selectedVariant?.color?.toLowerCase())
              );
              const va = vr.length > 0 ? Math.round((vr.reduce((s, r) => s + r.rating, 0) / vr.length) * 10) / 10 : 0;
              if (!vr.length) return null;
              return (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl px-5 py-3 mb-5 flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Selected Variant</p>
                    <p className="font-semibold text-gray-800">
                      {selectedVariant?.color}
                      {selectedVariant?.fabric ? ` / ${selectedVariant.fabric}` : ""}
                      {selectedVariant?.code ? ` (${selectedVariant.code})` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-lg ${s <= Math.round(va) ? "text-yellow-400" : "text-gray-200"}`}>&#9733;</span>
                    ))}
                    <span className="font-bold text-gray-700">{va}</span>
                    <span className="text-sm text-gray-400">({vr.length} review{vr.length !== 1 ? "s" : ""})</span>
                  </div>
                </div>
              );
            })()}

            {/* Filter Tabs */}
            {reviews.length > 0 && (
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setShowAllReviews(true)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${showAllReviews ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  All Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setShowAllReviews(false)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${!showAllReviews ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-600 hover:bg-pink-100"}`}
                >
                  {(() => {
                    const cnt = reviews.filter(
                      (r) =>
                        (selectedVariant?.code && r.variantCode === selectedVariant.code) ||
                        (!selectedVariant?.code && r.variantColor?.toLowerCase() === selectedVariant?.color?.toLowerCase())
                    ).length;
                    return `This Variant (${cnt})`;
                  })()}
                </button>
              </div>
            )}

            {reviewsLoading ? (
              <p className="text-gray-400 text-sm">Loading reviews...</p>
            ) : (
              (() => {
                const displayed = showAllReviews
                  ? reviews
                  : reviews.filter(
                    (r) =>
                      (selectedVariant?.code && r.variantCode === selectedVariant.code) ||
                      (!selectedVariant?.code && r.variantColor?.toLowerCase() === selectedVariant?.color?.toLowerCase())
                  );
                return displayed.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl">
                    <p className="text-4xl mb-3">&#11088;</p>
                    <p className="text-gray-500">
                      {showAllReviews ? "No reviews yet. Be the first!" : "No reviews for this variant yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayed.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => {
                      const isCurrent =
                        (selectedVariant?.code && review.variantCode === selectedVariant.code) ||
                        (!selectedVariant?.code && review.variantColor?.toLowerCase() === selectedVariant?.color?.toLowerCase());
                      return (
                        <div key={review._id} className={`bg-white rounded-2xl shadow-sm p-5 border ${isCurrent ? "border-pink-200 bg-pink-50/30" : "border-gray-100"}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {(review.userName || "A")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{review.userName || "Anonymous"}</p>
                                <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                              </div>
                            </div>
                            <div className="flex gap-0.5 flex-shrink-0">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={`text-base ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>&#9733;</span>
                              ))}
                            </div>
                          </div>
                          {review.comment && <p className="text-gray-600 text-sm leading-relaxed mt-1">{review.comment}</p>}
                          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                            {(review.variantColor || review.variantCode) && (
                              <span className="text-xs font-medium text-pink-500 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
                                {review.variantColor}{review.variantCode ? ` . ${review.variantCode}` : ""}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full font-medium">
                                This Variant
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

        <div className="mt-20">
          <RelatedProducts
            category={productData.category}
            subCategory={productData.subCategory}
          />
        </div>

      </div>

      {/* ================= IMAGE PREVIEW ================= */}
      {
        isPreviewOpen && (
          <div
            onClick={closePreview}
            className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center"
          >
            {showZoomHint && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse tracking-wide flex items-center gap-2">
                ✨ Double tap or scroll to zoom
              </div>
            )}

            <div
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                // handle zoom via scroll
                if (e.ctrlKey || e.metaKey || zoom > 1 || e.deltaY) {
                  e.preventDefault();

                  // if zooming
                  let newZoom = zoom - e.deltaY * 0.01;
                  newZoom = Math.min(Math.max(1, newZoom), 5); // limit zoom from 1x to 5x

                  setZoom(newZoom);
                  if (newZoom === 1) {
                    setPosition({ x: 0, y: 0 }); // reset position if zoomed way out
                  }
                } else {
                  handleWheel(e);
                }
              }}
              onTouchStart={(e) => (touchStartX.current = e.touches?.[0]?.clientX)}
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
              className="relative w-full max-w-5xl h-[80vh] mt-10 overflow-hidden flex items-center justify-center group"
            >
              <button
                onClick={closePreview}
                className="absolute top-0 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors shadow-lg backdrop-blur-sm border border-white/20"
                title="Close Preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Prev/Next Buttons (Visible on hover on PC) */}
              {(selectedVariant?.images?.length || 0) > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); setZoom(1); setPosition({ x: 0, y: 0 }); }}
                    className={`absolute left-4 z-40 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm border border-white/20 md:opacity-0 md:group-hover:opacity-100 ${zoom > 1 ? 'hidden' : ''}`}
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); setZoom(1); setPosition({ x: 0, y: 0 }); }}
                    className={`absolute right-4 z-40 w-12 h-12 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-all shadow-lg backdrop-blur-sm border border-white/20 md:opacity-0 md:group-hover:opacity-100 ${zoom > 1 ? 'hidden' : ''}`}
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 ml-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
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
                className={`select-none max-w-full max-h-full object-contain ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                  touchAction: "none",
                }}
              />
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Product;
