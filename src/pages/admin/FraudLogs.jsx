import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Shield } from 'lucide-react';

const FraudLogs = () => {
  const [fraudLogs, setFraudLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/fraud-logs');
      setFraudLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlock = async (id) => {
    if (window.confirm('Block this user due to fraud activity?')) {
      try {
        await api.put(`/users/${id}/block`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <ShieldAlert className="text-red-600" size={32} />
          Fraud Monitoring
        </h1>
        <p className="text-stone-500 mt-1">Review suspicious activities and potential bidding fraud.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-rose-50/30 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Suspect User</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Reason / Trigger</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {fraudLogs?.map((log) => (
                <tr key={log._id} className="hover:bg-red-50/10 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800 break-words">{log.user?.name || 'N/A'}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{log.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 text-sm font-semibold rounded-lg">
                      <ShieldAlert size={14} />
                      {log.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-sm font-medium break-words">
                    {new Date(log.flaggedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {log.user && !log.user.isBlocked && (
                      <button 
                        onClick={() => handleBlock(log.user._id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-red-600 text-white hover:bg-red-700 hover:shadow-lg shadow-red-600/30 flex items-center gap-2 ml-auto"
                      >
                        <Shield size={14} /> Block User
                      </button>
                    )}
                    {log.user?.isBlocked && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-lg">
                        Blocked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {fraudLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-16 flex flex-col items-center justify-center text-center text-stone-400">
                    <Shield className="text-stone-200 mb-4" size={48} />
                    <p className="font-bold text-lg">System Secure</p>
                    <p className="text-sm mt-1">No fraud activities detected recently.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FraudLogs;
