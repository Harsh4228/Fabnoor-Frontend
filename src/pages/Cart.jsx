import { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { getPerPiecePriceFromVariant, getPackPriceFromVariant, formatNumber } from "../utils/price";
import SetInfo from "../components/SetInfo";
import { toast } from "react-toastify";

const Cart = () => {
  const { products, cartItems, currency, updateQuantity, navigate } =
    useContext(ShopContext);

    
  const [cartData, setCartData] = useState([]);
  const prevCartDataRef = useRef([]);

  /* ================= BUILD CART DATA (WHOLESALE ONLY) ================= */
  useEffect(() => {
    const temp = [];

    const parseKey = (key) => {
      if (!key || typeof key !== "string") return { productId: key, color: "", type: "" };
      if (key.indexOf("::") === -1) return { productId: key, color: "", type: "" };
      const [pid, c, t] = key.split("::");
      return { productId: pid, color: decodeURIComponent(c || ""), type: decodeURIComponent(t || "") };
    };

    for (const cartKey in cartItems) {
      const item = cartItems[cartKey];
      const { productId, color, type } = parseKey(cartKey);

      const qty = Number(item?.quantity || 0);
      if (qty > 0) {
        temp.push({
          key: cartKey,
          productId,
          quantity: qty,
          color: item?.color || color || "",
          type: item?.type || type || "",
        });
      }
    }

    setCartData(temp);
  }, [cartItems]);

  /* ================= POPUP ON ADD ITEM ================= */
  useEffect(() => {
    const prev = prevCartDataRef.current;
    const current = cartData;

    if (prev.length === 0 && current.length === 0) {
      prevCartDataRef.current = current;
      return;
    }

    const getTotalQty = (arr) =>
      arr.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const prevQty = getTotalQty(prev);
    const currentQty = getTotalQty(current);

    if (currentQty > prevQty) {
      toast.success("Item added successfully 🛒", { autoClose: 1200 });
    }

    prevCartDataRef.current = current;
  }, [cartData]);

  /* ================= GET WHOLESALE VARIANT ================= */
  const getWholesaleVariant = (product, color, type) => {
    if (!product?.variants?.length) return null;

    // try match selected variant
    let v =
      product.variants.find((x) => x.color === color && x.type === type) ||
      product.variants[0];

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

  return (
    <div className="border-t pt-14 min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 md:px-8">
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
            if (!product) return null;

            const v = getWholesaleVariant(product, item.color, item.type);
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
                        {currency}{formatNumber(getPackPriceFromVariant(v))}
                      </div>
                      <div className="text-xs text-gray-500">
                        (Per pc) {currency}{formatNumber(getPerPiecePriceFromVariant(v))}
                      </div>
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
                      {formatNumber(getPackPriceFromVariant(v) * item.quantity)}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
