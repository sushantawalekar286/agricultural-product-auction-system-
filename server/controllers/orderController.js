import Order from '../models/Order.js';
import Auction from '../models/Auction.js';
import Notification from '../models/Notification.js';

export const createOrder = async (req, res) => {
  try {
    const { auctionId, deliveryMethod, paymentMethod, deliveryAddress } = req.body;
    
    // Find auction
    const auction = await Auction.findById(auctionId).populate('product');
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    
    if (auction.status !== 'closed') {
      return res.status(400).json({ message: 'Auction is not closed yet' });
    }
    
    if (!auction.winner || auction.winner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the winning dealer can place an order' });
    }
    
    // Check if order already exists
    const existingOrder = await Order.findOne({ auction: auctionId });
    if (existingOrder) {
      return res.status(400).json({ message: 'Order for this auction already exists' });
    }
    
    const quantity = auction.product.quantity;
    const finalPrice = auction.highestBid;
    
    let deliveryCharge = 0;
    if (deliveryMethod === 'delivery') {
      deliveryCharge = 100;
    }
    
    const totalAmount = finalPrice + deliveryCharge;
    
    const order = await Order.create({
      product: auction.product._id,
      farmer: auction.product.farmer,
      dealer: req.user._id,
      auction: auction._id,
      quantity,
      pricePerUnit: finalPrice / quantity,
      deliveryCharge,
      totalAmount,
      deliveryMethod,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : ''
    });
    
    // Create notifications
    await Notification.create({
      recipient: auction.product.farmer,
      type: 'system',
      title: 'Order Received',
      message: `Dealer ${req.user.name} has placed an order for your ${auction.product.name}.`
    });

    if (paymentMethod === 'online') {
      await Notification.create({
        recipient: auction.product.farmer,
        type: 'system',
        title: 'Payment Done',
        message: `Payment for ${auction.product.name} order has been done successfully.`
      });
      await Notification.create({
        recipient: req.user._id,
        type: 'system',
        title: 'Payment Success',
        message: `Payment for ${auction.product.name} order was successful.`
      });
    }
    
    await Notification.create({
      recipient: req.user._id,
      type: 'system',
      title: 'Order Placed',
      message: `Your order for ${auction.product.name} has been placed successfully.`
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

export const getDealerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ dealer: req.user._id })
      .populate('product', 'name category')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .populate('dealer', 'name phone location')
      .populate('product', 'name category')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus, paymentStatus } = req.body;
    
    const order = await Order.findById(orderId).populate('product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this order' });
    }
    
    if (orderStatus) {
      order.orderStatus = orderStatus;
      
      // Notify dealer
      let statusMsg = '';
      if (orderStatus === 'ready_for_pickup') statusMsg = 'is ready for pickup';
      if (orderStatus === 'shipped') statusMsg = 'has been shipped';
      if (orderStatus === 'delivered' || orderStatus === 'picked_up') statusMsg = 'is completed';
      
      if (statusMsg) {
        await Notification.create({
          recipient: order.dealer,
          type: 'system',
          title: 'Order Updated',
          message: `Your order for ${order.product.name} ${statusMsg}.`
        });
      }
    }
    
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    
    await order.save();
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating order', error: error.message });
  }
};
