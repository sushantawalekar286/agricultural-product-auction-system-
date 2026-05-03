import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, History, Trophy, Clock, Package } from 'lucide-react';

const AuctionDetailsAdmin = () => {
  const { auctionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const [timer, setTimer] = useState('');

  useEffect(() => {
    fetchDetails();
  }, [auctionId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/auctions/${auctionId}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !data?.auction) return;
    
    const handler = (socketData) => {
      if (socketData.auctionId === data.auction._id) {
        // newBid includes bid data and highestBid
        // The endpoint we fetch has `bids: [...]` and `auction: {...}`
        // Just refresh the whole fetch to get exact bid details safely
        fetchDetails(); 
      }
    };

    socket.on('bidUpdate', handler);
    socket.on('auctionClosed', handler);
    socket.on('auctionExtended', handler);

    return () => {
      socket.off('bidUpdate', handler);
      socket.off('auctionClosed', handler);
      socket.off('auctionExtended', handler);
    };
  }, [socket, data?.auction?._id]);

  useEffect(() => {
    if (!data?.auction) return;
    const updateTimer = () => {
      const remaining = new Date(data.auction.endTime).getTime() - Date.now();
      if (data.auction.status !== 'active') {
        setTimer('Closed');
        return;
      }
      if (remaining > 0) {
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        setTimer(`${min}m ${sec}s`);
      } else {
        setTimer('Ending...');
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data?.auction]);

  if (loading) {
    return <div className="p-12 text-center text-stone-500 font-bold">Loading auction details...</div>;
  }

  if (!data || !data.auction) {
    return <div className="p-12 text-center text-red-500 font-bold">Error loading auction.</div>;
  }

  const { auction, bids } = data;
  const product = auction.product || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <Link to="/admin/auctions" className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors text-stone-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <Package className="text-indigo-600" size={32} />
            Live Bidding Details
          </h1>
          <p className="text-stone-500 mt-1">Detailed real-time breakdown of auction performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Info */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40">
          <h3 className="text-lg font-black text-stone-800 mb-4 tracking-tight">Product Details</h3>
          <div className="space-y-3">
            <p className="text-sm border-b border-stone-50 pb-2 flex justify-between">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Name</span>
              <span className="text-stone-800 font-bold">{product.name || 'N/A'}</span>
            </p>
            <p className="text-sm border-b border-stone-50 pb-2 flex justify-between">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Category</span>
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">{product.category || 'N/A'}</span>
            </p>
            <p className="text-sm border-b border-stone-50 pb-2 flex justify-between">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Quantity</span>
              <span className="text-stone-800 font-bold">{product.quantity || 0} kg</span>
            </p>
            <p className="text-sm border-b border-stone-50 pb-2 flex justify-between">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Base Price</span>
              <span className="text-emerald-600 font-black">₹{product.basePrice || 0}</span>
            </p>
            <p className="text-sm flex justify-between">
              <span className="text-stone-400 font-bold uppercase tracking-widest text-xs">Farmer</span>
              <span className="text-stone-800 font-bold">{product.farmer?.name || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Bidding Summary */}
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-black text-stone-800 tracking-tight">Live Status</h3>
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
              auction.status === 'active' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-stone-100 text-stone-600'
            }`}>
              {auction.status}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-stone-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Current Highest</p>
                <p className="text-3xl font-black text-emerald-700">₹{auction.highestBid || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Time Remaining</p>
                <p className="text-xl font-bold font-mono text-stone-800 flex items-center justify-end gap-1">
                  <Clock size={16} className="text-indigo-500" />
                  {timer}
                </p>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">Highest Bidder / Winner</p>
                <p className="text-lg font-bold text-indigo-900">{auction.winner?.name || 'No bids yet'}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">Total Bids</p>
                <p className="text-xl font-black text-indigo-900">{bids?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden">
        <div className="p-6 border-b border-stone-50 flex items-center gap-2">
          <History className="text-stone-400" size={20} />
          <h3 className="text-lg font-black text-stone-800 tracking-tight">Full Bid History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Dealer</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Bid Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Date / Time</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {bids?.map((bid, index) => {
                const isHighest = index === 0;
                return (
                  <tr key={bid._id} className={isHighest ? "bg-emerald-50/20" : "hover:bg-stone-50/50 transition-colors"}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-stone-800">{bid.dealer?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-lg font-black ${isHighest ? 'text-emerald-600' : 'text-stone-700'}`}>₹{bid.amount}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-sm font-medium">
                      {new Date(bid.timestamp || bid.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isHighest ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-lg">
                          <Trophy size={14} /> Highest
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest rounded-lg">
                          Outbid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {bids?.length === 0 && (
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

export default AuctionDetailsAdmin;
