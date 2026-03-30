import Bid from '../models/Bid.js';

export const detectFraud = async (userId, productId, amount, highestBid) => {
  // 1. Sudden price increase (>50%)
  if (amount > highestBid * 1.5) {
    return 'Sudden price increase (>50%)';
  }

  // 2. Too many bids in short time (e.g., > 5 bids in 30 seconds)
  const thirtySecondsAgo = new Date(Date.now() - 30000);
  const recentBidsCount = await Bid.countDocuments({
    dealer: userId,
    timestamp: { $gte: thirtySecondsAgo }
  });
  if (recentBidsCount >= 5) {
    return 'Too many bids in short time';
  }

  // 3. Same user repeated bidding on same product consecutively
  const lastBid = await Bid.findOne({ product: productId }).sort({ timestamp: -1 });
  if (lastBid && lastBid.dealer.toString() === userId.toString()) {
    // Check if there are other bidders
    const uniqueBidders = await Bid.distinct('dealer', { product: productId });
    if (uniqueBidders.length === 1) {
      // If only one bidder, they shouldn't be bidding against themselves unless it's a new auction
      // But in our system, they can't bid lower than highest, so if they are the highest, they shouldn't bid again
      return 'Repeated bidding by same user';
    }
  }

  return null;
};
