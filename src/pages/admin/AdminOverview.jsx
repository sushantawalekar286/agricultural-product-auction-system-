import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Users, Gavel, Play, ShieldAlert, TrendingUp } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeAuctions: 0, totalBids: 0, fraudAlerts: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Analytics Dashboard</h1>
        <p className="text-stone-500 mt-1">High-level overview of the AgriBid platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 transform transition hover:-translate-y-1">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <Users size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Users</p>
          <h3 className="text-4xl font-black text-stone-800">{stats.totalUsers}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 transform transition hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
            <Play size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Active Auctions</p>
          <h3 className="text-4xl font-black text-stone-800">{stats.activeAuctions}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 transform transition hover:-translate-y-1">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 shadow-sm">
            <Gavel size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Bids</p>
          <h3 className="text-4xl font-black text-stone-800">{stats.totalBids}</h3>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 transform transition hover:-translate-y-1">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-4 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Fraud Alerts</p>
          <h3 className="text-4xl font-black text-stone-800">{stats.fraudAlerts}</h3>
        </div>
      </div>

      {/* Adding a placeholder chart area to make it look robust */}
      <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" /> Platform Growth
          </h3>
        </div>
        <div className="h-64 flex items-end justify-between space-x-2">
          {/* Faux bar chart */}
          {[40, 60, 30, 80, 50, 90, 70].map((val, i) => (
            <div key={i} className="w-full bg-indigo-50 rounded-t-md relative group">
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500" 
                style={{ height: `${val}%` }}
              ></div>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-stone-800 text-white text-xs py-1 px-2 rounded transition-opacity">
                {val}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs font-bold text-stone-400 uppercase tracking-widest">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
