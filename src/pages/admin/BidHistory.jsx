import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, History, Trophy } from 'lucide-react';

const BidHistory = () => {
  const { productId } = useParams();
  const [bids, setBids] = useState([]);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchBids();
    }
  }, [productId]);

  const fetchBids = async () => {
    try {
      const bidRes = await api.get(`/bids/${productId}`);
      setBids(Array.isArray(bidRes.data) ? bidRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/auctions" className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors text-stone-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <History className="text-indigo-600" size={32} />
            Complete Bid History
          </h1>
          <p className="text-stone-500 mt-1">Chronological history of all bids placed on this product.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50 bg-stone-50/50 flex justify-between items-center">
          <p className="font-bold text-stone-700">Total Bids: <span className="text-indigo-600">{bids.length}</span></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Dealer</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Bid Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {bids?.map((bid, index) => (
                <tr key={bid._id} className={index === 0 ? "bg-emerald-50/30" : "hover:bg-stone-50/50"}>
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{bid.dealer?.name || 'Unknown'}</p>
                  </td>
                  <td className="px-6 py-4 text-lg font-black text-stone-800">
                    ₹{bid.amount}
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-sm font-medium">
                    {new Date(bid.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-lg">
                        <Trophy size={14} /> Highest / Winner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-lg">
                        Outbid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {bids.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-stone-400 font-medium">No bids have been placed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BidHistory;
