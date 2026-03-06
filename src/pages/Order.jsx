import { useContext, useEffect, useState, useCallback } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import ReviewModal from "../components/ReviewModal";
import axios from "axios";

const STATUS_STEPS = ["Order Placed", "Dispatched", "Out for Delivery", "Delivered", "Cancelled"];

const Order = () => {
  const { token, currency } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [orderData, setOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination state
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  // Review modal state
  const [reviewTarget, setReviewTarget] = useState(null); // { item, orderId }

  const fetchOrders = useCallback(async (isAppend = false, currentPage = 1) => {
    try {
      if (!token) return;
      setLoading(true);

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        { page: currentPage, limit },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (isAppend) {
          setOrderData((prev) => [...prev, ...response.data.orders]);
        } else {
          setOrderData(response.data.orders || []);
        }
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Load orders error:", error);
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl, limit]);

  useEffect(() => {
    fetchOrders(page > 1, page);
  }, [page, token, fetchOrders]);

  // Expose for review success reload
  const reloadFirstPage = () => {
    if (page === 1) {
      fetchOrders(false, 1);
    } else {
      setPage(1); // will trigger useEffect
    }
  };

  // Build the same dedupe key as the backend
  const getReviewKey = (item) =>
    `${item.productId}_${item.code || item.color}`;

  const isReviewed = (order, item) =>
    (order.reviewedItems || []).includes(getReviewKey(item));

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      {/* EMPTY */}
      {orderData.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No orders found
        </p>
      )}

      {/* ORDER LIST */}
      <div className="flex flex-col gap-6 mt-8">
        {orderData.map((order) => (
          <div
            key={order._id}
            className="border rounded-xl shadow-sm bg-white overflow-hidden"
          >
            {/* ORDER HEADER / METADATA */}
            <div className="bg-gray-50 px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">ORDER PLACED</p>
                  <p>{new Date(order.createdAt).toDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">TOTAL</p>
                  <p>{currency}{order.amount}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">PAYMENT</p>
                  <p>{order.paymentMethod}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${order.status === "Delivered"
                      ? "bg-green-500"
                      : order.status === "Cancelled"
                        ? "bg-red-500"
                        : "bg-blue-500"
                      }`}
                  />
                  <p className="text-sm font-semibold text-gray-700">{order.status}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white border border-gray-300 px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap"
                >
                  Track Order
                </button>
              </div>
            </div>

            {/* ORDER ITEMS */}
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div
                  key={`${order._id}-${item.productId || item.name}-${i}`}
                  className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                >
                  <div className="flex gap-6 w-full">
                    <img
                      className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-lg shadow-sm"
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>

                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">
                          {currency}{item.price}
                        </p>
                        <p><span className="text-gray-400">Qty:</span> {item.quantity}</p>
                        <p><span className="text-gray-400">Size:</span> {item.size}</p>
                        <p><span className="text-gray-400">Color:</span> {item.color}</p>
                        {item.code && (
                          <p className="col-span-2 sm:col-auto">
                            <span className="text-gray-400">Code:</span> {item.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ITEM ACTIONS - Write a Review */}
                  <div className="w-full sm:w-auto flex justify-end">
                    {order.status === "Delivered" && (
                      isReviewed(order, item) ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1.5 border border-green-200 rounded-full px-4 py-1.5 bg-green-50">
                          ✓ Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setReviewTarget({ item, orderId: order._id })
                          }
                          className="text-xs sm:text-sm border-2 border-pink-400 text-pink-500 px-5 py-2 rounded-full hover:bg-pink-50 transition-all font-semibold shadow-sm"
                        >
                          ★ Write a Review
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      {orderData.length > 0 && orderData.length < totalCount && (
        <div className="flex justify-center mt-10 mb-10">
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
      {!loading && orderData.length > 0 && orderData.length >= totalCount && (
        <div className="text-center mt-10 mb-10 text-gray-400 text-sm">
          You've reached the end of your orders.
        </div>
      )}

      {/* ================= REDESIGNED TRACK ORDER MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 flex justify-between items-center text-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Track Your Order</h2>
                <p className="text-pink-100 text-sm mt-1">Order No: {selectedOrder.orderNumber || selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8">
              {/* Stepper Section */}
              <div className="relative">
                <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:gap-4 relative px-4">
                  {/* Progress Line (Backdrop) */}
                  <div className="hidden sm:block absolute top-[1.375rem] left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10" />

                  {STATUS_STEPS.map((step, idx) => {
                    const currentIndex = STATUS_STEPS.indexOf(selectedOrder.status);
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                      <div key={step} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 flex-1">
                        {/* Vertical line for mobile */}
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`sm:hidden absolute left-[1.375rem] mt-10 w-0.5 h-10 ${isCompleted ? 'bg-pink-500' : 'bg-gray-100'}`} style={{ top: `${idx * 4.5}rem` }} />
                        )}

                        {/* Step Circle */}
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-pink-500 border-pink-100 text-white' :
                            isActive ? 'bg-white border-pink-500 text-pink-500 shadow-lg shadow-pink-200' :
                              'bg-white border-gray-100 text-gray-400'
                          }`}>
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Label */}
                        <div className="flex flex-col sm:items-center text-left sm:text-center">
                          <p className={`text-xs sm:text-sm font-bold transition-colors duration-300 ${isCompleted ? 'text-pink-600' : isActive ? 'text-pink-500' : 'text-gray-400'
                            }`}>
                            {step.toUpperCase()}
                          </p>
                          {isActive && (
                            <span className="text-[10px] text-pink-400 font-medium animate-pulse mt-1 sm:mt-0">CURRENT STATUS</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800">Delivery Address</h3>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-900">{selectedOrder.address.fullName}</p>
                    <p>{selectedOrder.address.addressLine}</p>
                    <p>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                    <p className="pt-2">{selectedOrder.address.phone}</p>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-800">Order Summary</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-medium text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-bold text-pink-600 text-lg">{currency}{selectedOrder.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  Items in this package
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl divide-y">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4">
                      <img src={i.image} alt="" className="w-14 h-16 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{i.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {i.color} / {i.size} × {i.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{currency}{i.price * i.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row gap-4 items-center sm:justify-between">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                Need help with your order? <span className="text-pink-500 font-semibold cursor-pointer hover:underline">Contact Support</span>
              </p>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REVIEW MODAL ================= */}
      {reviewTarget && (
        <ReviewModal
          item={reviewTarget.item}
          orderId={reviewTarget.orderId}
          onClose={() => setReviewTarget(null)}
          onSuccess={reloadFirstPage}
        />
      )}
    </div>
  );
};

export default Order;
