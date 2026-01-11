import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { Link } from "react-router-dom";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [showFilter, setShowFilter] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  /* IMAGE FROM VARIANT */
  const getProductImage = (product) =>
    product?.variants?.[0]?.images?.[0] || assets.placeholder_image;

  /* PRICE FROM VARIANT */
  const getPrice = (product) =>
    product?.variants?.[0]?.sizes?.[0]?.price || 0;

  /* FILTER OPTIONS */
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const subCategories = useMemo(
    () => [...new Set(products.map((p) => p.subCategory).filter(Boolean))],
    [products]
  );

  /* FILTER + SEARCH */
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

    if (category.length) {
      temp = temp.filter((p) => category.includes(p.category));
    }

    if (subCategory.length) {
      temp = temp.filter((p) => subCategory.includes(p.subCategory));
    }

    if (sortType === "low-high") {
      temp.sort((a, b) => getPrice(a) - getPrice(b));
    } else if (sortType === "high-low") {
      temp.sort((a, b) => getPrice(b) - getPrice(a));
    }

    setFilteredProducts(temp);
  }, [products, category, subCategory, search, showSearch, sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t px-4 md:px-10">

      {/* FILTERS */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl cursor-pointer"
        >
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
        <div className="flex justify-between mb-4">
          <Title text1="ALL" text2="COLLECTIONS" />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border px-2"
          >
            <option value="relevant">Relevant</option>
            <option value="low-high">Low → High</option>
            <option value="high-low">High → Low</option>
          </select>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <Link
              key={p._id}
              to={`/product/${p._id}`}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gray-50 mb-3 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-full h-48 md:h-56 overflow-hidden">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="text-center px-1">
                <h3 className="text-xs md:text-sm font-medium text-gray-800 mb-1 truncate group-hover:text-rose-500 transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm md:text-base font-serif text-rose-500">
                  ₹{getPrice(p).toLocaleString()}
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
