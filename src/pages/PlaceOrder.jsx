import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PackageOpen, CreditCard, Truck, Banknote, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

const PlaceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    deliveryMethod: 'pickup',
    paymentMethod: 'cod',
    deliveryAddress: ''
  });

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const { data } = await api.get(`/auctions/${id}`);
        setAuction(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load auction. Maybe it does not exist.');
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (form.deliveryMethod === 'delivery' && !form.deliveryAddress) {
        throw new Error('Please enter a delivery address');
      }
      
      const res = await api.post('/orders/create', {
        auctionId: id,
        ...form
      });
      alert('Order Placed successfully!');
      navigate('/dealer/orders');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-bold text-stone-500">Loading Order Details...</div>;
  if (!auction) return <div className="py-20 text-center text-red-500">{error}</div>;

  const deliveryCharge = form.deliveryMethod === 'delivery' ? 200 : 0;
  const totalAmount = (auction?.highestBid || 0) + deliveryCharge;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-stone-100 shadow-xl shadow-stone-200/40">
        <h1 className="text-3xl font-black text-stone-800 flex items-center gap-4 mb-2">
          <PackageOpen className="text-indigo-600" size={32} />
          Finalize Order
        </h1>
        <p className="text-stone-500 font-medium mb-8">Secure your won auction item and coordinate delivery.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 font-bold text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Product Won</h3>
              <p className="text-xl font-bold text-stone-800">{auction.product?.name}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Quantity</h3>
                  <p className="font-bold text-indigo-700">{auction.product?.quantity} kg</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Final Total</h3>
                  <p className="font-bold text-emerald-600 text-xl">₹{auction.highestBid}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleOrder} className="space-y-8">
              {/* Delivery Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  <Truck size={16} className="text-indigo-500" /> Delivery Concept
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${form.deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50/50' : 'border-stone-100 bg-white hover:border-stone-200'}`}>
                    <input type="radio" className="sr-only" name="deliveryMethod" value="pickup" checked={form.deliveryMethod === 'pickup'} onChange={handleChange} />
                    <PackageOpen size={24} className={form.deliveryMethod === 'pickup' ? 'text-indigo-600' : 'text-stone-400'} />
                    <span className={`font-bold text-sm ${form.deliveryMethod === 'pickup' ? 'text-indigo-900' : 'text-stone-600'}`}>Self Pickup</span>
                  </label>
                  
                  <label className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center ${form.deliveryMethod === 'delivery' ? 'border-indigo-600 bg-indigo-50/50' : 'border-stone-100 bg-white hover:border-stone-200'}`}>
                    <input type="radio" className="sr-only" name="deliveryMethod" value="delivery" checked={form.deliveryMethod === 'delivery'} onChange={handleChange} />
                    <Truck size={24} className={form.deliveryMethod === 'delivery' ? 'text-indigo-600' : 'text-stone-400'} />
                    <span className={`font-bold text-sm ${form.deliveryMethod === 'delivery' ? 'text-indigo-900' : 'text-stone-600'}`}>Home Delivery</span>
                  </label>
                </div>

                {form.deliveryMethod === 'delivery' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <MapPin size={12} /> Delivery Address
                    </label>
                    <textarea 
                      name="deliveryAddress" 
                      value={form.deliveryAddress} 
                      onChange={handleChange}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                      rows="3" 
                      placeholder="Enter full shipping address..." 
                    ></textarea>
                  </motion.div>
                )}
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-500" /> Payment Route
                </h3>
                
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center gap-3">
                  <Banknote size={24} className="text-emerald-600" />
                  <div>
                    <p className="font-bold text-sm text-stone-800">Cash on Delivery (COD)</p>
                    <p className="text-xs text-stone-500">Pay cash upon pickup or home delivery.</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-stone-900 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:bg-stone-800 disabled:opacity-50 transition-all text-sm mt-6"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          <div className="hidden md:block bg-stone-900 rounded-3xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
                <PackageOpen size={300} />
             </div>
             <h3 className="text-xl font-bold mb-6 relative">Order Summary</h3>
             <div className="space-y-4 relative">
               <div className="flex justify-between border-b border-white/10 pb-4">
                 <span className="text-stone-400 font-medium">Base Price (x{auction.product?.quantity})</span>
                 <span className="font-bold">₹{auction.product?.basePrice * auction.product?.quantity}</span>
               </div>
               <div className="flex justify-between border-b border-white/10 pb-4">
                 <span className="text-stone-400 font-medium">Your Winning Bid</span>
                 <span className="font-bold text-emerald-400">₹{auction.highestBid}</span>
               </div>
               <div className="flex justify-between border-b border-white/10 pb-4">
                 <span className="text-stone-400 font-medium">Delivery Charge</span>
                 <span className="font-bold text-indigo-400">₹{deliveryCharge}</span>
               </div>
               <div className="flex justify-between border-b border-white/10 pb-4">
                 <span className="text-stone-400 font-medium">Platform Fee</span>
                 <span className="font-bold">₹0</span>
               </div>
               <div className="flex justify-between pt-4">
                 <span className="text-lg text-white font-black uppercase tracking-widest">Total Pay</span>
                 <span className="text-3xl font-black text-emerald-400">₹{totalAmount}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
