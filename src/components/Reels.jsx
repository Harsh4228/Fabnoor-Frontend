import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";

const Reels = () => {
  const { token } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= GET REELS ================= */
  const fetchReels = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/reels`);
      setReels(res.data.reels || res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  /* ================= LIKE / UNLIKE ================= */
  const toggleLike = async (reelId) => {
    if (!token) {
      toast.error("Login to like reels");
      return;
    }

    try {
      await axios.put(
        `${backendUrl}/api/reels/like/${reelId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // optimistic UI
      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId
            ? {
                ...r,
                likes: r.likes.includes("me")
                  ? r.likes.filter((l) => l !== "me")
                  : [...r.likes, "me"],
              }
            : r
        )
      );

      fetchReels();
    } catch {
      toast.error("Failed to like reel");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-rose-300" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900">
              LATEST <span className="text-rose-500">VIDEOS</span>
            </h2>
            <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {reels.map((reel) => {
            const liked = reel.likes?.includes("me");

            return (
              <div
                key={reel._id}
                className="relative min-w-[280px] sm:min-w-[320px] h-[500px] sm:h-[550px] bg-black rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 snap-center group"
              >
                {/* Video */}
                <video
                  src={reel.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5">

                  {/* Caption */}
                  <p className="text-white text-sm mb-4 line-clamp-2 font-medium">
                    {reel.caption}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(reel._id)}
                      className="flex items-center gap-2 text-white hover:scale-110 transition-transform duration-300"
                    >
                      {liked ? (
                        <FaHeart className="text-2xl text-pink-500 drop-shadow-lg" />
                      ) : (
                        <FaRegHeart className="text-2xl drop-shadow-lg" />
                      )}
                      <span className="text-sm font-semibold">
                        {reel.likes?.length || 0}
                      </span>
                    </button>

                    <button className="ml-auto px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30 transition-all duration-300">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Play Indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reels;