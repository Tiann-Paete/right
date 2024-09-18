import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../CartContext';

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleAddToCart = () => {
    setIsAnimating(true);
    addToCart({ ...product, quantity });
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 1000);
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return Array(5).fill(0).map((_, index) => {
      if (index < fullStars) {
        return <span key={index} className="text-yellow-400">★</span>;
      } else if (index === fullStars && hasHalfStar) {
        return <span key={index} className="text-yellow-400">½</span>;
      } else {
        return <span key={index} className="text-gray-300">☆</span>;
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-8 max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal">
        <div className="relative h-64 mb-4">
          <Image
            src={product.image_url}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {renderStars(product.rating)}
            <span className="text-gray-600 ml-1">({product.rating.toFixed(1)})</span>
          </div>
          <div className="text-xl font-bold">₱{product.price}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border rounded-full overflow-hidden">
            <button onClick={decrementQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">-</button>
            <span className="px-3 py-1">{quantity}</span>
            <button onClick={incrementQuantity} className="px-3 py-1 bg-gray-100 hover:bg-gray-200">+</button>
          </div>
          <button 
            onClick={handleAddToCart}
            className={`bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-all duration-300 ${
              isAnimating ? 'animate-toss' : ''
            }`}
            disabled={isAnimating}
          >
            {isAnimating ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;