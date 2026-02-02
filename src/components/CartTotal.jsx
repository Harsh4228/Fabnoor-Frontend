import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { formatNumber } from "../utils/price";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  const subtotal = getCartAmount();
  const total = subtotal === 0 ? 0 : subtotal + delivery_fee;

  return (
    <div className="w-full bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-pink-100 shadow-lg">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-2xl font-serif text-gray-900">CART</h2>
          <span className="text-xl md:text-2xl font-serif text-rose-500">
            TOTALS
          </span>
        </div>
        <div className="h-0.5 w-16 bg-gradient-to-r from-rose-400 to-pink-300 mt-2" />
      </div>

      <div className="space-y-4 md:space-y-5">
        <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">
            {currency} {formatNumber(subtotal)}
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200" />

        <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
          <span className="font-medium">Shipping Fee</span>
          <span className="font-semibold">
            {currency} {formatNumber(delivery_fee)}
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200" />

        <div className="flex justify-between items-center pt-3 md:pt-4">
          <span className="text-base md:text-lg font-bold text-gray-900">
            Total
          </span>
          <span className="text-lg md:text-xl font-bold text-rose-500">
            {currency} {formatNumber(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
