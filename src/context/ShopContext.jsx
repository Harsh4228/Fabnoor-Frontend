/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import { getPackPriceFromVariant } from "../utils/price";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext(null);

export const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 40;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ✅ SIDE CART DRAWER STATE
  const [showCartDrawer, setShowCartDrawerState] = useState(false);
  // prevent accidental auto-close: when drawer is opened programmatically
  // ignore programmatic closes for a short grace period, but allow an
  // explicit auto-close timer to close it as a non-programmatic action.
  const drawerLockUntilRef = useRef(0);
  const drawerAutoCloseRef = useRef(null);
  const DRAWER_LOCK_MS = 8000;
  const AUTO_CLOSE_MS = 3500;

  const clearAutoClose = () => {
    if (drawerAutoCloseRef.current) {
      clearTimeout(drawerAutoCloseRef.current);
      drawerAutoCloseRef.current = null;
    }
  };

  const setShowCartDrawer = (val, { programmatic = true } = {}) => {
    const now = Date.now();

    // if attempting to close programmatically within lock window, ignore
    if (val === false && programmatic && now < drawerLockUntilRef.current) {
      try {
        // debug log when a programmatic close is ignored
        // eslint-disable-next-line no-console
        console.log("Ignored programmatic close of cart drawer due to lock", {
          now,
          lockUntil: drawerLockUntilRef.current,
          stack: new Error().stack,
        });
      } catch (e) {}
      return;
    }

    // if opening, set lock to prevent immediate programmatic closes
    if (val === true && programmatic) {
      drawerLockUntilRef.current = Date.now() + DRAWER_LOCK_MS;

      // clear previous auto-close then schedule a new auto-close that will
      // call the setter with programmatic: false so it bypasses the lock.
      clearAutoClose();
      drawerAutoCloseRef.current = setTimeout(() => {
        setShowCartDrawer(false, { programmatic: false });
      }, AUTO_CLOSE_MS);
    }

    // if closing (by any means), clear any pending auto-close timer
    if (val === false) {
      clearAutoClose();
    }

    try {
      // debug log for opens/closes
      // eslint-disable-next-line no-console
      console.log("setShowCartDrawer ->", val, { programmatic, now });
    } catch (e) {}

    setShowCartDrawerState(val);
  };

  /* ================= SAFE CART NORMALIZER ================= */
  const normalizeCart = (savedCart) => {
    if (!savedCart || typeof savedCart !== "object") return {};

    const encode = (s) => encodeURIComponent(String(s || ""));
    const decode = (s) => decodeURIComponent(String(s || ""));
    const makeKey = (pid, color, type) => `${pid}::${encode(color)}::${encode(type)}`;
    const parseKey = (key) => {
      if (!key || typeof key !== "string") return { productId: key, color: "", type: "" };
      if (key.indexOf("::") === -1) return { productId: key, color: "", type: "" };
      const [pid, c, t] = key.split("::");
      return { productId: pid, color: decode(c), type: decode(t) };
    };

    const newCart = {};

    for (const rawKey in savedCart) {
      const value = savedCart[rawKey];

      // if the key is already composite (pid::color::type)
      if (rawKey.includes("::")) {
        const { productId, color, type } = parseKey(rawKey);

        // VALUE expected to be { quantity, color, type } or similar
        if (typeof value === "object" && value !== null && typeof value.quantity !== "undefined") {
          const qty = Number(value.quantity || 0);
          if (qty > 0) {
            newCart[rawKey] = { quantity: qty, color: color || value.color || "", type: type || value.type || "", productId };
          }
        } else if (typeof value === "number") {
          const qty = Number(value || 0);
          if (qty > 0) {
            newCart[rawKey] = { quantity: qty, color, type, productId };
          }
        } else if (typeof value === "object" && value !== null) {
          // treat as size map -> keep as-is under composite key with quantity 1
          const totalQty = Object.values(value).reduce((s, q) => s + Number(q || 0), 0);
          if (totalQty > 0) {
            newCart[rawKey] = { quantity: totalQty, color, type, productId };
          }
        }
      }

      // legacy key (just productId)
      else {
        const pid = rawKey;

        // NEW FORMAT: { quantity, color, type }
        if (typeof value === "object" && value !== null && typeof value.quantity !== "undefined") {
          const qty = Number(value.quantity || 0);
          if (qty > 0) {
            const key = makeKey(pid, value.color || "", value.type || "");
            newCart[key] = { quantity: qty, color: value.color || "", type: value.type || "", productId: pid };
          }
        }

        // OLD FORMAT: number
        else if (typeof value === "number") {
          const qty = Number(value || 0);
          if (qty > 0) {
            const key = makeKey(pid, "", "");
            newCart[key] = { quantity: qty, color: "", type: "", productId: pid };
          }
        }

        // VERY OLD FORMAT: size map
        else if (typeof value === "object" && value !== null) {
          const totalQty = Object.values(value).reduce((sum, q) => sum + Number(q || 0), 0);
          if (totalQty > 0) {
            const key = makeKey(pid, "", "");
            newCart[key] = { quantity: totalQty, color: "", type: "", productId: pid };
          }
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

  // ✅ wishlist in DB (for logged in users)
  const [wishlist, setWishlist] = useState([]);

  // ✅ guest wishlist (for not logged in users)
  const [guestWishlist, setGuestWishlist] = useState(() => {
    const saved = localStorage.getItem("guestWishlist");
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();

  /* ================= AUTH HEADER ================= */
  const authHeader = useMemo(() => {
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, [token]);

  /* ================= SAVE CART LOCAL ================= */
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /* ================= SAVE GUEST WISHLIST LOCAL ================= */
  useEffect(() => {
    localStorage.setItem("guestWishlist", JSON.stringify(guestWishlist));
  }, [guestWishlist]);

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
    for (const key in cartItems) {
      total += Number(cartItems[key]?.quantity || 0);
    }
    return total;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (productId, color = "", type = "") => {
    // optimistic update
    const encode = (s) => encodeURIComponent(String(s || ""));
    const makeKey = (pid, c, t) => `${pid}::${encode(c)}::${encode(t)}`;

    setCartItems((prev) => {
      const updated = structuredClone(prev);
      const key = makeKey(productId, color, type);

      if (!updated[key]) {
        updated[key] = { quantity: 1, color, type, productId };
      } else {
        updated[key].quantity = Number(updated[key].quantity || 0) + 1;
        if (color) updated[key].color = color;
        if (type) updated[key].type = type;
      }

      return updated;
    });

    // ✅ OPEN SIDE CART DRAWER WHEN ADD ITEM
    setShowCartDrawer(true);

    // ✅ if no token, don't sync with backend (no error toast)
    if (!token) return;

    try {
      const key = `${productId}::${encodeURIComponent(String(color || ''))}::${encodeURIComponent(String(type || ''))}`;
      const { data } = await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: key, color, type },
        authHeader
      );

      if (data.success) {
        setCartItems(normalizeCart(data.cartData || {}));
      }
    } catch (err) {
      console.log("Cart sync add error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to sync cart"
      );
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);

    // optimistic update (productId may be composite key)
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

      if (data.success) {
        setCartItems(normalizeCart(data.cartData || {}));
      }
    } catch (err) {
      console.log("Cart sync update error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to sync cart"
      );
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
      if (!variant) continue;
      // price stored as per-piece; use full pack price for cart total
      const packPrice = getPackPriceFromVariant(variant);

      total += qty * packPrice;
    }

    return total;
  };

  /* ================= LOAD PRODUCTS ================= */
  const getProductsData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/product/list`);
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.log("Products load error:", err);
    }
  }, [backendUrl]);

  /* ================= GET USER CART ================= */
  const getUserCart = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        authHeader
      );

      if (data.success) {
        const serverCart = normalizeCart(data.cartData || {});
        const serverHasItems = Object.keys(serverCart).length > 0;
        const localHasItems = Object.keys(cartItems || {}).length > 0;

        // Avoid overwriting a non-empty local guest cart with an empty server cart
        if (serverHasItems || !localHasItems) {
          setCartItems(serverCart);
        }
      }
    } catch (err) {
      console.log("User cart load error:", err);
    }
  }, [backendUrl, authHeader, token]);

  /* ================= MERGE GUEST CART TO DB (ON LOGIN) - BULK ================= */
  const mergeGuestCartToDB = useCallback(async () => {
    const entries = Object.entries(cartItems || {});
    if (!token || !entries.length) return;

    try {
      const payload = { cartData: cartItems };
      const { data } = await axios.post(
        `${backendUrl}/api/cart/merge`,
        payload,
        authHeader
      );

      if (data.success) {
        const serverCart = normalizeCart(data.cartData || {});
        const serverHasItems = Object.keys(serverCart).length > 0;
        if (serverHasItems) {
          // replace local cart with server cart only if server has items
          setCartItems(serverCart);
          localStorage.removeItem("cartItems");
          try {
            localStorage.setItem("cartMerged", "1");
          } catch (e) {}
        } else {
          // server returned empty cart after merge — keep local guest cart
          console.warn("Merge returned empty server cart; keeping local guest cart.");
        }
      }
    } catch (err) {
      console.error("Cart merge failed:", err);
    }
  }, [cartItems, token, backendUrl, authHeader]);

  /* ================= WISHLIST (DB) ================= */
  const getWishlist = useCallback(async () => {
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
  }, [backendUrl, authHeader, token]);

  /* ================= GUEST WISHLIST HELPERS ================= */
  const addGuestWishlist = (productId, color = "") => {
    setGuestWishlist((prev) => {
      const exists = prev.some(
        (x) => x.productId === productId && x.color === color
      );
      if (exists) return prev;
      return [...prev, { productId, color }];
    });
  };

  const removeGuestWishlist = (productId, color = "") => {
    setGuestWishlist((prev) =>
      prev.filter((x) => !(x.productId === productId && x.color === color))
    );
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = async (productId, color) => {
    // ✅ if user not logged in => store in guest wishlist
    if (!token) {
      addGuestWishlist(productId, color);
      toast.success("Added to wishlist ❤️ (saved locally)");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId, color },
        authHeader
      );
      getWishlist();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to add to wishlist"
      );
    }
  };

  /* ================= REMOVE FROM WISHLIST ================= */
  const removeFromWishlist = async (productId, color) => {
    // ✅ if user not logged in => remove from guest wishlist
    if (!token) {
      removeGuestWishlist(productId, color);
      toast.success("Removed from wishlist");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId, color },
        authHeader
      );
      getWishlist();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove from wishlist"
      );
    }
  };

  /* ================= IS IN WISHLIST ================= */
  const isInWishlist = (productId, color) => {
    // if logged in => check DB wishlist
    if (token) {
      return wishlist.some(
        (item) => item.productId?._id === productId && item.color === color
      );
    }

    // if guest => check local wishlist
    return guestWishlist.some(
      (item) => item.productId === productId && item.color === color
    );
  };

  /* ================= MERGE GUEST WISHLIST TO DB AFTER LOGIN ================= */
  const mergeGuestWishlistToDB = useCallback(async () => {
    if (!token) return;
    if (!guestWishlist.length) return;

    try {
      // add all guest items into DB
      for (const item of guestWishlist) {
        await axios.post(
          `${backendUrl}/api/wishlist/add`,
          { productId: item.productId, color: item.color },
          authHeader
        );
      }

      // clear guest wishlist after merge
      setGuestWishlist([]);
      localStorage.removeItem("guestWishlist");

      // reload DB wishlist
      getWishlist();
    } catch (err) {
      console.log("Wishlist merge error:", err);
    }
  }, [token, guestWishlist, backendUrl, authHeader, getWishlist]);

  /* ================= LOAD ON START ================= */
  useEffect(() => {
    getProductsData();
  }, [getProductsData]);

  // ✅ If token exists, load cart from backend. Otherwise keep local cart (localStorage).
  useEffect(() => {
    if (token) getUserCart();
  }, [token, getUserCart]);

  // Detect token transitions (login / logout)
  const prevTokenRef = useRef(token);

  useEffect(() => {
    const prev = prevTokenRef.current;
    // login: prev falsy -> now truthy
    if (!prev && token) {
      // merge guest cart into DB
      mergeGuestCartToDB();
      // also merge guest wishlist
      mergeGuestWishlistToDB();
    }

    // logout: prev truthy -> now falsy
    if (prev && !token) {
      // clear local cart on explicit logout
      setCartItems({});
      localStorage.removeItem("cartItems");
      // clear wishlist from memory (keep guestWishlist local)
      setWishlist([]);
    }

    prevTokenRef.current = token;
  }, [token, mergeGuestCartToDB, mergeGuestWishlistToDB]);

  // wishlist load
  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  // ✅ merge guest wishlist after login
  useEffect(() => {
    if (token) mergeGuestWishlistToDB();
  }, [token, mergeGuestWishlistToDB]);

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

        // ✅ CART DRAWER
        showCartDrawer,
        setShowCartDrawer,

        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        getCartItems,
        getCartAmount,

        // wishlist
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,

        // auth
        navigate,
        token,
        setToken,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
