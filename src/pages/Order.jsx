import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Order = () => {
  const { token, currency } = useContext(ShopContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [orderData, setOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrderData(response.data.orders || []);
      }
    } catch (error) {
      console.error("Load orders error:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

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
      <div>
        {orderData.map((order) => (
          <div
            key={order._id}
            className="py-4 border-t border-b text-gray-700 flex flex-col gap-4"
          >
            {order.items.map((item, i) => (
              <div
                key={`${order._id}-${item.productId || item.name}-${i}`}
                className="flex flex-col md:flex-row md:justify-between gap-4"
              >
                <div className="flex gap-6 text-sm">
                  <img
                    className="w-16 sm:w-20"
                    src={item.image}
                    alt={item.name}
                  />

                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>

                    <div className="flex gap-3 mt-1 text-base flex-wrap">
                      <p>
                        {currency}
                        {item.price}
                      </p>
                      <p>Qty: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                      <p>Color: {item.color}</p>
                    </div>

                    <p className="mt-1">
                      Date:{" "}
                      <span className="text-gray-400">
                        {new Date(order.createdAt).toDateString()}
                      </span>
                    </p>

                    <p className="mt-1">
                      Payment:{" "}
                      <span className="text-gray-400">
                        {order.paymentMethod}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:w-1/2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <p className="text-sm md:text-base">{order.status}</p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ================= TRACK ORDER MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[90%] max-w-lg rounded">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>

            <p>
              <b>Status:</b> {selectedOrder.status}
            </p>
            <p>
              <b>Payment:</b> {selectedOrder.paymentMethod}
            </p>
            <p>
              <b>Total:</b> {currency}
              {selectedOrder.amount}
            </p>

            <div className="mt-3">
              <b>Delivery Address:</b>
              <p>{selectedOrder.address.fullName}</p>
              <p>{selectedOrder.address.addressLine}</p>
              <p>
                {selectedOrder.address.city}, {selectedOrder.address.state}
              </p>
              <p>{selectedOrder.address.pincode}</p>
              <p>{selectedOrder.address.phone}</p>
            </div>

            <div className="mt-4">
              <b>Items:</b>
              {selectedOrder.items.map((i, idx) => (
                <p key={idx}>
                  {i.name} ({i.color}, {i.size}) × {i.quantity}
                </p>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 bg-black text-white px-6 py-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
