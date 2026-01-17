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
      {/* ================= TOP OFFER ================= */}
      <div className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 text-white text-sm py-3 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee px-4 font-medium tracking-wide">
          ✨ GET 10% OFF ON PREPAID · APPLY CODE "PRE10" · BUY 2 GET 15% OFF · BUY 3 GET 20% OFF · BUY 4 GET 25% OFF ✨
        </div>
      </div>

      {/* ================= LOGO + ICONS ================= */}
      <div className="border-b border-gray-100">
        <div className="flex items-center justify-between py-1 px-4 md:px-10 max-w-7xl mx-auto">

          {/* HAMBURGER — LEFT (mobile only) */}
          <button
            onClick={() => setVisible(true)}
            className="sm:hidden hover:text-rose-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop spacer */}
          <div className="w-1/3 hidden md:block" />

          {/* LOGO */}
          <Link to="/" className="flex-1 md:w-1/3 flex justify-center">
            <img
              src={assets.logo}
              className="h-16 md:h-20 w-auto transition-transform hover:scale-105"
              alt="Fabnoor Logo"
            />
          </Link>

          {/* ICONS — RIGHT */}
          <div className="flex justify-end items-center gap-4 md:gap-6 md:w-1/3">
            <img
              onClick={() => {
                setShowSearch(true);
                navigate("/collection");
              }}
              src={assets.search_icon}
              className="w-5 cursor-pointer hover:opacity-70"
              alt="Search"
            />

            {/* Wishlist */}
            <Link to="/wishlist">
              <FaRegHeart size={22} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <img src={assets.cart_icon} className="w-5" alt="Cart" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {getCartItems()}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP MENU ================= */}
      <nav className="hidden sm:block border-b bg-gradient-to-b from-white to-pink-50/20">
        <ul className="flex justify-center gap-8 py-4 text-sm font-medium text-gray-700">

          {["Home", "Collection", "About", "Contact", "order", "profile"].map((item) => (
            <>
              <NavLink
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={({ isActive }) =>
                  `relative group ${isActive ? "text-rose-500" : ""}`
                }
              >
                {item.toUpperCase()}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full" />
              </NavLink>
            </>
          ))}
          <button
            className={({ isActive }) =>
              `relative group ${isActive ? "text-rose-500" : ""}`
            }
            onClick={logout}
          >
            LOGOUT
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-500 transition-all group-hover:w-full" />
          </button>

        </ul>
      </nav>

      {/* ================= MOBILE SIDEBAR — LEFT (FIXED) ================= */}
      <div
        className={`sm:hidden fixed top-0 left-0 bottom-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${visible ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-lg font-semibold">Menu</h3>
          <button onClick={() => setVisible(false)}>✕</button>
        </div>

        <ul className="flex flex-col p-5 space-y-1">
          {["Home", "Collection", "About", "Contact", "order", "profile"].map((item) => (
            <NavLink
              key={item}
              to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              onClick={() => setVisible(false)}
              className="py-3 px-4 rounded-lg hover:bg-pink-50"
            >
              {item.toUpperCase()}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setVisible(false);
              logout();
            }}
            className="py-3 px-4 text-left rounded-lg hover:bg-pink-50 "
          >
          LOGOUT
          </button>
        </ul>
      </div>

      {/* OVERLAY */}
      {visible && (
        <div
          onClick={() => setVisible(false)}
          className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}

      {/* MARQUEE */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </header>
  );
}

export default Navbar;
