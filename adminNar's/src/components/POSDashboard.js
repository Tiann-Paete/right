import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiCurrencyDollar, HiShoppingCart, HiUsers, HiStar } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const POSDashboard = () => {
  const [salesData, setSalesData] = useState({
    periodSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [ratedProductsCount, setRatedProductsCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [timeFrame, setTimeFrame] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
    fetchRatedProductsCount();
    fetchTopProducts();
    fetchTotalProducts();
  }, [timeFrame]);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8001/sales-data?timeFrame=${timeFrame}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setError('Failed to fetch sales data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatedProductsCount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8001/rated-products-count?timeFrame=${timeFrame}`);
      setRatedProductsCount(response.data.ratedProductsCount);
    } catch (error) {
      console.error('Error fetching rated products count:', error);
      setError('Failed to fetch rated products count. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8001/top-products');
      setTopProducts(response.data);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError('Failed to fetch top products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTotalProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8001/total-products');
      setTotalProducts(response.data.totalProducts);
    } catch (error) {
      console.error('Error fetching total products:', error);
    }
  };

  const formatCurrency = (value) => {
    return typeof value === 'number' ? `₱${value.toFixed(2)}` : '₱0.00';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Point of Sale Dashboard</h2>
      
      {/* Time frame selector */}
      <div className="flex space-x-4 mb-3">
        {['today', 'yesterday', 'lastWeek', 'lastMonth'].map((option) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg shadow-md transition-colors duration-200 ${
              timeFrame === option
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-orange-50'
            }`}
            onClick={() => setTimeFrame(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Sales statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-rated-products`}
            icon={<HiStar className="w-8 h-8 text-yellow-400" />}
            title={`Rated Products (${timeFrame})`}
            value={ratedProductsCount}
            animate={true}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-sales`}
            icon={<HiCurrencyDollar className="w-8 h-8 text-green-500" />}
            title={`Total ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Sales`}
            value={formatCurrency(salesData.periodSales)}
            animate={true}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-orders`}
            icon={<HiShoppingCart className="w-8 h-8 text-orange-500" />}
            title="Total Orders"
            value={salesData.totalOrders || 0}
            animate={true}
          />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <StatCard
            key={`${timeFrame}-customers`}
            icon={<HiUsers className="w-8 h-8 text-neutral-600" />}
            title={`Total Customers (${timeFrame})`}
            value={salesData.totalCustomers || 0}
            animate={true}
          />
        </AnimatePresence>
      </div>

      {/* Top products */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Top Products <span className="text-gray-400 text-sm">({totalProducts} total)</span>
        </h3>
        <div className="">
          {topProducts.map((product, index) => (
            <motion.div 
              key={product.id} 
              className="flex items-center justify-between p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <div className="flex items-center">
                <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                <div>
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">
                    Sold: {product.sold || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <HiStar className="w-5 h-5 text-yellow-400 mr-1" />
                <span className="font-medium">{(product.rating || 0).toFixed(1)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard = ({ icon, title, value, animate }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4"
    initial={animate ? { opacity: 0, y: 20 } : false}
    animate={animate ? { opacity: 1, y: 0 } : false}
    exit={animate ? { opacity: 0, y: -20 } : false}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.03 }}
  >
    <div>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </motion.div>
);

export default POSDashboard;