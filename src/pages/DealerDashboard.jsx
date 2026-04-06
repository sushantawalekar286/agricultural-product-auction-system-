import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Gavel, Timer, User, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const DealerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data } = await api.get('/auctions');
      setAuctions(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-stone-800">{t('dealer')} {t('dashboard')}</h1>
        <p className="text-stone-500 mt-1">Browse active auctions and place your bids.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {auctions.map((auction) => (
          <motion.div 
            key={auction._id}
            whileHover={{ y: -8 }}
            className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/40 group"
          >
            <div className="h-48 bg-stone-100 relative overflow-hidden">
              {auction.product.images?.[0] ? (
                <img src={auction.product.images[0]} alt={auction.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <Globe size={48} />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Timer size={14} />
                Live
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-stone-800">{auction.product.name}</h3>
                  <p className="text-stone-400 font-medium">{auction.product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('currentBid')}</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{auction.highestBid}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-semibold text-stone-600">{auction.product.quantity} kg</span>
                </div>
                <Link 
                  to={`/auction/${auction._id}`}
                  className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  {t('placeBid')}
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {auctions.length === 0 && (
          <div className="col-span-full py-20 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
            <p className="text-stone-400 font-medium">No active auctions at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;
