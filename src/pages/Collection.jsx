import { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";
import SetInfo from "../components/SetInfo";
import axios from "axios";

const Collection = () => {
  const { search, showSearch, getProductDiscount } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSubCategory = searchParams.get("subCategory");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  // Data state
  const [productsList, setProductsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 12;

  // Metadata state (for filters)
  const [allCategories, setAllCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});

  // Active filters
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  /* IMAGE HELPER */
  const getImage = (p) =>
    p?.variants?.[0]?.images?.[0] || assets.placeholder_image;

  /* LOAD METADATA */
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/product/metadata`);
        if (data.success) {
          setAllCategories(data.categories || []);
          setSubCategoriesMap(data.subCategoriesMap || {});
        }
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMetadata();
  }, [backendUrl]);

  /* EXTRACT ACTIVE SUBCATEGORIES */
  const activeSubCategories = category.reduce((acc, cat) => {
    if (subCategoriesMap[cat]) {
      acc.push(...subCategoriesMap[cat]);
    }
    return acc;
  }, []);
  const displaySubCategories = [...new Set(activeSubCategories)];

  /* URL SYNC */
  useEffect(() => {
    if (urlCategory) setCategory([urlCategory]);
    else setCategory([]);

    if (urlSubCategory) setSubCategory([urlSubCategory]);
    else setSubCategory([]);
  }, [urlCategory, urlSubCategory]);

  /* FETCH PRODUCTS */
  const fetchProducts = async (isAppend = false) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: limit,
      };

      if (category.length) params.category = category.join(",");
      if (subCategory.length) params.subCategory = subCategory.join(",");
      if (showSearch && search) params.search = search;
      if (sortType !== "relevant") params.sortType = sortType;

      const { data } = await axios.get(`${backendUrl}/api/product/list`, { params });

      if (data.success) {
        if (isAppend) {
          setProductsList(prev => [...prev, ...data.products]);
        } else {
          setProductsList(data.products);
        }
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  /* TRIGGER FETCH WHEN FILTERS CHANGE */
  useEffect(() => {
    setPage(1); // Reset page on filter change
    // We cannot reliably fetch here because setState is async, and we must wait for page to reach 1.
    // However, if we clear products first:
    setProductsList([]);
  }, [category, subCategory, search, showSearch, sortType]);

  /* MAIN EFFECT: RUNS WHEN PAGE CHANGES OR PRODUCTS IS EMPTIED BY FILTERS */
  useEffect(() => {
    fetchProducts(page > 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, subCategory, search, showSearch, sortType]);

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
    <div className="pt-10 border-t px-4 md:px-10 min-h-screen">
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
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 ${sortType === s.key ? "text-pink-500 font-medium" : ""
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
        <div className="hidden sm:block w-64 min-w-[256px]">
          <div className="border rounded-2xl p-6 bg-white shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
              Filter By
            </h3>

            {/* HIERARCHICAL CATEGORY LIST */}
            <div className="space-y-6">
              {allCategories.map((cat) => {
                const subs = subCategoriesMap[cat] || [];
                const isSelected = category.includes(cat);

                return (
                  <div key={cat} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-3 text-sm font-semibold text-gray-800 cursor-pointer group-hover:text-pink-500 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-pink-500 rounded-md"
                          checked={isSelected}
                          onChange={() =>
                            setCategory((p) =>
                              p.includes(cat) ? p.filter((x) => x !== cat) : [...p, cat]
                            )
                          }
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                      {subs.length > 0 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500"}`}>
                          {subs.length}
                        </span>
                      )}
                    </div>

                    {/* SUB-CATEGORIES NESTED UNDERNEATH */}
                    {isSelected && subs.length > 0 && (
                      <div className="ml-7 mt-2 space-y-2 border-l-2 border-pink-50 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                        {subs.map((s) => (
                          <label key={s} className="flex items-center gap-3 text-xs text-gray-600 hover:text-pink-500 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 accent-pink-500 rounded"
                              checked={subCategory.includes(s)}
                              onChange={() =>
                                setSubCategory((p) =>
                                  p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                                )
                              }
                            />
                            <span className="capitalize">{s}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="flex-1 w-full">
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
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 ${sortType === s.key ? "text-pink-500 font-medium" : ""
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
            {productsList.map((item) => (
              <Link key={item._id} to={`/product/${item._id}`} className="group relative block">
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-3 shadow hover:shadow-xl transition border border-transparent hover:border-pink-100">
                  <div className="w-full h-48 md:h-56 overflow-hidden">
                    <img
                      src={getImage(item)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {getProductDiscount(item) > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full shadow-md uppercase">
                      {getProductDiscount(item)}% OFF
                    </div>
                  )}
                </div>

                <div className="text-center px-1">
                  <h3 className="text-xs md:text-sm font-medium text-gray-800 mb-1 truncate group-hover:text-rose-500 transition-colors">
                    {item.name}
                  </h3>
                  <div className="text-sm md:text-base font-serif text-rose-500">
                    <span className="font-semibold">₹{formatNumber(getPerPiecePrice(item, getProductDiscount(item)))}/pc</span>
                    {getProductDiscount(item) > 0 && (
                      <span className="text-[10px] text-gray-400 line-through ml-2">₹{formatNumber(getPerPiecePrice(item))}</span>
                    )}
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                      (Full Set) ₹{formatNumber(getPackPrice(item, getProductDiscount(item)))}
                      {getProductDiscount(item) > 0 && (
                        <span className="text-[10px] text-gray-300 line-through ml-1">₹{formatNumber(getPackPrice(item))}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* EMPTY STATE */}
          {!loading && productsList.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            </div>
          )}

          {/* LOAD MORE BUTTON */}
          {productsList.length > 0 && productsList.length < totalCount && (
            <div className="flex justify-center mt-12 mb-10">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-full shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}

          {/* END OF LIST */}
          {!loading && productsList.length > 0 && productsList.length >= totalCount && (
            <div className="text-center mt-12 mb-10 text-gray-400 text-sm">
              You've reached the end of the list.
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/40 z-50 flex">
          <div className="bg-white w-80 h-full p-5 overflow-y-auto">
            <p className="font-bold mb-6 text-xl text-gray-900">Filters</p>

            <div className="space-y-6">
              {allCategories.map((cat) => {
                const subs = subCategoriesMap[cat] || [];
                const isSelected = category.includes(cat);

                return (
                  <div key={cat} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-4 text-base font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-pink-500 rounded-md"
                          checked={isSelected}
                          onChange={() =>
                            setCategory((p) =>
                              p.includes(cat) ? p.filter((x) => x !== cat) : [...p, cat]
                            )
                          }
                        />
                        <span className="capitalize">{cat}</span>
                      </label>
                      {subs.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          {subs.length}
                        </span>
                      )}
                    </div>

                    {/* MOBILE NESTED SUBS */}
                    {isSelected && subs.length > 0 && (
                      <div className="ml-9 space-y-4 pt-2">
                        {subs.map((s) => (
                          <label key={s} className="flex items-center gap-4 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-pink-500 rounded"
                              checked={subCategory.includes(s)}
                              onChange={() =>
                                setSubCategory((p) =>
                                  p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                                )
                              }
                            />
                            <span className="capitalize">{s}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowFilter(false)}
              className="mt-10 w-full bg-pink-500 hover:bg-pink-600 text-white py-3.5 rounded-xl font-semibold transition"
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
