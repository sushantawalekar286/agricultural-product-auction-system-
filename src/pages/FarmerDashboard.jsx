import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { showSuccess, showError, showWarning, showConfirm, showDeleteConfirm, showValidationError, showLoading, closeLoading } from '../utils/sweetAlert';
import { Plus, Package, TrendingUp, DollarSign, Trash2, Edit3, X, Clock, Bell, Check } from 'lucide-react';
import { detectCategory } from '../utils/categoryDetector';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchNotifs();
    if (!socket) return;
    const handler = (data) => {
      setNotifications(prev => [data, ...prev]);
    };
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {}
  };

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
        <Bell size={20} className="text-stone-600" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
      
      {show && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-bold text-stone-800">Notifications</h3>
            <span className="text-xs font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">{notifications.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-stone-400 py-6 font-bold">No new notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n._id} className="p-3 mb-2 bg-indigo-50/50 rounded-xl flex justify-between items-start gap-4">
                  <p className="text-sm text-stone-700 font-medium">{n.message}</p>
                  <button onClick={() => markRead(n._id)} className="text-indigo-400 hover:text-indigo-600 shrink-0">
                    <Check size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const FarmerDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, activeAuctions: 0, completedAuctions: 0, totalEarnings: 0, avgSellingPrice: 0 });
  const [products, setProducts] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', category: '', quantity: '', basePrice: '',
    quality: {
      grade: 'A', size: 'Medium', moisture: '', isOrganic: false,
      harvestDate: '', expiryDate: '', ripeness: 'Ripe', color: '',
      texture: 'Medium', smell: 'Fresh', defects: [], storageCondition: 'Room Temperature', description: ''
    }
  });
  
  const socket = useSocket();
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, prodRes, earnRes] = await Promise.all([
        api.get('/farmer/dashboard-stats'),
        api.get('/farmer/products'),
        api.get('/farmer/earnings')
      ]);
      setStats(statsRes.data || {});
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setEarningsData(earnRes.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    // Listen for live bids arriving at any active auction this farmer owns.
    // The backend `bidUpdate` broadcasts `auctionId` and `highestBid`.
    const handleBidUpdate = (data) => {
      setProducts(prev => prev.map(p => {
        // We don't have auctionId inside product directly locally unless we matched it, but if we assume 1-1, maybe we can fetchDashboardData.
        // For simplicity and to ensure data is strictly fresh:
        return p; 
      }));
      fetchDashboardData(); // Refresh entire state to ensure bidCount/highestBid is perfectly exact.
    };

    socket.on('bidUpdate', handleBidUpdate);
    socket.on('auctionClosed', fetchDashboardData);

    return () => {
      socket.off('bidUpdate', handleBidUpdate);
      socket.off('auctionClosed', fetchDashboardData);
    };
  }, [socket]);

  // Pseudo-live timer (if we mapped end time, but backend didn't return end time in getFarmerProductsWithBids)
  // Let's just indicate active status.

  const handleNameChange = (e) => {
    const name = e.target.value;
    const detected = detectCategory(name);
    setNewProduct(prev => ({
      ...prev,
      name,
      category: detected || (name.trim() === '' ? '' : prev.category)
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    if (!newProduct.name.trim()) {
      showValidationError('Product Name is required.');
      return;
    }
    if (!newProduct.category) {
      showValidationError('Category is required. Please select or enter a valid category.');
      return;
    }

    const quantityVal = parseFloat(newProduct.quantity);
    if (isNaN(quantityVal) || quantityVal <= 0) {
      showValidationError('Invalid quantity. Quantity must be greater than 0.');
      return;
    }
    const priceVal = parseFloat(newProduct.basePrice);
    if (isNaN(priceVal) || priceVal <= 0) {
      showValidationError('Invalid price. Base Price must be greater than 0.');
      return;
    }

    try {
      showLoading('Uploading Product...', 'Please wait while we publish your crop listing.');
      await api.post('/products', newProduct);
      closeLoading();
      await showSuccess('Product Added Successfully');
      setShowAddModal(false);
      setNewProduct({ 
        name: '', category: '', quantity: '', basePrice: '',
        quality: {
          grade: 'A', size: 'Medium', moisture: '', isOrganic: false,
          harvestDate: '', expiryDate: '', ripeness: 'Ripe', color: '',
          texture: 'Medium', smell: 'Fresh', defects: [], storageCondition: 'Room Temperature', description: ''
        }
      });
      fetchDashboardData();
    } catch (err) {
      closeLoading();
      console.error(err);
      const errMsg = err.response?.data?.message || 'Server error creating product';
      setError(errMsg);
      showError(errMsg);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showDeleteConfirm('Delete Product?', 'Delete this product permanently?');
    if (confirmed) {
      try {
        showLoading('Deleting Product...', 'Please wait...');
        await api.delete(`/products/${id}`);
        closeLoading();
        await showSuccess('Product Deleted Successfully');
        fetchDashboardData();
      } catch (err) {
        closeLoading();
        showError(err.response?.data?.message || 'Error deleting product');
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight">Farmer Workspace</h1>
          <p className="text-stone-500 font-medium tracking-wide">Monitor your crops, track live bids, and evaluate earnings.</p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <a href="/farmer/orders" className="bg-stone-100 text-stone-700 px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-200 transition-colors">
            <Package size={18} /> Orders
          </a>
          <button 
            onClick={() => { setError(''); setShowAddModal(true); }}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Plus size={18} /> New Crop Listing
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Products", val: stats.totalProducts, icon: <Package size={20}/>, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Auctions", val: stats.activeAuctions, icon: <Clock size={20} className="animate-pulse" />, color: "text-amber-600", bg: "bg-amber-50" },
          { title: "Sold/Closed", val: stats.completedAuctions, icon: <Check size={20}/>, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Gross Earnings", val: `₹${stats.totalEarnings}`, icon: <DollarSign size={20}/>, color: "text-emerald-700", bg: "bg-emerald-50", wide: true },
          { title: "Average Price", val: `₹${stats.avgSellingPrice}`, icon: <TrendingUp size={20}/>, color: "text-emerald-500", bg: "bg-emerald-50/50" }
        ].map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/30 ${s.wide ? 'col-span-2 lg:col-span-1 border-l-4 border-l-emerald-500' : ''}`}>
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-4`}>
              {s.icon}
            </div>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mb-1">{s.title}</p>
            <h3 className={`text-2xl font-black ${s.wide ? 'text-emerald-700' : 'text-stone-800'}`}>{s.val}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Performance Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
          <div className="p-6 border-b border-stone-50 bg-stone-50/30">
            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Package className="text-indigo-500" size={20} /> Product Performance Matrix
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-stone-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Crop Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Bidding Specs</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products?.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-800">{p.name}</p>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{p.category}</p>
                    </td>
                    <td className="px-6 py-4">
                      {p.status === 'active' ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-widest flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
                        </span>
                      ) : p.status === 'closed' || p.status === 'sold' ? (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-widest inline-block">Sold</span>
                      ) : (
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-full uppercase tracking-widest inline-block">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs text-stone-400 font-bold tracking-widest uppercase">Base: ₹{p.basePrice}</p>
                      <p className={`text-lg font-black mt-0.5 ${p.status === 'active' ? 'text-emerald-600' : 'text-stone-800'}`}>
                        High: ₹{p.highestBid || 0}
                      </p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Bids: {p.totalBids || 0}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(p.status === 'pending' || p.status === 'expired') && (
                        <button onClick={() => handleDelete(p._id)} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-stone-400 font-bold">No products listed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Earnings Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden flex flex-col">
            <div className="p-6 bg-emerald-600 text-white rounded-b-[2rem]">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-1 opacity-80 flex items-center gap-2">
                <TrendingUp size={16} /> Total Realized Revenue
              </h3>
              <p className="text-4xl font-black tracking-tight">₹{earningsData?.totalEarnings || 0}</p>
            </div>
            
            <div className="p-6 flex-grow">
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Top Sold Performer</h4>
              {earningsData?.highestSoldProduct ? (
                <div className="bg-stone-50 p-4 rounded-2xl flex justify-between items-center border border-stone-100">
                  <p className="font-bold text-stone-800">{earningsData.highestSoldProduct.name}</p>
                  <p className="text-lg font-black text-emerald-600">₹{earningsData.highestSoldProduct.price}</p>
                </div>
              ) : (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center text-xs font-bold text-stone-400">
                  No sales recorded yet
                </div>
              )}

              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-6 mb-3">Itemized Yield</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {earningsData?.earningsPerProduct?.map((earn, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2 last:border-0 hover:bg-stone-50/50 p-1 rounded transition-colors">
                    <span className="font-semibold text-stone-700">{earn.productName}</span>
                    <span className="font-black text-stone-800">₹{earn.earned}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 transform transition-all h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-2xl font-black text-stone-800">List New Crop</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-6 overflow-y-auto pr-4 flex-grow custom-scrollbar">
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl font-medium text-sm border border-red-200">
                  {error}
                </div>
              )}
              <div className="space-y-4 pb-6 border-b border-stone-100">
                <h3 className="font-bold text-lg text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl inline-block mb-2">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Crop Name</label>
                    <input required type="text" value={newProduct.name} onChange={handleNameChange} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium" placeholder="E.g. Alphonso Mango" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Category</label>
                    <select required value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium">
                      <option value="">Select Category</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Grains">Grains</option>
                      <option value="Pulses">Pulses</option>
                      <option value="Oil Seeds">Oil Seeds</option>
                      <option value="Cash Crops">Cash Crops</option>
                      <option value="Spices">Spices</option>
                      <option value="Flowers">Flowers</option>
                      <option value="Herbs">Herbs</option>
                      <option value="Dry Fruits">Dry Fruits</option>
                      <option value="Plantation Crops">Plantation Crops</option>
                      <option value="Medicinal Plants">Medicinal Plants</option>
                      <option value="Fodder Crops">Fodder Crops</option>
                      <option value="Organic Products">Organic Products</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Quantity (kg)</label>
                    <input required type="number" min="1" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium" placeholder="100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Base Price (₹)</label>
                    <input required type="number" min="1" value={newProduct.basePrice} onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium" placeholder="5000" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl inline-block mb-2">Quality & Storage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Grade</label>
                    <select value={newProduct.quality.grade} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, grade: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium">
                      <option value="A">Grade A (Premium)</option>
                      <option value="B">Grade B (Standard)</option>
                      <option value="C">Grade C (Low)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Size</label>
                    <select value={newProduct.quality.size} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, size: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium">
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Ripeness</label>
                    <select value={newProduct.quality.ripeness} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, ripeness: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium">
                      <option value="Raw">Raw</option>
                      <option value="Semi-Ripe">Semi-Ripe</option>
                      <option value="Ripe">Ripe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Color</label>
                    <input type="text" value={newProduct.quality.color} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, color: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium" placeholder="E.g. bright yellow" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Moisture (%)</label>
                    <input type="number" min="0" max="100" value={newProduct.quality.moisture} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, moisture: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium" placeholder="E.g. 12" />
                  </div>
                  <div className="flex items-center gap-3 mt-8">
                    <input type="checkbox" id="organic" checked={newProduct.quality.isOrganic} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, isOrganic: e.target.checked } })} className="w-5 h-5 accent-emerald-600 rounded cursor-pointer" />
                    <label htmlFor="organic" className="text-sm font-bold uppercase tracking-widest text-emerald-800 cursor-pointer">100% Organic</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Harvest Date</label>
                    <input type="date" value={newProduct.quality.harvestDate} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, harvestDate: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Expiry Date</label>
                    <input required type="date" value={newProduct.quality.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, expiryDate: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Texture</label>
                    <select value={newProduct.quality.texture} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, texture: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium">
                      <option value="Soft">Soft</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Smell</label>
                    <select value={newProduct.quality.smell} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, smell: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium">
                      <option value="Fresh">Fresh</option>
                      <option value="Normal">Normal</option>
                      <option value="Bad">Bad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Storage Condition</label>
                    <select value={newProduct.quality.storageCondition} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, storageCondition: e.target.value } })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium">
                      <option value="Cold Storage">Cold Storage</option>
                      <option value="Room Temperature">Room Temperature</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Defects (Check all that apply)</label>
                  <div className="flex flex-wrap gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    {['Spots', 'Cuts', 'Damage', 'Overripe'].map(defect => (
                      <label key={defect} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newProduct.quality.defects.includes(defect)}
                          onChange={(e) => {
                            const newDefects = e.target.checked 
                              ? [...newProduct.quality.defects, defect]
                              : newProduct.quality.defects.filter(d => d !== defect);
                            setNewProduct({ ...newProduct, quality: { ...newProduct.quality, defects: newDefects } });
                          }}
                          className="accent-emerald-600 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-stone-700">{defect}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">Description (Optional)</label>
                  <textarea value={newProduct.quality.description} onChange={(e) => setNewProduct({ ...newProduct, quality: { ...newProduct.quality, description: e.target.value } })} rows="3" className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 outline-none font-medium" placeholder="E.g. excellent condition, highly requested..."></textarea>
                </div>
              </div>

              <div className="pt-4 shrink-0">
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]">
                  Publish Full Listing &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
