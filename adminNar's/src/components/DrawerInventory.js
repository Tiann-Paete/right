import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageModal from './ImageModal';
import { motion, AnimatePresence } from 'framer-motion';

const DrawerInventory = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    stock_quantity: '',
    category: '',
    supplier_id: '',
    rating: 0,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [totalStock, setTotalStock] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page) => {
    try {
      const response = await axios.get(`http://localhost:8001/products?page=${page}&limit=10`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
      calculateTotalStock(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateTotalStock = (products) => {
    const totalStock = products.reduce((acc, product) => acc + product.stock_quantity, 0);
    setTotalStock(totalStock);
  };

  const handleInputChange = (e) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    } else {
      setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8001/products', newProduct);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image_url: '',
        stock_quantity: '',
        category: '',
        supplier_id: '',
        rating: 0,
      });
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8001/products/${editingProduct.id}`, editingProduct);
      setEditingProduct(null);
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:8001/products/${id}`);
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${currentPage === i ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &lt;
        </button>
        {pageNumbers}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &gt;
        </button>
        <span className="ml-4">
          {totalItems} items | Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="container mx-auto p-4"
  >
    <h2 className="text-2xl font-bold mb-4">
      Inventory Management 
      <span className="text-gray-500 text-base ml-2">({totalStock} stocks)</span>
    </h2>
    
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {editingProduct ? (
        <form onSubmit={handleUpdateProduct} className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" value={editingProduct.name} onChange={handleInputChange} placeholder="Name" required className="p-2 border rounded" />
            <input name="description" value={editingProduct.description} onChange={handleInputChange} placeholder="Description" required className="p-2 border rounded" />
            <input name="price" type="number" value={editingProduct.price} onChange={handleInputChange} placeholder="Price" required className="p-2 border rounded" />
            <input name="image_url" value={editingProduct.image_url} onChange={handleInputChange} placeholder="Image URL" className="p-2 border rounded" />
            <input name="stock_quantity" type="number" value={editingProduct.stock_quantity} onChange={handleInputChange} placeholder="Stock Quantity" required className="p-2 border rounded" />
            <input name="category" value={editingProduct.category} onChange={handleInputChange} placeholder="Category" className="p-2 border rounded" />
            <input name="supplier_id" value={editingProduct.supplier_id} onChange={handleInputChange} placeholder="Supplier ID" required className="p-2 border rounded" />
            <input 
              name="rating" 
              type="number" 
              min="0" 
              max="5" 
              step="0.1" 
              value={editingProduct.rating} 
              onChange={handleInputChange} 
              placeholder="Rating" 
              className="p-2 border rounded"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">Update</button>
            <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500" onClick={() => setEditingProduct(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddProduct} className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" value={newProduct.name} onChange={handleInputChange} placeholder="Name" required className="p-2 border rounded" />
            <input name="description" value={newProduct.description} onChange={handleInputChange} placeholder="Description" required className="p-2 border rounded" />
            <input name="price" type="number" value={newProduct.price} onChange={handleInputChange} placeholder="Price" required className="p-2 border rounded" />
            <input name="image_url" value={newProduct.image_url} onChange={handleInputChange} placeholder="Image URL" className="p-2 border rounded" />
            <input name="stock_quantity" type="number" value={newProduct.stock_quantity} onChange={handleInputChange} placeholder="Stock Quantity" required className="p-2 border rounded" />
            <input name="category" value={newProduct.category} onChange={handleInputChange} placeholder="Category" className="p-2 border rounded" />
            <input name="supplier_id" value={newProduct.supplier_id} onChange={handleInputChange} placeholder="Supplier ID" required className="p-2 border rounded" />
            <input 
              name="rating" 
              type="number" 
              min="0" 
              max="5" 
              step="0.1" 
              value={newProduct.rating} 
              onChange={handleInputChange} 
              placeholder="Rating" 
              className="p-2 border rounded"
            />
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Add Product</button>
        </form>
       )}
    </motion.div>

       <motion.table 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full border-collapse border"
    >
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Inventory ID</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Supplier ID</th>
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Rating</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
        <AnimatePresence>
          {products.map((product) => (
            <motion.tr 
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border"
            >
              <td className="border p-2">{product.id}</td>
              <td className="border p-2">
                {product.image_url && (
                  <img 
                    src={product.image_url.startsWith('http') ? product.image_url : `http://localhost:8001${product.image_url}`} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover cursor-pointer"
                    onClick={() => handleImageClick(product.image_url.startsWith('http') ? product.image_url : `http://localhost:8001${product.image_url}`)}
                  />
                )}
              </td>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">{product.description}</td>
              <td className="border p-2">₱{product.price}</td>
              <td className="border p-2">{product.stock_quantity}</td>
              <td className="border p-2">{product.category}</td>
              <td className="border p-2">{product.supplier_id}</td>
              <td className="border p-2">{product.order_id}</td>
              <td className="border p-2">{product.rating}</td>
              <td className="border p-2">
  <div className="flex items-center justify-center space-x-2">
    <button 
      onClick={() => handleEditProduct(product)} 
      className="p-1 text-neutral-700 hover:text-neutral-800"
      title="Update"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    </button>
    <button 
      onClick={() => handleDeleteProduct(product.id)} 
      className="p-1 text-red-500 hover:text-red-600"
      title="Delete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  </div>
</td>
</motion.tr>
          ))}
        </AnimatePresence>
      </tbody>
    </motion.table>
    
    {renderPagination()}
    
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ImageModal 
            imageUrl={selectedImage} 
            altText="Product Image"
            onClose={closeImageModal}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);
}

export default DrawerInventory;