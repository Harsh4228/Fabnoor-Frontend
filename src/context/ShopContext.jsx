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

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cartItems");
    return saved ? JSON.parse(saved) : {};
  });
  

  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  /* ================= AUTH HEADER ================= */
  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  /* ================= GET WISHLIST ================= */
  const getWishlist = async () => {
    if (!token) {
      setWishlist([]); // ✅ clear on logout
      return;
    }

    try {
      const res = await axios.get(
        `${backendUrl}/api/wishlist`,
        authHeader // ✅ FIXED
      );

      setWishlist(res.data.wishlist || []);
    } catch (error) {
      console.error("Wishlist fetch failed", error);
      setWishlist([]);
    }
  };

  /* ================= ADD TO WISHLIST ================= */
  const addToWishlist = async (productId, color, size) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/add`,
        { productId, color, size },
        authHeader // ✅ FIXED
      );

      getWishlist();
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  /* ================= REMOVE FROM WISHLIST ================= */
  const removeFromWishlist = async (productId, color, size) => {
    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/wishlist/remove`,
        { productId, color, size },
        authHeader // ✅ FIXED
      );

      getWishlist();
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  /* ================= CHECK IF IN WISHLIST ================= */
  const isInWishlist = (productId, color, size) => {
    return wishlist.some(
      (item) =>
        item.productId?._id === productId &&
        item.color === color &&
        item.size === size
        // item.type === type
    );
  };

  /* ================= SAVE CART ================= */
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  /* ================= ADD TO CART ================= */
  const addToCart = async (itemId, size) => {
    if (!size) return toast.error("Please select a size");

    const sizeKey = String(size);

    setCartItems((prev) => {
      const updated = structuredClone(prev);
      if (!updated[itemId]) updated[itemId] = {};
      updated[itemId][sizeKey] = (updated[itemId][sizeKey] || 0) + 1;
      return updated;
    });

    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/add`,
        { itemId, size: sizeKey },
        authHeader
      );
    } catch {
      toast.error("Failed to sync cart");
    }
  };

  /* ================= CART COUNT ================= */
  const getCartItems = () => {
    let total = 0;
    for (const pid in cartItems) {
      for (const size in cartItems[pid]) {
        total += Number(cartItems[pid][size]) || 0;
      }
    }
    return total;
  };

  /* ================= SIZE DATA ================= */
  const getSizeData = (product, size) => {
    if (!product?.variants) return null;

    for (const variant of product.variants) {
      const found = variant.sizes.find(
        (s) => String(s.size) === String(size)
      );
      if (found) {
        return {
          price: Number(found.price),
          image: variant.images?.[0] || "",
          color: variant.color,
          type: variant.type,
        };
      }
    }
    return null;
  };

  /* ================= CART TOTAL ================= */
  const getCartAmount = () => {
    let total = 0;
    for (const pid in cartItems) {
      const product = products.find((p) => p._id === pid);
      if (!product) continue;

      for (const size in cartItems[pid]) {
        const qty = Number(cartItems[pid][size]) || 0;
        const sizeData = getSizeData(product, size);
        if (sizeData) total += qty * sizeData.price;
      }
    }
    return total;
  };

  /* ================= UPDATE QTY ================= */
  const updateQuantity = async (itemId, size, quantity) => {
    const qty = Number(quantity);

    setCartItems((prev) => {
      const updated = structuredClone(prev);
      if (!updated[itemId]) return updated;

      if (qty <= 0) {
        delete updated[itemId][size];
        if (!Object.keys(updated[itemId]).length) delete updated[itemId];
      } else {
        updated[itemId][size] = qty;
      }
      return updated;
    });

    if (!token) return;

    try {
      await axios.post(
        `${backendUrl}/api/cart/update`,
        { itemId, size, quantity: qty },
        authHeader
      );
    } catch {
      toast.error("Failed to sync cart");
    }
  };

  /* ================= LOAD PRODUCTS ================= */
  const getProductsData = async () => {
    const { data } = await axios.get(`${backendUrl}/api/product/list`);
    if (data.success) {
      setProducts(data.products);
      setProductsLoaded(true);
    }
  };

  /* ================= MERGE CART ================= */
  const getUserCart = async () => {
    if (!token) return;
    const { data } = await axios.post(
      `${backendUrl}/api/cart/get`,
      {},
      authHeader
    );
    if (data.success) setCartItems(data.cartData || {});
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (token && productsLoaded) getUserCart();
  }, [token, productsLoaded]);

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
        getSizeData,
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
