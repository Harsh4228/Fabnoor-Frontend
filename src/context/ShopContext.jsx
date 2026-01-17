import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext(null);

export const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 40;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  /* ================= SAFE CART NORMALIZER ================= */
  const normalizeCart = (savedCart) => {
    if (!savedCart || typeof savedCart !== "object") return {};

    const newCart = {};

    for (const productId in savedCart) {
      const value = savedCart[productId];

      // NEW FORMAT: { quantity, color, type }
      if (
        typeof value === "object" &&
        value !== null &&
        typeof value.quantity !== "undefined"
      ) {
        const qty = Number(value.quantity || 0);
        if (qty > 0) {
          newCart[productId] = {
            quantity: qty,
            color: value.color || "",
            type: value.type || "",
          };
        }
      }

      // OLD FORMAT: { productId: number }
      else if (typeof value === "number") {
        const qty = Number(value || 0);
        if (qty > 0) {
          newCart[productId] = { quantity: qty, color: "", type: "" };
        }
      }

      // VERY OLD FORMAT: { S:1, M:1 }
      else if (typeof value === "object" && value !== null) {
        const totalQty = Object.values(value).reduce(
          (sum, q) => sum + Number(q || 0),
          0
        );

        if (totalQty > 0) {
          newCart[productId] = { quantity: 1, color: "", type: "" };
        }
      }
    }

    return newCart;
  };

  /* ================= CART INIT ================= */
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    if (!saved) return {};
    try {
      return normalizeCart(JSON.parse(saved));
    } catch {
      return {};
    }
  });

  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [wishlist, setWishlist] = useState([]);

  const navigate = useNavigate();

  /* ================= AUTH HEADER ================= */
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  /* ================= SAVE CART LOCAL ================= */
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /* ================= FIND VARIANT ================= */
  const findVariant = (product, color, type) => {
    if (!product?.variants?.length) return null;

    if (color && type) {
      const matched = product.variants.find(
        (v) => v.color === color && v.type === type
      );
      if (matched) return matched;
    }

    return product.variants[0];
  };

  /* ================= CART COUNT ================= */
  const getCartItems = () => {
    let total = 0;
    for (const pid in cartItems) {
      total += Number(cartItems[pid]?.quantity || 0);
    }
    return total;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (productId, color = "", type = "") => {
    // optimistic update
    setCartItems((prev) => {
      const updated = structuredClone(prev);

      if (!updated[productId]) {
        updated[productId] = { quantity: 1, color, type };
      } else {
        updated[productId].quantity =
          Number(updated[productId].quantity || 0) + 1;
        if (color) updated[productId].color = color;
        if (type) updated[productId].type = type;
      }

      return updated;
    });

    if (!token) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: productId, color, type },
        authHeader
      );

      // ✅ update from DB response
      if (data.success) {
        setCartItems(normalizeCart(data.cartData || {}));
      }
    } catch (err) {
      console.log("Cart sync add error:", err);
      toast.error("Failed to sync cart");
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);

    // optimistic update
    setCartItems((prev) => {
      const updated = structuredClone(prev);

      if (!updated[productId]) return updated;

      if (qty <= 0) delete updated[productId];
      else updated[productId].quantity = qty;

      return updated;
    });

    if (!token) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId: productId, quantity: qty },
        authHeader
      );

      // ✅ update from DB response
      if (data.success) {
        setCartItems(normalizeCart(data.cartData || {}));
      }
    } catch (err) {
      console.log("Cart sync update error:", err);
      toast.error("Failed to sync cart");
    }
  };

  /* ================= CART TOTAL ================= */
  const getCartAmount = () => {
    let total = 0;

    for (const pid in cartItems) {
      const product = products.find((p) => p._id === pid);
      if (!product) continue;

      const qty = Number(cartItems[pid]?.quantity || 0);
      const { color, type } = cartItems[pid] || {};

      const variant = findVariant(product, color, type);
      const price = Number(variant?.price || 0);

      total += qty * price;
    }

    return total;
  };

  /* ================= LOAD PRODUCTS ================= */
  const getProductsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.log("Products load error:", err);
    }
  };

  /* ================= GET USER CART ================= */
  const getUserCart = async () => {
    if (!token) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        authHeader
      );

      if (data.success) {
        setCartItems(normalizeCart(data.cartData || {}));
      }
    } catch (err) {
      console.log("User cart load error:", err);
    }
  };

  /* ================= WISHLIST ================= */
  const getWishlist = async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/wishlist`, authHeader);
      setWishlist(res.data.wishlist || []);
    } catch (error) {
      console.error("Wishlist fetch failed", error);
      setWishlist([]);
    }
  };

  const addToWishlist = async (productId, color) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId, color },
        authHeader
      );
      getWishlist();
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId, color) => {
    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId, color },
        authHeader
      );
      getWishlist();
    } catch {
      toast.error("Failed to remove from wishlist");
    }
  };

  const isInWishlist = (productId, color) => {
    return wishlist.some(
      (item) => item.productId?._id === productId && item.color === color
    );
  };

  /* ================= LOAD ON START ================= */
  useEffect(() => {
    getProductsData();
  }, []);

  // ✅ Cart must load directly when token exists
  useEffect(() => {
    if (token) getUserCart();
    else setCartItems({});
  }, [token]);

  useEffect(() => {
    getWishlist();
  }, [token]);

  return (
    <ShopContext.Provider
      value={{
        products,
        currency,
        delivery_fee,

        search,
        setSearch,
        showSearch,
        setShowSearch,

        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        getCartItems,
        getCartAmount,

        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,

        navigate,
        token,
        setToken,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
