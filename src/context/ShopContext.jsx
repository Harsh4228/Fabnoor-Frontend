/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { getPackPriceFromVariant } from "../utils/price";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext(null);

export const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const [globalDiscount, setGlobalDiscount] = useState({
    discountPercentage: 0,
    isActive: false,
  });

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
    const makeKey = (pid, color, type, code) =>
      `${pid}::${encode(color)}::${encode(type)}::${encode(code)}`;
    const parseKey = (key) => {
      if (!key || typeof key !== "string")
        return { productId: key, color: "", type: "", code: "" };
      if (key.indexOf("::") === -1)
        return { productId: key, color: "", type: "", code: "" };
      const [pid, c, t, cd] = key.split("::");
      return {
        productId: pid,
        color: decode(c),
        fabric: decode(t),
        type: decode(t),
        code: cd !== undefined ? decode(cd) : "",
      };
    };

    const newCart = {};

    for (const rawKey in savedCart) {
      const value = savedCart[rawKey];

      // if the key is already composite (pid::color::type)
      if (rawKey.includes("::")) {
        const { productId, color, type, code } = parseKey(rawKey);

        // VALUE expected to be { quantity, color, type, code } or similar
        if (
          typeof value === "object" &&
          value !== null &&
          typeof value.quantity !== "undefined"
        ) {
          const qty = Number(value.quantity || 0);
          if (qty > 0) {
            newCart[rawKey] = {
              quantity: qty,
              color: color || value.color || "",
              fabric: fabric || value.fabric || type || value.type || "",
              code: code || value.code || "",
              productId,
            };
          }
        } else if (typeof value === "number") {
          const qty = Number(value || 0);
          if (qty > 0) {
            newCart[rawKey] = { quantity: qty, color, type, code, productId };
          }
        } else if (typeof value === "object" && value !== null) {
          // treat as size map -> keep as-is under composite key with quantity 1
          const totalQty = Object.values(value).reduce(
            (s, q) => s + Number(q || 0),
            0,
          );
          if (totalQty > 0) {
            newCart[rawKey] = {
              quantity: totalQty,
              color,
              type,
              code,
              productId,
            };
          }
        }
      }

      // legacy key (just productId)
      else {
        const pid = rawKey;

        // NEW FORMAT: { quantity, color, type, code }
        if (
          typeof value === "object" &&
          value !== null &&
          typeof value.quantity !== "undefined"
        ) {
          const qty = Number(value.quantity || 0);
          if (qty > 0) {
            const key = makeKey(
              pid,
              value.color || "",
              value.fabric || value.type || "",
              value.code || "",
            );
            newCart[key] = {
              quantity: qty,
              color: value.color || "",
              fabric: value.fabric || value.type || "",
              code: value.code || "",
              productId: pid,
            };
          }
        }

        // OLD FORMAT: number
        else if (typeof value === "number") {
          const qty = Number(value || 0);
          if (qty > 0) {
            const key = makeKey(pid, "", "", "");
            newCart[key] = {
              quantity: qty,
              color: "",
              type: "",
              code: "",
              productId: pid,
            };
          }
        }

        // VERY OLD FORMAT: size map
        else if (typeof value === "object" && value !== null) {
          const totalQty = Object.values(value).reduce(
            (sum, q) => sum + Number(q || 0),
            0,
          );
          if (totalQty > 0) {
            const key = makeKey(pid, "", "", "");
            newCart[key] = {
              quantity: totalQty,
              color: "",
              type: "",
              code: "",
              productId: pid,
            };
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

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem("cachedProducts");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
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
  const getProductDiscount = useCallback(
    (product) => {
      if (globalDiscount.isActive) return globalDiscount.discountPercentage;
      return product?.discount || 0;
    },
    [globalDiscount],
  );

  const findVariant = (product, color, fabric, code) => {
    if (!product?.variants?.length) return null;

    if (code) {
      const matched = product.variants.find((v) => v.code === code);
      if (matched) return matched;
    }

    if (color && fabric) {
      const matched = product.variants.find(
        (v) => v.color === color && (v.fabric === fabric || v.type === fabric),
      );
      if (matched) return matched;
    }

    return product.variants[0];
  };

  /* ================= CART COUNT ================= */
  const getCartItems = () => {
    let total = 0;
    for (const key in cartItems) {
      const productId = key.includes("::") ? key.split("::")[0] : key;
      const product = products.find((p) => p._id === productId);
      // Only count if product exists in cache
      if (product) {
        total += Number(cartItems[key]?.quantity || 0);
      }
    }
    return total;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = async (productId, color = "", fabric = "", code = "") => {
    const encode = (s) => encodeURIComponent(String(s || ""));
    const makeKey = (pid, c, f, cd) =>
      `${pid}::${encode(c)}::${encode(f)}::${encode(cd)}`;
    const key = makeKey(productId, color, fabric, code);

    // Optimistic update — always runs immediately, never awaited
    setCartItems((prev) => {
      const updated = structuredClone(prev);

      if (!updated[key]) {
        updated[key] = { quantity: 1, color, fabric, code, productId };
      } else {
        updated[key].quantity = Number(updated[key].quantity || 0) + 1;
        if (color) updated[key].color = color;
        if (fabric) updated[key].fabric = fabric;
        if (code) updated[key].code = code;
      }

      return updated;
    });

    // ✅ OPEN SIDE CART DRAWER WHEN ADD ITEM
    setShowCartDrawer(true);

    // ✅ if no token, don't sync with backend
    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId: key, color, fabric, code },
        authHeader,
      );
      // ⚠️ DO NOT call setCartItems here — the optimistic update is correct.
      // Replacing state from the server response would overwrite other items
      // that were added between clicks (race condition).
    } catch (err) {
      console.log("Cart sync add error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to sync cart",
      );
    }
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (productId, quantity) => {
    const qty = Number(quantity);

    // Optimistic update (productId may be composite key)
    setCartItems((prev) => {
      const updated = structuredClone(prev);

      if (!updated[productId]) return updated;

      if (qty <= 0) delete updated[productId];
      else updated[productId].quantity = qty;

      return updated;
    });

    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId: productId, quantity: qty },
        authHeader,
      );
      // ⚠️ DO NOT replace state from server response — optimistic update is correct.
    } catch (err) {
      console.log("Cart sync update error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to sync cart",
      );
    }
  };

  /* ================= CART TOTAL ================= */
  const getCartAmount = () => {
    let total = 0;

    const parseKeyProductId = (key) => {
      if (!key || typeof key !== "string") return key;
      // composite key: pid::color::type::code
      if (key.includes("::")) return key.split("::")[0];
      return key;
    };

    for (const cartKey in cartItems) {
      const productId = parseKeyProductId(cartKey);
      const product = products.find((p) => p._id === productId);
      if (!product) continue;

      const qty = Number(cartItems[cartKey]?.quantity || 0);
      const { color, fabric, type, code } = cartItems[cartKey] || {};

      const variant = findVariant(product, color, fabric || type, code);
      if (!variant) continue;

      const discount = getProductDiscount(product);
      // price stored as per-piece; use full pack price for cart total
      const packPrice = getPackPriceFromVariant(variant, discount);
      total += qty * packPrice;
    }

    return Math.round(total);
  };

  /* ================= ADD PRODUCTS TO CACHE ================= */
  const addProductsToCache = useCallback((newProducts) => {
    if (!newProducts || !newProducts.length) return;
    setProducts((prev) => {
      const map = new Map(prev.map((p) => [p._id, p]));
      newProducts.forEach((p) => map.set(p._id, p));
      const merged = Array.from(map.values());
      // Persist to localStorage so cart products are available instantly on next load
      try {
        localStorage.setItem("cachedProducts", JSON.stringify(merged));
      } catch {}
      return merged;
    });
  }, []);

  /* ================= LOAD GUEST UNCACHED PRODUCTS ================= */
  const loadGuestCartProducts = useCallback(
    async (currentCart) => {
      try {
        const productIds = new Set();
        for (const key in currentCart) {
          if (currentCart[key].quantity > 0) {
            const pid = key.includes("::") ? key.split("::")[0] : key;
            if (pid) productIds.add(pid);
          }
        }

        const idsToFetch = Array.from(productIds);
        if (idsToFetch.length > 0) {
          const { data } = await axios.post(
            `${backendUrl}/api/product/by-ids`,
            { ids: idsToFetch },
          );
          if (data.success && data.products) {
            addProductsToCache(data.products);
          }
        }
      } catch (err) {
        console.log("Guest products load error:", err);
      }
    },
    [backendUrl, addProductsToCache],
  );

  /* ================= GET USER CART ================= */
  const getUserCart = useCallback(async () => {
    if (!token) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/cart/get`,
        {},
        authHeader,
      );

      if (data.success) {
        if (data.cartProducts) {
          addProductsToCache(data.cartProducts);
        }

        const serverCart = normalizeCart(data.cartData || {});
        const serverHasItems = Object.keys(serverCart).length > 0;

        // Use functional form to avoid cartItems in dependency array (prevents infinite loop)
        setCartItems((prev) => {
          const localHasItems = Object.keys(prev || {}).length > 0;
          // Avoid overwriting a non-empty local guest cart with an empty server cart
          if (serverHasItems || !localHasItems) {
            return serverCart;
          }
          return prev;
        });
      }
    } catch (err) {
      console.log("User cart load error:", err);
    }
    // ✅ cartItems intentionally removed from deps — using functional setCartItems instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl, authHeader, token, addProductsToCache]);

  /* ================= MERGE GUEST CART TO DB (ON LOGIN) - BULK ================= */
  const mergeGuestCartToDB = useCallback(async () => {
    const entries = Object.entries(cartItems || {});
    if (!token || !entries.length) return;

    try {
      const payload = { cartData: cartItems };
      const { data } = await axios.post(
        `${backendUrl}/api/cart/merge`,
        payload,
        authHeader,
      );

      if (data.success) {
        if (data.cartProducts) {
          addProductsToCache(data.cartProducts);
        }

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
          console.warn(
            "Merge returned empty server cart; keeping local guest cart.",
          );
        }
      }
    } catch (err) {
      console.error("Cart merge failed:", err);
    }
  }, [cartItems, token, backendUrl, authHeader, addProductsToCache]);

  /* ================= WISHLIST (DB) ================= */
  const getWishlist = useCallback(async () => {
    if (!token) {
      setWishlist([]);
      return;
    }

    try {
      const res = await axios.get(`${backendUrl}/api/wishlist`, authHeader);
      const fetchedWishlist = res.data.wishlist || [];
      setWishlist(fetchedWishlist);

      // Extract populated products and add to cache
      const wishlistProducts = fetchedWishlist
        .map((w) => w.productId)
        .filter(Boolean);
      addProductsToCache(wishlistProducts);
    } catch (error) {
      console.error("Wishlist fetch failed", error);
      setWishlist([]);
    }
  }, [backendUrl, authHeader, token, addProductsToCache]);

  /* ================= GUEST WISHLIST HELPERS ================= */
  const addGuestWishlist = (productId, color = "") => {
    setGuestWishlist((prev) => {
      const exists = prev.some(
        (x) => x.productId === productId && x.color === color,
      );
      if (exists) return prev;
      return [...prev, { productId, color }];
    });
  };

  const removeGuestWishlist = (productId, color = "") => {
    setGuestWishlist((prev) =>
      prev.filter((x) => !(x.productId === productId && x.color === color)),
    );
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = async (productId, color) => {
    // ✅ if user not logged in => store in guest wishlist
    if (!token) {
      addGuestWishlist(productId, color);
      return;
    }

    // Optimistic Update
    const previousWishlist = [...wishlist];
    setWishlist((prev) => {
      if (
        prev.some(
          (item) => item.productId?._id === productId && item.color === color,
        )
      )
        return prev;
      // Optimistically we push just ID so it's not fully populated, but background fetch fixes it
      return [...prev, { productId: { _id: productId }, color }];
    });

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId, color },
        authHeader,
      );
      // Fetch fresh data in the background
      getWishlist();
    } catch (err) {
      // Revert optimistic update on failure
      setWishlist(previousWishlist);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add to wishlist",
      );
    }
  };

  /* ================= REMOVE FROM WISHLIST ================= */
  const removeFromWishlist = async (productId, color) => {
    // ✅ if user not logged in => remove from guest wishlist
    if (!token) {
      removeGuestWishlist(productId, color);
      return;
    }

    // Optimistic Update
    const previousWishlist = [...wishlist];
    setWishlist((prev) =>
      prev.filter(
        (item) => !(item.productId?._id === productId && item.color === color),
      ),
    );

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId, color },
        authHeader,
      );
      // Fetch fresh data in the background
      getWishlist();
    } catch (err) {
      // Revert optimistic update on failure
      setWishlist(previousWishlist);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to remove from wishlist",
      );
    }
  };

  /* ================= IS IN WISHLIST ================= */
  const isInWishlist = (productId, color) => {
    // if logged in => check DB wishlist
    if (token) {
      return wishlist.some(
        (item) => item.productId?._id === productId && item.color === color,
      );
    }

    // if guest => check local wishlist
    return guestWishlist.some(
      (item) => item.productId === productId && item.color === color,
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
          authHeader,
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

  // ✅ Cleanup orphaned guest wishlist items
  useEffect(() => {
    if (products.length > 0) {
      setGuestWishlist((prev) => {
        const updated = prev.filter((item) =>
          products.some((p) => p._id === item.productId),
        );
        return updated.length !== prev.length ? updated : prev;
      });
    }
  }, [products]);

  /* ================= FETCH GLOBAL DISCOUNT ================= */
  const fetchGlobalDiscount = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/discount/get`);
      if (data.success) {
        setGlobalDiscount(data.globalDiscount);
      }
    } catch (err) {
      console.log("Global discount fetch error:", err);
    }
  }, [backendUrl]);

  /* ================= LOAD ON START ================= */
  useEffect(() => {
    fetchGlobalDiscount();
    if (!token) {
      loadGuestCartProducts(cartItems);

      const hwids = guestWishlist.map((w) => w.productId);
      if (hwids.length > 0) {
        axios
          .post(`${backendUrl}/api/product/by-ids`, { ids: hwids })
          .then((res) => {
            if (res.data.success) addProductsToCache(res.data.products);
          })
          .catch(() => {});
      }
    }
  }, [token]);

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
      const isNewRegistration = localStorage.getItem("isNewRegistration");

      if (isNewRegistration) {
        // If it's a completely new account, they should NOT inherit whatever items
        // the previous guest left in the browser. Clear guest data.
        setGuestWishlist([]);
        localStorage.removeItem("guestWishlist");

        setCartItems({});
        localStorage.removeItem("cartItems");

        // Remove the flag so future logins behave normally
        localStorage.removeItem("isNewRegistration");
      } else {
        // regular login => merge guest cart and wishlist into DB
        mergeGuestCartToDB();
        mergeGuestWishlistToDB();
      }
    }

    // logout: prev truthy -> now falsy
    if (prev && !token) {
      // clear local cart on explicit logout
      setCartItems({});
      localStorage.removeItem("cartItems");
      // clear cached products on logout so stale data doesn't persist across accounts
      localStorage.removeItem("cachedProducts");
      setProducts([]);
      // clear wishlist from memory (keep guestWishlist local)
      setWishlist([]);
    }

    prevTokenRef.current = token;
  }, [token, mergeGuestCartToDB, mergeGuestWishlistToDB]);

  // wishlist load
  useEffect(() => {
    getWishlist();
  }, [getWishlist]);

  // ✅ Cleanup orphaned cart items from local state when products list changes
  useEffect(() => {
    if (products.length > 0) {
      setCartItems((prev) => {
        const updated = { ...prev };
        let changed = false;
        for (const key in updated) {
          const pid = key.includes("::") ? key.split("::")[0] : key;
          const exists = products.some((p) => p._id === pid);
          if (!exists) {
            delete updated[key];
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }
  }, [products]);

  // ✅ merge guest wishlist after login
  useEffect(() => {
    if (token) mergeGuestWishlistToDB();
  }, [token, mergeGuestWishlistToDB]);

  /* ================= AUTO-LOGOUT ON 401 (TOKEN EXPIRED) ================= */
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          const currentToken = localStorage.getItem("token");
          // Only auto-logout if the user IS logged in (avoid loop on login page)
          if (currentToken) {
            // Clear auth state
            setToken("");
            localStorage.removeItem("token");
            // Clear user-specific data
            setCartItems({});
            localStorage.removeItem("cartItems");
            localStorage.removeItem("cachedProducts");
            setProducts([]);
            setWishlist([]);
            // Notify user
            toast.info("Your session has expired. Please login again.", {
              toastId: "session-expired",
            });
            // Redirect to login
            navigate("/login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <ShopContext.Provider
      value={{
        products,
        currency,
        delivery_fee,
        addProductsToCache,

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

        // discount
        globalDiscount,
        getProductDiscount,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

ShopContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
