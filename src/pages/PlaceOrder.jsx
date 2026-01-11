import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const {
    navigate,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= BUILD ORDER ITEMS ================= */
  const buildOrderItems = () => {
    const items = [];

    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      for (const size in cartItems[productId]) {
        const qty = Number(cartItems[productId][size]);
        if (qty <= 0) continue;

        let matchedVariant, matchedSize;

        for (const variant of product.variants) {
          const s = variant.sizes.find(
            (sz) => String(sz.size) === String(size)
          );
          if (s) {
            matchedVariant = variant;
            matchedSize = s;
            break;
          }
        }

        if (!matchedVariant || !matchedSize) continue;

        items.push({
          productId,
          name: product.name,
          color: matchedVariant.color,
          size,
          quantity: qty,
          price: Number(matchedSize.price),
          image: matchedVariant.images?.[0] || "",
        });
      }
    }

    return items;
  };

  /* ================= SUBMIT ORDER ================= */
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const items = buildOrderItems();

      if (!items.length) {
        alert("Cart is empty");
        setLoading(false);
        return;
      }

      const orderData = {
        address: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pinCode,
          country: formData.country,
          phone: formData.phone,
        },
        items,
        amount: getCartAmount() + delivery_fee,
      };

      /* ================= COD ================= */
      if (method === "cod") {
        const res = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setCartItems({});
          navigate("/orders");
        }
      }

      /* ================= RAZORPAY ================= */
      if (method === "razorpay") {
        const res = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success && res.data.razorpayOrder) {
          const rpOrder = res.data.razorpayOrder;

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            order_id: rpOrder.id,
            handler: async (response) => {
              const verify = await axios.post(
                `${backendUrl}/api/order/verifyRazorpay`,
                {
                  ...response,
                  orderId: res.data.orderId,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (verify.data.success) {
                setCartItems({});
                navigate("/orders");
              }
            },
          };

          new window.Razorpay(options).open();
        }
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-5 sm:pt-14">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          
          {/* LEFT - Delivery Information */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="text-2xl sm:text-3xl mb-6">
                <Title text1="DELIVERY" text2="INFORMATION" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["firstName", "First name"],
                  ["lastName", "Last name"],
                ].map(([name, placeholder]) => (
                  <input
                    key={name}
                    required
                    name={name}
                    value={formData[name]}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder={placeholder}
                  />
                ))}
              </div>

              <div className="space-y-4 mt-4">
                {[
                  ["email", "E-mail address"],
                  ["street", "Street address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pinCode", "Pin Code"],
                  ["country", "Country"],
                  ["phone", "Phone number"],
                ].map(([name, placeholder]) => (
                  <input
                    key={name}
                    required
                    name={name}
                    value={formData[name]}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder={placeholder}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT - Cart Total & Payment */}
          <div className="flex-1 max-w-lg">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 sticky top-24">
              <CartTotal />

              <div className="mt-8">
                <div className="mb-4">
                  <Title text1="PAYMENT" text2="METHOD" />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setMethod("razorpay")}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                      method === "razorpay" 
                        ? "border-pink-500 bg-pink-50" 
                        : "border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    <img className="h-6" src={assets.razorpay_logo} alt="Razorpay" />
                    {method === "razorpay" && (
                      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("cod")}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${
                      method === "cod" 
                        ? "border-pink-500 bg-pink-50 text-pink-600" 
                        : "border-gray-200 text-gray-700 hover:border-pink-300"
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    CASH ON DELIVERY
                    {method === "cod" && (
                      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-8">
                  <button
                    onClick={onSubmitHandler}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>PLACE ORDER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;