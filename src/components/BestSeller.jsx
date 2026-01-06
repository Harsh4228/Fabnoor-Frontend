import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSellers, setBestSellers] = useState([]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (products.length > 0) {
      const bestProductList = products.filter((item) => item.bestseller);
      const shuffledProducts = shuffleArray([...bestProductList]);
      setBestSellers(shuffledProducts.slice(0, 5));
    }
  }, [products]);

  // ✅ IMAGE FROM VARIANT
  const getImage = (product) => {
    return product?.variants?.[0]?.images?.[0] || assets.placeholder_image;
  };

  // ✅ PRICE FROM VARIANT
  const getPrice = (product) => {
    return product?.variants?.[0]?.sizes?.[0]?.price || 0;
  };

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover our most popular products! These best sellers are selected fresh every time you visit.
        </p>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSellers.map((item) => (
          <Link
            to={`/product/${item._id}`}
            key={item._id}
            className="border p-2 hover:shadow"
          >
            {/* IMAGE */}
            <div className="w-full h-52 bg-gray-100 overflow-hidden">
              <img
                src={getImage(item)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = assets.placeholder_image;
                }}
              />
            </div>

            {/* INFO */}
            <div className="pt-2">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-sm text-gray-600">₹{getPrice(item)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
