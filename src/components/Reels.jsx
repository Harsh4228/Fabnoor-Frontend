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
      setReels(res.data.reels || res.data); // safe
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
    return <div className="text-center py-10">Loading reels...</div>;
  }

  return (
    <div className="w-full flex gap-4 overflow-x-auto py-6 px-4 scrollbar-hide">
      {reels.map((reel) => {
        const liked = reel.likes?.includes("me"); // backend handles real user

        return (
          <div
            key={reel._id}
            className="relative min-w-[280px] h-[500px] bg-black rounded-lg overflow-hidden"
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

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-3 bg-gradient-to-t from-black/70 to-transparent">

              {/* Caption */}
              <p className="text-white text-sm mb-2">
                {reel.caption}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLike(reel._id)}
                  className="text-white text-xl"
                >
                  {liked ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <span className="text-white text-sm">
                  {reel.likes?.length || 0}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Reels;
