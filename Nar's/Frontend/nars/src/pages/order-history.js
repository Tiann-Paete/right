import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import RatingModal from '../components/RatingModal';
import { Star } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/order-history', { withCredentials: true });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching order history');
    }
  };

  const handleRateProduct = async (order) => {
    try {
      const response = await axios.get(`http://localhost:8000/order/${order.id}`, { withCredentials: true });
      const detailedOrder = response.data;
      
      const preparedOrder = {
        ...detailedOrder,
        items: detailedOrder.items.map(item => ({
          ...item,
          name: item.name,
          imageUrl: item.imageUrl || '/placeholder-image.jpg'
        }))
      };
      
      setSelectedOrder(preparedOrder);
      setShowRatingModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('An error occurred while fetching order details');
    }
  };

  const handleRatingSubmit = async ({ orderId, ratings, feedback }) => {
    try {
      if (!orderId) {
        throw new Error('No order selected or invalid order ID');
      }
      console.log('Submitting ratings:', { orderId, ratings, feedback }); // Add this line for debugging
      await axios.post(`http://localhost:8000/submit-ratings/${orderId}`, { ratings, feedback }, { withCredentials: true });
      setShowRatingModal(false);
      fetchOrderHistory();
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setError('An error occurred while submitting ratings');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <button 
        onClick={() => router.back()} 
        className="mb-4 text-orange-500 hover:text-orange-600"
      >
        ← Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order.id} className={`mb-4 p-4 border rounded ${order.status === 'Cancelled' ? 'bg-red-100' : ''}`}>
              <p>Order ID: {order.id}</p>
              <p>Tracking Number: {order.tracking_number}</p>
              <p>Status: <span className={order.status === 'Cancelled' ? 'text-red-500 font-bold' : ''}>{order.status}</span></p>
              <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Total: ₱{order.total.toFixed(2)}</p>
              <p>Products: {order.products}</p>
              {order.status === 'Delivered' && !order.is_rated && (
                <button
                  onClick={() => handleRateProduct(order)}
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors duration-300 flex items-center"
                >
                  <Star className="mr-2" size={18} />
                  Rate Products
                </button>
              )}
              {order.is_rated && (
                <p className="mt-2 text-green-600">Thank you for rating this order!</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {showRatingModal && selectedOrder && (
        <RatingModal
          order={selectedOrder}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default OrderHistory;