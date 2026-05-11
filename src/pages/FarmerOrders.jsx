import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Truck, CheckCircle, Banknote } from 'lucide-react';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/farmer');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await api.put('/orders/update-status', { orderId, orderStatus, paymentStatus });
      alert('Order updated!');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order');
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-stone-500">Loading Orders...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-emerald-800 p-6 md:px-8 md:py-8 rounded-3xl border-b-4 border-emerald-900 shadow-sm flex items-center justify-between text-white">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <Package className="text-emerald-400" size={28} /> Received Orders
          </h1>
          <p className="text-emerald-100/80 font-medium mt-1">Manage processing, packing, and dispatch for sold items.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-bold">No orders received yet.</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {orders.map(order => (
              <div key={order._id} className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 md:items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-xl text-stone-800 mb-1">{order.product?.name}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Ordered by: <span className="text-indigo-600">{order.dealer?.name}</span> ({order.dealer?.phone || 'No phone'})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-xl">₹{order.totalAmount}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{order.quantity} kg</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Delivery Path</p>
                      <p className="text-xs font-black text-stone-700">{order.deliveryMethod}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Pay Method</p>
                      <p className="text-xs font-black text-stone-700">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Pay Status</p>
                      <p className={`text-xs font-black ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Order Status</p>
                      <p className="text-xs font-black text-indigo-600">
                        {order.orderStatus.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  
                  {order.deliveryAddress && (
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Shipping Address</p>
                      <p className="text-sm font-medium text-stone-700">{order.deliveryAddress}</p>
                    </div>
                  )}
                </div>

                <div className="lg:w-64 space-y-3 p-5 bg-white border border-stone-100 rounded-2xl shadow-sm">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Quick Actions</h4>
                  
                  {order.deliveryMethod === 'pickup' && (
                    <select 
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value, undefined)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-bold text-stone-700 uppercase focus:outline-none focus:border-indigo-500"
                    >
                      <option value="placed">Placed</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="picked_up">Picked Up</option>
                    </select>
                  )}

                  {order.deliveryMethod === 'delivery' && (
                    <select 
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value, undefined)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-bold text-stone-700 uppercase focus:outline-none focus:border-indigo-500"
                    >
                      <option value="placed">Placed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  )}

                  <select 
                    value={order.paymentStatus}
                    onChange={(e) => updateStatus(order._id, undefined, e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-bold text-stone-700 uppercase focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pending">Pending Pay</option>
                    <option value="paid">Mark Paid</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerOrders;
