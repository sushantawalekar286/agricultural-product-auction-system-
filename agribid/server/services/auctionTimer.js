import Auction from '../models/Auction.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

export const checkAuctions = async (io) => {
  try {
    const now = new Date();
    const expiredAuctions = await Auction.find({
      status: 'active',
      endTime: { $lte: now }
    });

    for (const auction of expiredAuctions) {
      auction.status = 'closed';
      await auction.save();

      const product = await Product.findById(auction.product);
      if (product) {
        product.status = auction.winner ? 'sold' : 'expired';
        await product.save();
      }

      if (auction.winner) {
        await Notification.create({
          user: auction.winner,
          message: `Congratulations! You won the auction for ${product ? product.name : 'Unknown Product'}.`
        });
        io.to(auction.winner.toString()).emit('notification', { message: `You won the auction for ${product ? product.name : 'Unknown Product'}!` });
      }

      if (product) {
        await Notification.create({
          user: product.farmer,
          message: `Auction for ${product.name} has ended. Status: ${product.status}.`
        });
        io.to(product.farmer.toString()).emit('notification', { message: `Auction for ${product.name} has ended.` });
      }

      io.emit('auctionClosed', { auctionId: auction._id, status: product ? product.status : 'expired' });
    }
  } catch (error) {
    console.error('Error in checkAuctions:', error);
  }
};
