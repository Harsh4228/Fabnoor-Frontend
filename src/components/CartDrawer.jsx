import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { FaTimes } from "react-icons/fa";
import { formatNumber } from "../utils/price";

const CartDrawer = () => {
  const {
    showCartDrawer,
    setShowCartDrawer,
    cartItems,
    products,
    currency,
    getCartAmount,
    delivery_fee,
    updateQuantity,
    navigate,
  } = useContext(ShopContext);

  // convert cart object to array for rendering — newest items at top
  const cartList = useMemo(() => {
    const arr = [];

    const parseKey = (key) => {
      if (!key || typeof key !== "string") return { productId: key, color: "", type: "", code: "" };
      if (key.indexOf("::") === -1) return { productId: key, color: "", type: "", code: "" };
      const [pid, c, t, cd] = key.split("::");
      return { productId: pid, color: decodeURIComponent(c || ""), type: decodeURIComponent(t || ""), code: cd !== undefined ? decodeURIComponent(cd) : "" };
    };

    for (const cartKey in cartItems) {
      const item = cartItems[cartKey];
      const { productId, color, fabric, code } = parseKey(cartKey);
      const qty = Number(item?.quantity || 0);
      if (qty <= 0) continue;

      const product = products.find((p) => p._id === productId);

      if (product) {
        let variant;
        if (code) {
          variant = product?.variants?.find((v) => v.code === code);
        }
        if (!variant) {
          variant = product?.variants?.find((v) => v.color === color && v.fabric === fabric) ||
            product?.variants?.[0];
        }

        arr.push({
          key: cartKey,
          productId,
          name: product.name,
          qty,
          price: Number(variant?.price || 0),
          packPrice: Number(variant?.price || 0) * (variant?.sizes?.length || 1),
          image: variant?.images?.[0] || assets.placeholder_image,
          color: variant?.color || color,
          fabric: variant?.fabric || fabric,
          code: variant?.code || code,
        });
      } else {
        arr.push({
          key: cartKey,
          productId,
          name: "Loading product...",
          qty,
          price: 0,
          packPrice: 0,
          image: assets.placeholder_image,
          color,
          fabric,
          code,
        });
      }
    }

    // Reverse so the newest-added item is at the top
    return arr.reverse();
  }, [cartItems, products]);

  const subtotal = getCartAmount();
  const total = subtotal + delivery_fee;

  if (!showCartDrawer) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div
        onClick={() => setShowCartDrawer(false)}
        className="absolute inset-0 bg-black/40"
      />

      {/* drawer */}
      <div className="absolute right-0 top-0 h-full w-[85%] sm:w-[420px] bg-white shadow-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button
            onClick={() => setShowCartDrawer(false)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <FaTimes />
          </button>
        </div>

        {/* items (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {cartList.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              Cart is empty 🛒
            </div>
          ) : (
            cartList.map((item) => (
              <div
                key={item.key}
                className="flex gap-3 border rounded-xl p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold line-clamp-1">
                    {item.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.color ? `Color: ${item.color}` : ""}
                    {item.fabric ? ` | Fabric: ${item.fabric}` : ""}
                  </p>

                  <p className="text-sm font-bold text-rose-500 mt-1">
                    {currency}{formatNumber(item.packPrice || item.price)}
                    {item.packPrice && item.price !== item.packPrice && (
                      <span className="text-xs text-gray-400 font-normal ml-1">(pack)</span>
                    )}
                  </p>

                  {/* qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.key, item.qty - 1)
                      }
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-semibold">
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.key, item.qty + 1)
                      }
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer fixed */}
        <div className="border-t px-4 py-4 bg-white">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Subtotal</span>
            <span>
              {currency}
              {subtotal}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Delivery</span>
            <span>
              {currency}
              {delivery_fee}
            </span>
          </div>

          <div className="flex justify-between text-base font-bold mb-4">
            <span>Total</span>
            <span>
              {currency}
              {total}
            </span>
          </div>

          <button
            disabled={cartList.length === 0}
            onClick={() => {
              setShowCartDrawer(false);
              navigate("/cart");
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            View Cart
          </button>

          <button
            disabled={cartList.length === 0}
            onClick={() => {
              setShowCartDrawer(false);
              navigate("/place-order");
            }}
            className="w-full mt-3 border border-rose-500 text-rose-500 py-3 rounded-xl font-semibold hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
