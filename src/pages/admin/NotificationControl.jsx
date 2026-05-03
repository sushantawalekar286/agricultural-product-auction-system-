import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell } from 'lucide-react';

const NotificationControl = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Bell className="text-indigo-600" size={32} />
          Notification Control
        </h1>
        <p className="text-stone-500 mt-1">View system-wide notifications generated across the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Recipient</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {notifications?.map((notif) => (
                <tr key={notif._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{notif.user?.name || 'N/A'}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">{notif.user?.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg ${
                      notif.type === 'outbid' ? 'bg-amber-100 text-amber-700' : 
                      notif.type === 'auctionClosed' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-stone-100 text-stone-600'
                    }`}>
                      {notif.type || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-stone-700">
                    {notif.message}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(notif.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-stone-400 font-medium">No notifications in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotificationControl;
