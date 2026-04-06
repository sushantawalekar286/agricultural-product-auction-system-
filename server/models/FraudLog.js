import mongoose from 'mongoose';

const fraudLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  reason: { type: String, required: true },
  flaggedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const FraudLog = mongoose.model('FraudLog', fraudLogSchema);
export default FraudLog;
