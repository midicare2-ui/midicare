/* ==========================================================================
   MEDICARE — CATEGORY PAGE INTERACTIVE ENGINE
   Filter system, Sort, Pagination, Skeleton, Empty State, Cart, RTL
   ========================================================================== */

/* ------------------------------------------------------------------
   PRODUCT DATA CATALOG (Imported from single source of truth product-catalog.js)
   ------------------------------------------------------------------ */
const CATALOG = (typeof window !== 'undefined' && window.PRODUCT_CATALOG)
  ? window.PRODUCT_CATALOG
  : (typeof require !== 'undefined' ? require('./product-catalog.js').PRODUCT_CATALOG : []);

// Expose CATALOG globally for category-mobile.js to access
window.CATALOG = CATALOG;

const PRODUCTS_PER_PAGE = 16;
let showAllMode = false;
let currentPage = 1;
let filteredProducts = [...CATALOG];
let activeFilters = {};
let selectedSizes = new Set();
let selectedColors = new Set();
let cart = [];
let cartCount = 0;

// Cache for Supabase products (loaded async on DOMContentLoaded)
let _supabaseProducts = [];

/* ------------------------------------------------------------------
   DOM REFS
   ------------------------------------------------------------------ */
const productGrid     = document.getElementById('product-grid');
const chipsBar        = document.getElementById('chips-bar');
const paginationEl    = document.getElementById('pagination');
const resultCount     = document.getElementById('result-count');
const resultsSummary  = document.getElementById('results-summary');
const sortSelect      = document.getElementById('sort-select');
const filterOverlay   = document.getElementById('filter-overlay');
const filterTrigger   = document.getElementById('filter-trigger-btn');
const filterSheetClose= document.getElementById('filter-sheet-close');
const sidebarReset    = document.getElementById('sidebar-reset-btn');
const gridViewBtn     = document.getElementById('grid-view-btn');
const listViewBtn     = document.getElementById('list-view-btn');
const catCartBtn      = document.getElementById('cat-cart-btn');
const catCartOverlay  = document.getElementById('cat-cart-overlay');
const catCartClose    = document.getElementById('cat-cart-close');
const catCartBadge    = document.getElementById('cat-cart-badge');
const toast           = document.getElementById('copy-toast');

/* ------------------------------------------------------------------
   UTILITIES
   ------------------------------------------------------------------ */
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

function starsHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function formatPrice(n) {
  const num = Number(n);
  if (isNaN(num)) return '0 DZD';
  return num.toLocaleString('fr-DZ') + ' DZD';
}

function discountPct(original, current) {
  const orig = Number(original);
  const cur = Number(current);
  if (orig && cur && orig > cur) {
    return Math.round((1 - cur / orig) * 100);
  }
  return 0;
}

/* ------------------------------------------------------------------
   SKELETON LOADING — shown on first render
   ------------------------------------------------------------------ */
function renderSkeletons(count = 16) {
  if (!productGrid) return;
  productGrid.innerHTML = Array.from({length: count}).map(() => `
    <div class="mc-skeleton-card" role="listitem" aria-label="Loading product">
      <div class="mc-skeleton-img"></div>
      <div class="mc-skeleton-body">
        <div class="mc-skeleton-text short"></div>
        <div class="mc-skeleton-text wide"></div>
        <div class="mc-skeleton-text medium"></div>
        <div class="mc-skeleton-text short"></div>
        <div class="mc-skeleton-swatches">
          <div class="mc-skeleton-swatch"></div>
          <div class="mc-skeleton-swatch"></div>
          <div class="mc-skeleton-swatch"></div>
        </div>
      </div>
      <div class="mc-skeleton-btn"></div>
    </div>
  `).join('');
}

/* ------------------------------------------------------------------
   PRODUCT CARD RENDERER
   ------------------------------------------------------------------ */
function productCardHTML(p) {
  if (!p) return '';
  const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="50" fill="%2394a3b8">🩺</text></svg>';
  const pId = p.id || p.sku || 'prod';
  
  const currentLang = (window.MC_I18N ? window.MC_I18N.getCurrentLang() : (localStorage.getItem('medicare_lang') || 'en'));
  const pName = (window.MC_I18N ? window.MC_I18N.getProductField(p, 'name', currentLang) : (p.name || 'Medical Product'));
  const pNameAr = p.nameAr || p.name_ar || p.name;
  const pPrice = Number(p.price) || 0;
  const pOrigPrice = (p.originalPrice || p.original_price) ? Number(p.originalPrice || p.original_price) : null;
  const pImg = p.img || (Array.isArray(p.images) && p.images[0]) || defaultPlaceholderSvg;
  const pImg2 = p.img2 || (Array.isArray(p.images) && p.images[1]) || pImg;
  const pRating = Number(p.rating) || 5;
  const pReviews = Number(p.reviews ?? p.reviews_count) || 0;
  const pSpecialty = p.specialty || 'medicine';

  let stock = 10;
  try {
    const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
    stock = overrides[pId] !== undefined ? Number(overrides[pId]) : (Number(p.stock) ?? 10);
  } catch (e) {}
  const isOutOfStock = stock <= 0;

  const disc = discountPct(pOrigPrice, pPrice);
  const badgeMap = { sale:'mc-badge-sale', new:'mc-badge-new', hot:'mc-badge-hot', limited:'mc-badge-limited', bundle:'mc-badge-bundle' };
  const badgeLabel = { 
    sale:`−${disc}%`, 
    new: currentLang === 'ar' ? 'جديد' : (currentLang === 'fr' ? 'Nouveau' : 'New'), 
    hot: currentLang === 'ar' ? '🔥 رائج' : (currentLang === 'fr' ? '🔥 Tendance' : '🔥 Hot'), 
    limited: currentLang === 'ar' ? 'كمية محدودة' : (currentLang === 'fr' ? 'Stock Limité' : 'Limited'), 
    bundle: currentLang === 'ar' ? 'باقة' : (currentLang === 'fr' ? 'Pack' : 'Bundle')
  };

  const colorSwatches = (Array.isArray(p.colors) ? p.colors : []).slice(0, 4).map((c, i) => {
    const hex = (typeof c === 'string') ? (c.startsWith('#') ? c : '#0E4D45') : (c.hex || '#0E4D45');
    const name = (typeof c === 'string') ? c : (c.name || 'Color');
    return `
      <button class="mc-card-swatch ${i===0?'active':''}" style="background:${hex}" title="${name}" 
        onclick="swapColor(event, '${pId}', '${hex}')" aria-label="Color ${name}"></button>
    `;
  }).join('');
  const moreColors = (Array.isArray(p.colors) && p.colors.length > 4) ? `<span class="mc-swatch-more">+${p.colors.length - 4}</span>` : '';

  const safeName = String(pName).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const safeNameAr = String(pNameAr).replace(/'/g, "\\'").replace(/"/g, '&quot;');

  const addBtnLabel = isOutOfStock 
    ? (currentLang === 'ar' ? '⚠️ نفد من المخزون' : (currentLang === 'fr' ? '⚠️ Rupture de stock' : '⚠️ Out of Stock')) 
    : (currentLang === 'ar' ? '🛒 أضف إلى السلة' : (currentLang === 'fr' ? '🛒 Ajouter au panier' : '🛒 Add to Cart'));

  return `
    <div class="mc-cat-card" role="listitem" data-id="${pId}" data-specialty="${pSpecialty}" data-price="${pPrice}" data-rating="${pRating}" style="opacity:${isOutOfStock ? '0.78' : '1'};" onclick="window.location.href='product-detail.html?id=${pId}'">
      <div class="mc-card-img-wrap">
        <img class="mc-card-img-primary" src="${pImg}" alt="${safeName}" loading="lazy" onerror="this.src='${defaultPlaceholderSvg}'">
        <img class="mc-card-img-secondary" src="${pImg2}" alt="${safeName} alternate view" loading="lazy" onerror="this.src='${defaultPlaceholderSvg}'">

        <!-- Badges -->
        <div class="mc-card-badges">
          ${isOutOfStock ? '<span class="mc-card-badge mc-badge-limited" style="background:#EF4444; color:#fff;">⚠️ Out of Stock</span>' : ''}
          ${p.badge ? `<span class="mc-card-badge ${badgeMap[p.badge] || 'mc-badge-sale'}">${badgeLabel[p.badge] || p.badge}</span>` : ''}
          ${p.isBestSeller ? '<span class="mc-card-badge mc-badge-hot">Best Seller</span>' : ''}
        </div>

        <!-- Wishlist -->
        <button class="mc-card-wishlist" onclick="toggleWishlist(event, this, '${safeName}')" aria-label="Add to wishlist">♥</button>

        <!-- Quick View -->
        <button class="mc-card-quick-view" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${pId}'">⚡ ${currentLang === 'ar' ? 'تفاصيل المنتج' : (currentLang === 'fr' ? 'Voir Détails' : 'View Details')}</button>
      </div>

      <div class="mc-card-body">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="mc-card-specialty">${specialtyLabel(pSpecialty)}</span>
          <span style="font-size:11px; font-weight:700; color:${isOutOfStock ? '#EF4444' : '#15803D'};">
            ${isOutOfStock ? (currentLang === 'ar' ? 'نفد المخزون' : (currentLang === 'fr' ? 'Épuisé' : 'Out of Stock')) : `${stock} ${currentLang === 'ar' ? 'متوفر' : (currentLang === 'fr' ? 'en stock' : 'in stock')}`}
          </span>
        </div>
        <h3 class="mc-card-name">${pName}</h3>

        <div class="mc-card-stars">
          <span class="mc-stars-display" aria-label="${pRating} out of 5 stars">${starsHTML(pRating)}</span>
          <span class="mc-review-count">(${pReviews})</span>
        </div>

        <div class="mc-card-pricing">
          <span class="mc-card-price">${formatPrice(pPrice)}</span>
          ${pOrigPrice ? `<span class="mc-card-original-price">${formatPrice(pOrigPrice)}</span>` : ''}
          ${disc >= 5 ? `<span class="mc-card-discount-pct">−${disc}%</span>` : ''}
        </div>

        <div class="mc-card-swatches">
          ${colorSwatches}${moreColors}
        </div>
      </div>

      <div class="mc-card-footer">
        <button class="mc-card-add-btn" id="add-btn-${pId}"
          ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
          onclick="addToCart(event, '${pId}', '${safeName}', '${safeNameAr}', ${pPrice}, '${pImg}')">
          ${addBtnLabel}
        </button>
      </div>
    </div>
  `;
}

function specialtyLabel(s) {
  return { medicine:'🩺 Medicine & Surgery', pharmacy:'💊 Pharmacy', dentistry:'🦷 Dentistry', nursing:'🏥 Nursing' }[s] || s;
}

/* ------------------------------------------------------------------
   EMPTY STATE
   ------------------------------------------------------------------ */
function emptyStateHTML() {
  // Check if store has any products at all (vs just filtered out)
  const hasAnyProducts = getLiveCatalog().length > 0;

  if (!hasAnyProducts) {
    return `
      <div class="mc-empty-state" role="status" style="padding:3rem 1.5rem;">
        <div class="mc-empty-icon" style="font-size:3rem;">📦</div>
        <h2 class="mc-empty-title" style="color:#0E4D45;">المتجر جاهز — أضف منتجاتك الآن</h2>
        <p class="mc-empty-desc" style="color:#475569; max-width:380px; margin:0.75rem auto 1.25rem;">
          لا توجد منتجات حتى الآن. قم بإضافة منتجاتك من لوحة التحكم (Admin) وستظهر هنا تلقائياً.
        </p>
        <a href="admin.html" class="mc-btn mc-btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; padding:0.65rem 1.5rem;">
          ⚙️ فتح لوحة التحكم — Open Admin Panel
        </a>
      </div>
    `;
  }

  return `
    <div class="mc-empty-state" role="status">
      <div class="mc-empty-icon">🔍</div>
      <h2 class="mc-empty-title">No products found</h2>
      <p class="mc-empty-desc">We couldn't find any products matching your current filters. Try adjusting or clearing some filters to see more results.</p>
      <div class="mc-empty-suggestions">
        <a href="#" class="mc-empty-suggest-tag" onclick="clearAllFilters(); return false;">Clear all filters</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('medicine'); return false;">Medicine</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('pharmacy'); return false;">Pharmacy</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('nursing'); return false;">Nursing</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('dentistry'); return false;">Dentistry</a>
      </div>
    </div>
  `;
}

function setSpecialty(s) {
  document.querySelectorAll('input[name="specialty"]').forEach(cb => { cb.checked = cb.value === s; });
  applyFilters();
}

/* ------------------------------------------------------------------
   SORT LOGIC
   ------------------------------------------------------------------ */
function sortProducts(arr) {
  const order = sortSelect?.value || 'best-selling';
  return [...arr].sort((a, b) => {
    switch (order) {
      case 'newest':     return b.isNew - a.isNew;
      case 'price-asc':  return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'top-rated':  return b.rating - a.rating || b.reviews - a.reviews;
      case 'best-selling': default: return b.isBestSeller - a.isBestSeller || b.reviews - a.reviews;
    }
  });
}

function getLiveCatalog() {
  // Start with static catalog (single source of truth product-catalog.js)
  let base = (typeof window !== 'undefined' && window.PRODUCT_CATALOG)
    ? [...window.PRODUCT_CATALOG]
    : (typeof require !== 'undefined' ? [...require('./product-catalog.js').PRODUCT_CATALOG] : []);

  // ── Merge Supabase products (fetched async on init)
  // Products from Supabase take precedence over static catalog for same id
  if (_supabaseProducts && _supabaseProducts.length > 0) {
    _supabaseProducts.forEach(sp => {
      const idx = base.findIndex(p => String(p.id) === String(sp.id));
      const normalized = {
        id:          sp.id,
        name:        sp.name,
        name_ar:     sp.name_ar || sp.name,
        specialty:   sp.specialty,
        price:       Number(sp.price),
        originalPrice: sp.original_price ? Number(sp.original_price) : null,
        rating:      Number(sp.rating) || 5,
        reviews:     Number(sp.reviews_count) || 0,
        stock:       Number(sp.stock) || 0,
        material:    sp.material || '',
        brand:       sp.brand || 'medicare',
        badge:       sp.badge || '',
        colors:      Array.isArray(sp.colors) ? sp.colors : [],
        sizes:       Array.isArray(sp.sizes) ? sp.sizes : ['S','M','L','XL'],
        img:         (Array.isArray(sp.images) && sp.images.length > 0 && sp.images[0]) ? sp.images[0] : (typeof sp.images === 'string' && sp.images ? sp.images : ''),
        img2:        (Array.isArray(sp.images) && sp.images.length > 1 && sp.images[1]) ? sp.images[1] : null,
        images:      (Array.isArray(sp.images) && sp.images.length > 0) ? sp.images : [],
        isBestSeller: sp.is_bestseller || false,
        isNew:       sp.is_new || false
      };
      if (idx >= 0) {
        base[idx] = normalized; // Update existing entry
      } else {
        base.unshift(normalized); // Add new product at top
      }
    });
  }

  // ── Merge localStorage custom products (Admin-added when Supabase was offline)
  try {
    const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
    customProds.forEach(cp => {
      if (!base.some(p => String(p.id) === String(cp.id))) {
        const primaryImage = (Array.isArray(cp.images) && cp.images.length > 0 && cp.images[0])
          ? cp.images[0]
          : (typeof cp.images === 'string' && cp.images ? cp.images : (cp.img || ''));

        // Normalize same as Supabase products to ensure img, reviews etc. are mapped correctly
        const normalized = {
          id:           cp.id || cp.sku,
          name:         cp.name || '',
          name_ar:      cp.name_ar || cp.name || '',
          specialty:    cp.specialty || '',
          price:        Number(cp.price) || 0,
          originalPrice: cp.original_price ? Number(cp.original_price) : (cp.originalPrice || null),
          rating:       Number(cp.rating) || 5,
          reviews:      Number(cp.reviews_count ?? cp.reviews) || 0,
          stock:        Number(cp.stock) || 0,
          material:     cp.material || '',
          brand:        cp.brand || 'medicare',
          badge:        cp.badge || '',
          colors:       Array.isArray(cp.colors) ? cp.colors : [],
          sizes:        Array.isArray(cp.sizes) ? cp.sizes : ['S','M','L','XL'],
          img:          primaryImage,
          img2:         (Array.isArray(cp.images) && cp.images.length > 1) ? cp.images[1] : (cp.img2 || null),
          images:       (Array.isArray(cp.images) && cp.images.length > 0) ? cp.images : [primaryImage],
          isBestSeller: cp.is_bestseller || cp.isBestSeller || false,
          isNew:        cp.is_new || cp.isNew || false,
          // Preserve all other fields (features, specs, etc.)
          ...Object.fromEntries(Object.entries(cp).filter(([k]) => !['id','name','name_ar','specialty','price','original_price','originalPrice','rating','reviews_count','reviews','stock','material','brand','badge','colors','sizes','images','img','img2','is_bestseller','isBestSeller','is_new','isNew'].includes(k)))
        };
        base.unshift(normalized);
      }
    });
  } catch (e) {}

  // ── Apply stock overrides
  const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
  return base.map(p => ({
    ...p,
    stock: overrides[p.id] !== undefined ? Number(overrides[p.id]) : (Number(p.stock) ?? 10)
  }));
}

let activeCategoryFilter = 'all';

window.setCategoryFilter = function(catKey) {
  activeCategoryFilter = catKey || 'all';
  applyFilters();
};

/* ------------------------------------------------------------------
   FILTER LOGIC
   ------------------------------------------------------------------ */
function applyFilters() {
  const specialties  = [...document.querySelectorAll('input[name="specialty"]:checked')].map(i => i.value);
  const materials    = [...document.querySelectorAll('input[name="material"]:checked')].map(i => i.value);
  const brands       = [...document.querySelectorAll('input[name="brand"]:checked')].map(i => i.value);
  const ratingEl     = document.querySelector('input[name="rating"]:checked');
  const minRating    = ratingEl ? parseFloat(ratingEl.value) : 0;
  const minPrice     = parseInt(document.getElementById('price-min')?.value || 0);
  const maxPrice     = parseInt(document.getElementById('price-max')?.value || 50000);

  const liveList = getLiveCatalog();

  filteredProducts = liveList.filter(p => {
    // Top category pills filter (All, Scrubs, Lab Coats, Calots & Caps, Footwear, Diagnostic, Starter Kits)
    if (activeCategoryFilter && activeCategoryFilter !== 'all') {
      const catLower = (p.category || '').toLowerCase();
      const nameLower = (p.name + ' ' + (p.name_ar || p.nameAr || '')).toLowerCase();
      const specialty = (p.specialty || '').toLowerCase();

      if (activeCategoryFilter === 'scrubs') {
        const isScrub = catLower.includes('scrub') || nameLower.includes('scrub') || nameLower.includes('سكراب') || specialty === 'medicine' || specialty === 'nursing';
        if (!isScrub) return false;
      } else if (activeCategoryFilter === 'lab-coats') {
        const isLabCoat = catLower.includes('lab') || catLower.includes('coat') || nameLower.includes('coat') || nameLower.includes('مئزر') || nameLower.includes('بلوزة');
        if (!isLabCoat) return false;
      } else if (activeCategoryFilter === 'calots') {
        const isCalot = catLower.includes('calot') || catLower.includes('cap') || nameLower.includes('cap') || nameLower.includes('طاقية') || nameLower.includes('قبعة');
        if (!isCalot) return false;
      } else if (activeCategoryFilter === 'footwear') {
        const isFootwear = catLower.includes('footwear') || catLower.includes('shoe') || catLower.includes('clog') || nameLower.includes('حذاء') || nameLower.includes('قبقاب');
        if (!isFootwear) return false;
      } else if (activeCategoryFilter === 'diagnostic') {
        const isDiag = catLower.includes('diagnostic') || nameLower.includes('stethoscope') || nameLower.includes('سماعة') || nameLower.includes('ضغط');
        if (!isDiag) return false;
      } else if (activeCategoryFilter === 'starter-kits') {
        const isKit = catLower.includes('kit') || catLower.includes('bundle') || nameLower.includes('kit') || nameLower.includes('حقيبة') || nameLower.includes('باقة');
        if (!isKit) return false;
      }
    }

    if (specialties.length  && !specialties.includes(p.specialty))   return false;
    if (materials.length    && !materials.includes(p.material))      return false;
    if (brands.length       && !brands.includes(p.brand))            return false;
    if (selectedSizes.size  && p.sizes && p.sizes.length > 0 && !p.sizes.some(s => selectedSizes.has(s))) return false;
    if (selectedColors.size && p.colors && !p.colors.some(c => selectedColors.has(c))) return false;
    if (p.price < minPrice || p.price > maxPrice)                    return false;
    if (p.rating < minRating)                                        return false;
    return true;
  });

  currentPage = 1;
  renderPage();
  renderChips({ specialties, materials, brands, minRating, minPrice, maxPrice });
  updateFilterBadge();
}

/* ------------------------------------------------------------------
   SHOW ALL / PAGINATION TOGGLE
   ------------------------------------------------------------------ */
window.toggleShowAllMode = function() {
  showAllMode = !showAllMode;
  currentPage = 1;
  renderPage();
  if (showAllMode) {
    showToast(`✓ Showing all ${filteredProducts.length} products on one page`);
  } else {
    showToast(`✓ Switched to paginated view (16 / page)`);
  }
};

/* ------------------------------------------------------------------
   RENDER PAGE (paginated slice or show-all)
   ------------------------------------------------------------------ */
function renderPage() {
  const sorted = sortProducts(filteredProducts);
  const total  = filteredProducts.length;
  const toggleBtn = document.getElementById('toggle-view-all-btn');

  if (toggleBtn) {
    toggleBtn.innerHTML = showAllMode 
      ? `📄 Paginate (16/p)` 
      : `👀 View All (${total})`;
    toggleBtn.className = showAllMode 
      ? 'mc-btn mc-btn-primary mc-btn-sm' 
      : 'mc-btn mc-btn-secondary mc-btn-sm';
  }

  // Empty Grid
  if (total === 0) {
    productGrid.innerHTML = emptyStateHTML();
    if (paginationEl) paginationEl.innerHTML = '';
    if (resultCount) resultCount.textContent = 'No products found';
    if (resultsSummary) resultsSummary.textContent = '';
    return;
  }

  // Show All Mode (Continuous view of all matching products)
  if (showAllMode) {
    productGrid.innerHTML = sorted.map(productCardHTML).join('');
    if (resultCount) {
      resultCount.textContent = `Showing all ${total} of ${total} products`;
    }
    if (resultsSummary) {
      resultsSummary.textContent = `All ${total} products displayed`;
    }
    renderPagination(total);
    return;
  }

  // Paginated slice
  const start  = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const slice  = sorted.slice(start, start + PRODUCTS_PER_PAGE);
  const end = Math.min(start + PRODUCTS_PER_PAGE, total);

  if (resultCount) {
    resultCount.textContent = `Showing ${start + 1}–${end} of ${total} products`;
  }

  productGrid.innerHTML = slice.map(productCardHTML).join('');

  // Results summary
  if (resultsSummary) {
    const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
    resultsSummary.textContent = `Page ${currentPage} of ${totalPages} · ${total} total products`;
  }

  renderPagination(total);
}

/* ------------------------------------------------------------------
   PAGINATION CONTROLS
   ------------------------------------------------------------------ */
function renderPagination(total) {
  if (!paginationEl) return;
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  if (showAllMode) {
    paginationEl.innerHTML = `
      <div class="mc-pagination-tools">
        <span style="font-size:13px; font-weight:700; color:var(--color-primary-700);">✓ Showing all ${total} products</span>
        <button class="mc-page-btn" onclick="toggleShowAllMode()" style="padding:0 1rem; width:auto; font-weight:700;">
          📄 Switch to Paginated View (16 / page)
        </button>
        <button class="mc-page-btn" onclick="window.scrollTo({top:0, behavior:'smooth'})" style="padding:0 0.8rem; width:auto;">
          ↑ Back to Top
        </button>
      </div>
    `;
    return;
  }

  if (totalPages <= 1) {
    paginationEl.innerHTML = `
      <div class="mc-pagination-tools">
        <span style="font-size:13px; color:var(--color-neutral-600);">Showing all ${total} products</span>
      </div>
    `;
    return;
  }

  let pagesHtml = '';

  // Prev
  pagesHtml += `<button class="mc-page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">‹ Prev</button>`;

  // Pages with ellipsis
  const pages = getPageNumbers(currentPage, totalPages);
  pages.forEach(p => {
    if (p === '...') {
      pagesHtml += `<span class="mc-page-dots">…</span>`;
    } else {
      pagesHtml += `<button class="mc-page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})" aria-label="Page ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`;
    }
  });

  // Next
  pagesHtml += `<button class="mc-page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">Next ›</button>`;

  paginationEl.innerHTML = `
    <div class="mc-pagination-pages">
      ${pagesHtml}
    </div>
    <div class="mc-pagination-tools">
      <button class="mc-page-btn" onclick="toggleShowAllMode()" style="padding:0 1rem; width:auto; font-weight:700;" title="View all products on a single page">
        👀 View All ${total} Products
      </button>
    </div>
  `;
}

function getPageNumbers(cur, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

window.goPage = function(page) {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ------------------------------------------------------------------
   OFFERS & BUNDLES (Frequently Bought Together Merchandising Packages)
   ------------------------------------------------------------------ */
function getCategoryStoredBundles() {
  try {
    const raw = localStorage.getItem('medicare_bundles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  return [];
}

function getProductFromAnyCatalog(id) {
  if (window.getProductById && typeof window.getProductById === 'function') {
    const p = window.getProductById(id);
    if (p) return p;
  }
  if (window.PRODUCT_CATALOG_MAP && window.PRODUCT_CATALOG_MAP[id]) {
    return window.PRODUCT_CATALOG_MAP[id];
  }
  return CATALOG.find(p => p.id === id) || null;
}

function renderCategoryBundles() {
  const section = document.getElementById('cat-bundles-section');
  const carousel = document.getElementById('cat-bundles-carousel');
  const subtitleEl = document.getElementById('cat-bundles-subtitle');
  if (!section || !carousel) return;

  const allBundles = getCategoryStoredBundles();
  const activeBundles = allBundles.filter(b => b.active);

  if (activeBundles.length === 0) {
    section.style.display = 'none';
    return;
  }

  if (subtitleEl) {
    subtitleEl.textContent = `${activeBundles.length} Active Special Package${activeBundles.length > 1 ? 's' : ''} — Save up to 25%`;
  }

  carousel.innerHTML = activeBundles.map(bundle => {
    const items = (bundle.productIds || []).map(id => getProductFromAnyCatalog(id)).filter(Boolean);
    const totalVal = items.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const bundlePrice = Number(bundle.bundlePrice || totalVal);
    const savings = Math.max(0, totalVal - bundlePrice);
    const savingsPct = totalVal > 0 ? Math.round((savings / totalVal) * 100) : 0;
    const anchorId = bundle.anchorProductId || items[0]?.id || '';

    const thumbsHTML = items.map((it, idx) => {
      const itImg = Array.isArray(it.images) && it.images[0] ? it.images[0] : (it.img || 'assets/medicare_scrubs_hero_1786614154492.png');
      const plus = idx < items.length - 1 ? '<span class="mc-cat-bundle-plus-sign">+</span>' : '';
      return `
        <a href="product-detail.html?id=${it.id}" title="${it.name} (${Number(it.price || 0).toLocaleString()} DZD)" style="display:inline-flex; align-items:center; text-decoration:none;">
          <img src="${itImg}" alt="${it.name}" class="mc-cat-bundle-item-thumb">
        </a>
        ${plus}
      `;
    }).join('');

    return `
      <div class="mc-cat-bundle-card">
        <div class="mc-cat-bundle-card-top">
          <div class="mc-cat-bundle-name">
            <span>⚡ ${bundle.name}</span>
            <span class="mc-cat-bundle-savings-badge">Save ${savings.toLocaleString()} DZD</span>
          </div>

          <div class="mc-cat-bundle-items-row">
            ${thumbsHTML}
          </div>

          <div class="mc-cat-bundle-pricing">
            <div>
              <div class="mc-cat-bundle-orig-price">${totalVal.toLocaleString()} DZD</div>
              <div class="mc-cat-bundle-disc-price">${bundlePrice.toLocaleString()} DZD</div>
            </div>
            <span style="font-size:11.5px; font-weight:800; color:#15803D; background:#DCFCE7; padding:2px 6px; border-radius:4px;">
              ${savingsPct}% OFF
            </span>
          </div>
        </div>

        <div class="mc-cat-bundle-actions">
          <button type="button" class="mc-btn mc-btn-accent mc-cat-bundle-btn" onclick="addCatBundleToCart('${bundle.id}')">
            🛒 Add Bundle to Cart
          </button>
          <a href="product-detail.html?id=${anchorId}" class="mc-cat-bundle-link">
            👁️ View Full Bundle Details →
          </a>
        </div>
      </div>
    `;
  }).join('');

  section.style.display = 'block';
}

window.addCatBundleToCart = function(bundleId) {
  const allBundles = getCategoryStoredBundles();
  const bundle = allBundles.find(b => b.id === bundleId);
  if (!bundle) return;

  const items = (bundle.productIds || []).map(id => getProductFromAnyCatalog(id)).filter(Boolean);
  if (items.length === 0) return;

  if (window.MedicareCart && typeof window.MedicareCart.addItem === 'function') {
    items.forEach(bp => {
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

  // Sync category cart UI
  if (typeof renderCartDrawer === 'function') renderCartDrawer();
  if (catCartOverlay) catCartOverlay.classList.add('open');
  showToast(`⚡ Added ${bundle.name} (${items.length} items) to cart!`);
};

/* ------------------------------------------------------------------
   ACTIVE FILTER CHIPS
   ------------------------------------------------------------------ */
function renderChips({ specialties, materials, brands, minRating, minPrice, maxPrice }) {
  if (!chipsBar) return;

  const chips = [];

  specialties.forEach(s => chips.push({ label: specialtyLabel(s), key: 'specialty', val: s }));
  materials.forEach(m   => chips.push({ label: `Material: ${m}`, key: 'material', val: m }));
  brands.forEach(b       => chips.push({ label: `Brand: ${b}`, key: 'brand', val: b }));
  selectedSizes.forEach(s => chips.push({ label: `Size: ${s}`, key: 'size', val: s }));
  selectedColors.forEach(c => chips.push({ label: `Color: ${c}`, key: 'color', val: c }));
  if (minPrice > 0)           chips.push({ label: `Min: ${formatPrice(minPrice)}`, key: 'price-min', val: minPrice });
  if (maxPrice < 50000)       chips.push({ label: `Max: ${formatPrice(maxPrice)}`, key: 'price-max', val: maxPrice });
  if (minRating > 0)          chips.push({ label: `⭐ ${minRating}+`, key: 'rating', val: minRating });

  if (chips.length === 0) {
    chipsBar.innerHTML = '';
    chipsBar.classList.remove('has-chips');
    return;
  }

  chipsBar.classList.add('has-chips');
  chipsBar.innerHTML = chips.map(c => `
    <span class="mc-chip">
      ${c.label}
      <button class="mc-chip-remove" onclick="removeChip('${c.key}', '${c.val}')" aria-label="Remove filter ${c.label}">✕</button>
    </span>
  `).join('') + `<button class="mc-clear-all-btn" onclick="clearAllFilters()">✕ Clear all</button>`;
}

window.removeChip = function(key, val) {
  if (key === 'specialty' || key === 'material' || key === 'brand') {
    document.querySelectorAll(`input[name="${key}"][value="${val}"]`).forEach(cb => cb.checked = false);
  } else if (key === 'size') {
    selectedSizes.delete(val);
    document.querySelectorAll(`.mc-size-btn[data-size="${val}"]`).forEach(b => b.classList.remove('active'));
  } else if (key === 'color') {
    selectedColors.delete(val);
    document.querySelectorAll(`.mc-color-filter-swatch[data-color="${val}"]`).forEach(b => b.classList.remove('active'));
  } else if (key === 'price-min') {
    document.getElementById('price-min').value = 0;
    updatePriceRange();
  } else if (key === 'price-max') {
    document.getElementById('price-max').value = 50000;
    updatePriceRange();
  } else if (key === 'rating') {
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  }
  applyFilters();
};

window.clearAllFilters = function() {
  document.querySelectorAll('input[name="specialty"], input[name="material"], input[name="brand"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  document.querySelectorAll('.mc-size-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mc-color-filter-swatch').forEach(b => b.classList.remove('active'));
  selectedSizes.clear();
  selectedColors.clear();
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (minEl) minEl.value = 0;
  if (maxEl) maxEl.value = 50000;
  updatePriceRange();
  applyFilters();
  showToast('All filters cleared');
};

function updateFilterBadge() {
  const count = [...document.querySelectorAll('input[name="specialty"]:checked, input[name="material"]:checked, input[name="brand"]:checked, input[name="rating"]:checked')].length
    + selectedSizes.size + selectedColors.size;
  const badge = document.getElementById('filter-count-badge');
  if (!badge) return;
  if (count > 0) { badge.style.display = ''; badge.textContent = count; }
  else { badge.style.display = 'none'; }
}

/* ------------------------------------------------------------------
   PRICE RANGE
   ------------------------------------------------------------------ */
window.updatePriceRange = function() {
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  const fillEl = document.getElementById('range-fill');
  const minLabel = document.getElementById('price-min-label');
  const maxLabel = document.getElementById('price-max-label');
  if (!minEl || !maxEl) return;

  let min = parseInt(minEl.value);
  let max = parseInt(maxEl.value);
  if (min > max) { const t = min; min = max; max = t; minEl.value = min; maxEl.value = max; }

  if (minLabel) minLabel.textContent = formatPrice(min);
  if (maxLabel) maxLabel.textContent = formatPrice(max);

  const pct1 = (min / 50000) * 100;
  const pct2 = (max / 50000) * 100;
  if (fillEl) { fillEl.style.left = pct1 + '%'; fillEl.style.width = (pct2 - pct1) + '%'; }

  // Sync mobile sliders if they exist
  const mMin = document.getElementById('m-price-min');
  const mMax = document.getElementById('m-price-max');
  if (mMin) mMin.value = min;
  if (mMax) mMax.value = max;
  updateMobilePriceRange();

  applyFilters();
};

window.updateMobilePriceRange = function() {
  const minEl = document.getElementById('m-price-min');
  const maxEl = document.getElementById('m-price-max');
  const fillEl = document.getElementById('m-range-fill');
  const minLabel = document.getElementById('m-price-min-label');
  const maxLabel = document.getElementById('m-price-max-label');
  if (!minEl || !maxEl) return;

  let min = parseInt(minEl.value);
  let max = parseInt(maxEl.value);
  if (min > max) { const t = min; min = max; max = t; minEl.value = min; maxEl.value = max; }

  if (minLabel) minLabel.textContent = formatPrice(min);
  if (maxLabel) maxLabel.textContent = formatPrice(max);

  const pct1 = (min / 50000) * 100;
  const pct2 = (max / 50000) * 100;
  if (fillEl) { fillEl.style.left = pct1 + '%'; fillEl.style.width = (pct2 - pct1) + '%'; }

  // Sync desktop sliders
  const dMin = document.getElementById('price-min');
  const dMax = document.getElementById('price-max');
  if (dMin) dMin.value = min;
  if (dMax) dMax.value = max;

  applyFilters();
};

/* ------------------------------------------------------------------
   SIZE TOGGLE
   ------------------------------------------------------------------ */
window.toggleSize = function(btn) {
  const size = btn.dataset.size;
  if (selectedSizes.has(size)) {
    selectedSizes.delete(size);
    btn.classList.remove('active');
  } else {
    selectedSizes.add(size);
    btn.classList.add('active');
  }
  // Sync all same-size buttons
  document.querySelectorAll(`.mc-size-btn[data-size="${size}"]`).forEach(b => b.classList.toggle('active', selectedSizes.has(size)));
  applyFilters();
};

/* ------------------------------------------------------------------
   COLOR TOGGLE
   ------------------------------------------------------------------ */
window.toggleColor = function(btn) {
  const color = btn.dataset.color;
  if (selectedColors.has(color)) {
    selectedColors.delete(color);
    btn.classList.remove('active');
  } else {
    selectedColors.add(color);
    btn.classList.add('active');
  }
  document.querySelectorAll(`.mc-color-filter-swatch[data-color="${color}"]`).forEach(b => b.classList.toggle('active', selectedColors.has(color)));
  applyFilters();
};

/* ------------------------------------------------------------------
   FILTER GROUP ACCORDION TOGGLE
   ------------------------------------------------------------------ */
window.toggleGroup = function(header) {
  const group = header.closest('.mc-filter-group');
  group.classList.toggle('collapsed');
};

/* ------------------------------------------------------------------
   MOBILE FILTER SHEET
   ------------------------------------------------------------------ */
function openFilterSheet()  { filterOverlay?.classList.add('open'); document.body.style.overflow = 'hidden'; }
window.closeFilterSheet = function() { filterOverlay?.classList.remove('open'); document.body.style.overflow = ''; }

if (filterTrigger)  filterTrigger.addEventListener('click', openFilterSheet);
if (filterSheetClose) filterSheetClose.addEventListener('click', closeFilterSheet);
if (filterOverlay) filterOverlay.addEventListener('click', e => { if (e.target === filterOverlay) closeFilterSheet(); });
if (sidebarReset)  sidebarReset.addEventListener('click', clearAllFilters);

/* ------------------------------------------------------------------
   VIEW TOGGLE (Grid / List) — Defaults to List View
   ------------------------------------------------------------------ */
function setViewMode(mode) {
  if (!productGrid) return;
  if (mode === 'list') {
    productGrid.classList.add('list-view');
    listViewBtn?.classList.add('active');
    gridViewBtn?.classList.remove('active');
    try { localStorage.setItem('medicare_view_mode', 'list'); } catch (_) {}
  } else {
    productGrid.classList.remove('list-view');
    gridViewBtn?.classList.add('active');
    listViewBtn?.classList.remove('active');
    try { localStorage.setItem('medicare_view_mode', 'grid'); } catch (_) {}
  }
}
window.setViewMode = setViewMode;

if (gridViewBtn) gridViewBtn.addEventListener('click', () => setViewMode('grid'));
if (listViewBtn) listViewBtn.addEventListener('click', () => setViewMode('list'));

/* ------------------------------------------------------------------
   SORT
   ------------------------------------------------------------------ */
if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; renderPage(); });

/* ------------------------------------------------------------------
   CART
   ------------------------------------------------------------------ */
window.addToCart = function(event, id, name, nameAr, price, img) {
  event.stopPropagation();
  const btn = document.getElementById(`add-btn-${id}`);

  if (window.MedicareCart) {
    window.MedicareCart.addItem({
      productId: id,
      id: id,
      name: name,
      nameAr: nameAr,
      price: price,
      qty: 1,
      image: img
    });
  }

  // Button feedback
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = '🛒 Add to Cart'; btn.classList.remove('added'); }, 1600);
  }

  showToast(`✓ "${name}" added to cart!`);
  renderCartDrawer();
  catCartOverlay?.classList.add('open');
};

function renderCartDrawer() {
  const body = document.getElementById('cat-cart-body');
  const totalEl = document.getElementById('cat-cart-total');
  const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
  const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;
  const subtotal = window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;

  if (catCartBadge) catCartBadge.textContent = totalQty;
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">Your cart is empty.</div>';
    if (totalEl) totalEl.textContent = '0 DZD';
    return;
  }

  body.innerHTML = cart.map((item, idx) => {
    const displayName = item.nameAr || item.name;
    const imgSrc = item.image || item.img;
    return `
      <div class="mc-cart-item">
        <img src="${imgSrc}" class="mc-cart-item-img" alt="${displayName}">
        <div class="mc-cart-item-info">
          <span class="mc-cart-item-title">${displayName}</span>
          <span class="mc-cart-item-price">${formatPrice(item.price)}</span>
          <div class="mc-cart-qty-ctrl">
            <button class="mc-qty-btn" onclick="catUpdateQty(${idx},-1)">−</button>
            <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
            <button class="mc-qty-btn" onclick="catUpdateQty(${idx},1)">+</button>
          </div>
        </div>
        <button onclick="catUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px;padding:0 0.25rem">✕</button>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}
window.renderCart = renderCartDrawer;
window.renderCartDrawer = renderCartDrawer;

window.catUpdateQty = function(idx, delta) {
  if (window.MedicareCart) {
    window.MedicareCart.updateQty(idx, delta);
  }
  renderCartDrawer();
};

window.addEventListener('medicare_cart_updated', renderCartDrawer);

if (catCartBtn)    catCartBtn.addEventListener('click', () => { renderCartDrawer(); catCartOverlay?.classList.add('open'); });
if (catCartClose)  catCartClose.addEventListener('click', () => catCartOverlay?.classList.remove('open'));
if (catCartOverlay) catCartOverlay.addEventListener('click', e => { if (e.target === catCartOverlay) catCartOverlay.classList.remove('open'); });

/* ------------------------------------------------------------------
   WISHLIST TOGGLE
   ------------------------------------------------------------------ */
window.toggleWishlist = function(event, btn, name) {
  event.stopPropagation();
  btn.classList.toggle('active');
  showToast(btn.classList.contains('active') ? `♥ "${name}" saved to Wishlist` : 'Removed from Wishlist');
};

/* ------------------------------------------------------------------
   QUICK VIEW (placeholder modal)
   ------------------------------------------------------------------ */
window.quickView = function(event, id) {
  event.stopPropagation();
  const p = CATALOG.find(p => p.id === id);
  if (!p) return;
  showToast(`⚡ Quick view: "${p.name}"`);
};

/* ------------------------------------------------------------------
   CARD COLOR SWATCH SWAP
   ------------------------------------------------------------------ */
window.swapColor = function(event, id, color) {
  event.stopPropagation();
  const card = document.querySelector(`.mc-cat-card[data-id="${id}"]`);
  if (!card) return;
  card.querySelectorAll('.mc-card-swatch').forEach(s => s.classList.toggle('active', s.style.backgroundColor === color || s.dataset?.color === color));
};

/* ------------------------------------------------------------------
   SEARCH BAR (Comprehensive single-word & substring matcher)
   ------------------------------------------------------------------ */
function normalizeSearchText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove arabic tashkeel
    .trim();
}

function runCatalogSearch(query) {
  const rawQ = (query || '').trim();
  const q = normalizeSearchText(rawQ);
  const liveList = getLiveCatalog();
  
  if (!q) {
    filteredProducts = [...liveList];
    currentPage = 1;
    renderPage();
    return;
  }

  const tokens = q.split(/\s+/).filter(Boolean);

  filteredProducts = liveList.filter(p => {
    const pFields = [
      p.name,
      p.nameAr,
      p.name_ar,
      p.description,
      p.descriptionAr,
      p.description_ar,
      p.category,
      p.specialty,
      p.brand,
      p.material,
      p.sku
    ].filter(Boolean);

    const normText = normalizeSearchText(pFields.join(' '));

    // Match if full query is found OR every typed word/letter token matches
    return normText.includes(q) || tokens.every(tok => normText.includes(tok));
  });

  currentPage = 1;
  renderPage();
  renderChips({specialties:[],materials:[],brands:[],minRating:0,minPrice:0,maxPrice:50000});
}

const searchInput = document.getElementById('cat-search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    runCatalogSearch(searchInput.value);
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCatalogSearch(searchInput.value);
    }
  });
}

/* ------------------------------------------------------------------
   TRILINGUAL LANGUAGE TOGGLE & DISPATCHER
   ------------------------------------------------------------------ */
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
      applyFilters();
    }
  });
}

if (langDropdownMenu) {
  langDropdownMenu.querySelectorAll('.mc-lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.lang;
      if (window.MC_I18N) window.MC_I18N.setLang(selected);
      applyFilters();
      langDropdownMenu.classList.remove('show');
    });
  });

  document.addEventListener('click', e => {
    if (langToggleBtn && !langToggleBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
      langDropdownMenu.classList.remove('show');
    }
  });
}

window.addEventListener('medicare_language_changed', () => {
  applyFilters();
});

/* ------------------------------------------------------------------
   INIT — skeleton then render
   ------------------------------------------------------------------ */
// Expose applyFilters, runCatalogSearch and renderCategoryBundles globally
window.applyFilters = applyFilters;
window.runCatalogSearch = runCatalogSearch;
window.renderCategoryBundles = renderCategoryBundles;

document.addEventListener('DOMContentLoaded', async () => {
  const initialViewMode = (typeof localStorage !== 'undefined' && localStorage.getItem('medicare_view_mode')) || 'list';
  setViewMode(initialViewMode);

  // Check URL query parameters (e.g. ?specialty=medicine or ?search=scrub)
  let initialSearchQuery = '';
  try {
    const params = new URLSearchParams(window.location.search);
    const spec = params.get('specialty');
    if (spec && spec !== 'all') {
      const cb = document.querySelector(`input[name="specialty"][value="${spec}"]`);
      if (cb) cb.checked = true;
    }
    const sq = params.get('search') || params.get('q');
    if (sq) {
      initialSearchQuery = sq;
      if (searchInput) searchInput.value = sq;
    }
  } catch (e) {}

  // ── Immediately render products (zero wait time, zero dummy/skeleton flickering)
  updatePriceRange();
  if (initialSearchQuery) {
    runCatalogSearch(initialSearchQuery);
  } else {
    applyFilters();
  }
  renderCategoryBundles();

  // ── Fetch live products from Supabase async in background
  if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
    try {
      const sbProds = await window.MedicareDB.getProducts({ limit: 200 });
      if (Array.isArray(sbProds) && sbProds.length > 0) {
        _supabaseProducts = sbProds;
        // Re-render with the fresh Supabase data
        if (searchInput && searchInput.value.trim()) {
          runCatalogSearch(searchInput.value);
        } else {
          applyFilters();
        }
        renderCategoryBundles();
      }
    } catch (e) {
      console.warn('[Category] Supabase getProducts failed:', e);
    }
  }
});

window.addEventListener('medicare_bundles_updated', renderCategoryBundles);
window.addEventListener('medicare_stock_updated', () => {
  applyFilters();
});
window.addEventListener('medicare_products_updated', () => {
  applyFilters();
});
window.addEventListener('storage', (e) => {
  if (e.key === 'medicare_stock_overrides' || e.key === 'medicare_custom_products') {
    applyFilters();
  }
});

