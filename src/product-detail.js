/* ==========================================================================
   MEDICARE — PRODUCT DETAIL PAGE (PDP) — DYNAMIC ENGINE v2.0
   Reads ?id= from URL → fetches from Supabase → renders everything:
   gallery, price, colors, sizes, description, reviews.
   Handles missing/invalid id with a clean "Product not found" state.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* ------------------------------------------------------------------
     UTILITIES
     ------------------------------------------------------------------ */
  function showToast(msg) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ------------------------------------------------------------------
     1. READ ?id= FROM URL
     ------------------------------------------------------------------ */
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  /* ------------------------------------------------------------------
     2. SHOW LOADING STATE WHILE FETCHING
     ------------------------------------------------------------------ */
  const pdpMain = document.querySelector('.pdp-main');
  if (pdpMain) {
    pdpMain.style.opacity = '0.4';
    pdpMain.style.pointerEvents = 'none';
  }

  /* ------------------------------------------------------------------
     3. FULL LOCAL CATALOG (single source of truth product-catalog.js)
     ------------------------------------------------------------------ */
  const LOCAL_CATALOG = (typeof window !== 'undefined' && (window.PRODUCT_CATALOG_MAP || window.LOCAL_CATALOG))
    ? (window.PRODUCT_CATALOG_MAP || window.LOCAL_CATALOG)
    : (typeof require !== 'undefined' ? require('./product-catalog.js').PRODUCT_CATALOG_MAP : {});

  /* ------------------------------------------------------------------
     4. FETCH PRODUCT — chain: Supabase → localStorage → static catalog
     ------------------------------------------------------------------ */
  let product = null;
  // Mutable state shared across cart, qty stepper, color/size pickers & WhatsApp builder
  let productData = {
    id: '', title: '', titleAr: '', price: 0, img: '',
    selectedColor: '', selectedSize: '', qty: 1
  };

  if (productId) {
    // ── Step A: Try Supabase (MedicareDB.getProductById now handles localStorage too)
    if (window.MedicareDB && typeof window.MedicareDB.getProductById === 'function') {
      try {
        const dbProduct = await window.MedicareDB.getProductById(productId);
        if (dbProduct && (dbProduct.id || dbProduct.name)) {
          // Normalize DB/localStorage product to PDP format
          product = normalizeToPDP(dbProduct);
        }
      } catch (e) {
        console.warn('[PDP] getProductById failed:', e);
      }
    }

    // ── Step B: Static local catalog fallback (for old MC-xxx IDs)
    if (!product) {
      // Try exact string match first, then coerced match
      const localFound = LOCAL_CATALOG[productId]
        || LOCAL_CATALOG[String(productId)]
        || Object.values(LOCAL_CATALOG).find(p => String(p.id) === String(productId));
      if (localFound) product = localFound;
    }

    // ── Step C: Check localStorage custom products directly
    //    (safety net if MedicareDB was not initialized yet)
    if (!product) {
      try {
        const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
        const cp = customProds.find(p => String(p.id) === String(productId));
        if (cp) product = normalizeToPDP(cp);
      } catch (e) {}
    }
  }

  // Restore visibility
  if (pdpMain) {
    pdpMain.style.opacity = '';
    pdpMain.style.pointerEvents = '';
  }

  /* ------------------------------------------------------------------
     HELPER: normalize any product object (DB or localStorage) to PDP shape
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     HELPER: normalize any product object (DB or localStorage) to rich PDP shape
     ------------------------------------------------------------------ */
  function normalizeToPDP(src) {
    const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="%23f8fafc"><rect width="600" height="600" fill="%23f8fafc"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="70" fill="%2394a3b8">🩺</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="%2364748b">MEDICARE OFFICIAL</text></svg>';
    // Handle images — can be array or string
    const imgs = Array.isArray(src.images) && src.images.length > 0 ? src.images
      : (src.images ? [src.images] : (src.img ? [src.img] : [defaultPlaceholderSvg]));

    // Handle colors — can be array of strings or objects
    const colors = Array.isArray(src.colors) && src.colors.length > 0
      ? src.colors.map((c, i) => ({
          name: typeof c === 'string' ? (c.startsWith('#') ? (i === 0 ? 'Primary' : `Variant ${i+1}`) : c) : (c.name || 'Color'),
          hex:  typeof c === 'string' ? (c.startsWith('#') ? c : '#0E4D45') : (c.hex || '#0E4D45'),
          img:  (typeof c === 'object' && c.img) ? c.img : (imgs[i] || imgs[0] || defaultPlaceholderSvg)
        }))
      : [];

    const features = Array.isArray(src.features) ? src.features : [];
    const specs = (src.specifications && typeof src.specifications === 'object') ? src.specifications : {};
    const care = Array.isArray(src.care_instructions) ? src.care_instructions : (src.care_instructions ? [src.care_instructions] : []);
    const sizeGuide = (src.size_guide && typeof src.size_guide === 'object') ? src.size_guide : { enabled: true };
    const trustBadges = Array.isArray(src.trust_badges) && src.trust_badges.length > 0
      ? src.trust_badges
      : ['🚚 58 Wilayas COD', '🔄 14-Day Free Exchange', '🛡️ Antimicrobial Shield'];

    return {
      id:                   src.id,
      name:                 src.name || src.title || 'Product',
      name_ar:              src.name_ar || src.name || src.title || 'منتج',
      name_fr:              src.name_fr || src.name || src.title || 'Produit',
      specialty:            src.specialty || 'medicine',
      category:             src.category || 'Medical Wear',
      brand:                src.brand || 'MEDICARE PRO',
      sku:                  src.sku || src.id,
      status:               src.status || 'active',
      price:                Number(src.price) || 0,
      original_price:       src.original_price ? Number(src.original_price) : null,
      rating:               Number(src.rating) || 5.0,
      reviews_count:        Number(src.reviews_count) || 0,
      stock:                src.stock !== undefined ? Number(src.stock) : 10,
      min_stock:            src.min_stock !== undefined ? Number(src.min_stock) : 5,
      badge:                src.badge || '',
      is_new:               !!src.is_new,
      is_bestseller:        !!src.is_bestseller,
      material:             src.material || '',
      short_description:    src.short_description || src.description || '',
      short_description_ar: src.short_description_ar || src.short_description || src.description || '',
      short_description_fr: src.short_description_fr || src.short_description || src.description || '',
      description:          src.description || '',
      description_ar:       src.description_ar || src.description || '',
      description_fr:       src.description_fr || src.description || '',
      colors,
      sizes:                Array.isArray(src.sizes) ? src.sizes : [],
      images:               imgs,
      features,
      features_ar:          Array.isArray(src.features_ar) ? src.features_ar : (Array.isArray(src.featuresAr) ? src.featuresAr : features),
      features_fr:          Array.isArray(src.features_fr) ? src.features_fr : (Array.isArray(src.featuresFr) ? src.featuresFr : features),
      specifications:       specs,
      specifications_ar:    (src.specifications_ar && typeof src.specifications_ar === 'object') ? src.specifications_ar : specs,
      specifications_fr:    (src.specifications_fr && typeof src.specifications_fr === 'object') ? src.specifications_fr : specs,
      care_instructions:    care,
      care_instructions_ar: Array.isArray(src.care_instructions_ar) ? src.care_instructions_ar : care,
      care_instructions_fr: Array.isArray(src.care_instructions_fr) ? src.care_instructions_fr : care,
      size_guide:           sizeGuide,
      delivery_info:        src.delivery_info || '',
      delivery_info_ar:     src.delivery_info_ar || src.delivery_info || '',
      delivery_info_fr:     src.delivery_info_fr || src.delivery_info || '',
      return_info:          src.return_info || '',
      return_info_ar:       src.return_info_ar || src.return_info || '',
      return_info_fr:       src.return_info_fr || src.return_info || '',
      trust_badges:         trustBadges
    };
  }

  /* ------------------------------------------------------------------
     5. "PRODUCT NOT FOUND" STATE — only show if truly not found
     ------------------------------------------------------------------ */
  if (!product) {
    document.title = 'Product Not Found — MEDICARE';
    const main = document.querySelector('.pdp-main') || document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div style="max-width:560px;margin:6rem auto;padding:2rem;text-align:center;font-family:var(--font-family-base,sans-serif)">
          <div style="font-size:5rem;margin-bottom:1rem">🔍</div>
          <h1 style="font-size:1.75rem;font-weight:800;color:var(--color-neutral-900,#111);margin-bottom:0.75rem">Product Not Found</h1>
          <p style="color:var(--color-neutral-500,#6b7280);font-size:15px;margin-bottom:2rem;line-height:1.6">
            The product <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${productId || 'unknown'}</code> does not exist or may have been removed.
          </p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
            <a href="category.html" style="background:var(--color-primary-600,#0E4D45);color:#fff;padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700">
              Browse All Products
            </a>
            <a href="index.html" style="border:2px solid var(--color-primary-600,#0E4D45);color:var(--color-primary-600,#0E4D45);padding:0.75rem 1.5rem;border-radius:8px;text-decoration:none;font-weight:700">
              Back to Home
            </a>
          </div>
        </div>`;
    }
    return; // Stop execution — nothing else to render
  }

  /* ------------------------------------------------------------------
     5. RENDER ALL DYNAMIC CONTENT INTO THE PAGE (100% Admin Managed)
     ------------------------------------------------------------------ */

  // Page title & meta
  document.title = `${product.name} — MEDICARE`;

  // Breadcrumb
  const breadcrumbCurrent = document.querySelector('.mc-breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

  // Brand / SKU row
  const brandTagEl = document.querySelector('.pdp-brand-tag');
  if (brandTagEl) brandTagEl.textContent = `${product.brand} | ${product.category.toUpperCase()}`;
  const skuEl = document.querySelector('.pdp-sku');
  if (skuEl) skuEl.textContent = `SKU: ${product.sku}`;

  // Title
  const titleEl = document.querySelector('.pdp-title');
  if (titleEl) titleEl.textContent = product.name;

  // Rating Stars and Review Count
  const ratingStarsEl = document.querySelector('.pdp-stars-val');
  if (ratingStarsEl) {
    const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(Math.max(0, 5 - Math.round(product.rating)));
    ratingStarsEl.textContent = `${stars} ${product.rating}`;
  }
  const ratingCountEl = document.querySelector('.mc-review-count');
  if (ratingCountEl) ratingCountEl.textContent = `(${product.reviews_count} verified reviews)`;

  // Price box & dynamic discount calculation
  const currentPriceEl = document.querySelector('.pdp-current-price');
  if (currentPriceEl) currentPriceEl.textContent = `${product.price.toLocaleString()} DZD`;
  const originalPriceEl = document.querySelector('.pdp-original-price');
  const saveBadgeEl = document.querySelector('.pdp-save-badge');

  if (product.original_price && product.original_price > product.price) {
    const saved = product.original_price - product.price;
    const pct = Math.round((saved / product.original_price) * 100);
    if (originalPriceEl) {
      originalPriceEl.textContent = `${product.original_price.toLocaleString()} DZD`;
      originalPriceEl.style.display = 'inline';
    }
    if (saveBadgeEl) {
      saveBadgeEl.textContent = `SAVE ${saved.toLocaleString()} DZD (${pct}% OFF)`;
      saveBadgeEl.style.display = 'inline-block';
    }
  } else {
    if (originalPriceEl) originalPriceEl.style.display = 'none';
    if (saveBadgeEl) saveBadgeEl.style.display = 'none';
  }

  // Gallery Badges (Sale %, Hot/Bestseller, New, Custom)
  const galleryBadgesContainer = document.querySelector('.pdp-gallery-badges');
  if (galleryBadgesContainer) {
    let badgesHTML = '';
    if (product.original_price && product.original_price > product.price) {
      const pct = Math.round(((product.original_price - product.price) / product.original_price) * 100);
      badgesHTML += `<span class="mc-card-badge mc-badge-sale">−${pct}% OFF</span>`;
    }
    if (product.is_bestseller) {
      badgesHTML += `<span class="mc-card-badge mc-badge-hot">🔥 Best Seller</span>`;
    } else if (product.is_new) {
      badgesHTML += `<span class="mc-card-badge mc-badge-new">✨ New Arrival</span>`;
    } else if (product.badge) {
      badgesHTML += `<span class="mc-card-badge mc-badge-hot">${product.badge}</span>`;
    }
    galleryBadgesContainer.innerHTML = badgesHTML;
    galleryBadgesContainer.style.display = badgesHTML ? 'flex' : 'none';
  }

  // Apply real-time stock overrides from Admin & Checkout
  try {
    const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
    if (overrides[product.id] !== undefined) {
      product.stock = Number(overrides[product.id]);
    }
  } catch (e) {}

  // Stock indicator & purchase buttons state
  const stockEl = document.getElementById('pdp-stock-indicator');
  const addToCartBtn = document.getElementById('pdp-buy-btn') || document.querySelector('.pdp-btn-cart');
  const waBtn = document.getElementById('pdp-whatsapp-cta');
  const minStockThreshold = product.min_stock || 5;

  if (product.stock <= 0) {
    if (stockEl) {
      stockEl.innerHTML = '<span class="pdp-stock-dot" style="background:#EF4444;"></span><span style="color:#EF4444; font-weight:700;">⚠️ Out of Stock (نفد من المخزون)</span>';
      stockEl.className = 'pdp-stock-indicator out-of-stock';
    }
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.style.opacity = '0.5';
      addToCartBtn.style.cursor = 'not-allowed';
      addToCartBtn.innerHTML = '⚠️ Out of Stock';
    }
  } else if (product.stock <= minStockThreshold) {
    if (stockEl) {
      stockEl.innerHTML = `<span class="pdp-stock-dot"></span><span>In Stock — <strong style="color:var(--color-accent-700)">Only ${product.stock} left in stock!</strong></span>`;
      stockEl.className = 'pdp-stock-indicator low-stock';
    }
  } else {
    if (stockEl) {
      stockEl.innerHTML = `<span class="pdp-stock-dot"></span><span>In Stock — ${product.stock} units available for express delivery</span>`;
      stockEl.className = 'pdp-stock-indicator in-stock';
    }
  }

  // Short description
  const shortDescEl = document.querySelector('.pdp-short-desc');
  if (shortDescEl) {
    if (product.short_description || product.description) {
      shortDescEl.textContent = product.short_description || product.description;
      shortDescEl.style.display = 'block';
    } else {
      shortDescEl.style.display = 'none';
    }
  }

  // Update sticky bottom mobile purchase bar with real product info
  const stickyThumb = document.querySelector('.pdp-sticky-thumb');
  const stickyTitle = document.querySelector('.pdp-sticky-title');
  const stickyPrice = document.querySelector('.pdp-sticky-price');
  if (stickyThumb) {
    const primaryImg = (Array.isArray(product.images) && product.images[0]) || product.img || '';
    if (primaryImg) {
      stickyThumb.src = primaryImg;
      stickyThumb.alt = product.name;
    } else {
      stickyThumb.style.display = 'none';
    }
  }
  if (stickyTitle) {
    stickyTitle.textContent = product.name;
  }
  if (stickyPrice) {
    stickyPrice.textContent = `${Number(product.price || 0).toLocaleString('fr-DZ')} DZD`;
  }

  // Trust Badges Bar under Add to Cart
  const trustBar = document.querySelector('.pdp-info-col > div[style*="grid-template-columns"]');
  if (trustBar) {
    if (Array.isArray(product.trust_badges) && product.trust_badges.length > 0) {
      trustBar.innerHTML = product.trust_badges.map(b => `<div>${b}</div>`).join('');
      trustBar.style.display = 'grid';
    } else {
      trustBar.style.display = 'none';
    }
  }

  // --- GALLERY ---
  const mainImg = document.getElementById('pdp-main-img');
  if (mainImg && product.images && product.images.length > 0) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
    mainImg.style.opacity = '1';
  }
  const thumbsContainer = document.querySelector('.pdp-thumbnails');
  if (thumbsContainer) {
    if (product.images && product.images.length > 1) {
      thumbsContainer.innerHTML = product.images.map((src, i) => `
        <button class="pdp-thumb ${i === 0 ? 'active' : ''}" onclick="switchMainImage(this, '${src}')">
          <img src="${src}" alt="${product.name} view ${i + 1}">
        </button>`
      ).join('');
      thumbsContainer.style.display = 'flex';
    } else {
      thumbsContainer.style.display = 'none';
    }
  }

  // --- COLORS (Conditional Selector) ---
  const colorSelectorGroup = document.querySelector('.pdp-selector-group:has(.pdp-color-options)');
  const colorOptionsEl = document.querySelector('.pdp-color-options');
  if (colorOptionsEl && colorSelectorGroup) {
    if (product.colors && product.colors.length > 0) {
      colorOptionsEl.innerHTML = product.colors.map((c, i) => `
        <button class="pdp-color-btn ${i === 0 ? 'active' : ''}"
          data-color="${c.name}" data-img="${c.img || ''}"
          onclick="selectColor(this)">
          <span class="pdp-color-swatch-dot" style="background:${c.hex}"></span>
          <span class="pdp-color-name">${c.name}</span>
        </button>`
      ).join('');
      const colorNameEl = document.getElementById('selected-color-name');
      if (colorNameEl) colorNameEl.textContent = product.colors[0].name;
      productData.selectedColor = product.colors[0].name;
      colorSelectorGroup.style.display = 'block';
    } else {
      colorSelectorGroup.style.display = 'none';
      productData.selectedColor = '';
    }
  }

  // --- SIZES (Conditional Selector) ---
  const sizeSelectorGroup = document.querySelector('.pdp-selector-group:has(.pdp-size-options)');
  const sizeOptionsEl = document.querySelector('.pdp-size-options');
  const sizeGuideLinkEl = document.querySelector('.pdp-size-guide-link');

  if (sizeOptionsEl && sizeSelectorGroup) {
    if (product.sizes && product.sizes.length > 0) {
      if (product.sizes.length === 1 && (product.sizes[0] === 'ONE' || product.sizes[0] === 'One Size')) {
        sizeOptionsEl.innerHTML = `<button class="pdp-size-btn active" data-size="One Size" onclick="selectSize(this)">One Size</button>`;
        productData.selectedSize = 'One Size';
      } else {
        sizeOptionsEl.innerHTML = product.sizes.map((s, i) => `
          <button class="pdp-size-btn ${i === 0 ? 'active' : ''}" data-size="${s}" onclick="selectSize(this)">${s}</button>`
        ).join('');
        productData.selectedSize = product.sizes[0];
      }
      const sizeNameEl = document.getElementById('selected-size-name');
      if (sizeNameEl) sizeNameEl.textContent = productData.selectedSize;
      sizeSelectorGroup.style.display = 'block';
    } else {
      sizeSelectorGroup.style.display = 'none';
      productData.selectedSize = '';
    }
  }

  // Size Guide Link Visibility
  if (sizeGuideLinkEl) {
    const isSgEnabled = product.size_guide && product.size_guide.enabled !== false;
    sizeGuideLinkEl.style.display = isSgEnabled ? 'inline-block' : 'none';
  }

  // --- TAB 1: DESCRIPTION & FEATURES ---
  const tabDesc = document.getElementById('tab-desc');
  if (tabDesc) {
    const descTitle = tabDesc.querySelector('h3');
    if (descTitle) descTitle.textContent = `${product.name} — Overview & Technology`;
    const descPara = tabDesc.querySelector('p');
    if (descPara) descPara.textContent = product.description || product.short_description || product.name;

    const specGrid = tabDesc.querySelector('.pdp-spec-grid');
    if (specGrid) {
      if (Array.isArray(product.features) && product.features.length > 0) {
        specGrid.innerHTML = product.features.map(f => `
          <div class="pdp-spec-card">
            <div class="pdp-spec-card-title">${f.icon || '✨'} ${f.title}</div>
            <p class="pdp-spec-card-desc">${f.desc}</p>
          </div>
        `).join('');
        specGrid.style.display = 'grid';
      } else {
        specGrid.style.display = 'none';
      }
    }
  }

  // --- TAB 2: MATERIALS, SPECS & CARE ---
  const tabMaterials = document.getElementById('tab-materials');
  if (tabMaterials) {
    let matHTML = `<h3 style="font-family:var(--font-family-display); font-size:1.25rem; font-weight:800; color:var(--color-neutral-900);">Specifications & Care</h3>`;

    // Specs table
    if (product.specifications && typeof product.specifications === 'object' && Object.keys(product.specifications).length > 0) {
      matHTML += `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin:1rem 0;">`;
      Object.entries(product.specifications).forEach(([k, v]) => {
        matHTML += `
          <div style="background:#F8FAFC; padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--color-neutral-200);">
            <strong style="font-size:12px; color:var(--color-primary-800); display:block; margin-bottom:3px;">${k}</strong>
            <span style="font-size:13.5px; color:var(--color-neutral-800); font-weight:600;">${v}</span>
          </div>
        `;
      });
      matHTML += `</div>`;
    }

    // Care instructions
    if (Array.isArray(product.care_instructions) && product.care_instructions.length > 0) {
      matHTML += `
        <h4 style="font-size:14px; font-weight:700; margin-top:1.5rem; color:var(--color-neutral-900);">🧼 Washing & Care Instructions</h4>
        <ul style="padding-left:1.25rem; margin-top:0.5rem; font-size:13.5px; color:var(--color-neutral-700); line-height:1.6;">
          ${product.care_instructions.map(c => `<li>${c}</li>`).join('')}
        </ul>
      `;
    }
    tabMaterials.innerHTML = matHTML;
  }

  // --- TAB 3: SHIPPING & RETURNS ---
  const tabShipping = document.getElementById('tab-shipping');
  if (tabShipping) {
    tabShipping.innerHTML = `
      <h3 style="font-family:var(--font-family-display); font-size:1.25rem; font-weight:800; color:var(--color-neutral-900);">Fast Express Delivery Across 58 Wilayas</h3>
      <p style="font-size:14px; line-height:1.6; color:var(--color-neutral-700); margin-top:0.5rem;">
        ${product.delivery_info || 'We ship directly to all 58 Wilayas in Algeria via express courier partners with Cash on Delivery (COD) payment support. Free express shipping automatically applied on orders above 5,000 DZD.'}
      </p>
      <h4 style="font-size:14px; font-weight:700; margin-top:1.5rem; color:var(--color-neutral-900);">🔄 14-Day Free Exchange & Return Policy</h4>
      <p style="font-size:14px; line-height:1.6; color:var(--color-neutral-700); margin-top:0.5rem;">
        ${product.return_info || '14-Day Free Exchange across all 58 Wilayas. Product must be in original condition with tags attached.'}
      </p>
    `;
  }

  /* ------------------------------------------------------------------
     6. SHARED PRODUCT STATE (used by cart, whatsapp, qty stepper)
     ------------------------------------------------------------------ */
  productData.id    = product.id;
  productData.title = product.name;
  productData.titleAr = product.name_ar;
  productData.price = product.price;
  productData.img   = product.images ? product.images[0] : '';

  /* ------------------------------------------------------------------
     7. RELATED PRODUCTS DYNAMIC RENDER (You May Also Like)
     ------------------------------------------------------------------ */
  const relatedSection = document.getElementById('related-products-grid');
  const relatedParentSection = relatedSection?.closest('section');

  async function loadRelatedProducts() {
    if (!relatedSection) return;

    let candidateList = [];

    // 1. Fetch from Supabase
    if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        const sbData = await window.MedicareDB.getProducts({ limit: 50 });
        if (Array.isArray(sbData)) {
          candidateList.push(...sbData);
        }
      } catch (e) {}
    }

    // 2. Fetch from localStorage custom products
    try {
      const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      if (Array.isArray(customProds)) {
        customProds.forEach(cp => {
          if (!candidateList.some(p => String(p.id) === String(cp.id))) {
            candidateList.push(cp);
          }
        });
      }
    } catch (e) {}

    // 3. Fallback to window.PRODUCT_CATALOG
    if (window.PRODUCT_CATALOG && Array.isArray(window.PRODUCT_CATALOG)) {
      window.PRODUCT_CATALOG.forEach(p => {
        if (!candidateList.some(c => String(c.id) === String(p.id))) {
          candidateList.push(p);
        }
      });
    }

    // Filter out current product
    const otherProducts = candidateList.filter(p => String(p.id) !== String(product.id));

    if (otherProducts.length === 0) {
      // No other products in the store — hide the section cleanly
      if (relatedParentSection) relatedParentSection.style.display = 'none';
      return;
    }

    if (relatedParentSection) relatedParentSection.style.display = '';

    // Prioritize same specialty if available
    const sameSpecialty = otherProducts.filter(p => p.specialty === product.specialty);
    const otherSpecialty = otherProducts.filter(p => p.specialty !== product.specialty);
    const finalRelated = [...sameSpecialty, ...otherSpecialty].slice(0, 4);

    relatedSection.innerHTML = finalRelated.map(p => {
      const pImg = (Array.isArray(p.images) && p.images[0]) || p.img || 'assets/medicare_scrubs_hero_1786614154492.png';
      const pName = p.name || 'Medical Product';
      const pPrice = Number(p.price) || 0;
      const safeName = String(pName).replace(/'/g, "\\'").replace(/"/g, '&quot;');

      return `
        <div class="pdp-related-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
          <div class="pdp-related-img-wrap">
            <img src="${pImg}" alt="${safeName}" loading="lazy" onerror="this.onerror=null; this.src='assets/medicare_scrubs_hero_1786614154492.png'">
          </div>
          <div class="pdp-related-info">
            <div class="pdp-related-name">${pName}</div>
            <div class="pdp-related-price">${pPrice.toLocaleString('fr-DZ')} DZD</div>
          </div>
          <button class="mc-btn mc-btn-primary mc-btn-sm" style="margin-top:0.5rem;width:100%;"
            onclick="event.stopPropagation(); if(window.MedicareCart) window.MedicareCart.addItem({productId:'${p.id}',id:'${p.id}',name:'${safeName}',price:${pPrice},qty:1,image:'${pImg}'}); showToast('✓ Added to cart');">
            🛒 Quick Add
          </button>
        </div>
      `;
    }).join('');
  }

  await loadRelatedProducts();

  /* ------------------------------------------------------------------
     8. GALLERY IMAGE SWITCHER & HOVER ZOOM LENS
     ------------------------------------------------------------------ */
  const imageBox  = document.getElementById('pdp-image-box');
  const zoomLens  = document.getElementById('pdp-zoom-lens');

  window.switchMainImage = function(thumb, src) {
    const img = document.getElementById('pdp-main-img');
    if (!img) return;
    document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    img.style.opacity = '0';
    setTimeout(() => { img.src = src; productData.img = src; img.style.opacity = '1'; }, 150);
  };

  if (imageBox && zoomLens && mainImg && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    imageBox.addEventListener('mousemove', e => {
      const rect = imageBox.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const lw = zoomLens.offsetWidth, lh = zoomLens.offsetHeight;
      zoomLens.style.left = `${Math.max(0, Math.min(x - lw/2, rect.width - lw))}px`;
      zoomLens.style.top  = `${Math.max(0, Math.min(y - lh/2, rect.height - lh))}px`;
      mainImg.style.transformOrigin = `${(x/rect.width)*100}% ${(y/rect.height)*100}%`;
      mainImg.style.transform = 'scale(1.8)';
    });
    imageBox.addEventListener('mouseleave', () => {
      mainImg.style.transform = 'scale(1)';
      mainImg.style.transformOrigin = 'center center';
    });
  }

  /* ------------------------------------------------------------------
     9. COLOR / SIZE / QTY SELECTORS
     ------------------------------------------------------------------ */
  window.selectColor = function(btn) {
    document.querySelectorAll('.pdp-color-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    productData.selectedColor = btn.dataset.color;
    const colorNameEl = document.getElementById('selected-color-name');
    if (colorNameEl) colorNameEl.textContent = btn.dataset.color;
    if (btn.dataset.img) {
      const img = document.getElementById('pdp-main-img');
      if (img) { img.style.opacity = '0'; setTimeout(() => { img.src = btn.dataset.img; productData.img = btn.dataset.img; img.style.opacity = '1'; }, 150); }
    }
    updateWhatsAppURL();
    showToast(`Color: ${btn.dataset.color}`);
  };

  window.selectSize = function(btn) {
    document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    productData.selectedSize = btn.dataset.size;
    const sizeNameEl = document.getElementById('selected-size-name');
    if (sizeNameEl) sizeNameEl.textContent = btn.dataset.size;
    updateWhatsAppURL();
    showToast(`Size: ${btn.dataset.size}`);
  };

  window.updatePDPQty = function(delta) {
    productData.qty = Math.max(1, (productData.qty || 1) + delta);
    const qtyInput = document.getElementById('pdp-qty-input');
    if (qtyInput) qtyInput.value = productData.qty;
    updateWhatsAppURL();
  };

  /* ------------------------------------------------------------------
     10. WHATSAPP PRE-FILLED MESSAGE
     ------------------------------------------------------------------ */
  function updateWhatsAppURL() {
    const wa = document.getElementById('pdp-whatsapp-cta');
    if (!wa) return;
    const total = (productData.price * (productData.qty || 1)).toLocaleString();
    const msg = `مرحباً MEDICARE! 👋\nأريد الطلب:\n\n📌 المنتج: ${productData.title}\n📏 المقاس: ${productData.selectedSize}\n🎨 اللون: ${productData.selectedColor}\n🔢 الكمية: ${productData.qty || 1}\n💵 الإجمالي: ${total} DZD\n\nهل المنتج متوفر للتوصيل COD لجميع ولايات الجزائر؟`;
    wa.href = `https://wa.me/213662497253?text=${encodeURIComponent(msg)}`;
  }
  window.buildWhatsAppURL = updateWhatsAppURL;
  updateWhatsAppURL();

  /* ------------------------------------------------------------------
     11. SIZE GUIDE MODAL
     ------------------------------------------------------------------ */
  const sizeModal = document.getElementById('size-guide-modal');
  window.openSizeGuideModal = () => sizeModal?.classList.add('open');
  window.closeSizeGuideModal = () => sizeModal?.classList.remove('open');
  if (sizeModal) sizeModal.addEventListener('click', e => { if (e.target === sizeModal) closeSizeGuideModal(); });

  /* ------------------------------------------------------------------
     12. CART DRAWER (uses shared MedicareCart engine)
     ------------------------------------------------------------------ */
  const cartOverlay = document.getElementById('pdp-cart-overlay');
  const cartClose   = document.getElementById('pdp-cart-close');
  const cartBtn     = document.getElementById('pdp-cart-btn');

  function renderCart() {
    const body    = document.getElementById('pdp-cart-body');
    const totalEl = document.getElementById('pdp-cart-total');
    const badge   = document.getElementById('pdp-cart-badge');
    const cart    = window.MedicareCart ? window.MedicareCart.getCart()       : [];
    const count   = window.MedicareCart ? window.MedicareCart.getTotalCount()  : 0;
    const subtotal= window.MedicareCart ? window.MedicareCart.getSubtotal()    : 0;

    if (badge) badge.textContent = count;
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">Your cart is empty.</div>';
      if (totalEl) totalEl.textContent = '0 DZD';
      return;
    }
    body.innerHTML = cart.map((item, idx) => {
      const name = item.nameAr || item.name;
      const img  = item.image  || item.img;
      return `<div class="mc-cart-item">
        <img src="${img}" class="mc-cart-item-img" alt="${name}">
        <div class="mc-cart-item-info">
          <span class="mc-cart-item-title">${name}</span>
          <span class="mc-cart-item-price">${Number(item.price).toLocaleString()} DZD ${item.size ? `(${item.size})` : ''}</span>
          <div class="mc-cart-qty-ctrl">
            <button class="mc-qty-btn" onclick="pdpUpdateQty(${idx},-1)">−</button>
            <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
            <button class="mc-qty-btn" onclick="pdpUpdateQty(${idx},1)">+</button>
          </div>
        </div>
        <button onclick="pdpUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px">✕</button>
      </div>`;
    }).join('');
    if (totalEl) totalEl.textContent = `${subtotal.toLocaleString()} DZD`;
  }
  window.renderCart = renderCart;
  window.renderCartDrawer = renderCart;

  window.pdpUpdateQty = function(idx, delta) {
    if (window.MedicareCart) window.MedicareCart.updateQty(idx, delta);
    renderCart();
  };

  window.addPDPToCart = function() {
    const pId = productData.id || product?.id || null;
    const pTitle = productData.title || product?.name || document.getElementById('pdp-product-title')?.textContent || '';
    const pTitleAr = productData.titleAr || product?.name_ar || '';
    const pPrice = Number(productData.price || product?.price || 0);
    const pImg = productData.img || (product?.images && product.images[0]) || 'assets/medicare_scrubs_hero_1786614154492.png';
    const pSize = productData.selectedSize || document.querySelector('.pdp-size-btn.active')?.dataset.size || 'M';
    const pColor = productData.selectedColor || document.querySelector('.pdp-color-btn.active')?.dataset.color || 'Obsidian Teal';
    const pQty = Number(productData.qty || document.getElementById('pdp-qty-input')?.value || 1);

    if (window.MedicareCart) {
      window.MedicareCart.addItem({
        productId: pId,
        id: pId,
        name: pTitle,
        nameAr: pTitleAr,
        price: pPrice,
        qty: pQty,
        size: pSize,
        color: pColor,
        image: pImg
      });
    }

    renderCart();

    const overlay = document.getElementById('pdp-cart-overlay') || document.getElementById('cart-drawer-overlay');
    if (overlay) {
      overlay.classList.add('open');
    }

    showToast(`✓ Added to cart! (${pSize} · ${pColor})`);
  };

  /* ------------------------------------------------------------------
     12. DYNAMIC FREQUENTLY BOUGHT TOGETHER / BUNDLE CROSS-SELL
     ------------------------------------------------------------------ */
  let activeCurrentBundle = null;

  function renderDynamicBundleSection() {
    const bundleSection = document.getElementById('pdp-bundle-section') || document.querySelector('.pdp-bundle-box');
    if (!bundleSection) return;

    let bundles = [];
    try {
      const raw = localStorage.getItem('medicare_bundles');
      if (raw) {
        bundles = JSON.parse(raw);
      } else {
        bundles = [];
      }
    } catch (e) {
      bundles = [];
    }

    // Look up active bundle where anchorProductId matches the currently viewed product
    activeCurrentBundle = bundles.find(b => b.active && String(b.anchorProductId).trim().toLowerCase() === String(product.id).trim().toLowerCase());

    if (!activeCurrentBundle || !Array.isArray(activeCurrentBundle.productIds) || activeCurrentBundle.productIds.length === 0) {
      // Hide the bundle section completely if no active bundle matches
      bundleSection.style.display = 'none';
      return;
    }

    // Resolve products in bundle from catalog
    const bundleProducts = activeCurrentBundle.productIds.map(id => {
      if (window.getProductById) return window.getProductById(id);
      if (LOCAL_CATALOG && LOCAL_CATALOG[id]) return LOCAL_CATALOG[id];
      if (window.PRODUCT_CATALOG) return window.PRODUCT_CATALOG.find(p => p.id === id);
      return null;
    }).filter(Boolean);

    if (bundleProducts.length < 2) {
      bundleSection.style.display = 'none';
      return;
    }

    bundleSection.style.display = 'block';

    const totalValue = bundleProducts.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const bundlePrice = Number(activeCurrentBundle.bundlePrice || totalValue);
    const savings = Math.max(0, totalValue - bundlePrice);
    const savingsPct = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

    // Badge and descriptions
    const badgeEl = document.getElementById('pdp-bundle-badge');
    if (badgeEl) badgeEl.textContent = `⚡ ${activeCurrentBundle.name || 'Complete The Clinical Look'}`;

    const savingsDescEl = document.getElementById('pdp-bundle-savings-desc');
    if (savingsDescEl) {
      savingsDescEl.textContent = savings > 0 
        ? `Save ${savings.toLocaleString()} DZD (${savingsPct}% OFF) on this ${bundleProducts.length}-piece bundle` 
        : `Curated ${bundleProducts.length}-piece clinical set`;
    }

    // Render items
    const itemsContainer = document.getElementById('pdp-bundle-items-container') || document.querySelector('.pdp-bundle-items');
    if (itemsContainer) {
      itemsContainer.innerHTML = bundleProducts.map((p, idx) => {
        const pImg = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.img || 'assets/medicare_scrubs_hero_1786614154492.png');
        const plus = idx < bundleProducts.length - 1 ? '<span class="pdp-bundle-plus">+</span>' : '';
        return `
          <div class="pdp-bundle-item-card">
            <a href="product-detail.html?id=${p.id}" style="text-decoration:none; color:inherit; display:block;">
              <img src="${pImg}" alt="${p.name}" class="pdp-bundle-item-img">
              <div style="font-size:12px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;" title="${p.name}">${p.name}</div>
              <div style="font-size:11px; color:var(--color-primary-200);">${Number(p.price || 0).toLocaleString()} DZD</div>
            </a>
          </div>
          ${plus}
        `;
      }).join('');
    }

    // Render totals
    const totalValEl = document.getElementById('pdp-bundle-total-val');
    if (totalValEl) totalValEl.textContent = `${totalValue.toLocaleString()} DZD`;

    const priceEl = document.getElementById('pdp-bundle-price');
    if (priceEl) priceEl.textContent = `${bundlePrice.toLocaleString()} DZD`;

    const btnEl = document.getElementById('pdp-bundle-btn') || document.querySelector('.pdp-bundle-summary-card button');
    if (btnEl) {
      btnEl.innerHTML = `🛒 Add Complete Bundle to Cart ${savings > 0 ? `(Save ${savings.toLocaleString()} DZD)` : ''}`;
    }
  }

  window.addBundleToCart = function() {
    if (!activeCurrentBundle || !Array.isArray(activeCurrentBundle.productIds)) return;

    const bundleProducts = activeCurrentBundle.productIds.map(id => {
      if (window.getProductById) return window.getProductById(id);
      if (LOCAL_CATALOG && LOCAL_CATALOG[id]) return LOCAL_CATALOG[id];
      if (window.PRODUCT_CATALOG) return window.PRODUCT_CATALOG.find(p => p.id === id);
      return null;
    }).filter(Boolean);

    if (bundleProducts.length === 0) return;

    if (window.MedicareCart && typeof window.MedicareCart.addItem === 'function') {
      bundleProducts.forEach(bp => {
        const bpImg = Array.isArray(bp.images) && bp.images[0] ? bp.images[0] : (bp.img || 'assets/medicare_scrubs_hero_1786614154492.png');
        window.MedicareCart.addItem({
          productId: bp.id,
          id: bp.id,
          name: bp.name,
          nameAr: bp.nameAr || bp.name_ar || bp.name,
          price: Number(bp.price || 0),
          qty: 1,
          size: Array.isArray(bp.sizes) && bp.sizes[0] ? bp.sizes[0] : 'M',
          color: Array.isArray(bp.colors) && bp.colors[0] ? (typeof bp.colors[0] === 'string' ? bp.colors[0] : bp.colors[0].name) : 'Standard',
          image: bpImg
        });
      });
    }

    renderCart();
    cartOverlay?.classList.add('open');
    showToast(`⚡ ${activeCurrentBundle.name || 'Complete Bundle'} added to cart (${bundleProducts.length} items)!`);
  };

  renderDynamicBundleSection();
  window.addEventListener('medicare_bundles_updated', renderDynamicBundleSection);


  window.addEventListener('medicare_cart_updated', renderCart);
  if (cartBtn)     cartBtn.addEventListener('click',  () => { renderCart(); cartOverlay?.classList.add('open'); });
  if (cartClose)   cartClose.addEventListener('click', () => cartOverlay?.classList.remove('open'));
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) cartOverlay.classList.remove('open'); });
  renderCart();

  /* ------------------------------------------------------------------
     13. STICKY MOBILE ADD-TO-CART BAR
     ------------------------------------------------------------------ */
  const buyBtn   = document.getElementById('pdp-buy-btn');
  const stickyBar = document.getElementById('pdp-sticky-bar');
  if (buyBtn && stickyBar) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => stickyBar.classList.toggle('visible', !e.isIntersecting));
    }, { threshold: 0.1 });
    obs.observe(buyBtn);
  }

  /* ------------------------------------------------------------------
     14. TAB SWITCHER
     ------------------------------------------------------------------ */
  window.switchTab = function(btn, targetId) {
    document.querySelectorAll('.pdp-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.pdp-tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(targetId)?.classList.add('active');
  };

  /* ------------------------------------------------------------------
     15. WISHLIST TOGGLE
     ------------------------------------------------------------------ */
  window.togglePDPWishlist = function() {
    const btn   = document.getElementById('pdp-wishlist-toggle');
    const badge = document.getElementById('pdp-wishlist-badge');
    if (!btn) return;
    btn.classList.toggle('active');
    const isSaved = btn.classList.contains('active');
    if (badge) badge.textContent = isSaved ? '3' : '2';
    showToast(isSaved ? '♥ Saved to Wishlist' : 'Removed from Wishlist');
    if (isSaved) {
      const wl = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]');
      if (!wl.find(i => i.id === product.id)) {
        wl.push({ id: product.id, name: product.name, nameAr: product.name_ar, price: product.price, img: product.images[0], specialty: product.specialty });
        localStorage.setItem('medicare_wishlist', JSON.stringify(wl));
      }
    }
  };

  /* ------------------------------------------------------------------
     16. LIGHTBOX
     ------------------------------------------------------------------ */
  window.openLightbox = function() {
    const img = document.getElementById('pdp-main-img');
    const src = img ? img.src : '';
    const lb  = document.createElement('div');
    lb.id     = 'pdp-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
    lb.innerHTML = `<img src="${src}" style="max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 25px 60px rgba(0,0,0,.5)">`;
    lb.addEventListener('click', () => lb.remove());
    document.body.appendChild(lb);
  };

  /* ------------------------------------------------------------------
     17. TRILINGUAL LANGUAGE TOGGLE & LOCALIZED PDP RENDERER
     ------------------------------------------------------------------ */
  function renderPDPTranslations(lang) {
    if (!product) return;
    const currentL = lang || (window.MC_I18N ? window.MC_I18N.getCurrentLang() : (localStorage.getItem('medicare_lang') || 'en'));
    const isAR = currentL === 'ar';
    const isFR = currentL === 'fr';

    // Localized Title & Breadcrumb
    const localizedName = isAR ? (product.name_ar || product.name) : (isFR ? (product.name_fr || product.name) : product.name);
    document.title = `${localizedName} — MEDICARE`;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = localizedName;
    if (titleEl) titleEl.textContent = localizedName;
    productData.title = localizedName;

    // Short Description
    if (shortDescEl) {
      const shortD = isAR ? (product.short_description_ar || product.short_description || product.description)
        : (isFR ? (product.short_description_fr || product.short_description || product.description) : (product.short_description || product.description));
      if (shortD) {
        shortDescEl.textContent = shortD;
        shortDescEl.style.display = 'block';
      }
    }

    // Tab 1: Description & Features
    if (tabDesc) {
      const descTitle = tabDesc.querySelector('h3');
      const overviewLabel = isAR ? 'نظرة عامة والخصائص السريرية' : (isFR ? 'Aperçu & Caractéristiques Cliniques' : 'Overview & Technology');
      if (descTitle) descTitle.textContent = `${localizedName} — ${overviewLabel}`;

      const descPara = tabDesc.querySelector('p');
      const fullD = isAR ? (product.description_ar || product.description)
        : (isFR ? (product.description_fr || product.description) : product.description);
      if (descPara) descPara.textContent = fullD || product.short_description || localizedName;

      const specGrid = tabDesc.querySelector('.pdp-spec-grid');
      if (specGrid) {
        const featList = isAR ? (product.features_ar || product.features)
          : (isFR ? (product.features_fr || product.features) : product.features);
        if (Array.isArray(featList) && featList.length > 0) {
          specGrid.innerHTML = featList.map(f => {
            if (typeof f === 'string') {
              return `
                <div class="pdp-spec-card">
                  <div class="pdp-spec-card-title">✨ ${f}</div>
                </div>
              `;
            }
            return `
              <div class="pdp-spec-card">
                <div class="pdp-spec-card-title">${f.icon || '✨'} ${f.title}</div>
                <p class="pdp-spec-card-desc">${f.desc || ''}</p>
              </div>
            `;
          }).join('');
          specGrid.style.display = 'grid';
        }
      }
    }

    // Tab 2: Specs & Care
    if (tabMaterials) {
      const specsTitle = isAR ? 'المواصفات الفنية وتعليمات العناية' : (isFR ? 'Spécifications Techniques & Entretien' : 'Specifications & Care');
      let matHTML = `<h3 style="font-family:var(--font-family-display); font-size:1.25rem; font-weight:800; color:var(--color-neutral-900);">${specsTitle}</h3>`;

      const specObj = isAR ? (product.specifications_ar || product.specifications)
        : (isFR ? (product.specifications_fr || product.specifications) : product.specifications);

      if (specObj && typeof specObj === 'object' && Object.keys(specObj).length > 0) {
        matHTML += `<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; margin:1rem 0;">`;
        Object.entries(specObj).forEach(([k, v]) => {
          matHTML += `
            <div style="background:#F8FAFC; padding:0.75rem 1rem; border-radius:6px; border:1px solid var(--color-neutral-200);">
              <strong style="font-size:12px; color:var(--color-primary-800); display:block; margin-bottom:3px;">${k}</strong>
              <span style="font-size:13.5px; color:var(--color-neutral-800); font-weight:600;">${v}</span>
            </div>
          `;
        });
        matHTML += `</div>`;
      }

      const careList = isAR ? (product.care_instructions_ar || product.care_instructions)
        : (isFR ? (product.care_instructions_fr || product.care_instructions) : product.care_instructions);

      if (Array.isArray(careList) && careList.length > 0) {
        const careLabel = isAR ? '🧼 تعليمات الغسيل والعناية' : (isFR ? '🧼 Conseils de Lavage & Entretien' : '🧼 Washing & Care Instructions');
        matHTML += `
          <h4 style="font-size:14px; font-weight:700; margin-top:1.5rem; color:var(--color-neutral-900);">${careLabel}</h4>
          <ul style="padding-left:1.25rem; margin-top:0.5rem; font-size:13.5px; color:var(--color-neutral-700); line-height:1.6;">
            ${careList.map(c => `<li>${c}</li>`).join('')}
          </ul>
        `;
      }
      tabMaterials.innerHTML = matHTML;
    }

    // Tab 3: Shipping & Returns
    if (tabShipping) {
      const shipTitle = isAR ? 'شحن سريع لكافة الـ 58 ولاية' : (isFR ? 'Livraison Express dans les 58 Wilayas' : 'Fast Express Delivery Across 58 Wilayas');
      const shipBody = isAR ? (product.delivery_info_ar || product.delivery_info || 'توصيل سريع لكافة الـ 58 ولاية عبر شركاء التوصيل مع الدفع عند الاستلام. شحن مجاني للطلبات فوق 5,000 دج.')
        : (isFR ? (product.delivery_info_fr || product.delivery_info || 'Livraison express dans les 58 Wilayas d’Algérie avec paiement à la livraison. Livraison gratuite dès 5 000 DZD d’achat.') : (product.delivery_info || 'We ship directly to all 58 Wilayas in Algeria via express courier partners with Cash on Delivery (COD) payment support. Free express shipping automatically applied on orders above 5,000 DZD.'));

      const returnTitle = isAR ? '🔄 سياسة الاستبدال والضمان' : (isFR ? '🔄 Politique d’Échange & Garantie' : '🔄 14-Day Free Exchange & Return Policy');
      const returnBody = isAR ? (product.return_info_ar || product.return_info || 'استبدال مجاني للمقاسات خلال 7 أيام. ضمان سنتين على الأجهزة الإلكترونية والتشخيصية.')
        : (isFR ? (product.return_info_fr || product.return_info || 'Échange de taille 100% gratuit sous 7 jours. Garantie 2 ans sur les appareils électroniques et diagnostics.') : (product.return_info || '14-Day Free Exchange across all 58 Wilayas. Product must be in original condition with tags attached.'));

      tabShipping.innerHTML = `
        <h3 style="font-family:var(--font-family-display); font-size:1.25rem; font-weight:800; color:var(--color-neutral-900);">${shipTitle}</h3>
        <p style="font-size:14px; line-height:1.6; color:var(--color-neutral-700); margin-top:0.5rem;">${shipBody}</p>
        <h4 style="font-size:14px; font-weight:700; margin-top:1.5rem; color:var(--color-neutral-900);">${returnTitle}</h4>
        <p style="font-size:14px; line-height:1.6; color:var(--color-neutral-700); margin-top:0.5rem;">${returnBody}</p>
      `;
    }

    // Purchase button label
    if (addToCartBtn && product.stock > 0) {
      addToCartBtn.innerHTML = isAR ? '🛒 أضف إلى السلة' : (isFR ? '🛒 Ajouter au panier' : '🛒 Add to Cart');
    }
  }

  // Initial localized render
  renderPDPTranslations();

  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langDropdownMenu = document.getElementById('lang-dropdown-menu');

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (langDropdownMenu) {
        langDropdownMenu.classList.toggle('show');
      } else {
        const cur = window.MC_I18N ? window.MC_I18N.getCurrentLang() : 'en';
        const next = cur === 'en' ? 'ar' : (cur === 'ar' ? 'fr' : 'en');
        if (window.MC_I18N) window.MC_I18N.setLang(next);
        renderPDPTranslations(next);
      }
    });
  }

  if (langDropdownMenu) {
    langDropdownMenu.querySelectorAll('.mc-lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.lang;
        if (window.MC_I18N) window.MC_I18N.setLang(selected);
        renderPDPTranslations(selected);
        langDropdownMenu.classList.remove('show');
      });
    });

    document.addEventListener('click', e => {
      if (langToggleBtn && !langToggleBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
        langDropdownMenu.classList.remove('show');
      }
    });
  }

  window.addEventListener('medicare_language_changed', (e) => {
    if (e.detail && e.detail.lang) {
      renderPDPTranslations(e.detail.lang);
    }
  });

  /* ------------------------------------------------------------------
     18. REVIEW SUBMISSION MODAL, REAL PHOTO UPLOAD & LOGIC
     ------------------------------------------------------------------ */
  let currentSelectedRating = 5;
  let attachedPhotos = []; // Array of base64 photo strings
  const reviewModal = document.getElementById('review-modal');

  window.openReviewModal = function() {
    if (reviewModal) {
      reviewModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeReviewModal = function() {
    if (reviewModal) {
      reviewModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal?.classList.contains('open')) {
      closeReviewModal();
    }
  });

  window.setRating = function(val) {
    currentSelectedRating = Number(val) || 5;
    const stars = document.querySelectorAll('#interactive-star-picker .star');
    stars.forEach((star, i) => {
      if (i < currentSelectedRating) star.classList.add('selected');
      else star.classList.remove('selected');
    });
  };

  function renderPhotoPreviews() {
    const previewContainer = document.getElementById('rev-photo-previews');
    if (!previewContainer) return;
    if (attachedPhotos.length === 0) {
      previewContainer.innerHTML = '';
      return;
    }
    previewContainer.innerHTML = attachedPhotos.map((src, index) => `
      <div class="rev-preview-item">
        <img src="${src}" alt="Attached Photo ${index + 1}">
        <button type="button" class="remove-btn" onclick="removeAttachedPhoto(${index})" title="Remove photo">✕</button>
      </div>
    `).join('');
  }

  window.removeAttachedPhoto = function(index) {
    attachedPhotos.splice(index, 1);
    renderPhotoPreviews();
  };

  function processImageFiles(files) {
    if (!files || files.length === 0) return;
    const maxFiles = 4;
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please upload only image files (JPG, PNG, WEBP)');
        return;
      }
      if (file.size > maxSize) {
        showToast(`⚠️ File "${file.name}" exceeds 5MB limit`);
        return;
      }
      if (attachedPhotos.length >= maxFiles) {
        showToast(`⚠️ Maximum ${maxFiles} photos allowed per review`);
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        attachedPhotos.push(e.target.result);
        renderPhotoPreviews();
        showToast(`📷 Photo "${file.name}" attached!`);
      };
      reader.readAsDataURL(file);
    });
  }

  window.handlePhotoSelect = function(e) {
    processImageFiles(e.target.files);
    e.target.value = ''; // Reset so the same file can be re-selected if removed
  };

  // Drag & drop support on photo dropzone
  const dropzone = document.getElementById('rev-photo-dropzone');
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files) {
        processImageFiles(dt.files);
      }
    }, false);
  }

  window.openReviewPhotoLightbox = function(src) {
    const lb = document.createElement('div');
    lb.className = 'rev-photo-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:1rem;';
    lb.innerHTML = `<img src="${src}" style="max-width:92vw;max-height:90vh;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.6);object-fit:contain;">`;
    lb.addEventListener('click', () => lb.remove());
    document.body.appendChild(lb);
  };

  window.voteHelpful = function(btn, initialVal) {
    if (btn.classList.contains('voted')) return;
    btn.classList.add('voted');
    const countEl = btn.querySelector('.vote-count');
    if (countEl) {
      const current = parseInt(countEl.textContent || initialVal || '1', 10);
      countEl.textContent = current + 1;
    }
    showToast('👍 Thank you for your feedback!');
  };

  window.handleReviewSubmit = function(e) {
    e.preventDefault();
    const author = document.getElementById('rev-author')?.value.trim();
    const role   = document.getElementById('rev-role')?.value || 'Resident Physician';
    const title  = document.getElementById('rev-headline')?.value.trim();
    const body   = document.getElementById('rev-body')?.value.trim();

    if (!author || !title || !body) {
      showToast('Please fill out all required review fields');
      return;
    }

    const container = document.getElementById('reviews-list-container');
    const starsStr = '★'.repeat(currentSelectedRating) + '☆'.repeat(5 - currentSelectedRating);
    
    // Generate initials for avatar
    const initials = author.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'MD';

    const currentPhotos = [...attachedPhotos];

    const newReviewHTML = `
      <div class="pdp-review-card" style="animation: fadeIn 0.4s ease; background: #F8FAFC; border-radius: 10px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--color-neutral-200);">
        <div class="pdp-review-user-row">
          <div class="pdp-review-user-info">
            <div class="pdp-user-avatar" style="background:var(--color-primary-100); color:var(--color-primary-800);">${initials}</div>
            <div>
              <div style="font-weight:700; font-size:14px;">${author} <span class="pdp-verified-badge">✓ Verified Buyer</span></div>
              <div style="font-size:11px; color:var(--color-neutral-400);">${role}</div>
            </div>
          </div>
          <span style="font-size:12px; color:var(--color-neutral-400);">Just now</span>
        </div>
        <div style="color:var(--color-accent-500); margin-bottom:0.35rem;">${starsStr}</div>
        <h4 style="margin:0 0 0.25rem 0; font-size:14px; font-weight:700; color:var(--color-neutral-900);">${title}</h4>
        <p style="font-size:13.5px; color:var(--color-neutral-700); margin:0 0 0.5rem 0; line-height:1.6;">${body}</p>
        ${currentPhotos.length > 0 ? `
          <div class="pdp-review-photos" style="margin-top:0.5rem;">
            ${currentPhotos.map(p => `<img src="${p}" alt="Review Photo" class="pdp-review-photo-thumb" onclick="openReviewPhotoLightbox('${p}')" title="Click to view">`).join('')}
          </div>
        ` : ''}
        <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
          <button class="rev-helpful-btn" onclick="voteHelpful(this, 1)">
            👍 Helpful (<span class="vote-count">1</span>)
          </button>
        </div>
      </div>
    `;

    if (container) {
      container.insertAdjacentHTML('afterbegin', newReviewHTML);
    }

    const activeProdId = (window.productData && window.productData.id) || (product && product.id) || null;

    const reviewPayload = {
      customer_name: author,
      specialty_tag: role,
      rating: currentSelectedRating,
      comment: `${title}: ${body}`,
      product_id: activeProdId,
      photos: currentPhotos
    };

    if (window.MedicareDB && typeof window.MedicareDB.submitReview === 'function') {
      window.MedicareDB.submitReview(reviewPayload).catch(err => {
        console.warn('[PDP] Supabase submitReview failed, fallback saved:', err);
      });
    } else {
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      localReviews.unshift({
        id: 'REV-' + Date.now(),
        ...reviewPayload,
        is_approved: true,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('medicare_reviews_db', JSON.stringify(localReviews));
    }

    // Reset form & state
    e.target.reset();
    attachedPhotos = [];
    renderPhotoPreviews();
    window.setRating(5);

    closeReviewModal();
    showToast('🎉 Review submitted successfully!');
  };

  // Load real reviews for this product from DB and compute live stats
  async function loadProductReviews() {
    const activeProdId = (window.productData && window.productData.id) || (product && product.id) || null;
    let reviewsList = [];

    if (window.MedicareDB && typeof window.MedicareDB.getReviews === 'function') {
      try {
        const dbRev = await window.MedicareDB.getReviews(activeProdId);
        if (Array.isArray(dbRev) && dbRev.length > 0) {
          reviewsList = dbRev;
        }
      } catch (e) {
        console.warn('[PDP] Could not fetch DB reviews:', e);
      }
    }

    if (reviewsList.length === 0) {
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      reviewsList = localReviews.filter(r => String(r.product_id) === String(activeProdId));
    }

    const container = document.getElementById('reviews-list-container');
    const totalReviews = reviewsList.length;

    // Calculate real average rating
    let avgRating = product.rating || 5.0;
    if (totalReviews > 0) {
      const sum = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      avgRating = Number((sum / totalReviews).toFixed(1));
    }

    // Update top rating badges
    if (ratingStarsEl) {
      const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(Math.max(0, 5 - Math.round(avgRating)));
      ratingStarsEl.textContent = `${stars} ${avgRating}`;
    }
    if (ratingCountEl) {
      ratingCountEl.textContent = `(${totalReviews} verified ${totalReviews === 1 ? 'review' : 'reviews'})`;
    }

    // Update Reviews Tab header
    const reviewsTabBtn = document.querySelector('.pdp-tab-btn:nth-child(4)');
    if (reviewsTabBtn) {
      reviewsTabBtn.textContent = `Customer Reviews (${totalReviews})`;
    }

    // Render dynamic reviews overview into #pdp-reviews-overview
    const overviewEl = document.getElementById('pdp-reviews-overview');
    if (overviewEl) {
      const histoCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviewsList.forEach(r => {
        const rVal = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 5)));
        histoCounts[rVal]++;
      });
      const histoHtml = [5,4,3,2,1].map(s => {
        const cnt = histoCounts[s] || 0;
        const pct = totalReviews > 0 ? Math.round((cnt / totalReviews) * 100) : 0;
        return `<div class="pdp-histo-row"><span>${s} Stars</span><div class="pdp-histo-bar-bg"><div class="pdp-histo-bar-fill" style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
      }).join('');
      const starsDisplay = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
      if (totalReviews === 0) {
        overviewEl.innerHTML = `
          <div style="text-align:center; padding:1.5rem; color:var(--color-neutral-400);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">⭐</div>
            <div style="font-size:13px; margin-bottom:1rem;">No reviews yet — be the first!</div>
            <button class="mc-btn mc-btn-primary mc-btn-sm" onclick="openReviewModal()">✍️ Write a Review</button>
          </div>`;
      } else {
        overviewEl.innerHTML = `
          <div class="pdp-review-score-box">
            <div class="pdp-review-big-score">${avgRating}</div>
            <div style="color:var(--color-accent-500); font-size:1.2rem;">${starsDisplay}</div>
            <div style="font-size:12px; color:var(--color-neutral-500); margin-top:0.25rem;">Based on ${totalReviews} review${totalReviews !== 1 ? 's' : ''}</div>
          </div>
          <div class="pdp-review-histogram">${histoHtml}</div>
          <div style="text-align:center;">
            <button class="mc-btn mc-btn-primary mc-btn-sm" onclick="openReviewModal()">✍️ Write a Review</button>
          </div>`;
      }
    }

    // Render review cards or empty state
    if (container) {
      if (reviewsList.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1rem; background:#F8FAFC; border-radius:10px; border:1px dashed var(--color-neutral-300); color:var(--color-neutral-500);">
            <div style="font-size:2.5rem; margin-bottom:0.5rem;">✍️</div>
            <div style="font-weight:700; font-size:15px; color:var(--color-neutral-800); margin-bottom:0.25rem;">No reviews yet for this product</div>
            <div style="font-size:13px; margin-bottom:1rem;">Be the first medical professional to share your experience with colleagues!</div>
            <button class="mc-btn mc-btn-primary mc-btn-sm" onclick="openReviewModal()">✍️ Write the First Review</button>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      const reversed = [...reviewsList].reverse();
      reversed.forEach(r => {
        const ratingVal = Number(r.rating) || 5;
        const starsStr = '★'.repeat(ratingVal) + '☆'.repeat(Math.max(0, 5 - ratingVal));
        const initials = (r.customer_name || 'MD').split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'MD';
        const cardPhotos = Array.isArray(r.photos) ? r.photos : [];
        const reviewHTML = `
          <div class="pdp-review-card" style="margin-bottom: 1rem;">
            <div class="pdp-review-user-row">
              <div class="pdp-review-user-info">
                <div class="pdp-user-avatar">${initials}</div>
                <div>
                  <div style="font-weight:700; font-size:14px;">${r.customer_name || 'Verified Customer'} <span class="pdp-verified-badge">✓ Verified Buyer</span></div>
                  <div style="font-size:11px; color:var(--color-neutral-400);">${r.specialty_tag || 'Medical Professional'}</div>
                </div>
              </div>
              <span style="font-size:12px; color:var(--color-neutral-400);">${r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}</span>
            </div>
            <div style="color:var(--color-accent-500); margin-bottom:0.35rem;">${starsStr}</div>
            <p style="font-size:13.5px; color:var(--color-neutral-700); margin:0 0 0.5rem 0;">${r.comment || ''}</p>
            ${cardPhotos.length > 0 ? `
              <div class="pdp-review-photos" style="margin-top:0.5rem;">
                ${cardPhotos.map(p => `<img src="${p}" alt="Review Photo" class="pdp-review-photo-thumb" onclick="openReviewPhotoLightbox('${p}')">`).join('')}
              </div>
            ` : ''}
            ${r.admin_reply ? `
              <div class="pdp-admin-reply" style="margin-top:0.75rem; background:#F0FDF4; border-left:3px solid #0E4D45; border-radius:6px; padding:0.75rem 1rem;">
                <div style="font-weight:800; font-size:12px; color:#064E3B; margin-bottom:3px; display:flex; align-items:center; gap:5px;">
                  🏥 <span>Official MEDICARE Response (رد إدارة المتجر):</span>
                </div>
                <div style="font-size:13px; color:#1E293B; line-height:1.45;">${r.admin_reply}</div>
              </div>
            ` : ''}
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="rev-helpful-btn" onclick="voteHelpful(this, 1)">
                👍 Helpful (<span class="vote-count">1</span>)
              </button>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('afterbegin', reviewHTML);
      });
    }
  }

  loadProductReviews();

});

/* ==========================================================================
   GLOBAL STATE — shared with addPDPToCart, selectColor, selectSize
   Must be declared outside DOMContentLoaded so it persists
   ========================================================================== */
window.productData = {
  id: '',
  title: '',
  titleAr: '',
  price: 0,
  originalPrice: 0,
  selectedColor: 'Obsidian Teal',
  selectedSize: 'M',
  qty: 1,
  img: ''
};
