import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  quality: {
    grade: { type: String, enum: ["A", "B", "C"], default: "A" },
    size: { type: String, enum: ["Small", "Medium", "Large"] },
    moisture: { type: Number, min: 0, max: 100 },
    isOrganic: { type: Boolean, default: false },
    harvestDate: Date,
    expiryDate: Date,
    ripeness: { type: String, enum: ["Raw", "Semi-Ripe", "Ripe"] },
    color: String,
    texture: { type: String, enum: ["Soft", "Medium", "Hard"] },
    smell: { type: String, enum: ["Fresh", "Normal", "Bad"] },
    defects: [{ type: String }],
    storageCondition: { type: String, enum: ["Cold Storage", "Room Temperature"] },
    description: String
  },
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
