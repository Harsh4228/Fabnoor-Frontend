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
    <div className="border-t pt-14 min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-3xl mb-8 flex items-center gap-3">
          <Title text1="YOUR" text2="CART" />
        </div>

        {/* EMPTY CART */}
        {cartData.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button 
              onClick={() => navigate('/collection')}
              className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        <div className="space-y-4">
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 md:p-6 border border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto] gap-4 md:gap-6 items-center">
                  
                  {/* PRODUCT INFO */}
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{product.name}</p>
                      <p className="text-sm text-gray-500">Size: <span className="font-medium">{item.size}</span></p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="flex items-center gap-2 md:justify-center">
                    <span className="text-lg font-bold text-pink-500">
                      {currency}{price}
                    </span>
                  </div>

                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                    <button
                      onClick={() => {
                        const newQty = item.quantity - 1;
                        if (newQty >= 1) {
                          updateQuantity(item.productId, item.size, newQty);
                        }
                      }}
                      className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-pink-50 transition"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= 1) {
                          updateQuantity(item.productId, item.size, val);
                        }
                      }}
                      className="w-16 text-center border-0 bg-transparent font-semibold text-gray-900 focus:outline-none"
                    />
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-pink-50 transition"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* TOTAL & REMOVE */}
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <p className="font-bold text-xl text-gray-900">
                      {currency}{price * item.quantity}
                    </p>
                    
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, 0)}
                      className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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