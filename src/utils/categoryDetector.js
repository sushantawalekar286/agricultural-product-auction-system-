import { cropMapping } from './cropMapping';

/**
 * Escapes special characters for use in regular expressions.
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Detects the category of an agricultural product based on its name.
 * 
 * Priority:
 * 1. Exact Match (Case-Insensitive, trimmed)
 * 2. Word Boundary Match (e.g., "Alphonso Mango" contains word "mango")
 * 3. Contains Match (e.g., "Mangoes" contains "mango")
 * 4. Fallback (returns empty string)
 * 
 * @param {string} productName - The name of the product entered by the farmer
 * @returns {string} The detected category, or an empty string if not found
 */
export const detectCategory = (productName) => {
  if (!productName) return '';

  // Clean the input: trim outer whitespace, replace multiple spaces, convert to lowercase
  const cleanInput = productName.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!cleanInput) return '';

  // 1. Exact Match (Case Insensitive)
  if (cropMapping[cleanInput]) {
    return cropMapping[cleanInput];
  }

  // Get all crops sorted by length descending so that longer/more specific crops
  // (e.g., "sweet corn" or "black pepper") are checked and matched before shorter ones (e.g., "corn", "pepper").
  const sortedCrops = Object.keys(cropMapping).sort((a, b) => b.length - a.length);

  // 2. Word Boundary Match (Case Insensitive)
  // Check if any crop name exists as a discrete word/phrase in the input
  for (const crop of sortedCrops) {
    try {
      // Use regex with word boundaries. We escape the crop name first.
      const regex = new RegExp(`\\b${escapeRegExp(crop)}\\b`, 'i');
      if (regex.test(cleanInput)) {
        return cropMapping[crop];
      }
    } catch (e) {
      // Fallback in case of regex errors
    }
  }

  // 3. Substring / Contains Match (Case Insensitive)
  // If no word boundary match was found, do a simple substring match
  for (const crop of sortedCrops) {
    if (cleanInput.includes(crop)) {
      return cropMapping[crop];
    }
  }

  // 4. Fallback if no match is found
  return '';
};
