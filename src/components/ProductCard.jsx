import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { formatNumber } from '../utils/price';
import { assets } from '../assets/assets';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "7XL", "Free Size"];
const sortSizes = (sizes) => [...(sizes || [])].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));

const ProductCard = ({ item, variant, tag }) => {
    const { currency, getProductDiscount, addToCart, addToWishlist, removeFromWishlist, isInWishlist, token, navigate } = useContext(ShopContext);

    // Client-side guard – hidden variants should already be stripped by the API
    if (variant?.hidden) return null;

    const isWished = isInWishlist(item._id, variant.color);

    const discount = getProductDiscount(item);
    const perPiecePrice = Number(variant?.price || 0);
    const discountedPrice = perPiecePrice * (1 - discount / 100);
    const sizes = sortSizes(variant?.sizes);
    const variantImage = variant?.images?.[0] || assets.placeholder_image;
    const linkTo = `/product/${item._id}?color=${encodeURIComponent(variant.color || "")}&code=${encodeURIComponent(variant.code || "")}`;

    const handleWhatsAppInquiry = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!token) {
            toast.error("Login is required");
            navigate("/login");
            return;
        }
        // Get number from env and clean it (remove +, spaces, etc)
        const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919979624404";
        const phoneNumber = rawNumber.replace(/\D/g, ''); 

        let message = `Hi, I'm interested in this product:\n*Name:* ${item.name}\n*Color:* ${variant.color || 'N/A'}\n*Code:* ${variant.code || 'N/A'}\n*Sizes:* ${sizes.join(', ')}`;
        if (token) {
            message += `\n*Price:* ${currency}${formatNumber(discountedPrice)}`;
        }
        message += `\n*Link:* ${window.location.origin}${linkTo}`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleAddToCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error("Login is required");
            navigate("/login");
            return;
        }
        addToCart(item._id, variant.color, variant.fabric || variant.type, variant.code);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWished) {
            removeFromWishlist(item._id, variant.color);
        } else {
            addToWishlist(item._id, variant.color);
        }
    };

    return (
        <div className="group flex flex-col bg-white rounded-lg overflow-hidden transition-all duration-300 h-full">
            {/* Image Section */}
            <Link to={linkTo} className="relative aspect-[3/4] overflow-hidden bg-gray-50 flex-shrink-0">
                <img
                    src={variantImage}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute bottom-2 right-2 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-300"
                >
                    <svg
                        className={`w-4 h-4 ${isWished ? 'fill-pink-500 stroke-pink-500' : 'fill-none stroke-gray-600'}`}
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Out of Stock Overlay */}
                {variant.stock === 0 && (
                    <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center">
                        <span className="bg-white/90 text-gray-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                            Out of Stock
                        </span>
                    </div>
                )}
                
                {/* Badges – discount % only for logged-in users */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                    {tag && (
                        <span className="bg-rose-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider w-fit">
                            {tag}
                        </span>
                    )}
                    {token && discount > 0 && (
                        <span className="bg-[#e53e3e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider w-fit">
                            {discount}% OFF
                        </span>
                    )}
                </div>
            </Link>

            {/* Content Section */}
            <div className="p-3 flex flex-col flex-1 bg-white">
                {/* Product Name */}
                <Link to={linkTo}>
                    <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors leading-tight">
                        {item.name}
                    </h3>
                </Link>

                {/* Sizes */}
                <p className="text-xs text-gray-400 font-normal mb-0.5">
                    {sizes.join(', ')}
                </p>

                {/* Price Display */}
                {token ? (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-base md:text-lg font-bold text-gray-800">
                            {currency} {formatNumber(discountedPrice)}
                        </span>
                        {discount > 0 && (
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">
                                {currency} {formatNumber(perPiecePrice)}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                            className="w-full py-1 text-[11px] font-semibold text-gray-500 border border-gray-200 rounded hover:border-rose-400 hover:text-rose-500 transition-colors"
                        >
                            🔒 Login to see price
                        </button>
                    </div>
                )}

                {/* Buttons */}
                <div className="mt-auto flex flex-col gap-2">
                    <button
                        onClick={handleAddToCartClick}
                        className="w-full bg-[#2d3436] hover:bg-black text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">Add To Cart</span>
                    </button>
                    <button
                        onClick={handleWhatsAppInquiry}
                        className="w-full bg-[#25D366] hover:bg-[#1faa53] text-white py-2 px-3 rounded flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                    >
                        <FaWhatsapp size={14} className="flex-shrink-0" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap">Inquiry Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
