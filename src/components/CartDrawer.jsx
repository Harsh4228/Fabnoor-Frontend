import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { IoClose } from "react-icons/io5";

const CartDrawer = () => {
  const {
    showCartDrawer,
    setShowCartDrawer,
    cartItems,
    products,
    getCartAmount,
    delivery_fee,
    navigate,
  } = useContext(ShopContext);

  const closeDrawer = () => setShowCartDrawer(false);

  // ✅ Convert cartItems into array (supports both structures)
  const cartList = useMemo(() => {
    const list = [];

    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      const cartValue = cartItems[productId];

      // CASE 1: { quantity, color, type }
      if (cartValue && typeof cartValue === "object" && "quantity" in cartValue) {
        const qty = Number(cartValue.quantity || 0);
        if (qty <= 0) continue;

        list.push({
          productId,
          name: product.name,
          qty,
          image:
            product?.variants?.[0]?.images?.[0] ||
            product?.image?.[0] ||
            product?.images?.[0] ||
            "",
        });
        continue;
      }

      // CASE 2: { S: 2, M: 1 }
      if (cartValue && typeof cartValue === "object") {
        let totalQty = 0;
        for (const key in cartValue) {
          totalQty += Number(cartValue[key] || 0);
        }
        if (totalQty <= 0) continue;

        list.push({
          productId,
          name: product.name,
          qty: totalQty,
          image:
            product?.variants?.[0]?.images?.[0] ||
            product?.image?.[0] ||
            product?.images?.[0] ||
            "",
        });
      }
    }

    return list;
  }, [cartItems, products]);

  const total = getCartAmount() + delivery_fee;

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-all duration-300 ${
          showCartDrawer ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeDrawer}
      />

      {/* DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-[92%] sm:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          showCartDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Cart</h2>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto h-[calc(100%-170px)]">
          {cartList.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cartList.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 border rounded-xl p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <div className="flex justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span>₹{getCartAmount()}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-700 mt-2">
            <span>Delivery</span>
            <span>₹{delivery_fee}</span>
          </div>

          <div className="flex justify-between font-semibold text-base mt-3">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                closeDrawer();
                navigate("/cart");
              }}
              className="w-full text-center border border-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50"
            >
              View Cart
            </button>

            <button
              type="button"
              onClick={() => {
                closeDrawer();
                navigate("/place-order");
              }}
              className="w-full bg-pink-500 text-white rounded-xl py-3 font-semibold hover:bg-pink-600"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
