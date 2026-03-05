import { useContext, useEffect, useMemo, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { FaSpinner } from "react-icons/fa";
import axios from "axios";

import Select from "react-select";
import { Country, State } from "country-state-city";
import { getPackPriceFromVariant } from "../utils/price";


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

  // Debug helper: safely mask token for logs
  const maskToken = (t) => {
    if (!t) return '<none>';
    if (t.length <= 12) return t.replace(/.(?=.{4})/g, '*');
    return `${t.slice(0, 6)}...${t.slice(-4)}`;
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    country: "India",
    phone: "",
  });

  // Fetch user profile and auto-populate address
  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            const user = res.data.user;

            // Auto-populate form
            if (user) {
              const nameParts = user.name ? user.name.split(" ") : ["", ""];
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              setFormData((prev) => ({
                ...prev,
                firstName: prev.firstName || firstName,
                lastName: prev.lastName || lastName,
                email: prev.email || user.email || "",
                phone: prev.phone || user.mobile || "",
                street: prev.street || user.address?.street || "",
                city: prev.city || user.address?.city || "",
                state: prev.state || user.address?.state || "",
                pinCode: prev.pinCode || user.address?.zipcode || "",
                country: prev.country || user.address?.country || "India",
              }));
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile for auto-population", error);
        }
      };
      fetchProfile();
    }
  }, [token, backendUrl]);

  const [errors, setErrors] = useState({});

  // ================== VALIDATIONS ==================
  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s+/g, "");
    const re = /^[+]?[0-9]{10,15}$/;
    return re.test(cleaned);
  };

  const validatePinCode = (pin) => {
    // India 6 digit
    const re = /^[0-9]{6}$/;
    return re.test(pin);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name required";

    if (!formData.email.trim()) newErrors.email = "Email required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Enter valid email";

    if (!formData.street.trim()) newErrors.street = "Street required";
    if (!formData.city.trim()) newErrors.city = "City required";

    if (!formData.country.trim()) newErrors.country = "Country required";
    if (!formData.state.trim()) newErrors.state = "State required";

    if (!formData.pinCode.trim()) newErrors.pinCode = "Pin code required";
    else if (!validatePinCode(formData.pinCode))
      newErrors.pinCode = "Enter valid 6-digit pin code";

    if (!formData.phone.trim()) newErrors.phone = "Phone number required";
    else if (!validatePhone(formData.phone))
      newErrors.phone = "Enter valid phone number (10-15 digits)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================== INPUT CHANGE HANDLER ==================
  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ================== COUNTRY / STATE OPTIONS ==================
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      label: c.name,
      value: c.isoCode,
    }));
  }, []);

  const selectedCountryOption = useMemo(() => {
    const found = Country.getAllCountries().find(
      (c) => c.name === formData.country
    );
    if (!found) return null;
    return { label: found.name, value: found.isoCode };
  }, [formData.country]);

  const stateOptions = useMemo(() => {
    if (!selectedCountryOption?.value) return [];
    return State.getStatesOfCountry(selectedCountryOption.value).map((s) => ({
      label: s.name,
      value: s.isoCode,
    }));
  }, [selectedCountryOption]);

  // ================== BUILD ORDER ITEMS (FIXED FOR BOTH CART STRUCTURES) ==================
  const buildOrderItems = () => {
    const items = [];
    const parseKey = (key) => {
      if (!key || typeof key !== "string") return { productId: key, color: "", type: "", code: "" };
      if (key.indexOf("::") === -1) return { productId: key, color: "", type: "", code: "" };
      const [pid, c, t, cd] = key.split("::");
      return {
        productId: pid,
        color: decodeURIComponent(c || ""),
        type: decodeURIComponent(t || ""),
        code: cd !== undefined ? decodeURIComponent(cd) : "",
      };
    };

    for (const cartKey in cartItems) {
      const { productId, color: keyColor, type: keyType, code: keyCode } = parseKey(cartKey);
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      const cartValue = cartItems[cartKey];

      // ✅ CASE 1: cartValue has { quantity, color, type, code }
      if (cartValue && typeof cartValue === "object" && "quantity" in cartValue) {
        const qty = Number(cartValue?.quantity || 0);
        if (qty <= 0) continue;

        // Match variant by code first, then color+type, then fallback
        const itemColor = cartValue?.color || keyColor;
        const itemType = cartValue?.type || keyType;
        const itemCode = cartValue?.code || keyCode;

        const matchedVariant =
          (itemCode && product?.variants?.find((v) => v.code === itemCode)) ||
          product?.variants?.find((v) => v.color === itemColor && v.type === itemType) ||
          product?.variants?.[0];

        if (!matchedVariant) continue;

        // image must be a non-empty string — fallback to first variant's image
        const image =
          matchedVariant.images?.[0] ||
          product?.variants?.[0]?.images?.[0] ||
          "";

        if (!image) continue; // skip if absolutely no image available

        items.push({
          productId,
          name: product.name,
          code: matchedVariant.code || "",
          color: matchedVariant.color || itemColor || "",
          fabric: matchedVariant.fabric || matchedVariant.type || itemType || "",
          type: matchedVariant.fabric || matchedVariant.type || itemType || "",
          // size must be an Array of strings per the order schema
          size: Array.isArray(matchedVariant.sizes) && matchedVariant.sizes.length
            ? matchedVariant.sizes
            : [matchedVariant.fabric || matchedVariant.type || itemType || ""],
          quantity: qty,
          price: getPackPriceFromVariant(matchedVariant) || 0,
          image,
        });

        continue;
      }

      // ✅ CASE 2: cartValue is size object { "S": 2, "M": 1 }
      if (cartValue && typeof cartValue === "object") {
        for (const size in cartValue) {
          const qty = Number(cartValue[size]);
          if (qty <= 0) continue;

          let matchedVariant = null;
          for (const variant of product.variants || []) {
            const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];
            if (sizes.includes(String(size))) {
              matchedVariant = variant;
              break;
            }
          }
          if (!matchedVariant) matchedVariant = product?.variants?.[0];
          if (!matchedVariant) continue;

          const image =
            matchedVariant.images?.[0] ||
            product?.variants?.[0]?.images?.[0] ||
            "";

          if (!image) continue;

          items.push({
            productId,
            name: product.name,
            code: matchedVariant.code || "",
            color: matchedVariant.color || "",
            fabric: matchedVariant.fabric || matchedVariant.type || "",
            type: matchedVariant.fabric || matchedVariant.type || "",
            size: [size],
            quantity: qty,
            price: getPackPriceFromVariant(matchedVariant) || 0,
            image,
          });
        }
      }
    }

    return items;
  };

  // ================== SUBMIT ORDER ==================
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const items = buildOrderItems();

      if (!items.length) {
        alert("Cart is empty");
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

      // ================= COD =================
      if (method === "cod") {
        console.log('[placeOrder] COD submit', { tokenPresent: !!token, token: maskToken(token), items: items.length, amount: orderData.amount });
        const res = await axios.post(`${backendUrl}/api/order/place`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          console.log('[placeOrder] COD success', res.data);
          setCartItems({});
          localStorage.removeItem("cartItems");
          navigate("/order", { replace: true });
        }
      }

      // ================= WHATSAPP =================
      if (method === "whatsapp") {
        console.log('[placeOrder] WhatsApp order submit', { tokenPresent: !!token, items: items.length, amount: orderData.amount });
        const res = await axios.post(`${backendUrl}/api/order/whatsapp`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          console.log('[placeOrder] WhatsApp order success', res.data);
          setCartItems({});
          localStorage.removeItem("cartItems");

          // Open WhatsApp with a confirmation message to seller
          const adminPhone = (import.meta.env.VITE_WHATSAPP_NUMBER || "919979624404").replace(/^\+/, "");
          const orderId = res.data.order?._id || res.data.order?.orderNumber || "";
          const msg = `Hello Fabnoor! I just placed a new order via WhatsApp.\n\n*Order ID:* ${orderId}\n*Total:* ₹${orderData.amount}\n*Items:* ${items.length} item(s)\n\nPlease confirm my order. Thank you!`;
          window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, "_blank");

          navigate("/order", { replace: true });
        }
      }

      // ================= RAZORPAY =================
      if (method === "razorpay") {
        console.log('[placeOrder] Razorpay create order', { tokenPresent: !!token, token: maskToken(token), amount: orderData.amount });
        const res = await axios.post(
          `${backendUrl}/api/order/razorpay`,
          orderData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          const rpOrder = res.data.razorpayOrder || res.data.order || res.data.razorpay;
          if (!rpOrder) {
            throw new Error('Razorpay order not returned by server');
          }
          console.log('[placeOrder] Razorpay order created', rpOrder);

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
            order_id: rpOrder.id,

            handler: async (response) => {
              console.log('[placeOrder] Razorpay handler response', response);
              const verify = await axios.post(
                `${backendUrl}/api/order/verifyRazorpay`,
                {
                  ...response,
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (verify.data.success) {
                console.log('[placeOrder] Razorpay verify success', verify.data);
                setCartItems({});
                localStorage.removeItem("cartItems");
                navigate("/order", { replace: true });
              }
            },
          };

          new window.Razorpay(options).open();
        }
      }
    } catch (error) {
      console.error("Order error:", error, error?.response?.data);
      const msg = error?.response?.data?.message || error.message || "Order failed";

      // If unauthorized, direct user to login
      if (error?.response?.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else if (error?.response?.status === 400 && msg.includes("Price mismatch")) {
        // Handle backend price validation failure
        // The admin updated the product price while the user was interacting with the cart
        alert(msg);
        // Force a reload so the frontend context refetches the latest products/prices from the DB
        window.location.reload();
      } else {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ================== REACT-SELECT STYLES ==================
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderRadius: "0.5rem",
      borderWidth: "2px",
      borderColor: state.isFocused ? "#ec4899" : "#e5e7eb",
      boxShadow: "none",
      padding: "2px",
      "&:hover": { borderColor: "#f9a8d4" },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-5 sm:pt-14">
      <div className="container mx-auto px-4 md:px-8">
        {/* ✅ FIX: wrap inside FORM so submit works properly */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col lg:flex-row justify-between gap-8"
        >
          {/* LEFT - Delivery Information */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="text-2xl sm:text-3xl mb-6">
                <Title text1="DELIVERY" text2="INFORMATION" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FIRST NAME */}
                <div>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* LAST NAME */}
                <div>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 mt-4">
                {/* EMAIL */}
                <div>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="E-mail address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* STREET */}
                <div>
                  <input
                    name="street"
                    value={formData.street}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="Street address"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                {/* CITY */}
                <div>
                  <input
                    name="city"
                    value={formData.city}
                    onChange={onChangeHandler}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                {/* COUNTRY SEARCH */}
                <div>
                  <Select
                    styles={selectStyles}
                    options={countryOptions}
                    value={selectedCountryOption}
                    onChange={(selected) => {
                      const countryName = selected?.label || "";
                      setFormData((prev) => ({
                        ...prev,
                        country: countryName,
                        state: "",
                      }));
                      setErrors((prev) => ({ ...prev, country: "", state: "" }));
                    }}
                    placeholder="Search & Select Country"
                    isSearchable
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>

                {/* STATE SEARCH */}
                <div>
                  <Select
                    styles={selectStyles}
                    options={stateOptions}
                    value={
                      formData.state
                        ? { label: formData.state, value: formData.state }
                        : null
                    }
                    onChange={(selected) => {
                      const stateName = selected?.label || "";
                      setFormData((prev) => ({ ...prev, state: stateName }));
                      setErrors((prev) => ({ ...prev, state: "" }));
                    }}
                    placeholder={
                      formData.country
                        ? "Search & Select State"
                        : "Select Country First"
                    }
                    isSearchable
                    isDisabled={!formData.country}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                {/* PINCODE */}
                <div>
                  <input
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({ ...prev, pinCode: val }));
                      setErrors((prev) => ({ ...prev, pinCode: "" }));
                    }}
                    maxLength={6}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="Pin Code"
                  />
                  {errors.pinCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pinCode}
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+]/g, "");
                      setFormData((prev) => ({ ...prev, phone: val }));
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className="border-2 border-gray-200 rounded-lg py-3 px-4 w-full focus:outline-none focus:border-pink-500 transition"
                    placeholder="Phone number (ex: +91xxxxxxxxxx)"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
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
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${method === "razorpay"
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                      }`}
                  >
                    <img
                      className="h-6"
                      src={assets.razorpay_logo}
                      alt="Razorpay"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("whatsapp")}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${method === "whatsapp"
                      ? "border-[#25D366] bg-green-50 text-[#128C7E]"
                      : "border-gray-200 text-gray-700 hover:border-green-400"
                      }`}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.02-.956-.263-.089-.454-.134-.644.15-.19.283-.735.956-.9 1.144-.165.188-.331.21-.628.061-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.644-1.554-.882-2.126-.231-.555-.465-.48-.644-.488-.166-.008-.356-.01-.546-.01-.19 0-.5-.072-.761.21-.261.282-1.001.978-1.001 2.388 0 1.41 1.026 2.774 1.17 2.962.143.188 2.019 3.084 4.889 4.326.682.296 1.214.473 1.629.605.685.217 1.307.186 1.802.113.551-.082 1.758-.719 2.007-1.413.25-.694.25-1.289.175-1.413-.075-.124-.271-.197-.568-.346z" />
                      <path d="M12.004 0C5.378 0 0 5.378 0 12.004c0 2.112.547 4.178 1.585 6.002L0 24l6.166-1.618a11.94 11.94 0 0 0 5.838 1.518c6.626 0 12.004-5.378 12.004-12.004S18.63 0 12.004 0zm0 21.944a9.9 9.9 0 0 1-5.056-1.388l-.362-.216-3.758.985 1.002-3.663-.238-.378a9.904 9.904 0 0 1-1.521-5.28c0-5.478 4.456-9.934 9.934-9.934 5.478 0 9.934 4.456 9.934 9.934 0 5.478-4.456 9.934-9.934 9.934z" />
                    </svg>
                    WHATSAPP ORDER
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("cod")}
                    className={`w-full p-4 border-2 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold ${method === "cod"
                      ? "border-pink-500 bg-pink-50 text-pink-600"
                      : "border-gray-200 text-gray-700 hover:border-pink-300"
                      }`}
                  >
                    CASH ON DELIVERY
                  </button>
                </div>

                <div className="mt-8">
                  {/* ✅ FIX: submit button must be type="submit" */}
                  <button
                    type="submit"
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
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>PLACE ORDER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrder;
