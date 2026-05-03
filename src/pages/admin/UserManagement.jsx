import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
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
    if (window.confirm('Are you sure you want to delete this user completely?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredUsers = userRoleFilter === 'all' 
    ? users 
    : (users || []).filter(u => u.role === userRoleFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Users className="text-indigo-600" size={32} />
          User Management
        </h1>
        <p className="text-stone-500 mt-1">Control access, view roles, and manage users.</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
          <div className="flex gap-2">
            {['all', 'farmer', 'dealer'].map(role => (
              <button
                key={role}
                onClick={() => setUserRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  userRoleFilter === role 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {role === 'all' ? 'All Roles' : role + 's'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">User Info</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredUsers?.filter(u => u.role !== 'admin')?.map((user) => (
                <tr key={user._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{user.name}</p>
                    <p className="text-sm text-stone-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                      user.role === 'farmer' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {user.isBlocked ? (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                        <XCircle size={16} /> Blocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                        <CheckCircle size={16} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleBlock(user._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 ${
                          user.isBlocked 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Shield size={14} />
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)} 
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.filter(u => u.role !== 'admin').length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-stone-400 font-medium">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
