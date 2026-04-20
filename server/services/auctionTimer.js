import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

const emitNotification = async (io, userId, message, type) => {
  if (!userId) return null;

  const notification = await Notification.create({
    user: userId,
    message,
    type,
    isRead: false
  });

  io?.to(userId.toString()).emit('notification', {
    _id: notification._id,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  });

  return notification;
};

export const finalizeAuction = async (auctionDoc, io, options = {}) => {
  const { force = false } = options;

  const closeFilter = {
    _id: auctionDoc._id,
    status: 'active'
  };

  if (!force) {
    closeFilter.endTime = { $lte: new Date() };
  }

  const closedAuction = await Auction.findOneAndUpdate(
    closeFilter,
    {
      $set: { status: 'closed' }
    },
    { new: true }
  );

  if (!closedAuction) {
    return;
  }

  const populatedAuction = await Auction.findById(closedAuction._id)
    .populate({
      path: 'product',
      populate: { path: 'farmer', select: 'name location' }
    })
    .populate('winner', 'name');

  if (!populatedAuction) {
    return;
  }

  const product = populatedAuction.product;
  if (product) {
    product.status = populatedAuction.winner ? 'sold' : 'expired';
    await product.save();
  }

  const winningBid = populatedAuction.highestBid || 0;
  const winnerId = populatedAuction.winner?._id?.toString?.() || populatedAuction.winner?.toString?.() || null;
  const winnerName = populatedAuction.winner?.name || 'N/A';
  const farmerId = product?.farmer?._id?.toString?.() || product?.farmer?.toString?.() || null;

  if (farmerId) {
    await emitNotification(
      io,
      farmerId,
      `Your product auction has ended. Winning bid: ₹${winningBid}. Dealer: ${winnerName}.`,
      'auction_ended'
    );
  }

  if (winnerId) {
    await emitNotification(
      io,
      winnerId,
      'Congratulations! You won the auction',
      'auction_won'
    );
  }

  const dealerIds = await Bid.distinct('dealer', { product: populatedAuction.product?._id || populatedAuction.product });
  for (const dealerId of dealerIds) {
    const dealerStringId = dealerId.toString();
    if (dealerStringId === winnerId) {
      continue;
    }

    await emitNotification(
      io,
      dealerStringId,
      'Auction ended. You did not win',
      'auction_lost'
    );
  }

  io?.emit('auctionClosed', { auctionId: populatedAuction._id, status: product ? product.status : 'expired' });
};

export const checkAuctions = async (io) => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now }
    });

    for (const auction of expiredAuctions) {
      await finalizeAuction(auction, io);
    }
  } catch (error) {
    console.error('Error in checkAuctions:', error);
  }
};
