import User from '../models/User.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import FraudLog from '../models/FraudLog.js';
import Product from '../models/Product.js';

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
