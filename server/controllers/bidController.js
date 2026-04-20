import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import FraudLog from '../models/FraudLog.js';
import Notification from '../models/Notification.js';
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

    const previousHighestBidderId = auction.winner ? auction.winner.toString() : null;
    const previousHighestBid = auction.highestBid;

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

    // Extend the auction once when a qualifying last-second bid lands.
    const now = Date.now();
    const remainingTime = new Date(auction.endTime).getTime() - now;
    let auctionExtended = false;

    if (remainingTime <= 10000 && remainingTime > 0) {
      const updatedAuction = await Auction.findOneAndUpdate(
        {
          _id: auction._id,
          status: 'active',
          endTime: auction.endTime
        },
        {
          $set: {
            endTime: new Date(new Date(auction.endTime).getTime() + 60000)
          }
        },
        { new: true }
      );

      if (updatedAuction) {
        auction.endTime = updatedAuction.endTime;
        auctionExtended = true;
      }
    }

    await auction.save();

    if (auctionExtended) {
      // Keep the extension visible to every watcher on the live auction room.
      req.app.get('io')?.to(auction._id.toString()).emit('auctionExtended', {
        auctionId: auction._id,
        endTime: auction.endTime,
        message: 'Auction extended by 1 minute!'
      });
    }

    if (previousHighestBidderId && previousHighestBidderId !== req.user._id.toString() && previousHighestBid < amount) {
      const outbidNotification = await Notification.create({
        user: previousHighestBidderId,
        message: 'You have been outbid!',
        type: 'outbid'
      });

      req.app.get('io')?.to(previousHighestBidderId).emit('notification', {
        _id: outbidNotification._id,
        message: outbidNotification.message,
        type: outbidNotification.type,
        isRead: outbidNotification.isRead,
        createdAt: outbidNotification.createdAt
      });
    }
    
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
