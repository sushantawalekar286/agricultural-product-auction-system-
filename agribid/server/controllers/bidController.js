import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import FraudLog from '../models/FraudLog.js';
import { detectFraud } from '../services/fraudDetectionService.js';

export const placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    
    if (!auctionId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid bid data' });
    }

    const auction = await Auction.findById(auctionId).populate('product');
    if (!auction || auction.status === 'closed') {
      return res.status(400).json({ message: 'Auction not active or not found' });
    }
    
    if (new Date(auction.endTime) < new Date()) {
      return res.status(400).json({ message: 'Auction time has ended' });
    }
    
    const minimumBid = Math.max(auction.highestBid || 0, auction.product.basePrice || 0);
    if (amount <= minimumBid) {
      return res.status(400).json({ message: `Bid must be higher than current highest bid (${minimumBid})` });
    }

    // Fraud detection
    const fraudReason = await detectFraud(req.user._id, auction.product._id, amount, auction.highestBid);
    if (fraudReason) {
      await FraudLog.create({ user: req.user._id, product: auction.product._id, reason: fraudReason });
      return res.status(403).json({ message: 'Potential fraud detected. Bid rejected.', reason: fraudReason });
    }

    const bid = await Bid.create({
      product: auction.product._id,
      dealer: req.user._id,
      amount
    });

    auction.highestBid = amount;
    auction.winner = req.user._id;
    
    // Extend auction if bid placed in last 10 seconds
    const now = new Date();
    const timeRemaining = auction.endTime.getTime() - now.getTime();
    if (timeRemaining < 10000 && timeRemaining > 0) {
      auction.endTime = new Date(auction.endTime.getTime() + 10000);
    }

    await auction.save();
    
    const populatedBid = await Bid.findById(bid._id).populate('dealer', 'name');
    return res.status(201).json(populatedBid);
  } catch (error) {
    console.error('Error in placeBid:', error);
    return res.status(500).json({ message: 'Server error placing bid', error: error.message });
  }
};

export const getBidsByProduct = async (req, res) => {
  try {
    const bids = await Bid.find({ product: req.params.productId }).populate('dealer', 'name').sort({ amount: -1 });
    return res.json(bids);
  } catch (error) {
    console.error('Error in getBidsByProduct:', error);
    return res.status(500).json({ message: 'Server error fetching bids', error: error.message });
  }
};
