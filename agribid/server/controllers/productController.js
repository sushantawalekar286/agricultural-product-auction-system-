import Product from '../models/Product.js';

export const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, basePrice, images } = req.body;
    if (!name || !category || !quantity || !basePrice) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    const product = await Product.create({
      name,
      category,
      quantity,
      basePrice,
      farmer: req.user._id,
      images: images || []
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error);
    return res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('farmer', 'name location');
    return res.json(products);
  } catch (error) {
    console.error('Error in getProducts:', error);
    return res.status(500).json({ message: 'Server error fetching products', error: error.message });
  }
};

export const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    return res.json(products);
  } catch (error) {
    console.error('Error in getFarmerProducts:', error);
    return res.status(500).json({ message: 'Server error fetching farmer products', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && product.farmer.toString() === req.user._id.toString()) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.quantity = req.body.quantity || product.quantity;
      product.basePrice = req.body.basePrice || product.basePrice;
      if (req.body.images) product.images = req.body.images;
      
      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.farmer.toString() === req.user._id.toString() || req.user.role === 'admin') {
      await product.deleteOne();
      return res.json({ message: 'Product removed' });
    } else {
      return res.status(403).json({ message: 'Unauthorized to delete this product' });
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
};
