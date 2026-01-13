import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";

const Profile = () => {
  const { token } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    const res = await axios.get(`${backendUrl}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setUser(res.data.user);
      setName(res.data.user.name || "");
    }
  };

  /* ================= LOAD ORDERS ================= */
  const loadOrders = async () => {
    const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    if (response.data.success) {
      setOrdersCount(response.data.orders.length);
    }
  };

  /* ================= LOAD WISHLIST ================= */
  const loadWishlist = async () => {
    const res = await axios.get(`${backendUrl}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.success) {
      setWishlistCount(res.data.wishlist.length);
    }
  };

  /* ================= UPDATE PROFILE ================= */
  const updateProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/user/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setUser(res.data.user);
        alert("Profile updated successfully");
      }
    } catch {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD EVERYTHING ================= */
  useEffect(() => {
    if (token) {
      loadProfile();
      loadOrders();
      loadWishlist();
    }
  }, [token]);

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
              <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <Title text1="MY" text2="PROFILE" />
          </div>

          {/* EMAIL */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              disabled
              value={user.email}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>

          {/* NAME */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-pink-500"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={updateProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold"
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
              <p className="text-3xl font-bold text-pink-500">{wishlistCount}</p>
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
