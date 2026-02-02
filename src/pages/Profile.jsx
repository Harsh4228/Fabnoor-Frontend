import { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import { toast } from "react-toastify";

const Profile = () => {
  const { token, navigate } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState(""); // ✅ always string
  const [loading, setLoading] = useState(false);

  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUser(res.data.user);
        setName(res.data.user?.name || "");
        setMobile(res.data.user?.mobile || "");
      } else {
        toast.error(res.data.message || "Failed to load profile");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile load failed");
    }
  }, [backendUrl, token]);

  /* ================= LOAD ORDERS ================= */
  const loadOrders = useCallback(async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOrdersCount(response.data.orders?.length || 0);
      }
    } catch (err) {
      console.error("Orders load error:", err);
      setOrdersCount(0);
    }
  }, [backendUrl, token]);

  /* ================= LOAD WISHLIST ================= */
  const loadWishlist = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setWishlistCount(res.data.wishlist?.length || 0);
      }
    } catch (err) {
      console.error("Wishlist load error:", err);
      setWishlistCount(0);
    }
  }, [backendUrl, token]);

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!mobile.trim()) return toast.error("Mobile is required");

    try {
      setLoading(true);

      const res = await axios.post(
        `${backendUrl}/api/user/profile`,
        { name: name.trim(), mobile: mobile.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Profile updated successfully ✅");
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD EVERYTHING ================= */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadProfile();
    loadOrders();
    loadWishlist();
  }, [token, navigate, loadProfile, loadOrders, loadWishlist]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-pink-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <Title text1="MY" text2="PROFILE" />
          </div>

          {/* EMAIL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              disabled
              value={user.email || ""}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>

          {/* NAME */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
            />
          </div>

          {/* MOBILE */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
              placeholder="Enter mobile number"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={updateProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t">
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-500">{ordersCount}</p>
              <p className="text-sm text-gray-600">Orders</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-pink-500">
                {wishlistCount}
              </p>
              <p className="text-sm text-gray-600">Wishlist</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-pink-500">0</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
