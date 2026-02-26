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
  const [shopName, setShopName] = useState("");
  const [mobile, setMobile] = useState(""); // ✅ always string
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });
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
        setShopName(res.data.user?.shopName || "");
        setMobile(res.data.user?.mobile || "");
        setDob(res.data.user?.dob || "");
        setGender(res.data.user?.gender || "");
        if (res.data.user?.address) {
          setAddress({
            street: res.data.user.address.street || "",
            city: res.data.user.address.city || "",
            state: res.data.user.address.state || "",
            zipcode: res.data.user.address.zipcode || "",
            country: res.data.user.address.country || "",
          });
        }
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
    if (!shopName.trim()) return toast.error("Shop Name is required");
    if (!mobile.trim()) return toast.error("Mobile is required");
    if (mobile.trim().length !== 10) return toast.error("Mobile must be 10 digits");

    try {
      setLoading(true);

      const res = await axios.post(
        `${backendUrl}/api/user/profile`,
        {
          name: name.trim(),
          shopName: shopName.trim(),
          mobile: mobile.trim(),
          dob,
          gender,
          address
        },
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

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

          {/* LEFT SIDE - STATS & AVATAR */}
          <div className="w-full md:w-[35%] bg-gradient-to-b from-pink-50 to-white p-8 md:p-10 flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-100">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
              <span className="text-4xl text-white font-bold">
                {(name || "User").charAt(0).toUpperCase()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">{name || "User"}</h2>
            <p className="text-gray-500 font-medium mb-1">{shopName || ""}</p>
            <p className="text-gray-400 text-sm mb-8">{user.email}</p>

            <div className="grid grid-cols-2 gap-4 w-full mt-auto">
              {/* Orders Stat */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
                <p className="text-2xl font-bold text-pink-500">{ordersCount}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Orders</p>
              </div>
              {/* Wishlist Stat */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
                <p className="text-2xl font-bold text-pink-500">{wishlistCount}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">Wishlist</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="w-full md:w-[65%] p-8 md:p-10">
            <div className="mb-8">
              <Title text1="PERSONAL" text2="INFORMATION" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Shop Name <span className="text-rose-500">*</span>
                </label>
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  placeholder="Your Boutique Name"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                  placeholder="10 digit number"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-700"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-gray-700"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <hr className="my-8 border-gray-100" />

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Delivery Address</h3>

              <div className="space-y-4">
                {/* Street */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Street Address
                  </label>
                  <input
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    placeholder="House number, street name, appt details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      placeholder="City"
                    />
                  </div>
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      State
                    </label>
                    <input
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      placeholder="State / Province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Zipcode */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      ZIP / Postal Code
                    </label>
                    <input
                      name="zipcode"
                      value={address.zipcode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      placeholder="Pincode"
                    />
                  </div>
                  {/* Country */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <input
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 md:py-3.5 rounded-xl font-bold shadow-md shadow-pink-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
