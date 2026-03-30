import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Search, Filter, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

const PredictionCard = () => {
  const [category, setCategory] = useState('Wheat');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/services/predict?category=${category}`);
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [category]);

  return (
    <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-stone-900/20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
          <TrendingUp size={20} />
        </div>
        <h3 className="text-xl font-bold">{t('prediction')}</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Select Crop Category</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors appearance-none font-medium"
            >
              <option value="Wheat" className="bg-stone-800">Wheat</option>
              <option value="Rice" className="bg-stone-800">Rice</option>
              <option value="Mango" className="bg-stone-800">Mango</option>
              <option value="Cotton" className="bg-stone-800">Cotton</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prediction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">{t('expectedPrice')}</p>
              <p className="text-3xl font-bold text-emerald-400">₹{prediction.expectedPriceRange}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{t('demand')}</p>
                <p className={`text-lg font-bold ${
                  prediction.demandLevel === 'HIGH' ? 'text-emerald-400' : 
                  prediction.demandLevel === 'MEDIUM' ? 'text-blue-400' : 'text-stone-400'
                }`}>{prediction.demandLevel}</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{t('trend')}</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${
                  prediction.trend === 'INCREASING' ? 'text-emerald-400' : 
                  prediction.trend === 'DECREASING' ? 'text-red-400' : 'text-stone-400'
                }`}>
                  {prediction.trend}
                  {prediction.trend === 'INCREASING' && <ArrowUpRight size={16} />}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PredictionCard;
