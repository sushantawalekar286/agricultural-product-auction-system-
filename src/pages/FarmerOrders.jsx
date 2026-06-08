import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { showOrderSuccess, showPaymentSuccess, showError, showConfirm, showLoading, closeLoading } from '../utils/sweetAlert';
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
      showLoading('Updating Order Status...', 'Please wait...');
      await api.put('/orders/update-status', { orderId, orderStatus, paymentStatus });
      closeLoading();
      
      if (paymentStatus === 'paid') {
        await showPaymentSuccess('Payment Status Updated');
      } else if (orderStatus === 'delivered') {
        await showOrderSuccess('Order Delivered Successfully');
      } else {
        await showOrderSuccess('Order Updated Successfully');
      }
      
      fetchOrders();
    } catch (err) {
      closeLoading();
      showError(err.response?.data?.message || 'Error updating order');
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Winning Bid</p>
                      <p className="text-xs font-black text-stone-700">₹{order.totalAmount - order.deliveryCharge}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Delivery Charge</p>
                      <p className="text-xs font-black text-stone-700">₹{order.deliveryCharge}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Total Amount</p>
                      <p className="text-xs font-black text-emerald-700">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Pay Method</p>
                      <p className="text-xs font-black text-stone-700">{order.paymentMethod ? order.paymentMethod.toUpperCase() : 'COD'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Pay Status</p>
                      <p className={`text-xs font-black ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mb-1">Order Status</p>
                      <p className="text-xs font-black text-indigo-600 uppercase">
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
                  
                  <div>
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1">Transit Status</label>
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
                  </div>

                  <div className="pt-2 border-t border-stone-50">
                    {order.paymentStatus === 'pending' ? (
                      <button
                        onClick={async () => {
                          const result = await showConfirm('Mark as Paid?', 'Are you sure you want to mark this order as paid?');
                          if (result.isConfirmed) {
                            updateStatus(order._id, undefined, 'paid');
                          }
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-emerald-600/10"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl p-2.5 text-center text-xs font-black uppercase tracking-wider">
                        Payment Completed
                      </div>
                    )}
                  </div>
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
