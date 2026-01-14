import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [wishlist, setWishlist] = useState({});

  /* IMAGE FROM VARIANT */
  const getImage = (p) =>
    p?.variants?.[0]?.images?.[0] || assets.placeholder_image;

  /* PRICE FROM VARIANT */
  const getPrice = (p) =>
    p?.variants?.[0]?.sizes?.[0]?.price || 0;

  /* FILTER OPTIONS */
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const subCategories = useMemo(
    () => [...new Set(products.map((p) => p.subCategory).filter(Boolean))],
    [products]
  );

  /* FILTER + SEARCH + SORT */
  useEffect(() => {
    let temp = [...products];

    if (showSearch && search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q)
      );
    }

    if (category.length) temp = temp.filter((p) => category.includes(p.category));
    if (subCategory.length) temp = temp.filter((p) => subCategory.includes(p.subCategory));

    if (sortType === "low-high") temp.sort((a, b) => getPrice(a) - getPrice(b));
    if (sortType === "high-low") temp.sort((a, b) => getPrice(b) - getPrice(a));

    setFilteredProducts(temp);
  }, [products, category, subCategory, search, showSearch, sortType]);

  const toggleWishlist = (id, e) => {
    e.preventDefault();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t px-4 md:px-10">

      {/* FILTERS */}
      <div className="min-w-60">
        <p onClick={() => setShowFilter(!showFilter)} className="my-2 text-xl cursor-pointer">
          FILTERS
        </p>

        <div className={`${showFilter ? "" : "hidden"} sm:block border p-4`}>
          <p className="font-medium mb-2">Categories</p>
          {categories.map((c) => (
            <label key={c} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                onChange={() =>
                  setCategory((p) =>
                    p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
                  )
                }
              />
              {c}
            </label>
          ))}
        </div>

        <div className={`${showFilter ? "" : "hidden"} sm:block border p-4 mt-4`}>
          <p className="font-medium mb-2">Sub Category</p>
          {subCategories.map((s) => (
            <label key={s} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                onChange={() =>
                  setSubCategory((p) =>
                    p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                  )
                }
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="flex-1">
        <div className="flex justify-between mb-6">
          <Title text1="ALL" text2="COLLECTIONS" />
          <select onChange={(e) => setSortType(e.target.value)} className="border px-2">
            <option value="relevant">Relevant</option>
            <option value="low-high">Low → High</option>
            <option value="high-low">High → Low</option>
          </select>
        </div>

        {/* PREMIUM PRODUCT GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((item) => (
            <Link key={item._id} to={`/product/${item._id}`} className="group">

              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-50 mb-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-pink-100">

                {/* NEW badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] px-3 py-1 rounded-full shadow-md">
                    NEW
                  </span>
                </div>

                {/* Wishlist */}
                {/* <button
                  onClick={(e) => toggleWishlist(item._id, e)}
                  className="absolute top-2 right-2 z-10 bg-white/90 p-2 rounded-full hover:bg-rose-500 hover:text-white shadow-md"
                >
                  {wishlist[item._id] ? (
                    <FaHeart className="text-rose-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button> */}

                {/* Image */}
                <div className="w-full h-48 md:h-56 overflow-hidden">
                  <img
                    src={getImage(item)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick View */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 text-center py-2 text-xs text-rose-500 font-medium">
                  Quick View
                </div>
              </div>

              {/* Info */}
              <div className="text-center px-1">
                <h3 className="text-xs md:text-sm font-medium text-gray-800 truncate group-hover:text-rose-500">
                  {item.name}
                </h3>
                <p className="text-sm md:text-base font-serif text-rose-500">
                  ₹{getPrice(item).toLocaleString()}
                </p>
              </div>

            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
