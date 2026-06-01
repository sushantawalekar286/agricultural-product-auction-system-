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
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">
                    Farmer: <span className="text-indigo-600">{order.farmer?.name || 'N/A'}</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs font-bold uppercase tracking-wider text-stone-600">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Quantity</p>
                      <p className="font-black text-stone-700">{order.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Winning Price</p>
                      <p className="font-black text-stone-700">₹{order.totalAmount - order.deliveryCharge}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Delivery Method</p>
                      <p className="font-black text-stone-700">{order.deliveryMethod}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Delivery Charge</p>
                      <p className="font-black text-stone-700">₹{order.deliveryCharge}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Total Amount</p>
                      <p className="font-black text-emerald-700">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Pay Method</p>
                      <p className="font-black text-stone-700">{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-stone-400 mb-0.5">Pay Status</p>
                      <p className={`font-black ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {order.paymentStatus.toUpperCase()}
                      </p>
                    </div>
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
