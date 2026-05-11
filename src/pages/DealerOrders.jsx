import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

const DealerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/dealer');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-stone-500">Loading Orders...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white p-6 md:px-8 md:py-8 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight flex items-center gap-3">
             <Package className="text-indigo-600" size={28} /> My Orders
          </h1>
          <p className="text-stone-500 font-medium mt-1">Track your won items and delivery status.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-bold">No orders found. Win an auction to place orders!</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {orders.map(order => (
              <div key={order._id} className="p-6 md:p-8 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                  <p className="font-black text-xl text-stone-800 mb-1">{order.product?.name}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <span className="bg-stone-100 px-3 py-1 rounded-full text-stone-600 border border-stone-200">
                      {order.quantity} kg
                    </span>
                    <span className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 border border-emerald-100">
                      ₹{order.totalAmount}
                    </span>
                    <span className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-700 border border-indigo-100 flex items-center gap-1">
                      <Truck size={12} /> {order.deliveryMethod}
                    </span>
                  </div>
                  <div className="mt-3 text-xs font-bold tracking-widest flex items-center gap-2">
                    Payment: 
                    <span className={order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  <div className="bg-stone-900 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-stone-900/20">
                    {order.orderStatus === 'placed' && <Clock size={14} className="text-amber-400" />}
                    {order.orderStatus === 'shipped' && <Truck size={14} className="text-blue-400" />}
                    {(order.orderStatus === 'delivered' || order.orderStatus === 'picked_up') && <CheckCircle size={14} className="text-emerald-400" />}
                    {order.orderStatus.replace(/_/g, ' ')}
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerOrders;
