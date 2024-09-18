import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const GCashModal = ({ isOpen, onClose, onConfirm, amount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleOutsideClick}
    >
      <div className={`bg-blue-600 p-8 rounded-lg max-w-md w-full transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="flex items-center mb-6">
          <Image src="/ImageLogo/Gcash.png" alt="GCash Logo" width={50} height={50} className="mr-4" />
          <h2 className="text-3xl font-bold text-white">GCash</h2>
        </div>
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg bg-white text-gray-800"
        />
        <input
          type="text"
          placeholder="GCash Number"
          value={gcashNumber}
          onChange={(e) => setGcashNumber(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg bg-white text-gray-800"
        />
        <p className="mb-6 text-white text-lg">Amount to Pay: ₱{amount.toFixed(2)}</p>
        <button
          onClick={() => onConfirm(fullName, gcashNumber)}
          className="w-full bg-white text-blue-600 px-4 py-3 rounded-full hover:bg-gray-100 transition duration-300 font-bold text-lg"
        >
          Proceed Order
        </button>
      </div>
    </div>
  );
};

export default GCashModal;