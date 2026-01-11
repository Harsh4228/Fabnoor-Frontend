import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  return (
    <div className="w-full bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-pink-100 shadow-lg">
      {/* Title */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="text-xl md:text-2xl font-serif text-gray-900">CART</h2>
          <span className="text-xl md:text-2xl font-serif text-rose-500">TOTALS</span>
        </div>
        <div className="h-0.5 w-16 bg-gradient-to-r from-rose-400 to-pink-300 mt-2" />
      </div>

      {/* Cart Details */}
      <div className="space-y-4 md:space-y-5">
        {/* Subtotal */}
        <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">
            {currency} {getCartAmount()}.00
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200" />

        {/* Shipping Fee */}
        <div className="flex justify-between items-center text-sm md:text-base text-gray-700">
          <span className="font-medium">Shipping Fee</span>
          <span className="font-semibold">
            {currency} {delivery_fee}.00
          </span>
        </div>

        <div className="h-px bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200" />

        {/* Total */}
        <div className="flex justify-between items-center pt-3 md:pt-4">
          <span className="text-base md:text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg md:text-xl font-bold text-rose-500">
            {currency} {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.00
          </span>
        </div>
      </div>

      {/* Checkout Button */}
     

      {/* Security Badge */}
      <div className="mt-5 md:mt-6 flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Secure Checkout</span>
      </div>

      {/* Additional Info */}
      <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-pink-200">
        <div className="space-y-2 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free shipping on orders above ₹999</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Easy returns within 7 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;