import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auction: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  
  deliveryMethod: { type: String, enum: ['pickup', 'delivery'], required: true },
  
  paymentMethod: { type: String, enum: ['online', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  
  orderStatus: { 
    type: String, 
    enum: ['placed', 'ready_for_pickup', 'picked_up', 'shipped', 'delivered'], 
    default: 'placed' 
  },
  
  deliveryAddress: { type: String },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
