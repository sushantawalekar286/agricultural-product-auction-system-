import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { Gavel, TrendingUp, ShieldCheck, Globe, ArrowRight, Timer, User } from 'lucide-react';
import { motion } from 'motion/react';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const { data } = await api.get('/auctions');
        console.log('Auction Data:', data);
        setAuctions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setAuctions([]);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-stone-900 text-white p-12 md:p-24">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-emerald-400 text-sm font-bold mb-8 border border-white/10"
          >
            <TrendingUp size={16} />
            Empowering Indian Farmers
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            The Future of <span className="text-emerald-500">Agri-Auctions</span> is Here.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-400 mb-12 leading-relaxed"
          >
            AgriBid Pro+ connects farmers directly with dealers through a secure, real-time bidding platform powered by intelligent demand prediction.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/register" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 group">
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#active-auctions" className="bg-white/5 backdrop-blur-md text-white border border-white/10 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              View Live Bids
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: <Gavel className="text-emerald-600" />, title: "Real-time Bidding", desc: "Place and track bids instantly with our high-speed Socket.IO integration." },
          { icon: <TrendingUp className="text-emerald-600" />, title: "Demand Prediction", desc: "Intelligent analytics to predict crop demand and expected price ranges." },
          { icon: <ShieldCheck className="text-emerald-600" />, title: "Fraud Detection", desc: "Advanced rule-based system to flag suspicious activities and protect users." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-4">{feature.title}</h3>
            <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Active Auctions */}
      <section id="active-auctions" className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold text-stone-800">Live <span className="text-emerald-600">Auctions</span></h2>
          <Link to="/dealer" className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(auctions || []).map((auction) => (
            <motion.div 
              key={auction._id}
              whileHover={{ y: -8 }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-200/40 group"
            >
              <div className="h-48 bg-stone-100 relative overflow-hidden">
                {auction?.product?.images?.[0] ? (
                  <img src={auction.product.images[0]} alt={auction?.product?.name || 'Auction Product'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
                    <h3 className="text-2xl font-bold text-stone-800">{auction?.product?.name || 'Auction product'}</h3>
                    <p className="text-stone-400 font-medium">{auction?.product?.category || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{t('currentBid')}</p>
                    <p className="text-2xl font-bold text-emerald-600">₹{auction?.highestBid || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-stone-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500">
                      <User size={16} />
                    </div>
                    <span className="text-sm font-semibold text-stone-600">{auction?.product?.quantity || 0} kg</span>
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
          {(auctions || []).length === 0 && (
            <div className="col-span-full py-20 text-center bg-stone-50 rounded-[2.5rem] border-2 border-dashed border-stone-200">
              <p className="text-stone-400 font-medium">Auction not started yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
