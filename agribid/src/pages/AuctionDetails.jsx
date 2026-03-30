import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Timer, Gavel, User, History, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const socket = useSocket();
  const { user } = useAuth();
  const { t } = useTranslation();

  const fetchAuction = async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      setAuction(data);
      if (data && data.product) {
        fetchBids(data.product._id);
      }
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchBids = async (productId) => {
    try {
      const { data } = await api.get(`/bids/${productId}`);
      setBids(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let currentAuction = null;
    
    fetchAuction().then(data => {
      currentAuction = data;
    });

    if (socket) {
      socket.emit('joinAuction', id);
      
      socket.on('bidUpdate', (data) => {
        setAuction(prev => {
          if (!prev) return prev;
          return { ...prev, highestBid: data.amount, winner: data.dealer };
        });
        
        // Use functional state update to access the latest auction state
        setAuction(prev => {
          if (prev && prev.product) {
            fetchBids(prev.product._id);
          }
          return prev;
        });
      });
      
      socket.on('auctionClosed', (data) => {
        if (data.auctionId === id) {
          setAuction(prev => prev ? { ...prev, status: 'closed' } : prev);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('leaveAuction', id);
        socket.off('bidUpdate');
        socket.off('auctionClosed');
      }
    };
  }, [id, socket]);

  useEffect(() => {
    if (!auction) return;

    const timer = setInterval(() => {
      const now = new Date();
      // Ensure auction.endTime is parsed if it's a string
      const end = new Date(auction.endTime);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const amount = parseFloat(bidAmount);
      await api.post('/bids', { auctionId: id, amount });
      if (socket) {
        socket.emit('newBid', { auctionId: id, amount, dealer: user });
      }
      setBidAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bid');
    }
  };

  if (!auction) return <div className="py-20 text-center">Loading auction...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left Column: Product Info */}
      <div className="lg:col-span-2 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/40"
        >
          <div className="h-[400px] bg-stone-100 relative">
            {auction.product.images?.[0] ? (
              <img src={auction.product.images[0]} alt={auction.product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-200">
                <TrendingUp size={120} />
              </div>
            )}
            <div className="absolute bottom-8 left-8 flex gap-3">
              <div className="bg-stone-900/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/10">
                <Timer size={20} className="text-emerald-400" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Time Remaining</p>
                  <p className="text-lg font-bold font-mono">{timeLeft}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {auction.product.category}
                  </span>
                  <span className="text-stone-400 text-sm font-medium">Product ID: {auction.product._id.slice(-6)}</span>
                </div>
                <h1 className="text-5xl font-bold text-stone-800">{auction.product.name}</h1>
              </div>
              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('basePrice')}</p>
                <p className="text-3xl font-bold text-stone-800">₹{auction.product.basePrice}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-stone-50">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-xl font-bold text-stone-800">{auction.product.quantity} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Farmer</p>
                <p className="text-xl font-bold text-stone-800">Verified</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Location</p>
                <p className="text-xl font-bold text-stone-800">Maharashtra</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Bids</p>
                <p className="text-xl font-bold text-stone-800">{bids.length}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Product Description</h3>
              <p className="text-stone-500 leading-relaxed">
                High-quality {auction.product.name} directly from the farm. Carefully harvested and stored to maintain freshness. Ideal for wholesale and retail distribution.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bid History */}
        <div className="bg-white rounded-[3rem] p-10 border border-stone-100 shadow-xl shadow-stone-200/40">
          <div className="flex items-center gap-3 mb-8">
            <History size={24} className="text-emerald-600" />
            <h3 className="text-2xl font-bold text-stone-800">Bid History</h3>
          </div>
          <div className="space-y-4">
            {bids.map((bid, i) => (
              <div key={bid._id} className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    {bid.dealer.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{bid.dealer.name}</p>
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{new Date(bid.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <p className={`text-xl font-bold ${i === 0 ? 'text-emerald-600' : 'text-stone-800'}`}>₹{bid.amount}</p>
              </div>
            ))}
            {bids.length === 0 && <p className="text-center py-8 text-stone-400">No bids yet. Be the first!</p>}
          </div>
        </div>
      </div>

      {/* Right Column: Bidding Action */}
      <div className="space-y-8">
        <div className="sticky top-24 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-stone-900 text-white rounded-[3rem] p-10 shadow-2xl shadow-stone-900/30 border border-white/5"
          >
            <div className="text-center mb-10">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('currentBid')}</p>
              <h2 className="text-6xl font-bold text-emerald-400">₹{auction.highestBid}</h2>
              {auction.winner && (
                <p className="text-stone-400 mt-4 flex items-center justify-center gap-2 text-sm">
                  <User size={16} />
                  Highest bidder: <span className="text-white font-bold">{auction.winner.name}</span>
                </p>
              )}
            </div>

            {auction.status === 'active' && user?.role === 'dealer' ? (
              <form onSubmit={handleBid} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Place Your Bid</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xl">₹</span>
                    <input 
                      type="number" 
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full pl-10 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors text-2xl font-bold"
                      placeholder={auction.highestBid + 100}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-xs bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
                >
                  <Gavel size={24} />
                  {t('placeBid')}
                </button>
                <p className="text-[10px] text-center text-stone-500 font-medium uppercase tracking-widest">
                  Bids are binding. Please bid responsibly.
                </p>
              </form>
            ) : auction.status === 'closed' ? (
              <div className="text-center py-10 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-red-400 font-bold text-xl uppercase tracking-widest">Auction Closed</p>
                {auction.winner && (
                  <p className="text-stone-400 mt-2">Winner: <span className="text-white font-bold">{auction.winner.name}</span></p>
                )}
              </div>
            ) : user?.role !== 'dealer' ? (
              <div className="text-center py-10 bg-white/5 rounded-[2rem] border border-white/5">
                <p className="text-stone-400 font-medium">Only dealers can place bids.</p>
              </div>
            ) : null}
          </motion.div>

          {/* Tips Card */}
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
            <h4 className="text-emerald-800 font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Bidding Tip
            </h4>
            <p className="text-emerald-700/80 text-sm leading-relaxed">
              Check the crop demand prediction to understand the market value. Bidding in the last few seconds may extend the auction by 10 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
