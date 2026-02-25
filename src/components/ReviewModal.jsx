import { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShopContext } from "../context/ShopContext";

const StarRating = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                className={`text-3xl transition-transform hover:scale-110 ${star <= value ? "text-yellow-400" : "text-gray-300"
                    }`}
            >
                ★
            </button>
        ))}
    </div>
);

const ReviewModal = ({ item, orderId, onClose, onSuccess }) => {
    const { token } = useContext(ShopContext);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                `${backendUrl}/api/review/submit`,
                {
                    orderId,
                    productId: item.productId,
                    variantCode: item.code || "",
                    variantColor: item.color || "",
                    rating,
                    comment,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Review submitted! Thank you 🎉");
                onSuccess();
                onClose();
            } else {
                toast.error(res.data.message || "Failed to submit review");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error submitting review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 text-lg font-bold transition"
                >
                    ×
                </button>

                <h2 className="text-xl font-semibold mb-1">Write a Review</h2>
                <p className="text-sm text-gray-500 mb-4">
                    For: <span className="font-medium text-gray-700">{item.name}</span>
                    {item.color && (
                        <span className="ml-1 text-pink-500">({item.color}{item.code ? ` / ${item.code}` : ""})</span>
                    )}
                </p>

                {/* Product thumbnail */}
                <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                            Color: {item.color} {item.size ? `| Size: ${item.size}` : ""}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Rating <span className="text-red-500">*</span>
                        </label>
                        <StarRating value={rating} onChange={setRating} />
                        {rating > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Review <span className="text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Share your experience with this product..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
