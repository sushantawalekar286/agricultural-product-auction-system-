import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Play, TrendingUp, CheckCircle, Package, Clock, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const DealerDashboard = () => {
  const [stats, setStats] = useState({ totalBids: 0, auctionsWon: 0, winPercentage: 0 });
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  
  const socket = useSocket();

  useEffect(() => {
    fetchEverything();
  }, []);

  const fetchEverything = async () => {
    try {
      const [statsRes, activeRes, myBidsRes, wonRes] = await Promise.all([
        api.get('/dealer/stats'),
        api.get('/dealer/active-auctions'),
        api.get('/dealer/my-bids'),
        api.get('/dealer/won-auctions')
      ]);
      setStats(statsRes.data || { totalBids: 0, auctionsWon: 0, winPercentage: 0 });
      setActiveAuctions(Array.isArray(activeRes.data) ? activeRes.data : []);
      setMyBids(Array.isArray(myBidsRes.data) ? myBidsRes.data : []);
      setWonAuctions(Array.isArray(wonRes.data) ? wonRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    // Live reload elements when meaningful global events happen.
    socket.on('newBid', fetchEverything);
    socket.on('bidUpdate', fetchEverything);
    socket.on('auctionClosed', fetchEverything);

    return () => {
      socket.off('newBid', fetchEverything);
      socket.off('bidUpdate', fetchEverything);
      socket.off('auctionClosed', fetchEverything);
    };
  }, [socket]);

  const quickBid = async (auctionId, currentHighest, increment) => {
    try {
      // Find base requirements if highest is 0 or missing, but backend handles this properly
      const calculatedAmount = Number(currentHighest) + increment;
      await api.post('/bids', { auctionId, amount: calculatedAmount });
      // Wait for socket to broadcast, or brutally fetch
      fetchEverything();
    } catch (err) {
      alert(err.response?.data?.message || 'Error placing bid');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:px-8 md:py-8 rounded-3xl border border-stone-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-stone-800 tracking-tight flex items-center gap-3">
             Dealer Terminal <ShieldCheck className="text-indigo-600" size={28} />
          </h1>
          <p className="text-stone-500 font-medium tracking-wide mt-1">Acquire top-grade crops via real-time competitive bidding.</p>
        </div>
      </div>

      {/* Dynamic Dealer Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-stone-50 group-hover:text-indigo-50 transition-colors duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="relative">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Total Bids Fired</p>
            <h3 className="text-5xl font-black text-indigo-900 mb-1">{stats.totalBids}</h3>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl border border-indigo-700 shadow-xl shadow-indigo-600/30 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-indigo-500 group-hover:text-indigo-400 transition-colors duration-500">
            <CheckCircle size={120} />
          </div>
          <div className="relative">
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Auctions Won</p>
            <h3 className="text-5xl font-black text-white mb-1">{stats.auctionsWon}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden group border-l-4 border-l-emerald-500">
          <div className="relative">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Win Precision Rate</p>
            <h3 className="text-5xl font-black text-emerald-600 mb-1">{stats.winPercentage}%</h3>
            <p className="text-xs text-stone-400 font-medium mt-2">Conversion efficiency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Active Trading Arena */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="text-xl font-black text-stone-800 tracking-tight uppercase">Live Active Market</h3>
          </div>
          
          {activeAuctions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center shadow-sm">
               <Package size={40} className="mx-auto text-stone-200 mb-4" />
               <p className="text-stone-400 font-bold">No active auctions at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAuctions.map(auc => (
                <div key={auc._id} className="bg-white rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/30 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-black text-stone-800">{auc.product?.name || 'Unknown'}</h4>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{auc.product?.category || 'Crop'}</p>
                    </div>
                    <div className="bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-stone-700 font-mono text-center">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                     <div>
                       <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Base Minimum</p>
                       <p className="font-bold text-stone-800">₹{auc.product?.basePrice}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Current Highest</p>
                       <p className="font-black text-xl text-emerald-700">₹{auc.highestBid || auc.product?.basePrice}</p>
                     </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-stone-50 flex items-center gap-2">
                     <Link to={`/auctions/${auc._id}`} className="flex-1 bg-stone-800 text-white py-3 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-stone-900 transition-colors">
                       View Room
                     </Link>
                     <button onClick={() => quickBid(auc._id, Math.max(auc.highestBid || 0, auc.product?.basePrice || 0), 10)} className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors border border-emerald-100 flex items-center gap-1">
                       <Zap size={14} /> +₹10
                     </button>
                     <button onClick={() => quickBid(auc._id, Math.max(auc.highestBid || 0, auc.product?.basePrice || 0), 100)} className="hidden sm:inline-flex px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors border border-emerald-100 items-center justify-center">
                       +₹100
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Tracking & Results */}
        <div className="space-y-8">
          
          {/* My Active Tracked Bids */}
          <div>
            <h3 className="text-lg font-black text-stone-800 tracking-tight uppercase mb-4 opacity-80">Tracked Placements</h3>
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
              {myBids.length === 0 ? (
                <div className="p-8 text-center text-stone-400 font-bold text-sm">You haven't placed any bids yet.</div>
              ) : (
                <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
                  {myBids.map((b, i) => (
                    <div key={i} className="p-5 hover:bg-stone-50/50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-800">{b.productName}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">You placed: ₹{b.myBidAmount}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        {b.status === 'Winning' && <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded uppercase tracking-widest mb-1">Winning 🟢</span>}
                        {b.status === 'Outbid' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase tracking-widest mb-1">Outbid 🔴</span>}
                        {b.status === 'Won' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black rounded uppercase tracking-widest mb-1">Won 🏆</span>}
                        {b.status === 'Lost' && <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-black rounded uppercase tracking-widest mb-1">Closed</span>}
                        
                        {(b.status === 'Winning' || b.status === 'Outbid') && (
                          <p className="text-xs text-stone-900 font-black mt-1">High: ₹{b.currentHighestBid}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hall of Trophies (Won Auctions) */}
          <div>
            <h3 className="text-lg font-black text-stone-800 tracking-tight uppercase mb-4 opacity-80 flex items-center gap-2">
              <CheckCircle size={18} /> Procurement History
            </h3>
            <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/30 overflow-hidden">
               {wonAuctions.length === 0 ? (
                <div className="p-8 text-center text-stone-400 font-bold text-sm">No won auctions mathematically verified yet.</div>
               ) : (
                <div className="divide-y divide-stone-50 max-h-[300px] overflow-y-auto">
                  {wonAuctions.map(w => (
                    <div key={w.auctionId} className="p-5 bg-indigo-50/20 flex justify-between items-center group hover:bg-indigo-50/60 transition-colors">
                      <div>
                        <p className="font-bold text-indigo-900">{w.productName}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1 block">From: {w.farmerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-emerald-600">₹{w.finalPrice}</p>
                        <p className="text-[10px] font-medium text-stone-400">{new Date(w.auctionDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
               )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;
