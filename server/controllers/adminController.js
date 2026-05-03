import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import FraudLog from '../models/FraudLog.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalBids = await Bid.countDocuments();
    const fraudAlerts = await FraudLog.countDocuments();

    return res.json({
      totalUsers,
      activeAuctions,
      totalBids,
      fraudAlerts
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({ message: 'Server error fetching stats', error: error.message });
  }
};

export const getFraudLogs = async (req, res) => {
  try {
    const logs = await FraudLog.find({})
      .populate('user', 'name email role isBlocked')
      .populate('product', 'name')
      .sort({ flaggedAt: -1 });
    return res.json(logs);
  } catch (error) {
    console.error('Error in getFraudLogs:', error);
    return res.status(500).json({ message: 'Server error fetching fraud logs', error: error.message });
  }
};

export const getAllAuctionsAdmin = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate({
        path: 'product',
        populate: { path: 'farmer', select: 'name email location' }
      })
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });

    // Fetch bid counts for these auctions
    const auctionsWithBidCount = await Promise.all(
      auctions.map(async (auction) => {
        let bidCount = 0;
        if (auction.product && auction.product._id) {
          bidCount = await Bid.countDocuments({ product: auction.product._id });
        }
        return { ...auction.toObject(), bidCount };
      })
    );

    return res.json(auctionsWithBidCount);
  } catch (error) {
    console.error('Error in getAllAuctionsAdmin:', error);
    return res.status(500).json({ message: 'Server error fetching all auctions', error: error.message });
  }
};

export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) {
    console.error('Error in getAllNotificationsAdmin:', error);
    return res.status(500).json({ message: 'Server error fetching notifications', error: error.message });
  }
};

export const getAdminAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('winner', 'name email')
      .populate({
        path: 'product',
        populate: { path: 'farmer', select: 'name email location' }
      });
      
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const bids = await Bid.find({ product: auction.product?._id })
      .populate('dealer', 'name email')
      .sort({ amount: -1 });

    return res.json({ auction, bids });
  } catch (error) {
    console.error('Error in getAdminAuctionDetails:', error);
    return res.status(500).json({ message: 'Server error fetching auction details', error: error.message });
  }
};

export const getAdminProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name email location');
      
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const auction = await Auction.findOne({ product: product._id })
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });

    const bids = await Bid.find({ product: product._id })
      .populate('dealer', 'name email')
      .sort({ timestamp: -1 }); // Or amount: -1 depending on preference

    return res.json({ product, auction, bids });
  } catch (error) {
    console.error('Error in getAdminProductDetails:', error);
    return res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
};
