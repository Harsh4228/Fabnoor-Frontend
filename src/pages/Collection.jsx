import { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { Link, useSearchParams } from "react-router-dom";
import { assets } from "../assets/assets";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import { getPerPiecePrice, formatNumber, getPackPrice } from "../utils/price";
import SetInfo from "../components/SetInfo";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const Collection = () => {
  const { search, showSearch, getProductDiscount, addProductsToCache } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  const urlSubCategory = searchParams.get("subCategory");

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const mobileSortRef = useRef(null);
  const desktopSortRef = useRef(null);

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

      const { data } = await axios.get(`${backendUrl}/api/product/list`, {
        params,
      });

      if (data.success) {
        addProductsToCache(data.products);
        if (isAppend) {
          setProductsList((prev) => [...prev, ...data.products]);
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
      const isOutsideMobile =
        mobileSortRef.current && !mobileSortRef.current.contains(e.target);
      const isOutsideDesktop =
        desktopSortRef.current && !desktopSortRef.current.contains(e.target);

      if (isOutsideMobile && isOutsideDesktop) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="pt-10 border-t min-h-screen">
      {/* MOBILE TOP BAR */}
      <div className="flex items-center justify-between mb-6 sm:hidden">
        <button
          onClick={() => setShowFilter(true)}
          className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium"
        >
          <FaFilter /> Filters
        </button>

        {/* CUSTOM SORT */}
        <div className="relative" ref={mobileSortRef}>
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
        <div className="hidden sm:block w-64 min-w-[256px]">
          <div className="border rounded-2xl p-6 bg-white shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-pink-500 rounded-full"></span>
              Filter By
            </h3>

            {/* HIERARCHICAL CATEGORY LIST */}
            <div className="space-y-6">
              {allCategories.map((catObj) => {
                const cat = typeof catObj === 'string' ? catObj : catObj.name;
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
                              setCategory((p) => {
                                const isUnselecting = p.includes(cat);
                                if (isUnselecting) {
                                  // Clear subcategories belonging to this category
                                  const subsToClear =
                                    subCategoriesMap[cat] || [];
                                  setSubCategory((prevSubs) =>
                                    prevSubs.filter(
                                      (s) => !subsToClear.includes(s),
                                    ),
                                  );
                                  return p.filter((x) => x !== cat);
                                }
                                return [...p, cat];
                              })
                            }
                          />
                          <span className="capitalize">{cat}</span>
                        </label>
                        {subs.length > 0 && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            {subs.length}
                          </span>
                        )}
                      </div>

                      {/* SUB-CATEGORIES NESTED UNDERNEATH */}
                      {isSelected && subs.length > 0 && (
                        <div className="ml-7 mt-2 space-y-2 border-l-2 border-pink-50 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                          {subs.map((s) => (
                            <label
                              key={s}
                              className="flex items-center gap-3 text-xs text-gray-600 hover:text-pink-500 cursor-pointer transition-all"
                            >
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 accent-pink-500 rounded"
                                checked={subCategory.includes(s)}
                                onChange={() =>
                                  setSubCategory((p) =>
                                    p.includes(s)
                                      ? p.filter((x) => x !== s)
                                      : [...p, s],
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
            <div className="relative" ref={desktopSortRef}>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 md:gap-6">
            {productsList.flatMap((item) =>
              (item.variants || []).map((variant) => {
                const discount = getProductDiscount(item);
                const piecePriceDiscounted = getPerPiecePrice(item, discount);
                const piecePriceOriginal = getPerPiecePrice(item);
                const packPriceDiscounted = getPackPrice(item, discount);
                const packPriceOriginal = getPackPrice(item);
                const variantImage = variant.images?.[0] || assets.placeholder_image;
                const linkTo = `/product/${item._id}?color=${encodeURIComponent(variant.color || "")}&code=${encodeURIComponent(variant.code || "")}`;

                return (
                  <ProductCard
                    key={`${item._id}-${variant.code || variant.color}`}
                    item={item}
                    variant={variant}
                    tag={item.bestseller ? "BESTSELLER" : ""}
                  />
                );
              })
            )}
          </div>

          {/* EMPTY STATE */}
          {!loading && productsList.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No products found matching your filters.
              </p>
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
          {!loading &&
            productsList.length > 0 &&
            productsList.length >= totalCount && (
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
              {allCategories.map((catObj) => {
                const cat = typeof catObj === 'string' ? catObj : catObj.name;
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
                              setCategory((p) => {
                                const isUnselecting = p.includes(cat);
                                if (isUnselecting) {
                                  const subsToClear =
                                    subCategoriesMap[cat] || [];
                                  setSubCategory((prevSubs) =>
                                    prevSubs.filter(
                                      (s) => !subsToClear.includes(s),
                                    ),
                                  );
                                  return p.filter((x) => x !== cat);
                                }
                                return [...p, cat];
                              })
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
                            <label
                              key={s}
                              className="flex items-center gap-4 text-sm text-gray-600"
                            >
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-pink-500 rounded"
                                checked={subCategory.includes(s)}
                                onChange={() =>
                                  setSubCategory((p) =>
                                    p.includes(s)
                                      ? p.filter((x) => x !== s)
                                      : [...p, s],
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

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => {
                  setCategory([]);
                  setSubCategory([]);
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 rounded-xl font-semibold transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3.5 rounded-xl font-semibold transition"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="flex-1" onClick={() => setShowFilter(false)} />
        </div>
      )}
    </div>
  );
};

export default Collection;
