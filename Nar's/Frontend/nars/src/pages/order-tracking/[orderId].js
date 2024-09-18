import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import axios from 'axios';

const OrderTracking = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/order/${orderId}`, {
        withCredentials: true
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Your Order</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4">Order Details</h2>
        <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
        <p><strong>Tracking Number:</strong> {orderDetails.trackingNumber}</p>
        <p><strong>Status:</strong> {orderDetails.status}</p>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Billing Information</h3>
        <p><strong>Full Name:</strong> {orderDetails.billingInfo.fullName}</p>
        <p><strong>Phone Number:</strong> {orderDetails.billingInfo.phoneNumber}</p>
        <p><strong>Address:</strong> {orderDetails.billingInfo.address}</p>
        <p><strong>City:</strong> {orderDetails.billingInfo.city}</p>
        <p><strong>State/Province:</strong> {orderDetails.billingInfo.stateProvince}</p>
        <p><strong>Postal Code:</strong> {orderDetails.billingInfo.postalCode}</p>
        <p><strong>Delivery Address:</strong> {orderDetails.billingInfo.deliveryAddress}</p>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Payment Method</h3>
        <p>{orderDetails.paymentMethod}</p>
        
        <h3 className="text-xl font-bold mt-6 mb-2">Ordered Items</h3>
        {orderDetails.items.map((item, index) => (
          <div key={index} className="mb-2">
            <p><strong>{item.name}</strong> - Quantity: {item.quantity}, Price: ₱{item.price}</p>
          </div>
        ))}
        
        <h3 className="text-xl font-bold mt-6 mb-2">Total</h3>
        <p><strong>Subtotal:</strong> ₱{orderDetails.subtotal}</p>
        <p><strong>Delivery Fee:</strong> ₱{orderDetails.delivery}</p>
        <p><strong>Total:</strong> ₱{orderDetails.total}</p>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => router.push('/home')}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Go back to order again
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;