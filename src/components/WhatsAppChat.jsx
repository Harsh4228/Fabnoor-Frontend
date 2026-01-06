import React from "react";
import { assets } from "../assets/assets";

const WhatsAppChat = () => {
  const phone = "+919979624404"; // 👈 admin number
  const message = encodeURIComponent(
    "Hello, I need help regarding a product"
  );

  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50"
    >
      <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition">
        <img
          src={assets.whatsapp_icon}
          alt="WhatsApp"
          className="w-6 h-6"
        />
        <span className="hidden sm:block font-medium">
          Chat with us
        </span>
      </div>
    </a>
  );
};

export default WhatsAppChat;
