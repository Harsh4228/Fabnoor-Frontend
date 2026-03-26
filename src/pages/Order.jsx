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
                        <p><span className="text-gray-400">Size:</span> {Array.isArray(item.size) ? item.size.join(', ') : item.size}</p>
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
      {/* ================= PREMIUM GLASSMORPHIC TRACK ORDER MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-2xl w-full max-w-2xl rounded-[2.5rem] shadow-[0_22px_70px_4px_rgba(0,0,0,0.2)] border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">Track Journey</h2>
                <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] mt-1 uppercase">Manifest: {selectedOrder.orderNumber || selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="relative z-10 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all hover:rotate-90 duration-300 border border-white/10"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-8 space-y-10 scrollbar-none">
              {/* Stepper Section */}
              <div className="relative py-4">
                <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-4 relative px-2">
                  {/* Progress Line (Backdrop) */}
                  <div className="hidden sm:block absolute top-[1.375rem] left-[5%] right-[5%] h-1 bg-slate-100/50 rounded-full -z-10" />

                  {STATUS_STEPS.map((step, idx) => {
                    const currentIndex = STATUS_STEPS.indexOf(selectedOrder.status);
                    const isCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;

                    return (
                      <div key={step} className="flex flex-row sm:flex-col items-center gap-5 sm:gap-4 flex-1">
                        {/* Vertical line for mobile */}
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`sm:hidden absolute left-[1.375rem] mt-12 w-1 h-12 rounded-full ${isCompleted ? 'bg-pink-500' : 'bg-slate-100'}`} style={{ top: `${idx * 5.5}rem` }} />
                        )}

                        {/* Step Circle */}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-700 shadow-2xl ${isCompleted ? 'bg-pink-500 border-pink-100 text-white rotate-[360deg]' :
                          isActive ? 'bg-white border-pink-500 text-pink-500 scale-110 shadow-pink-200 animate-pulse' :
                            'bg-slate-50 border-white text-slate-300'
                          }`}>
                          {isCompleted ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-black tracking-tighter">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Label */}
                        <div className="flex flex-col sm:items-center text-left sm:text-center">
                          <p className={`text-[10px] font-black tracking-widest transition-colors duration-500 ${isCompleted ? 'text-pink-600' : isActive ? 'text-pink-500' : 'text-slate-400'
                            }`}>
                            {step.toUpperCase()}
                          </p>
                          {isActive && (
                            <span className="text-[8px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-black tracking-widest mt-1">ACTIVE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info Cards - Glassmorphism style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Info */}
                <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-pink-500 p-2.5 rounded-xl text-white shadow-lg shadow-pink-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Destination</h3>
                  </div>
                  <div className="text-[13px] text-slate-600 font-bold space-y-1.5 ml-1">
                    <p className="font-black text-slate-900 text-base">{selectedOrder.address.fullName}</p>
                    <p className="opacity-70">{selectedOrder.address.addressLine}</p>
                    <p className="opacity-70">{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                    <div className="pt-3 flex items-center gap-2 text-pink-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {selectedOrder.address.phone}
                    </div>
                  </div>
                </div>

                {/* Summary Info */}
                <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-6 border border-white shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Payment</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs ml-1">
                      <span className="text-slate-400 font-bold tracking-widest uppercase">Method</span>
                      <span className="font-black text-slate-900 uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs ml-1">
                      <span className="text-slate-400 font-bold tracking-widest uppercase">Status</span>
                      <span className={`font-black uppercase px-2 py-0.5 rounded-md ${selectedOrder.payment ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {selectedOrder.payment ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                    <div className="flex justify-between items-end border-t border-slate-200 pt-4 ml-1">
                      <span className="text-slate-400 font-bold tracking-widest uppercase text-[10px] pb-1">Total Amount</span>
                      <span className="font-black text-pink-500 text-3xl tracking-tighter">{currency}{selectedOrder.amount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                  Package Contents
                </h3>
                <div className="bg-white/50 border border-slate-100 rounded-[2rem] overflow-hidden divide-y divide-slate-50">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-5 flex items-center gap-5 hover:bg-white transition-colors">
                      <div className="relative group">
                        <img src={i.image} alt="" className="w-16 h-20 object-cover rounded-2xl shadow-md group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[8px] font-black w-5 h-5 rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                          {i.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{i.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                          {i.color} / {Array.isArray(i.size) ? i.size.join(', ') : i.size}
                        </p>
                      </div>
                      <p className="text-lg font-black text-slate-900 tracking-tighter">{currency}{i.price * i.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-slate-50/80 backdrop-blur-md border-t border-white/20 flex flex-col sm:flex-row gap-5 items-center sm:justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center sm:text-left leading-relaxed">
                Concierge assistance required? <br />
                <span className="text-pink-500 cursor-pointer hover:underline">Connect with Support</span>
              </p>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
              >
                Close Tracking
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
