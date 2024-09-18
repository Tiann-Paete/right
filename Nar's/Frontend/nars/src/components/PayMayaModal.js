import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PayMayaModal = ({ isOpen, onClose, onConfirm, amount }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [payMayaNumber, setPayMayaNumber] = useState('');

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
      <div className={`bg-white p-8 rounded-lg max-w-md w-full transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="flex justify-center mb-6">
          <Image src="/ImageLogo/Paymaya.png" alt="PayMaya Logo" width={200} height={80} className="object-contain" />
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
          placeholder="PayMaya Number"
          value={payMayaNumber}
          onChange={(e) => setPayMayaNumber(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg bg-white text-gray-800"
        />
        <p className="mb-6 text-gray-800 text-lg">Amount to Pay: ₱{amount.toFixed(2)}</p>
        <button
          onClick={() => onConfirm(fullName, payMayaNumber)}
          className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition duration-300 font-bold text-lg"
        >
          Complete Order
        </button>
      </div>
    </div>
  );
};

export default PayMayaModal;