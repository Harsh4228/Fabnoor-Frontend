import { useContext, useEffect, useState, useCallback } from "react";
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
  const fetchReels = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/reels`);
      setReels(res.data.reels || res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reels");
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

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
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
  <div className="w-full py-8 bg-gradient-to-br from-pink-50 via-white to-rose-50">
    <div className="w-full px-0">

      {/* TITLE */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="h-px w-6 bg-gradient-to-r from-transparent to-rose-300" />
        <h2 className="text-xl md:text-2xl font-serif text-gray-900">
          LATEST <span className="text-rose-500">VIDEOS</span>
        </h2>
        <div className="h-px w-6 bg-gradient-to-l from-transparent to-rose-300" />
      </div>

      {/* REELS STRIP */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory px-2">
        {reels.map((reel) => {
          const liked = reel.likes?.includes("me");

          return (
            <div
              key={reel._id}
              className="
                relative
                min-w-[220px] sm:min-w-[250px] lg:min-w-[280px]
                h-[380px] sm:h-[420px] lg:h-[460px]
                bg-black rounded-xl overflow-hidden
                shadow-md hover:shadow-lg
                transition-all duration-300
                snap-center group
              "
            >
              {/* VIDEO */}
              <video
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* CONTENT */}
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <p className="text-white text-xs mb-2 line-clamp-2 font-medium">
                  {reel.caption}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLike(reel._id)}
                    className="flex items-center gap-1.5 text-white hover:scale-105 transition"
                  >
                    {liked ? (
                      <FaHeart className="text-lg text-pink-500" />
                    ) : (
                      <FaRegHeart className="text-lg" />
                    )}
                    <span className="text-xs font-semibold">
                      {reel.likes?.length || 0}
                    </span>
                  </button>

                  <button className="ml-auto px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] rounded-full hover:bg-white/30 transition">
                    View
                  </button>
                </div>
              </div>

              {/* PLAY ICON */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
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
}
export default Reels;
