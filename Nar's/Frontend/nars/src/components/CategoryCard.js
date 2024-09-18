import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const CategoryCard = ({ category, onSelect, index }) => {
  const categoryIcons = {
    'Pencil': 'https://cdn-icons-png.flaticon.com/128/588/588395.png',
    'Notebook': 'https://cdn-icons-png.flaticon.com/128/3275/3275966.png',
    'Backpacks': 'https://cdn-icons-png.flaticon.com/128/405/405656.png',
    'Color': 'https://cdn-icons-png.flaticon.com/128/3311/3311506.png',
    'Ballpen': 'https://cdn-icons-png.flaticon.com/128/2493/2493508.png',
    'Sharpener': 'https://cdn-icons-png.flaticon.com/128/381/381198.png',
    'Paper': 'https://cdn-icons-png.flaticon.com/128/2541/2541984.png',
    'Marker': 'https://cdn-icons-png.flaticon.com/128/4654/4654552.png',
    'Envelope': 'https://cdn-icons-png.flaticon.com/128/2514/2514465.png',
    // Add more category icons as needed
  };

  const iconUrl = categoryIcons[category.name] || 'https://cdn-icons-png.flaticon.com/128/1665/1665680.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3 relative w-12 h-12">
          <Image
            src={iconUrl}
            alt={category.name}
            layout="fill"
            objectFit="contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">Find essential {category.name.toLowerCase()} for your school needs.</p>
        <button
          onClick={() => onSelect(category.name)}
          className="mt-auto group inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
        >
          View Items
          <ArrowRightIcon className="ml-1.5 -mr-0.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

export default CategoryCard;