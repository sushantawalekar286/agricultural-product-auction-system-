import Product from '../models/Product.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

export const getDealerDashboardStats = async (req, res) => {
  try {
    const totalBids = await Bid.countDocuments({ dealer: req.user._id });
    const auctionsWon = await Auction.countDocuments({ winner: req.user._id, status: 'closed' });
    
    // Calculate Win Percentage. Count unique auctions the dealer bid on.
    const uniqueAuctionsBidOn = await Bid.distinct('product', { dealer: req.user._id });
    const winPercentage = uniqueAuctionsBidOn.length > 0 ? ((auctionsWon / uniqueAuctionsBidOn.length) * 100).toFixed(1) : 0;

    return res.json({
      totalBids,
      auctionsWon,
      winPercentage
    });
  } catch (error) {
    console.error('Error fetching dealer stats:', error);
    return res.status(500).json({ message: 'Server error fetching stats' });
  }
};

export const getDealerActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' }).populate('product', 'name category basePrice');
    return res.json(auctions);
  } catch (error) {
    console.error('Error fetching active auctions:', error);
    return res.status(500).json({ message: 'Server error fetching active auctions' });
  }
};

export const getDealerMyBids = async (req, res) => {
  try {
    const bids = await Bid.aggregate([
      { $match: { dealer: req.user._id } },
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$product",
          myHighestBid: { $max: "$amount" }
      }}
    ]);

    const formattedBids = await Promise.all(bids.map(async (b) => {
      const product = await Product.findById(b._id).select('name');
      const auction = await Auction.findOne({ product: b._id }).sort({ createdAt: -1 });

      if (!auction || !product) return null;

      const isWinning = auction.highestBid === b.myHighestBid && auction.winner?.toString() === req.user._id.toString();

      return {
        productId: b._id,
        productName: product.name,
        myBidAmount: b.myHighestBid,
        currentHighestBid: auction.highestBid,
        status: auction.status === 'closed' 
                ? (isWinning ? 'Won' : 'Lost') 
                : (isWinning ? 'Winning' : 'Outbid')
      };
    }));

    return res.json(formattedBids.filter(b => b !== null));
  } catch (error) {
    console.error('Error fetching my bids:', error);
    return res.status(500).json({ message: 'Server error fetching your bids' });
  }
};

export const getDealerWonAuctions = async (req, res) => {
  try {
    const wonAuctions = await Auction.find({ winner: req.user._id, status: 'closed' })
      .populate({
        path: 'product',
        populate: { path: 'farmer', select: 'name' }
      })
      .sort({ endTime: -1 });

    const formattedList = wonAuctions.map(auc => ({
      auctionId: auc._id,
      productName: auc.product?.name || 'Unknown',
      finalPrice: auc.highestBid,
      farmerName: auc.product?.farmer?.name || 'Unknown',
      auctionDate: auc.endTime
    }));

    return res.json(formattedList);
  } catch (error) {
    console.error('Error fetching won auctions:', error);
    return res.status(500).json({ message: 'Server error fetching won auctions' });
  }
};
