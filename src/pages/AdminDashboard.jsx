import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Users, Gavel, Play, Square, ShieldAlert, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeAuctions: 0, totalBids: 0, fraudAlerts: 0 });
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [fraudLogs, setFraudLogs] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, uRes, pRes, aRes, fRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/users'),
        api.get('/products'),
        api.get('/auctions'),
        api.get('/admin/fraud-logs')
      ]);
      setStats(statsRes.data);
      setUsers(uRes.data);
      setProducts(pRes.data);
      setAuctions(aRes.data);
      setFraudLogs(fRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (id) => {
    try {
      await api.put(`/users/${id}/block`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
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
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting auction');
    }
  };

  const handleStopAuction = async (auctionId) => {
    if (window.confirm('Force close this auction?')) {
      try {
        await api.put(`/auctions/${auctionId}/stop`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Remove this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredUsers = userRoleFilter === 'all' ? users : users.filter(u => u.role === userRoleFilter);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-stone-800">{t('admin')} {t('dashboard')}</h1>
        <p className="text-stone-500 mt-1">System-wide management and monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Users size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Users</p>
          <h3 className="text-3xl font-bold text-stone-800">{stats.totalUsers}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <Play size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Active Auctions</p>
          <h3 className="text-3xl font-bold text-stone-800">{stats.activeAuctions}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
            <Gavel size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Bids</p>
          <h3 className="text-3xl font-bold text-stone-800">{stats.totalBids}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4">
            <ShieldAlert size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Fraud Alerts</p>
          <h3 className="text-3xl font-bold text-stone-800">{stats.fraudAlerts}</h3>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-800">User Management</h3>
          <select 
            className="px-4 py-2 border rounded-xl text-sm"
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="dealer">Dealers</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredUsers.filter(u => u.role !== 'admin').map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-3 font-bold text-stone-800">{user.name}</td>
                  <td className="px-6 py-3 text-stone-500">{user.email}</td>
                  <td className="px-6 py-3 text-stone-500 capitalize">{user.role}</td>
                  <td className="px-6 py-3 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleBlock(user._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                        user.isBlocked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 text-stone-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Management */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
          <div className="p-6 border-b border-stone-50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-stone-800">Product Management</h3>
          </div>
          <div className="overflow-x-auto h-80 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-3 font-bold text-stone-800">{product.name}</td>
                    <td className="px-6 py-3 text-stone-500 capitalize">{product.status}</td>
                    <td className="px-6 py-3 flex justify-end gap-2 items-center">
                      {product.status === 'pending' && (
                        <button 
                          onClick={() => handleStartAuction(product._id)}
                          title="Start Auction"
                          className="p-1.5 text-emerald-600 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          <Play size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteProduct(product._id)} className="p-1.5 text-stone-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Control */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
          <div className="p-6 border-b border-stone-50">
            <h3 className="text-xl font-bold text-stone-800">Active Auctions</h3>
          </div>
          <div className="overflow-x-auto h-80 overflow-y-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Highest Bid</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {auctions.map((auction) => (
                  <tr key={auction._id}>
                    <td className="px-6 py-3 font-bold text-stone-800">{auction.product?.name || 'N/A'}</td>
                    <td className="px-6 py-3 text-stone-500">₹{auction.highestBid || 0}</td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleStopAuction(auction._id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                      >
                        <Square size={14} /> Stop
                      </button>
                    </td>
                  </tr>
                ))}
                {auctions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-stone-400">No active auctions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fraud Monitoring */}
      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50">
          <h3 className="text-xl font-bold text-stone-800">Fraud Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Reason</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {fraudLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-6 py-4 font-bold text-stone-800 break-words">{log.user?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-rose-500">{log.reason}</td>
                  <td className="px-6 py-4 text-stone-500 break-words">{new Date(log.flaggedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {log.user && !log.user.isBlocked && (
                      <button 
                        onClick={() => handleBlock(log.user._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Block {log.user.name}
                      </button>
                    )}
                    {log.user?.isBlocked && (
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Blocked</span>
                    )}
                  </td>
                </tr>
              ))}
              {fraudLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-8 text-center text-stone-400">No fraud activities detected.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
