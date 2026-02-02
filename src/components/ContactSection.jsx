import { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

const CategoryShowcase = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p?.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  return (
    <section className="my-6 py-3 bg-gradient-to-b from-pink-50/30 to-white">
      <div className="container mx-auto px-3">
        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-base md:text-lg font-serif text-gray-900">
            SHOP BY <span className="text-rose-500">CATEGORY</span>
          </h2>
          <p className="text-[10px] md:text-xs text-gray-600">
            Explore collections for every occasion
          </p>
        </div>

        {/* Small Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/collection?category=${cat}`)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full border border-gray-200 bg-white 
              text-gray-700 text-[10px] md:text-xs font-medium shadow-sm 
              hover:border-rose-300 hover:text-rose-500 transition-all duration-200"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default CategoryShowcase;
