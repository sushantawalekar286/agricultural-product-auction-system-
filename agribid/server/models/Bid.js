import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
