import Bid from '../models/Bid.js';

export const predictCropDemand = async (req, res) => {
  const { category } = req.query;
  const bids = await Bid.find({}).populate({
    path: 'product',
    match: { category }
  });

  const filteredBids = bids.filter(bid => bid.product !== null);
  if (filteredBids.length === 0) {
    return res.json({
      expectedPriceRange: 'N/A',
      demandLevel: 'LOW',
      trend: 'STABLE'
    });
  }

  const prices = filteredBids.map(b => b.amount);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  // Simple trend analysis (last 5 vs previous 5)
  const last5 = prices.slice(-5);
  const prev5 = prices.slice(-10, -5);
  let trend = 'STABLE';
  if (prev5.length > 0) {
    const lastAvg = last5.reduce((a, b) => a + b, 0) / last5.length;
    const prevAvg = prev5.reduce((a, b) => a + b, 0) / prev5.length;
    if (lastAvg > prevAvg * 1.1) trend = 'INCREASING';
    else if (lastAvg < prevAvg * 0.9) trend = 'DECREASING';
  }

  let demandLevel = 'MEDIUM';
  if (filteredBids.length > 20) demandLevel = 'HIGH';
  else if (filteredBids.length < 5) demandLevel = 'LOW';

  res.json({
    expectedPriceRange: `${(avgPrice * 0.9).toFixed(2)} - ${(avgPrice * 1.1).toFixed(2)}`,
    demandLevel,
    trend
  });
};
