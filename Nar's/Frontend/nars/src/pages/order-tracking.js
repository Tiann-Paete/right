import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AlertTriangle, X } from 'lucide-react';

const CancelConfirmationModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Cancel Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex items-center mb-4 text-amber-600">
          <AlertTriangle size={24} className="mr-2" />
          <p className="font-semibold">Are you sure you want to cancel this order?</p>
        </div>
        <p className="mb-6 text-gray-600">This action cannot be undone. Order ID: {orderId}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-200 text-white rounded hover:bg-orange-300 transition-colors"
          >
            No, Keep Order
          </button>
          <button
            onClick={() => {
              onConfirm(orderId);
              onClose();
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Yes, Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8000/all-orders', { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching orders');
    }
  };

  const handleCancelOrder = async (orderId) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };

  const confirmCancelOrder = async (orderId) => {
    try {
      await axios.post(`http://localhost:8000/cancel-order/${orderId}`, {}, { withCredentials: true });
      fetchOrders(); // Refresh the order list
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(error.response?.data?.error || 'An error occurred while cancelling the order');
    }
  };


  return (
    <div className="container mx-auto p-8 relative">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-orange-500 hover:text-orange-600"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className={`mb-4 p-4 border rounded ${order.status === 'Cancelled' ? 'bg-red-100' : ''}`}>
              <div className="flex justify-between items-center">
                <p className="font-bold">Order ID: {order.id}</p>
                {order.status === 'Delivered' && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">Delivered</span>
                )}
                {order.status === 'Cancelled' && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">Cancelled</span>
                )}
              </div>
              <p>Tracking Number: {order.tracking_number}</p>
              <p>Status: <span className={order.status === 'Cancelled' ? 'text-red-500 font-bold' : ''}>{order.status}</span></p>
              <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Total: ₱{order.total.toFixed(2)}</p>
              <button 
                onClick={() => router.push(`/order-tracking/${order.id}`)}
                className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mr-2"
              >
                View Details
              </button>
              {order.status === 'Order Placed' && (
                <button 
                  onClick={() => handleCancelOrder(order.id)}
                  className="mt-2 ml-4 border border-red-500 text-red-500 hover:bg-red-100 px-4 py-2 rounded"
                >
                  Cancel Order
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <CancelConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCancelOrder}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default OrderTracking;