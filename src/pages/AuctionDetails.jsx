import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showSuccess, showInfo } from '../utils/sweetAlert';
import { Timer, Gavel, User, History, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const statusMessageTimerRef = useRef(null);
  const [toasts, setToasts] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();
  const { t } = useTranslation();

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const showStatusMessage = (message) => {
    setStatusMessage(message);
    window.clearTimeout(statusMessageTimerRef.current);
    statusMessageTimerRef.current = window.setTimeout(() => setStatusMessage(''), 3000);
  };

  const fetchAuction = async () => {
    try {
      const { data } = await api.get(`/auctions/${id}`);
      console.log('Auction Data:', data);
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
      console.log('Bids:', data);
      setBids(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBids([]);
    }
  };

  useEffect(() => {
    fetchAuction();

    if (socket) {
      socket.emit('joinAuction', id);

      const handleBidUpdate = (data) => {
        setAuction(prev => {
          if (!prev) return prev;
          if (user && prev.winner && prev.winner._id === user._id && data.dealer?._id !== user._id) {
            addToast('You Have Been Outbid', 'warning');
          }
          return { ...prev, highestBid: data.amount, winner: data.dealer };
        });

        setAuction(prev => {
          if (prev?.product?._id) {
            fetchBids(prev.product._id);
          }
          return prev;
        });
      };

      const handleAuctionClosed = (data) => {
        if (data.auctionId === id) {
          setAuction(prev => {
            const isWinner = data.winnerId === user?._id || (prev?.winner && prev.winner._id === user?._id);
            if (isWinner) {
              showSuccess('Auction Winner Declared. You won the auction!');
            } else {
              showInfo('Auction Completed');
            }
            return prev ? { ...prev, status: 'closed' } : prev;
          });
          setTimeLeft('EXPIRED');
        }
      };

      const handleAuctionExtended = (data) => {
        if (data.auctionId === id) {
          setAuction(prev => prev ? { ...prev, endTime: data.endTime } : prev);
          addToast('Auction Extended by 1 Minute', 'info');
        }
      };

      socket.on('bidUpdate', handleBidUpdate);
      socket.on('auctionClosed', handleAuctionClosed);
      socket.on('auctionExtended', handleAuctionExtended);

      return () => {
        socket.emit('leaveAuction', id);
        socket.off('bidUpdate', handleBidUpdate);
        socket.off('auctionClosed', handleAuctionClosed);
        socket.off('auctionExtended', handleAuctionExtended);
      };
    }

    return undefined;
  }, [id, socket, user]);

  useEffect(() => {
    if (!auction?.endTime) return;

    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(auction.endTime);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        clearInterval(timer);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid bid amount');
      return;
    }
    const currentHighest = auction.highestBid || auction.product?.basePrice || 0;
    if (auction && amount <= currentHighest) {
      setError(`Bid must be higher than current highest bid of ₹${currentHighest}`);
      return;
    }

    try {
      await api.post('/bids', { auctionId: id, amount });
      if (socket) {
        socket.emit('newBid', { auctionId: id, amount, dealer: user });
      }
      setBidAmount('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to place bid';
      setError(errMsg);
    }
  };

  if (!auction) return <div className="py-20 text-center">Loading auction...</div>;
  if (!auction?.product) return <div className="py-20 text-center text-stone-500">Auction not started yet.</div>;

  let expiryText = 'N/A';
  if (auction?.product?.quality?.expiryDate) {
    const daysLeft = Math.ceil((new Date(auction.product.quality.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    expiryText = daysLeft > 0 ? `Expires in ${daysLeft} days` : 'Expired';
  }

  const grade = auction?.product?.quality?.grade || 'N/A';
  let gradeBadge = null;
  if (grade === 'A') gradeBadge = <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2">Premium</span>;
  else if (grade === 'B') gradeBadge = <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2">Standard</span>;
  else if (grade === 'C') gradeBadge = <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold ml-2">Low Quality</span>;

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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-8 border-y border-stone-50">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Available</p>
                <p className="text-xl font-bold text-stone-800">{auction.product.quantity} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Market Total</p>
                <p className="text-xl font-bold text-stone-800">{auction.marketQuantity || auction.product.quantity} kg</p>
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

            <div className="mt-10 bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center">
                Quality Specifications {gradeBadge}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Size</p>
                  <p className="text-sm font-bold text-stone-800">{auction.product?.quality?.size || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Ripeness</p>
                  <p className="text-sm font-bold text-stone-800">{auction.product?.quality?.ripeness || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Moisture</p>
                  <p className="text-sm font-bold text-stone-800">{auction.product?.quality?.moisture ? `${auction.product.quality.moisture}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Organic</p>
                  <p className="text-sm font-bold text-stone-800">{auction.product?.quality?.isOrganic ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Storage</p>
                  <p className="text-sm font-bold text-stone-800">{auction.product?.quality?.storageCondition || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Expiry Status</p>
                  <p className={`text-sm font-bold ${expiryText === 'Expired' ? 'text-red-500' : 'text-emerald-600'}`}>{expiryText}</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-stone-800 mb-4">Product Description</h3>
              <p className="text-stone-500 leading-relaxed">
                {auction.product?.quality?.description || `High-quality ${auction.product.name} directly from the farm. Carefully harvested and stored to maintain freshness.`}
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
            {(bids || []).map((bid, i) => (
              <div key={bid._id} className={`flex items-center justify-between p-5 rounded-2xl border ${i === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-stone-50 border-stone-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'}`}>
                    {bid?.dealer?.name?.[0] || 'D'}
                  </div>
                  <div>
                    <p className="font-bold text-stone-800">{bid?.dealer?.name || 'Dealer'}</p>
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
              {statusMessage && (
                <div className="mt-5 inline-flex items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                  {statusMessage}
                </div>
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
                {auction.winner && user && auction.winner._id?.toString() === user._id?.toString() && (
                  <div className="mt-8">
                    {auction.hasOrder ? (
                      <button 
                        onClick={() => navigate(`/dealer/orders`)}
                        className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-950/20 transition-all text-sm w-full"
                      >
                        Track Order Details
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/dealer/place-order/${auction._id}`)}
                        className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-900/20 transition-all text-sm w-full"
                      >
                        Place Order
                      </button>
                    )}
                  </div>
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
              Check the crop demand prediction to understand the market value. Bidding in the last 10 seconds extends the auction by 1 minute.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 ${
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
                toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                'bg-stone-900/95 border-stone-850 text-stone-100'
              }`}
            >
              {toast.type === 'warning' && <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />}
              {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <TrendingUp size={18} className="text-indigo-400 shrink-0 mt-0.5" />}
              <div className="flex-1 text-sm font-semibold leading-snug">
                {toast.message}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-stone-400 hover:text-stone-200 text-xs font-bold leading-none p-1 cursor-pointer"
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuctionDetails;
