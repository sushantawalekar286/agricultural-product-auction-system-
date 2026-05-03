import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Play } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Remove this product permanently?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStartAuction = async (productId) => {
    try {
      const durationMinutes = parseFloat(prompt('Enter auction duration in minutes:', '5'));
      if (isNaN(durationMinutes) || durationMinutes <= 0) return;
      const startTime = new Date();
      await api.post('/auctions', { productId, startTime, durationMinutes });
      alert('Auction started successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting auction');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <ShoppingBag className="text-indigo-600" size={32} />
          Product Management
        </h1>
        <p className="text-stone-500 mt-1">Manage and monitor all products listed.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Farmer</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {products?.map((product) => (
                <tr key={product._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/admin/products/${product._id}`} className="font-bold text-indigo-600 hover:underline">
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500 font-semibold mt-1">₹{product.basePrice} Base</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-700">{product.farmer?.name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 text-stone-500 capitalize font-medium">
                    {product.status}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2 items-center">
                    {product.status === 'pending' && (
                      <button 
                        onClick={() => handleStartAuction(product._id)}
                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Start Auction"
                      >
                        <Play size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteProduct(product._id)} 
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-stone-400 font-medium">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
