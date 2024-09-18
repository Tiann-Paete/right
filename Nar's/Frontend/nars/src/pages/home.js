import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { MagnifyingGlassIcon, UserCircleIcon, ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CategoryCard from '../components/CategoryCard';
import { useCart } from '../CartContext';
import { motion } from 'framer-motion';

export default function Home({ navigateToCart }) {
  const [firstName, setFirstName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;
  const { cartItems } = useCart();
  const dropdownRef = useRef(null);
  const [displayMode, setDisplayMode] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetch("http://localhost:8000/user", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFirstName(data.firstName);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    fetchProducts('all');
    fetchCategories();

    // Add event listener for closing dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = (mode, category = null) => {
    setIsLoading(true);
    let url = 'http://localhost:8000/products';
    if (mode === 'limited') {
      url = 'http://localhost:8000/limited-items';
    } else if (category) {
      url = `http://localhost:8000/products/category/${category}`;
    }
  
    console.log("Fetching products from:", url);
  
    axios.get(url)
      .then(response => {
        console.log("Fetched products:", response.data);
        setProducts(response.data);
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setIsLoading(false);
      });
  };

  const fetchCategories = () => {
    axios.get('http://localhost:8000/categories')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  };

  const handleDisplayModeChange = (mode) => {
    console.log("Display mode changed:", mode);
    setDisplayMode(mode);
    setSelectedCategory(null);
    fetchProducts(mode);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setDisplayMode('category');
    fetchProducts('category', category);
  };
  
  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:8000/logout', { withCredentials: true });
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-10">
                <Image src="/Logo/narslogo.png" alt="Nar's Logo" width={120} height={120} />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <button 
                    onClick={() => handleDisplayModeChange('limited')} 
                    className={`text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium ${displayMode === 'limited' ? 'text-orange-500' : ''}`}
                  >
                    Limited Items
                  </button>
                  <button 
                    onClick={() => handleDisplayModeChange('categories')} 
                    className={`text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium ${displayMode === 'categories' ? 'text-orange-500' : ''}`}
                  >
                    Categories
                  </button>
                  <button 
                    onClick={() => handleDisplayModeChange('all')} 
                    className={`text-white hover:text-orange-500 px-3 py-2 rounded-md text-md font-medium ${displayMode === 'all' ? 'text-orange-500' : ''}`}
                  >
                    All Supplies
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for supplies..."
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2">
                  <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                </button>
              </form>
            </div>
            <div className="flex items-center">
              <button 
                onClick={navigateToCart} 
                className="text-white hover:text-orange-500 relative mr-4"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center focus:outline-none"
                >
                  <UserCircleIcon className="h-8 w-8 text-white" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <p className="px-4 py-2 text-sm text-gray-700">
                      Welcome, {firstName}!
                    </p>
                    <button 
                      onClick={() => router.push('/order-tracking')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Order Tracking
                    </button>
                    <button 
                      onClick={() => router.push('/order-history')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Order History
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4 md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-orange-500 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
              </div>
            </div>
          </div>
        </div>
        <div 
          ref={mobileMenuRef}
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button 
              onClick={() => {
                handleDisplayModeChange('limited');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'limited' ? 'text-orange-500' : ''}`}
            >
              Limited Items
            </button>
            <button 
              onClick={() => {
                handleDisplayModeChange('categories');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'categories' ? 'text-orange-500' : ''}`}
            >
              Categories
            </button>
            <button 
              onClick={() => {
                handleDisplayModeChange('all');
                setIsMobileMenuOpen(false);
              }} 
              className={`block text-white hover:text-orange-500 px-3 py-2 rounded-md text-base font-medium ${displayMode === 'all' ? 'text-orange-500' : ''}`}
            >
              All Supplies
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-[1400px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {displayMode === 'limited' ? 'Limited Items' : 
           displayMode === 'categories' ? 'Shop by Category' : 
           selectedCategory || 'All Supplies'}
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          </div>
        ) : displayMode === 'categories' ? (
          <motion.div 
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {categories.map((category, index) => (
      <CategoryCard 
        key={category.id} 
        category={category} 
        onSelect={handleCategorySelect} 
        index={index}
      />
    ))}
  </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={handleProductClick} 
                isLimited={product.category === 'Limited'}
                delay={index * 100}
              />
            ))}
          </div>
        )}
        {displayMode !== 'categories' && (
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={products.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        )}
      </main>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
}

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex">
        {pageNumbers.map(number => (
          <li key={number} className="mx-1">
            <button
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded ${
                currentPage === number
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-orange-500 hover:bg-orange-100'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};