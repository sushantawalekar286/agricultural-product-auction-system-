import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Package, User, Calendar, Tag, Shield } from 'lucide-react';

const ProductDetailsAdmin = () => {
  const { productId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [productId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/products/${productId}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-bold">Loading product details...</div>;
  }

  if (!data || !data.product) {
    return <div className="p-12 text-center text-red-500 font-bold">Error loading product details.</div>;
  }

  const { product, auction, bids } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/products" className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors text-stone-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <Package className="text-indigo-600" size={32} />
            Full Product Details
          </h1>
          <p className="text-stone-500 mt-1">Holistic view of product status, auction history, and bid records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Product Info */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40">
          <h3 className="text-lg font-black text-stone-800 mb-6 tracking-tight flex items-center gap-2">
            <Tag size={18} className="text-indigo-500" /> General Specifications
          </h3>
          <div className="space-y-4">
            <p className="flex justify-between items-center bg-stone-50 p-3 rounded-lg">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Product Name</span>
              <span className="text-stone-800 font-bold text-lg">{product.name || 'N/A'}</span>
            </p>
            <p className="flex justify-between items-center bg-stone-50 p-3 rounded-lg">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Category</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">{product.category || 'N/A'}</span>
            </p>
            <p className="flex justify-between items-center bg-stone-50 p-3 rounded-lg">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Quantity</span>
              <span className="text-stone-800 font-bold">{product.quantity || 0} kg</span>
            </p>
            <p className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
              <span className="text-emerald-700 font-bold uppercase tracking-widest text-[10px]">Base Price</span>
              <span className="text-emerald-600 font-black text-xl">₹{product.basePrice || 0}</span>
            </p>
            <p className="flex justify-between items-center bg-stone-50 p-3 rounded-lg">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Tracking Status</span>
              <span className="text-stone-600 font-bold uppercase tracking-widest text-xs">{product.status || 'pending'}</span>
            </p>
          </div>
        </div>

        {/* Auction & Farmer Details */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40">
            <h3 className="text-lg font-black text-stone-800 mb-4 tracking-tight flex items-center gap-2">
              <User size={18} className="text-blue-500" /> Farmer Detail
            </h3>
            <p className="font-bold text-lg text-stone-800">{product.farmer?.name || 'Unknown'}</p>
            <p className="text-stone-500 text-sm mt-1">{product.farmer?.email}</p>
            <p className="text-stone-400 text-xs mt-2 uppercase tracking-widest font-bold">Location: {product.farmer?.location || 'Not Specified'}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 flex-grow">
            <h3 className="text-lg font-black text-stone-800 mb-4 tracking-tight flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" /> Auction Summary
            </h3>
            {auction ? (
              <div className="space-y-3">
                 <p className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Start Date</span>
                  <span className="text-stone-700 text-sm font-semibold">{new Date(auction.startTime).toLocaleString()}</span>
                 </p>
                 <p className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">End Date</span>
                  <span className="text-stone-700 text-sm font-semibold">{new Date(auction.endTime).toLocaleString()}</span>
                 </p>
                 <p className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Final/Current Winner</span>
                  <span className="text-indigo-700 font-bold text-sm bg-indigo-50 px-2 py-1 rounded">{auction.winner?.name || 'None'}</span>
                 </p>
                 <p className="flex justify-between items-center pt-2">
                  <span className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Highest Bid Result</span>
                  <span className="text-emerald-600 font-black text-lg">₹{auction.highestBid || 0}</span>
                 </p>
                 <p className="text-right text-stone-400 font-bold uppercase tracking-widest text-xs mt-4">
                  Total Bids Tracked: <span className="text-stone-800">{bids?.length || 0}</span>
                 </p>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center text-stone-400">
                <Shield className="text-stone-200 mb-2" size={32} />
                <p className="font-bold">No Auction Lifecycle Yet</p>
                <p className="text-xs uppercase tracking-widest mt-1">This product is pending auction.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50 bg-stone-50/50">
          <h3 className="text-lg font-black text-stone-800 tracking-tight">Lifespan Bid Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Dealer Log</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Amount Placed</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Timestamp Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {bids?.map((bid) => (
                <tr key={bid._id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{bid.dealer?.name || 'Unknown'}</p>
                    <p className="text-xs text-stone-400">{bid.dealer?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-stone-700 bg-stone-50 px-3 py-1 rounded-lg">₹{bid.amount}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-stone-500 font-medium text-sm border-l border-stone-100">
                    {new Date(bid.timestamp || bid.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {bids?.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-stone-400 font-medium">Bidding log is strictly empty.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsAdmin;
