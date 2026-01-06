import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    products,
    cartItems,
    currency,
    updateQuantity,
    navigate,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  /* ================= BUILD CART DATA ================= */
  useEffect(() => {
    const temp = [];

    for (const productId in cartItems) {
      const sizes = cartItems[productId];
      if (!sizes) continue;

      for (const size in sizes) {
        const qty = Number(sizes[size]);
        if (qty > 0) {
          temp.push({
            productId,
            size: String(size),
            quantity: qty,
          });
        }
      }
    }

    setCartData(temp);
  }, [cartItems]);

  /* ================= FIND VARIANT + SIZE ================= */
  const getVariantData = (product, size) => {
    if (!product?.variants) return null;

    for (const variant of product.variants) {
      const sizeData = variant.sizes.find(
        (s) => String(s.size) === String(size)
      );

      if (sizeData) {
        return {
          price: Number(sizeData.price) || 0,
          image:
            Array.isArray(variant.images) && variant.images.length
              ? variant.images[0]
              : assets.placeholder_image,
        };
      }
    }
    return null;
  };

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1="YOUR" text2="CART" />
      </div>

      {/* EMPTY CART */}
      {cartData.length === 0 && (
        <p className="text-center py-10 text-gray-500">
          Your cart is empty
        </p>
      )}

      {/* CART ITEMS */}
      {cartData.map((item) => {
        const product = products.find(
          (p) => p._id === item.productId
        );
        if (!product) return null;

        const variantData = getVariantData(product, item.size);
        if (!variantData) return null;

        const { price, image } = variantData;

        return (
          <div
            key={`${item.productId}-${item.size}`}
            className="py-4 border-t border-b grid grid-cols-[4fr_2fr_1fr] gap-4 items-center"
          >
            {/* PRODUCT INFO */}
            <div className="flex gap-4">
              <img
                src={image}
                alt={product.name}
                className="w-16 h-16 object-cover"
              />
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  Size: {item.size}
                </p>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex items-center gap-4">
              <p>
                {currency}
                {price}
              </p>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1) {
                    updateQuantity(
                      item.productId,
                      item.size,
                      val
                    );
                  }
                }}
                className="border w-14 px-2 py-1"
              />

              <img
                src={assets.bin_icon}
                alt="Remove"
                className="w-4 cursor-pointer"
                onClick={() =>
                  updateQuantity(item.productId, item.size, 0)
                }
              />
            </div>

            {/* TOTAL */}
            <p className="font-semibold text-right">
              {currency}
              {price * item.quantity}
            </p>
          </div>
        );
      })}

      {/* TOTAL + CHECKOUT */}
      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <CartTotal />
          <div className="text-end">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white px-8 py-3 my-8"
            >
              PROCESS TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
