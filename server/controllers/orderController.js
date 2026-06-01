import Order from '../models/Order.js';
import Auction from '../models/Auction.js';
import Notification from '../models/Notification.js';

// Helper to create database notification and emit via Socket.io
const sendNotificationHelper = async (req, userId, message, type = 'system') => {
  try {
    const notif = await Notification.create({
      user: userId,
      message,
      type,
      isRead: false
    });
    
    const io = req.app.get('io');
    if (io && userId) {
      io.to(userId.toString()).emit('notification', {
        _id: notif._id,
        message: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        createdAt: notif.createdAt
      });
    }
    return notif;
  } catch (error) {
    console.error('Failed to create/send notification:', error);
    return null;
  }
};

export const createOrder = async (req, res) => {
  try {
    const { auctionId, deliveryMethod, deliveryAddress } = req.body;
    
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
      deliveryCharge = process.env.DELIVERY_CHARGE ? Number(process.env.DELIVERY_CHARGE) : 200;
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
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : ''
    });
    
    // Create notifications with corrected fields (no recipient, no title)
    await sendNotificationHelper(
      req,
      auction.product.farmer,
      `Dealer ${req.user.name} has placed an order for your ${auction.product.name}.`,
      'system'
    );
    
    await sendNotificationHelper(
      req,
      req.user._id,
      `Your order for ${auction.product.name} has been placed successfully.`,
      'system'
    );

    return res.status(201).json(order);
  } catch (error) {
    console.error('Order Creation Error:', error);
    return res.status(500).json({ message: 'Server error creating order', error: error.message });
  }
};

export const getDealerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ dealer: req.user._id })
      .populate('product', 'name category')
      .populate('farmer', 'name')
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

    // Enforce proper tracking states
    if (orderStatus) {
      if (order.deliveryMethod === 'pickup') {
        const validPickupStatuses = ['placed', 'ready_for_pickup', 'picked_up'];
        if (!validPickupStatuses.includes(orderStatus)) {
          return res.status(400).json({ message: 'Invalid status for Pickup delivery method' });
        }
      } else if (order.deliveryMethod === 'delivery') {
        const validDeliveryStatuses = ['placed', 'shipped', 'delivered'];
        if (!validDeliveryStatuses.includes(orderStatus)) {
          return res.status(400).json({ message: 'Invalid status for Home Delivery method' });
        }
      }

      order.orderStatus = orderStatus;
      
      // Notify dealer
      let statusMsg = '';
      if (orderStatus === 'ready_for_pickup') statusMsg = 'is ready for pickup';
      if (orderStatus === 'shipped') statusMsg = 'has been shipped';
      if (orderStatus === 'delivered' || orderStatus === 'picked_up') statusMsg = 'is completed';
      
      if (statusMsg) {
        await sendNotificationHelper(
          req,
          order.dealer,
          `Your order for ${order.product.name} ${statusMsg}.`,
          'system'
        );
      }

      // Notify farmer when completed
      if (orderStatus === 'delivered' || orderStatus === 'picked_up') {
        await sendNotificationHelper(
          req,
          order.farmer,
          `Order for your product ${order.product.name} is completed.`,
          'system'
        );
      }
    }
    
    if (paymentStatus) {
      const isPaidUpdate = order.paymentStatus !== 'paid' && paymentStatus === 'paid';
      order.paymentStatus = paymentStatus;

      // Notify farmer when payment marked as paid
      if (isPaidUpdate) {
        await sendNotificationHelper(
          req,
          order.farmer,
          `Payment for your product ${order.product.name} has been marked as paid.`,
          'system'
        );
      }
    }
    
    await order.save();
    return res.json(order);
  } catch (error) {
    console.error('Order Update Error:', error);
    return res.status(500).json({ message: 'Server error updating order', error: error.message });
  }
};
