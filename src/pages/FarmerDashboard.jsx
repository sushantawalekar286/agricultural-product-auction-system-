import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Plus, Package, TrendingUp, DollarSign, Trash2, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FarmerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', quantity: '', basePrice: '' });
  const { t } = useTranslation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products/farmer');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', newProduct);
      setShowAddModal(false);
      setNewProduct({ name: '', category: '', quantity: '', basePrice: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-stone-800">{t('farmer')} {t('dashboard')}</h1>
          <p className="text-stone-500 mt-1">Manage your crops and track your sales.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
        >
          <Plus size={20} />
          Add New Crop
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
              <Package size={24} />
            </div>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Products</p>
            <h3 className="text-4xl font-bold text-stone-800">{products.length}</h3>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <DollarSign size={24} />
            </div>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Active Listings</p>
            <h3 className="text-4xl font-bold text-stone-800">
              {products.filter(p => p.status === 'active').length}
            </h3>
          </div>

          {/* Product List */}
          <div className="sm:col-span-2 bg-white rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
            <div className="p-8 border-b border-stone-50 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-stone-800">Your Listings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Crop Name</th>
                    <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Base Price</th>
                    <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-stone-50/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-stone-800">{product.name}</td>
                      <td className="px-8 py-6 text-stone-500">{product.category}</td>
                      <td className="px-8 py-6 font-bold text-emerald-600">₹{product.basePrice}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          product.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {t(product.status)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"><Edit3 size={18} /></button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-8 py-12 text-center text-stone-400">No products found. Add your first crop!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-stone-800">Add New Crop</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Crop Name</label>
                  <input 
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    placeholder="e.g. Alphonso Mango"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
                  <input 
                    type="text" 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    placeholder="e.g. Fruits"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Quantity (kg)</label>
                    <input 
                      type="number" 
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">Base Price (₹)</label>
                    <input 
                      type="number" 
                      value={newProduct.basePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                      className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                      placeholder="5000"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all mt-4"
                >
                  Create Listing
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerDashboard;
