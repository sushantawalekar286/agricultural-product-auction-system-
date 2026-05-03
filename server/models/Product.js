import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  status: { type: String, enum: ['pending', 'active', 'sold', 'expired'], default: 'pending' }
}, { timestamps: true });

productSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'product'
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
