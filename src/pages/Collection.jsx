import { useContext, useEffect, useMemo, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";
import SetInfo from "../components/SetInfo";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  const [searchParams] = useSearchParams(); // ✅ GET URL QUERY
  const urlCategory = searchParams.get("category"); // example: "Mens"
  const urlSubCategory = searchParams.get("subCategory"); // optional

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  const [sortType, setSortType] = useState("relevant");

  const sortRef = useRef(null);

  /* IMAGE */
  const getImage = (p) =>
    p?.variants?.[0]?.images?.[0] || assets.placeholder_image;



  /* FILTER OPTIONS */
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const subCategories = useMemo(
    () => [...new Set(products.map((p) => p.subCategory).filter(Boolean))],
    [products]
  );

  /* ✅ APPLY URL FILTER ON PAGE LOAD / URL CHANGE */
  useEffect(() => {
    // If URL has category -> set checkbox filter automatically
    if (urlCategory) {
      setCategory([urlCategory]);
    } else {
      setCategory([]);
    }

    // Optional: support subCategory in URL too
    if (urlSubCategory) {
      setSubCategory([urlSubCategory]);
    } else {
      setSubCategory([]);
    }
  }, [urlCategory, urlSubCategory]);

  /* FILTER + SEARCH + SORT */
  useEffect(() => {
    let temp = [...products];

    // SEARCH
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

    // CATEGORY FILTER
    if (category.length) {
      temp = temp.filter((p) => category.includes(p.category));
    }

    // SUB CATEGORY FILTER
    if (subCategory.length) {
      temp = temp.filter((p) => subCategory.includes(p.subCategory));
    }

    // SORT
    if (sortType === "low-high") temp.sort((a, b) => getPerPiecePrice(a) - getPerPiecePrice(b));
    if (sortType === "high-low") temp.sort((a, b) => getPerPiecePrice(b) - getPerPiecePrice(a));

    setFilteredProducts(temp);
  }, [products, category, subCategory, search, showSearch, sortType]);

  /* CLOSE SORT ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="pt-10 border-t px-4 md:px-10">
      {/* MOBILE TOP BAR */}
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium"
        >
          <FaFilter /> Filters
        </button>

        {/* CUSTOM SORT */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm"
          >
            Sort
            <FaChevronDown className="text-xs" />
          </button>

          {showSort && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-20">
              {[
                { key: "relevant", label: "Relevant" },
                { key: "low-high", label: "Price: Low → High" },
                { key: "high-low", label: "Price: High → Low" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setSortType(s.key);
                    setShowSort(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 ${
                    sortType === s.key ? "text-pink-500 font-medium" : ""
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* DESKTOP FILTERS */}
        <div className="hidden sm:block w-64">
          <div className="border rounded-2xl p-5 mb-6">
            <h3 className="font-semibold mb-4">Categories</h3>

            {categories.map((c) => (
              <label key={c} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={category.includes(c)}
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

          <div className="border rounded-2xl p-5">
            <h3 className="font-semibold mb-4">Sub Categories</h3>
            {subCategories.map((s) => (
              <label key={s} className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={subCategory.includes(s)}
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
          <div className="hidden sm:flex justify-between mb-8">
            <div className="flex items-center gap-2">
              <Title text1="ALL" text2="COLLECTIONS" />
              <SetInfo compact />
            </div>

            {/* DESKTOP SORT */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 border rounded-full"
              >
                Sort
                <FaChevronDown className="text-xs" />
              </button>

              {showSort && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-20">
                  {[
                    { key: "relevant", label: "Relevant" },
                    { key: "low-high", label: "Price: Low → High" },
                    { key: "high-low", label: "Price: High → Low" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => {
                        setSortType(s.key);
                        setShowSort(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 ${
                        sortType === s.key ? "text-pink-500 font-medium" : ""
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((item) => (
              <Link key={item._id} to={`/product/${item._id}`} className="group">
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow hover:shadow-xl transition">
                  <div className="h-48 md:h-56 overflow-hidden">
                    <img
                      src={getImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-sm font-medium truncate group-hover:text-pink-500">
                    {item.name}
                  </h3>
                  <p className="text-base font-serif text-pink-500">
                    <span className="font-semibold">₹{formatNumber(getPackPrice(item))}</span>
                    <span className="text-sm text-gray-500 ml-2">(Set) ₹{formatNumber(getPerPiecePrice(item))}/pc</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/40 z-50 flex">
          <div className="bg-white w-80 h-full p-5 overflow-y-auto">
            <h3 className="font-semibold mb-4">Filters</h3>

            <p className="font-medium mb-2">Categories</p>
            {categories.map((c) => (
              <label key={c} className="flex gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={category.includes(c)}
                  onChange={() =>
                    setCategory((p) =>
                      p.includes(c) ? p.filter((x) => x !== c) : [...p, c]
                    )
                  }
                />
                {c}
              </label>
            ))}

            <p className="font-medium mt-4 mb-2">Sub Categories</p>
            {subCategories.map((s) => (
              <label key={s} className="flex gap-2 text-sm mb-2">
                <input
                  type="checkbox"
                  checked={subCategory.includes(s)}
                  onChange={() =>
                    setSubCategory((p) =>
                      p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                    )
                  }
                />
                {s}
              </label>
            ))}

            <button
              onClick={() => setShowFilter(false)}
              className="mt-6 w-full bg-pink-500 text-white py-3 rounded-xl font-semibold"
            >
              Apply Filters
            </button>
          </div>

          <div className="flex-1" onClick={() => setShowFilter(false)} />
        </div>
      )}
    </div>
  );
};

export default Collection;
