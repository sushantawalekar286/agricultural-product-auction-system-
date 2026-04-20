import Auction from '../models/Auction.js';
import Product from '../models/Product.js';
import { finalizeAuction } from '../services/auctionTimer.js';

export const startAuction = async (req, res) => {
  try {
    const { productId, startTime, endTime, durationMinutes } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!durationMinutes && !endTime) {
      return res.status(400).json({ message: 'Missing auction duration' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.status !== 'pending') {
      return res.status(400).json({ message: 'Product is already active or sold' });
    }
    
    product.status = 'active';
    await product.save();

    const auctionStartTime = startTime ? new Date(startTime) : new Date();
    const auctionEndTime = durationMinutes
      ? new Date(auctionStartTime.getTime() + Number(durationMinutes) * 60000)
      : new Date(endTime);

    if (Number.isNaN(auctionEndTime.getTime())) {
      return res.status(400).json({ message: 'Invalid auction end time' });
    }

    const auction = await Auction.create({
      product: productId,
      startTime: auctionStartTime,
      endTime: auctionEndTime,
      highestBid: product.basePrice
    });
    return res.status(201).json(auction);
  } catch (error) {
    console.error('Error in startAuction:', error);
    return res.status(500).json({ message: 'Server error starting auction', error: error.message });
  }
};

export const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' }).populate({
      path: 'product',
      populate: { path: 'farmer', select: 'name location' }
    });
    return res.json(auctions);
  } catch (error) {
    console.error('Error in getActiveAuctions:', error);
    return res.status(500).json({ message: 'Server error fetching active auctions', error: error.message });
  }
};

export const getAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'product',
        populate: { path: 'farmer', select: 'name location' }
      })
      .populate('winner', 'name');
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    return res.json(auction);
  } catch (error) {
    console.error('Error in getAuctionDetails:', error);
    return res.status(500).json({ message: 'Server error fetching auction details', error: error.message });
  }
};

export const stopAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (auction) {
      await finalizeAuction(auction, req.app.get('io'), { force: true });
      return res.json({ message: 'Auction stopped' });
    } else {
      return res.status(404).json({ message: 'Auction not found' });
    }
  } catch (error) {
    console.error('Error in stopAuction:', error);
    return res.status(500).json({ message: 'Server error stopping auction', error: error.message });
  }
};
