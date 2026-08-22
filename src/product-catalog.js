/**
 * MEDICARE — SINGLE SOURCE OF TRUTH PRODUCT CATALOG (Pure Dynamic)
 * Real products are loaded exclusively from Supabase Database & Admin Management.
 */

// Zero mock products — strictly dynamic from Database & Admin
const RAW_PRODUCT_CATALOG = [];

// Helper to normalize product objects with rich schema and backward-compatible aliases
function normalizeProduct(p) {
  if (!p) return null;
  const primaryImg = (p.images && p.images[0]) || p.img || p.image || '';
  const secondaryImg = (p.images && p.images[1]) || p.img2 || primaryImg;
  const imagesArr = p.images && Array.isArray(p.images) && p.images.length > 0
    ? p.images
    : (primaryImg ? [primaryImg] : []);
  // Normalize colors to array of objects
  const colorsArr = Array.isArray(p.colors) && p.colors.length > 0
    ? p.colors.map((c, i) => {
        if (typeof c === 'string') {
          return {
            name: c.startsWith('#') ? (i === 0 ? 'Primary' : `Variant ${i+1}`) : c,
            hex: c.startsWith('#') ? c : '#0E4D45',
            img: imagesArr[i] || primaryImg
          };
        }
        return {
          name: c.name || 'Color',
          hex: c.hex || '#0E4D45',
          img: c.img || imagesArr[i] || primaryImg
        };
      })
    : [];

  const featuresArr = Array.isArray(p.features) ? p.features : [];
  const specsObj = (p.specifications && typeof p.specifications === 'object') ? p.specifications : {};
  const careArr = Array.isArray(p.care_instructions) ? p.care_instructions : (p.care_instructions ? [p.care_instructions] : []);
  const sizeGuideObj = (p.size_guide && typeof p.size_guide === 'object') ? p.size_guide : { enabled: true };
  const trustBadgesArr = Array.isArray(p.trust_badges) ? p.trust_badges : [];

  return {
    ...p,
    category: p.category || (p.specialty ? (p.specialty.charAt(0).toUpperCase() + p.specialty.slice(1)) : 'Medical Wear'),
    brand: p.brand || 'MEDICARE PRO',
    status: p.status || 'active',
    short_description: p.short_description || p.description || '',
    description: p.description || '',
    colors: colorsArr,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    features: featuresArr,
    specifications: specsObj,
    care_instructions: careArr,
    size_guide: sizeGuideObj,
    delivery_info: p.delivery_info || '',
    return_info: p.return_info || '',
    trust_badges: trustBadgesArr,
    // Unified aliases for backward compatibility
    nameAr: p.name_ar || p.nameAr || p.name,
    name_ar: p.name_ar || p.nameAr || p.name,
    originalPrice: p.original_price || p.originalPrice || null,
    original_price: p.original_price || p.originalPrice || null,
    reviews: p.reviews_count || p.reviews || 0,
    reviews_count: p.reviews_count || p.reviews || 0,
    isNew: p.is_new !== undefined ? Boolean(p.is_new) : Boolean(p.isNew),
    is_new: p.is_new !== undefined ? Boolean(p.is_new) : Boolean(p.isNew),
    isBestSeller: p.is_bestseller !== undefined ? Boolean(p.is_bestseller) : Boolean(p.isBestSeller),
    is_bestseller: p.is_bestseller !== undefined ? Boolean(p.is_bestseller) : Boolean(p.isBestSeller),
    img: primaryImg,
    img2: secondaryImg,
    images: imagesArr
  };
}

const PRODUCT_CATALOG = RAW_PRODUCT_CATALOG.map(normalizeProduct);

const PRODUCT_CATALOG_MAP = PRODUCT_CATALOG.reduce((map, p) => {
  map[p.id] = p;
  return map;
}, {});

function getProductById(id) {
  return PRODUCT_CATALOG_MAP[id] || null;
}

function getProductsBySpecialty(specialty) {
  if (!specialty || specialty === 'all') return [...PRODUCT_CATALOG];
  return PRODUCT_CATALOG.filter(p => p.specialty === specialty);
}

// Global Browser Window attachment
if (typeof window !== 'undefined') {
  window.PRODUCT_CATALOG = PRODUCT_CATALOG;
  window.MEDICARE_CATALOG = PRODUCT_CATALOG;
  window.CATALOG = PRODUCT_CATALOG; // Backward-compatible for category.js & category-mobile.js
  window.LOCAL_CATALOG = PRODUCT_CATALOG_MAP; // Backward-compatible for product-detail.js
  window.getProductById = getProductById;
  window.getProductsBySpecialty = getProductsBySpecialty;
  window.normalizeProduct = normalizeProduct;
}

// CommonJS module export for testing / Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRODUCT_CATALOG,
    PRODUCT_CATALOG_MAP,
    getProductById,
    getProductsBySpecialty,
    RAW_PRODUCT_CATALOG,
    normalizeProduct
  };
}
