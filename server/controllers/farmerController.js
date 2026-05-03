import Product from '../models/Product.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    const productIds = products.map(p => p._id);

    const activeAuctions = await Auction.countDocuments({ product: { $in: productIds }, status: 'active' });
    const completedAuctions = await Auction.countDocuments({ product: { $in: productIds }, status: 'closed' });

    // Calculate Earnings (Sum of highest bids for closed auctions that have a winner)
    const closedWonAuctions = await Auction.find({ product: { $in: productIds }, status: 'closed', winner: { $ne: null } });
    const totalEarnings = closedWonAuctions.reduce((sum, auc) => sum + (auc.highestBid || 0), 0);
    const avgSellingPrice = closedWonAuctions.length > 0 ? (totalEarnings / closedWonAuctions.length).toFixed(2) : 0;

    return res.json({
      totalProducts: products.length,
      activeAuctions,
      completedAuctions,
      totalEarnings,
      avgSellingPrice
    });
  } catch (error) {
    console.error('Error fetching farmer stats:', error);
    return res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

export const getFarmerProductsWithBids = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    const formattedProducts = await Promise.all(products.map(async (prod) => {
      const auction = await Auction.findOne({ product: prod._id }).sort({ createdAt: -1 });
      const totalBids = await Bid.countDocuments({ product: prod._id });

      return {
        _id: prod._id,
        name: prod.name,
        category: prod.category,
        basePrice: prod.basePrice,
        status: auction ? auction.status : prod.status,
        highestBid: auction ? auction.highestBid : 0,
        totalBids: totalBids,
        finalPrice: auction && auction.status === 'closed' ? auction.highestBid : null
      };
    }));

    return res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    const productIds = products.map(p => p._id);

    const closedWonAuctions = await Auction.find({ product: { $in: productIds }, status: 'closed', winner: { $ne: null } }).populate('product', 'name category');
    
    let totalEarnings = 0;
    let highestSoldProduct = null;
    let highestPrice = 0;

    const earningsPerProduct = closedWonAuctions.map(auc => {
      const earned = auc.highestBid || 0;
      totalEarnings += earned;
      if (earned > highestPrice) {
        highestPrice = earned;
        highestSoldProduct = auc.product;
      }
      return {
        productName: auc.product.name,
        category: auc.product.category,
        earned
      };
    });

    return res.json({
      totalEarnings,
      highestSoldProduct: highestSoldProduct ? { name: highestSoldProduct.name, price: highestPrice } : null,
      earningsPerProduct
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return res.status(500).json({ message: 'Server error fetching earnings' });
  }
};
