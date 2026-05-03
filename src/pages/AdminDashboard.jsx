import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Play, ShieldAlert, Users, ShoppingBag, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Admin Subpages
import AdminOverview from './admin/AdminOverview';
import AuctionMonitoring from './admin/AuctionMonitoring';
import BidHistory from './admin/BidHistory';
import FraudLogs from './admin/FraudLogs';
import UserManagement from './admin/UserManagement';
import ProductManagement from './admin/ProductManagement';
import NotificationControl from './admin/NotificationControl';
import AuctionDetailsAdmin from './admin/AuctionDetailsAdmin';
import ProductDetailsAdmin from './admin/ProductDetailsAdmin';

const AdminLayout = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Analytics Dashboard', path: '', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Auctions', path: 'auctions', icon: <Play size={20} /> },
    { name: 'Fraud Monitoring', path: 'fraud', icon: <ShieldAlert size={20} /> },
    { name: 'User Management', path: 'users', icon: <Users size={20} /> },
    { name: 'Product Management', path: 'products', icon: <ShoppingBag size={20} /> },
    { name: 'Notifications', path: 'notifications', icon: <Bell size={20} /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] gap-8">
      {/* Sidebar sidebar bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/40 p-6 lg:w-72 */}
      <aside className="lg:w-72 flex-shrink-0 bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 p-6 flex flex-col h-fit">
        <div className="mb-8 px-4">
          <h2 className="text-xl font-black text-stone-800 tracking-tight">AgriBid <span className="text-indigo-600">Pro+</span></h2>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/admin/${item.path}`}
              end={item.path === ''}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all sm:text-sm ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 -translate-y-0.5' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-indigo-600'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="mt-12 pt-6 border-t border-stone-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-bold text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all sm:text-sm"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="auctions" element={<AuctionMonitoring />} />
          <Route path="bids/:productId" element={<BidHistory />} />
          <Route path="fraud" element={<FraudLogs />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/:productId" element={<ProductDetailsAdmin />} />
          <Route path="notifications" element={<NotificationControl />} />
          <Route path="auctions/:auctionId" element={<AuctionDetailsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
