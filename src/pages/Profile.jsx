import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";

const Profile = () => {
  const { token } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PROFILE ================= */
  const loadProfile = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/user/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUser(res.data.user);
        setName(res.data.user.name || "");
      }
    } catch (err) {
      console.error(err);
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
        alert("Profile updated");
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProfile();
  }, [token]);

  if (!user) return <div className="pt-20 text-center">Loading...</div>;

  return (
    <div className="border-t pt-16 max-w-xl mx-auto">
      <Title text1="MY" text2="PROFILE" />

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            disabled
            value={user.email}
            className="w-full border px-3 py-2 mt-1 bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 mt-1"
          />
        </div>


        <button
          onClick={updateProfile}
          disabled={loading}
          className="bg-black text-white px-6 py-2 mt-4"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </div>
    </div>
  );
};

export default Profile;
