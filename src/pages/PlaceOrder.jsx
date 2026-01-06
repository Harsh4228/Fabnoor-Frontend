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
        setLoading(false); // ✅ FIX
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
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* LEFT */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>

        {[
          ["firstName", "First name"],
          ["lastName", "Last name"],
          ["email", "E-mail address"],
          ["street", "Street"],
          ["city", "City"],
          ["state", "State"],
          ["pinCode", "Pin Code"],
          ["country", "Country"],
          ["phone", "Phone"],
        ].map(([name, placeholder]) => (
          <input
            key={name}
            required
            name={name}
            value={formData[name]}
            onChange={onChangeHandler}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder={placeholder}
          />
        ))}
      </div>

      {/* RIGHT */}
      <div className="mt-8">
        <CartTotal />

        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />

          <div className="flex gap-3 mt-4">
            <div
              onClick={() => setMethod("razorpay")}
              className={`border p-3 cursor-pointer ${
                method === "razorpay" ? "bg-gray-100" : ""
              }`}
            >
              <img className="h-5" src={assets.razorpay_logo} alt="" />
            </div>

            <div
              onClick={() => setMethod("cod")}
              className={`border p-3 cursor-pointer ${
                method === "cod" ? "bg-gray-100" : ""
              }`}
            >
              CASH ON DELIVERY
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-16 py-3 text-sm"
            >
              {loading ? (
                <span className="flex gap-2 items-center">
                  <FaSpinner className="animate-spin" /> Placing Order
                </span>
              ) : (
                "PLACE ORDER"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
