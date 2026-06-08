export const allowedCategories = [
  'Fruits',
  'Vegetables',
  'Grains',
  'Pulses',
  'Oil Seeds',
  'Cash Crops',
  'Spices',
  'Flowers',
  'Herbs',
  'Dry Fruits',
  'Plantation Crops',
  'Medicinal Plants',
  'Fodder Crops',
  'Organic Products'
];

/**
 * Middleware to validate product fields and category before creation or update.
 */
export const validateProductFields = (req, res, next) => {
  // Support both 'name' and 'productName' from request body
  if (req.body.productName && !req.body.name) {
    req.body.name = req.body.productName;
  }

  const { name, category, quantity, basePrice } = req.body;

  // Validate presence of required fields
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Product name is required.' });
  }

  if (!category) {
    return res.status(400).json({ message: 'Product category is required.' });
  }

  // Check if category is within allowed enum list
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      message: `Invalid product category: "${category}". Allowed categories are: ${allowedCategories.join(', ')}`
    });
  }

  // Validate numeric fields (if present in the request)
  if (quantity !== undefined) {
    const qtyNum = Number(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }
  }

  if (basePrice !== undefined) {
    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ message: 'Base price must be a positive number.' });
    }
  }

  next();
};
