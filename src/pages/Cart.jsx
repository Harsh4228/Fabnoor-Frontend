import { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import {
  getPerPiecePriceFromVariant,
  getPackPriceFromVariant,
  formatNumber,
} from "../utils/price";
import SetInfo from "../components/SetInfo";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    products,
    cartItems,
    currency,
    updateQuantity,
    navigate,
    token,
    getProductDiscount,
  } = useContext(ShopContext);

  // ✅ Login guard — redirect to /login if not authenticated
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const [cartData, setCartData] = useState([]);

  /* ================= BUILD CART DATA (WHOLESALE ONLY) ================= */
  useEffect(() => {
    const temp = [];

    const parseKey = (key) => {
      if (!key || typeof key !== "string")
        return { productId: key, color: "", type: "", code: "" };
      if (key.indexOf("::") === -1)
        return { productId: key, color: "", type: "", code: "" };
      const [pid, c, t, cd] = key.split("::");
      return {
        productId: pid,
        color: decodeURIComponent(c || ""),
        type: decodeURIComponent(t || ""),
        code: cd !== undefined ? decodeURIComponent(cd) : "",
      };
    };

    for (const cartKey in cartItems) {
      const item = cartItems[cartKey];
      const { productId, color, type, code } = parseKey(cartKey);

      const qty = Number(item?.quantity || 0);
      if (qty > 0) {
        temp.push({
          key: cartKey,
          productId,
          quantity: qty,
          color: item?.color || color || "",
          type: item?.type || type || "",
          code: item?.code || code || "",
        });
      }
    }

    setCartData(temp);
  }, [cartItems]);

  /* ================= GET WHOLESALE VARIANT ================= */
  const getWholesaleVariant = (product, color, type, code) => {
    if (!product?.variants?.length) return null;

    // try match selected variant
    let v;
    if (code) {
      v = product.variants.find((x) => x.code === code);
    }
    if (!v) {
      v =
        product.variants.find((x) => x.color === color && x.type === type) ||
        product.variants[0];
    }

    if (!v) return null;

    return {
      price: Number(v.price) || 0,
      image:
        Array.isArray(v.images) && v.images.length
          ? v.images[0]
          : assets.placeholder_image,
      stock: Number(v.stock) || 0,
      sizes: Array.isArray(v.sizes) ? v.sizes : [],
      color: v.color,
      type: v.type,
      code: v.code || "",
    };
  };

  const handleWhatsAppInquiry = () => {
    if (!cartData.length) return;

    const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919274703338";
    const phoneNumber = rawNumber.replace(/\D/g, "");
    const baseUrl = window.location.origin;

    let message = `*Fabnoor - Product Inquiry*\n\n`;
    message += `Hi, I'm interested in the following products in my cart:\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    cartData.forEach((item, index) => {
      const product = products.find((p) => p._id === item.productId);
      if (!product) return;

      const v = getWholesaleVariant(
        product,
        item.color,
        item.type,
        item.code,
      );
      if (!v) return;

      const productUrl = `${baseUrl}/product/${item.productId}?color=${encodeURIComponent(item.color || "")}&code=${encodeURIComponent(item.code || "")}`;
      
      message += `${index + 1}. *${product.name}*\n`;
      message += `Variant: ${item.color} / ${item.type}\n`;
      message += `Sizes: ${v.sizes.join(", ")}\n`;
      message += `Quantity: ${item.quantity} Pack(s)\n`;
      message += `Link: ${productUrl}\n`;
      message += `\n━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });

    message += `Please let me know the availability and other details.\n`;
    message += `Thank you!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleWhatsAppCartOrder = () => {
    navigate("/place-order");
  };

  return (
    <div className="border-t pt-14 min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div>
        <div className="text-3xl mb-8 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Title text1="YOUR" text2="CART" />
            <SetInfo compact />
          </div>
        </div>

        {/* EMPTY CART */}
        {cartData.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-pink-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate("/collection")}
              className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        <div className="space-y-4">
          {cartData.map((item) => {
            const product = products.find((p) => p._id === item.productId);
            
            // If product is not in cache, show a loading placeholder
            if (!product) {
              return (
                <div key={item.key} className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 animate-pulse">
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gray-100 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              );
            }

            const v = getWholesaleVariant(
              product,
              item.color,
              item.type,
              item.code,
            );
            if (!v) return null;

            return (
              <div
                key={item.key}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 md:p-6 border border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] gap-4 md:gap-6 items-center">
                  {/* PRODUCT INFO */}
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={v.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        Variant:{" "}
                        <span className="font-medium">
                          {v.color} / {v.type}
                        </span>
                      </p>

                      {v.code && (
                        <p className="text-sm text-gray-500">
                          Code: <span className="font-medium">{v.code}</span>
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        Pack Sizes:{" "}
                        <span className="font-medium">
                          {v.sizes.join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="flex items-center gap-2 md:justify-center">
                    <div>
                      <div className="text-lg font-bold text-pink-500">
                        {currency}
                        {formatNumber(
                          getPackPriceFromVariant(
                            v,
                            getProductDiscount(product),
                          ),
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        (Per pc) {currency}
                        {formatNumber(
                          getPerPiecePriceFromVariant(
                            v,
                            getProductDiscount(product),
                          ),
                        )}
                      </div>
                      {getProductDiscount(product) > 0 && (
                        <div className="text-[10px] text-gray-400 line-through">
                          {currency}
                          {formatNumber(getPackPriceFromVariant(v))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                    <button
                      onClick={() => {
                        const newQty = item.quantity - 1;
                        if (newQty >= 1) updateQuantity(item.key, newQty);
                      }}
                      className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-pink-50 transition"
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1) updateQuantity(item.key, val);
                      }}
                      className="w-16 text-center border-0 bg-transparent font-semibold text-gray-900 focus:outline-none"
                    />

                    <button
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                      className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-pink-50 transition"
                    >
                      +
                    </button>
                  </div>

                  {/* TOTAL & REMOVE */}
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <p className="font-bold text-xl text-gray-900">
                      {currency}
                      {formatNumber(
                        getPackPriceFromVariant(
                          v,
                          getProductDiscount(product),
                        ) * item.quantity,
                      )}
                    </p>

                    <button
                      onClick={() => updateQuantity(item.key, 0)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-red-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTAL + CHECKOUT */}
        {cartData.length > 0 && (
          <div className="flex justify-end my-12">
            <div className="w-full sm:w-[450px] bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <CartTotal />
              <div className="text-end mt-6">
                <button
                  onClick={() => navigate("/place-order")}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  PROCEED TO CHECKOUT
                </button>
                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full mt-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#1faa53] transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.02-.956-.263-.089-.454-.134-.644.15-.19.283-.735.956-.9 1.144-.165.188-.331.21-.628.061-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.644-1.554-.882-2.126-.231-.555-.465-.48-.644-.488-.166-.008-.356-.01-.546-.01-.19 0-.5-.072-.761.21-.261.282-1.001.978-1.001 2.388 0 1.41 1.026 2.774 1.17 2.962.143.188 2.019 3.084 4.889 4.326.682.296 1.214.473 1.629.605.685.217 1.307.186 1.802.113.551-.082 1.758-.719 2.007-1.413.25-.694.25-1.289.175-1.413-.075-.124-.271-.197-.568-.346z" />
                    <path d="M12.004 0C5.378 0 0 5.378 0 12.004c0 2.112.547 4.178 1.585 6.002L0 24l6.166-1.618a11.94 11.94 0 0 0 5.838 1.518c6.626 0 12.004-5.378 12.004-12.004S18.63 0 12.004 0zm0 21.944a9.9 9.9 0 0 1-5.056-1.388l-.362-.216-3.758.985 1.002-3.663-.238-.378a9.904 9.904 0 0 1-1.521-5.28c0-5.478 4.456-9.934 9.934-9.934 5.478 0 9.934 4.456 9.934 9.934 0 5.478-4.456 9.934-9.934 9.934z" />
                  </svg>
                  WHATSAPP INQUIRY
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
