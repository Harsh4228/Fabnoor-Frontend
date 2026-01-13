import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaRegHeart } from "react-icons/fa";


function Navbar() {
  const [visible, setVisible] = useState(false);
  const {
    setShowSearch,
    getCartItems,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ================= 1️⃣ TOP OFFER SCROLLER ================= */}
      <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 text-white text-sm py-3 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee px-4 font-medium tracking-wide">
          ✨ GET 10% OFF ON PREPAID · APPLY CODE "PRE10" · BUY 2 GET 15% OFF · BUY 3 GET 20% OFF · BUY 4 GET 25% OFF ✨
        </div>
      </div>

      {/* ================= 2️⃣ LOGO + ICONS ================= */}
      <div className="border-b border-gray-100">
        <div className="flex items-center justify-between py-1 px-4 md:px-10 max-w-7xl mx-auto">
          {/* Left empty for centering */}
          <div className="w-1/3 hidden md:block" />

          {/* Logo */}
          <Link to="/" className="flex-1 md:w-1/3 flex justify-center">
            <img 
              src={assets.logo} 
              className="h-16 md:h-20 w-auto transition-transform hover:scale-105" 
              alt="Fabnoor Logo" 
            />
          </Link>

          {/* Icons */}
          <div className="w-1/3 flex justify-end items-center gap-5 md:gap-6">
            <img
  onClick={() => {
    setShowSearch(true);
    navigate("/collection");
  }}
  src={assets.search_icon}
  className="w-5 cursor-pointer hover:opacity-70 transition-opacity"
  alt="Search"
/>


            {/* Profile */}
            <div className="relative group">
              <img
                onClick={() => (token ? null : navigate("/login"))}
                src={assets.profile_icon}
                className="w-5 cursor-pointer hover:opacity-70 transition-opacity"
                alt="Profile"
              />
              {token && (
                <div className="hidden group-hover:block absolute right-0 pt-4">
                  <div className="bg-white shadow-lg rounded-xl w-40 px-5 py-4 text-sm border border-gray-100">
                    <p
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer hover:text-rose-500 transition-colors py-2 border-b border-gray-100"
                    >
                      My Profile
                    </p>
                    <p
                      onClick={() => navigate("/order")}
                      className="cursor-pointer hover:text-rose-500 transition-colors py-2 border-b border-gray-100"
                    >
                      Orders
                    </p>
                    <p
                      onClick={logout}
                      className="cursor-pointer hover:text-rose-500 transition-colors py-2"
                    >
                      Logout
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="hover:text-rose-500 transition-colors">
              <FaRegHeart size={22} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <img 
                src={assets.cart_icon} 
                className="w-5 hover:opacity-70 transition-opacity" 
                alt="Cart" 
              />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-md">
                {getCartItems()}
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setVisible(!visible)}
              className="sm:hidden hover:text-rose-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 3️⃣ DESKTOP MENU ================= */}
      <nav className="border-b border-gray-50 bg-gradient-to-b from-white to-pink-50/20 hidden sm:block">
        <ul className="flex justify-center gap-8 md:gap-10 py-4 text-sm font-medium text-gray-700 max-w-7xl mx-auto px-4">
          {["Home", "Collection", "About", "Contact"].map((item, index) => (
            <NavLink
              key={index}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `hover:text-rose-500 transition-colors tracking-wide relative group ${
                  isActive ? "text-rose-500" : ""
                }`
              }
            >
              {item.toUpperCase()}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full" />
            </NavLink>
          ))}
        </ul>
      </nav>

      {/* ================= 4️⃣ MOBILE MENU ================= */}
      <div
        className={`sm:hidden fixed top-0 right-0 bottom-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
          <button onClick={() => setVisible(false)} className="text-gray-600 hover:text-rose-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col p-5 space-y-1">
          {["Home", "Collection", "About", "Contact"].map((item, index) => (
            <NavLink
              key={index}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              onClick={() => setVisible(false)}
              className={({ isActive }) =>
                `py-3 px-4 rounded-lg transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-500 font-medium"
                    : "text-gray-700 hover:bg-pink-50 hover:text-rose-500"
                }`
              }
            >
              {item.toUpperCase()}
            </NavLink>
          ))}
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      {visible && (
        <div
          onClick={() => setVisible(false)}
          className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </header>
  );
}

export default Navbar;