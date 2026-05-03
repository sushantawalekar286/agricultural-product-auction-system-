import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Play, Square, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuctionMonitoring = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const [timers, setTimers] = useState({});

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/auctions');
      setAuctions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    
    socket.on('newBid', fetchAuctions);
    socket.on('bidUpdate', fetchAuctions); // Keep for safety
    socket.on('auctionClosed', fetchAuctions);
    socket.on('auctionExtended', fetchAuctions);

    return () => {
      socket.off('newBid', fetchAuctions);
      socket.off('bidUpdate', fetchAuctions);
      socket.off('auctionClosed', fetchAuctions);
      socket.off('auctionExtended', fetchAuctions);
    };
  }, [socket]);

  useEffect(() => {
    const updateTimers = () => {
      const newTimers = {};
      const now = Date.now();
      
      auctions.forEach(a => {
        if (a.status === 'active') {
          const remaining = new Date(a.endTime).getTime() - now;
          if (remaining > 0) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            newTimers[a._id] = `${minutes}m ${seconds}s`;
          } else {
            newTimers[a._id] = 'Ending...';
          }
        } else {
          newTimers[a._id] = 'Closed';
        }
      });
      setTimers(newTimers);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  const handleStopAuction = async (auctionId) => {
    if (window.confirm('Force close this auction immediately?')) {
      try {
        await api.put(`/auctions/${auctionId}/stop`);
        fetchAuctions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExtendAuction = async (auctionId) => {
    const min = prompt("Enter minutes to extend:", "5");
    if (!min || isNaN(min) || min <= 0) return;
    try {
      await api.put(`/auctions/${auctionId}/extend`, { minutes: min });
      fetchAuctions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <Play className="text-indigo-600" size={32} />
          Live Auction Monitoring
        </h1>
        <p className="text-stone-500 mt-1">Real-time overview of active and past auctions.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 font-bold bg-white rounded-[2rem] border border-stone-100 shadow-xl w-full">
          Loading live auctions...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {auctions?.map(auction => (
            <div key={auction._id} className="bg-white rounded-2xl border border-stone-100 shadow-xl shadow-stone-200/40 relative overflow-hidden flex flex-col">
            <div className={`h-2 w-full ${auction.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></div>
            
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <h3 className="text-xl font-bold text-stone-800">{auction.product?.name || 'Unknown Product'}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                      auction.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {auction.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{auction.product?.category}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Time Remaining</p>
                  <p className={`text-xl font-black font-mono ${auction.status === 'active' ? 'text-stone-800' : 'text-stone-400'}`}>
                    <Clock size={16} className="inline mr-1 text-stone-400" />
                    {timers[auction._id] || '--m --s'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-stone-50 rounded-xl">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Base Price</p>
                  <p className="text-lg font-bold text-stone-800">₹{auction.product?.basePrice}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Highest Bid</p>
                  <p className="text-lg font-black text-emerald-800">₹{auction.highestBid || 0}</p>
                </div>
                <div className="col-span-2 flex justify-between px-2 pt-2 border-t border-stone-100">
                   <div className="text-sm">
                      <p className="text-stone-500">Farmer: <span className="font-semibold text-stone-800">{auction.product?.farmer?.name}</span></p>
                      {auction.status === 'closed' && auction.winner && (
                        <p className="text-stone-500 mt-1">Winner: <span className="font-semibold text-indigo-700">{auction.winner?.name}</span></p>
                      )}
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Bids</p>
                      <p className="text-xl font-bold text-stone-800">{auction.bidCount || 0}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-50 bg-stone-50/50 flex justify-between items-center">
              <Link to={`/admin/auctions/${auction._id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                View Live Details &rarr;
              </Link>
              
              <div className="flex gap-2">
                {auction.status === 'active' && (
                  <>
                    <button 
                      onClick={() => handleExtendAuction(auction._id)}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                    >
                      <Plus size={14} /> Extend
                    </button>
                    <button 
                      onClick={() => handleStopAuction(auction._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider shadow-sm"
                    >
                      <Square size={14} /> Force Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
          {auctions.length === 0 && (
            <div className="col-span-2 py-16 text-center bg-white rounded-3xl border border-stone-100 shadow-xl">
              <Play className="mx-auto text-stone-200 mb-4" size={48} />
              <p className="text-stone-400 font-bold text-lg">👉 No active auctions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuctionMonitoring;
