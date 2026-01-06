import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="border-t mt-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* ================= TOP SECTION ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-sm">

          {/* LOGO + ABOUT */}
          <div>
            <img
              src={assets.logo}
              alt="Company Logo"
              className="mb-5 w-32"
            />
            <p className="text-gray-600 leading-relaxed">
              Discover premium quality products crafted with care. 
              We bring you the latest trends, best prices, and a seamless shopping experience.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <p className="text-lg font-semibold mb-4">Company</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>
                <Link to="/" className="hover:text-black transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-black transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="hover:text-black transition">
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-black transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <p className="text-lg font-semibold mb-4">Support</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>
                <Link to="/contact" className="hover:text-black transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-black transition">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-black transition">
                  Return & Refund
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-black transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <p className="text-lg font-semibold mb-4">Get in Touch</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li>📞 +91 96317 42655</li>
              <li>✉️ support@fabnoor.com</li>
              <li>📍 India</li>
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="border-t mt-12 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Fabnoor.com — All Rights Reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
