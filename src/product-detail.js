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
     2. FULL LOCAL CATALOG (fallback if Supabase not yet seeded)
     ------------------------------------------------------------------ */
  const LOCAL_CATALOG = {
    'MC-101': {
      id: 'MC-101', name: 'Obsidian Flex Antimicrobial Scrub Set',
      name_ar: 'طقم سكراب أوبسيديان المضاد للبكتيريا',
      specialty: 'medicine', brand: 'MEDICARE PRO', sku: 'MC-101-OBS',
      price: 10700, original_price: 13400, rating: 4.8, reviews_count: 142,
      stock: 4, material: 'antimicrobial',
      description: 'Engineered for demanding 24-hour hospital shifts. Features 4-way flex stretch fabric, fluid-repellent nano-barrier, and Silver-Ion antimicrobial technology to keep you comfortable, cool, and protected all day.',
      colors: [
        { name: 'Obsidian Teal', hex: '#0E4D45', img: 'assets/medicare_scrubs_hero_1786614154492.png' },
        { name: 'Navy Blue',     hex: '#1E3A5F', img: 'assets/medicare_lab_coat_1786614177321.png' },
        { name: 'Slate Grey',    hex: '#6B7280', img: 'assets/medicare_medical_bag_1786614187700.png' },
        { name: 'Royal Blue',    hex: '#1D4ED8', img: 'assets/medicare_starter_kit_1786615195273.png' }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      images: [
        'assets/medicare_scrubs_hero_1786614154492.png',
        'assets/medicare_lab_coat_1786614177321.png',
        'assets/medicare_starter_kit_1786615195273.png',
        'assets/medicare_medical_bag_1786614187700.png'
      ]
    },
    'MC-102': {
      id: 'MC-102', name: 'ClinFlex 4-Way Stretch Scrub Pants',
      name_ar: 'بنطلون سكراب مرن بـ 4 اتجاهات',
      specialty: 'nursing', brand: 'ClinFlex', sku: 'MC-102-CLF',
      price: 6800, original_price: null, rating: 4.7, reviews_count: 98,
      stock: 28, material: 'flex',
      description: 'Ultra-flexible nursing scrub pants with deep side pockets, adjustable waistband, and moisture-wicking fabric for long shifts.',
      colors: [
        { name: 'Teal Green',  hex: '#0F766E', img: 'assets/medicare_scrubs_hero_1786614154492.png' },
        { name: 'Deep Purple', hex: '#7C3AED', img: 'assets/medicare_lab_coat_1786614177321.png' },
        { name: 'Ocean Blue',  hex: '#1D4ED8', img: 'assets/medicare_footwear_1786615096505.png' }
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      images: ['assets/medicare_scrubs_hero_1786614154492.png', 'assets/medicare_lab_coat_1786614177321.png']
    },
    'MC-103': {
      id: 'MC-103', name: 'Executive Fluid-Shield Lab Coat',
      name_ar: 'معطف مختبر مقاوم للسوائل',
      specialty: 'pharmacy', brand: 'MEDICARE PRO', sku: 'MC-103-EXC',
      price: 13400, original_price: 16700, rating: 4.9, reviews_count: 211,
      stock: 58, material: 'fluid-shield',
      description: 'Tailored fit lab coat with stain-repellent nano-coating, reinforced tablet pockets, and optional custom name embroidery. Fluid-Shield barrier keeps you protected during procedures.',
      colors: [
        { name: 'Clinical White', hex: '#F8F8F8', img: 'assets/medicare_lab_coat_1786614177321.png' },
        { name: 'Navy Blue',      hex: '#1E3A5F', img: 'assets/medicare_scrubs_hero_1786614154492.png' }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: ['assets/medicare_lab_coat_1786614177321.png', 'assets/medicare_scrubs_hero_1786614154492.png']
    },
    'MC-108': {
      id: 'MC-108', name: 'Titanium Master Diagnostic Stethoscope',
      name_ar: 'سماعة تيتانيوم الدقيقة',
      specialty: 'medicine', brand: 'MEDICARE PRO', sku: 'MC-108-STH',
      price: 19800, original_price: 24000, rating: 5.0, reviews_count: 317,
      stock: 9, material: 'antimicrobial',
      description: 'Ultra-sensitive acoustic response with ergonomic brushed titanium chestpiece. Dual-frequency diaphragm for precision adult/pediatric auscultation. Includes lifetime calibration warranty.',
      colors: [
        { name: 'Obsidian Teal', hex: '#0E4D45', img: 'assets/medicare_stethoscope_1786614166370.png' },
        { name: 'Gunmetal',      hex: '#1E3A5F', img: 'assets/medicare_stethoscope_1786614166370.png' },
        { name: 'Slate Grey',    hex: '#6B7280', img: 'assets/medicare_stethoscope_1786614166370.png' }
      ],
      sizes: ['ONE'],
      images: ['assets/medicare_stethoscope_1786614166370.png', 'assets/medicare_lab_coat_1786614177321.png']
    },
    'MC-110': {
      id: 'MC-110', name: 'Clinical Cushion Antibacterial Clogs',
      name_ar: 'قبقاب طبي بمقدمة مغلقة',
      specialty: 'nursing', brand: 'MEDICARE PRO', sku: 'MC-110-CLG',
      price: 9000, original_price: 11300, rating: 4.5, reviews_count: 128,
      stock: 15, material: 'antimicrobial',
      description: 'Liquid-repellent, slip-resistant clogs with antimicrobial treated insoles. Shock-absorbing cushion sole prevents joint fatigue during long hospital rotations. Easy-clean surface.',
      colors: [
        { name: 'Obsidian Teal',  hex: '#0E4D45', img: 'assets/medicare_footwear_1786615096505.png' },
        { name: 'Clinical White', hex: '#F8F8F8', img: 'assets/medicare_footwear_1786615096505.png' },
        { name: 'Navy Blue',      hex: '#1E3A5F', img: 'assets/medicare_footwear_1786615096505.png' }
      ],
      sizes: ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
      images: ['assets/medicare_footwear_1786615096505.png', 'assets/medicare_scrubs_hero_1786614154492.png']
    },
    'MC-112': {
      id: 'MC-112', name: '1st Year Pharmacy Starter Kit',
      name_ar: 'حقيبة الصيدلة — السنة الأولى',
      specialty: 'pharmacy', brand: 'MEDICARE PRO', sku: 'MC-112-PHK',
      price: 17400, original_price: 23400, rating: 4.9, reviews_count: 183,
      stock: 5, material: 'bundle',
      description: 'Everything a 1st-year pharmacy student needs: Lab coat (M), stethoscope, BP monitor, pulse oximeter, clinical bag, and a MEDICARE primer booklet. Includes a special 25% bundle discount.',
      colors: [
        { name: 'Obsidian Teal', hex: '#0E4D45', img: 'assets/medicare_starter_kit_1786615195273.png' }
      ],
      sizes: ['ONE'],
      images: ['assets/medicare_starter_kit_1786615195273.png', 'assets/medicare_medical_bag_1786614187700.png']
    }
  };

  /* ------------------------------------------------------------------
     3. FETCH PRODUCT DATA (Supabase first, then local fallback)
     ------------------------------------------------------------------ */
  let product = null;

  if (productId) {
    // Try Supabase
    if (window.MedicareDB && typeof window.MedicareDB.getProductById === 'function') {
      try {
        const dbProduct = await window.MedicareDB.getProductById(productId);
        if (dbProduct && dbProduct.id) {
          // Normalize DB product to PDP format
          product = {
            id: dbProduct.id,
            name: dbProduct.name,
            name_ar: dbProduct.name_ar || dbProduct.name,
            specialty: dbProduct.specialty,
            brand: dbProduct.brand || 'MEDICARE PRO',
            sku: dbProduct.id,
            price: Number(dbProduct.price),
            original_price: dbProduct.original_price ? Number(dbProduct.original_price) : null,
            rating: dbProduct.rating || 4.8,
            reviews_count: dbProduct.reviews_count || 0,
            stock: dbProduct.stock || 10,
            material: dbProduct.material || '',
            description: dbProduct.description || '',
            colors: Array.isArray(dbProduct.colors)
              ? dbProduct.colors.map((c, i) => ({
                  name: typeof c === 'string' ? c : (c.name || c),
                  hex: typeof c === 'string' ? '#0E4D45' : (c.hex || '#0E4D45'),
                  img: Array.isArray(dbProduct.images) ? (dbProduct.images[i] || dbProduct.images[0]) : (dbProduct.images || 'assets/medicare_scrubs_hero_1786614154492.png')
                }))
              : [{ name: 'Obsidian Teal', hex: '#0E4D45', img: dbProduct.images?.[0] || 'assets/medicare_scrubs_hero_1786614154492.png' }],
            sizes: Array.isArray(dbProduct.sizes) ? dbProduct.sizes : ['S','M','L','XL'],
            images: Array.isArray(dbProduct.images) ? dbProduct.images : [dbProduct.img || 'assets/medicare_scrubs_hero_1786614154492.png']
          };
        }
      } catch (e) {
        console.warn('[PDP] Supabase fetch failed:', e);
      }
    }
    // Local fallback
    if (!product) {
      product = LOCAL_CATALOG[productId] || null;
    }
  }

  /* ------------------------------------------------------------------
     4. "PRODUCT NOT FOUND" STATE
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
     5. RENDER ALL DYNAMIC CONTENT INTO THE PAGE
     ------------------------------------------------------------------ */

  // Page title & meta
  document.title = `${product.name} — MEDICARE`;

  // Breadcrumb
  const breadcrumbCurrent = document.querySelector('.mc-breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

  // Brand / SKU row
  const brandTagEl = document.querySelector('.pdp-brand-tag');
  if (brandTagEl) brandTagEl.textContent = `${product.brand} | ${product.specialty.toUpperCase()}`;
  const skuEl = document.querySelector('.pdp-sku');
  if (skuEl) skuEl.textContent = `SKU: ${product.sku}`;

  // Title
  const titleEl = document.querySelector('.pdp-title');
  if (titleEl) titleEl.textContent = product.name;

  // Rating
  const ratingStarsEl = document.querySelector('.pdp-stars-val');
  if (ratingStarsEl) {
    const stars = '★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating));
    ratingStarsEl.textContent = `${stars} ${product.rating}`;
  }
  const ratingCountEl = document.querySelector('.mc-review-count');
  if (ratingCountEl) ratingCountEl.textContent = `(${product.reviews_count} verified reviews)`;

  // Price box
  const currentPriceEl = document.querySelector('.pdp-current-price');
  if (currentPriceEl) currentPriceEl.textContent = `${product.price.toLocaleString()} DZD`;
  const originalPriceEl = document.querySelector('.pdp-original-price');
  if (originalPriceEl) {
    if (product.original_price) {
      originalPriceEl.textContent = `${product.original_price.toLocaleString()} DZD`;
      originalPriceEl.style.display = '';
    } else {
      originalPriceEl.style.display = 'none';
    }
  }
  const saveBadgeEl = document.querySelector('.pdp-save-badge');
  if (saveBadgeEl) {
    if (product.original_price) {
      const saved = product.original_price - product.price;
      saveBadgeEl.textContent = `SAVE ${saved.toLocaleString()} DZD`;
      saveBadgeEl.style.display = '';
    } else {
      saveBadgeEl.style.display = 'none';
    }
  }

  // Stock indicator
  const stockEl = document.getElementById('pdp-stock-indicator');
  if (stockEl) {
    if (product.stock <= 0) {
      stockEl.innerHTML = '<span class="pdp-stock-dot"></span><span>Out of Stock</span>';
      stockEl.className = 'pdp-stock-indicator out-of-stock';
    } else if (product.stock <= 10) {
      stockEl.innerHTML = `<span class="pdp-stock-dot"></span><span>In Stock — <strong style="color:var(--color-accent-700)">Only ${product.stock} left!</strong></span>`;
      stockEl.className = 'pdp-stock-indicator low-stock';
    } else {
      stockEl.innerHTML = `<span class="pdp-stock-dot"></span><span>In Stock — ${product.stock} available</span>`;
      stockEl.className = 'pdp-stock-indicator in-stock';
    }
  }

  // Short description
  const shortDescEl = document.querySelector('.pdp-short-desc');
  if (shortDescEl && product.description) shortDescEl.textContent = product.description;

  // --- GALLERY ---
  const mainImg = document.getElementById('pdp-main-img');
  if (mainImg && product.images && product.images.length > 0) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }
  const thumbsContainer = document.querySelector('.pdp-thumbnails');
  if (thumbsContainer && product.images) {
    thumbsContainer.innerHTML = product.images.map((src, i) => `
      <button class="pdp-thumb ${i === 0 ? 'active' : ''}" onclick="switchMainImage(this, '${src}')">
        <img src="${src}" alt="${product.name} view ${i + 1}">
      </button>`
    ).join('');
  }

  // --- COLORS ---
  const colorOptionsEl = document.querySelector('.pdp-color-options');
  if (colorOptionsEl && product.colors && product.colors.length > 0) {
    colorOptionsEl.innerHTML = product.colors.map((c, i) => `
      <button class="pdp-color-btn ${i === 0 ? 'active' : ''}"
        data-color="${c.name}" data-img="${c.img}"
        onclick="selectColor(this)">
        <span class="pdp-color-swatch-dot" style="background:${c.hex}"></span>
        <span class="pdp-color-name">${c.name}</span>
      </button>`
    ).join('');
    const colorNameEl = document.getElementById('selected-color-name');
    if (colorNameEl) colorNameEl.textContent = product.colors[0].name;
    productData.selectedColor = product.colors[0].name;
  }

  // --- SIZES ---
  const sizeOptionsEl = document.querySelector('.pdp-size-options');
  if (sizeOptionsEl && product.sizes && product.sizes.length > 0) {
    if (product.sizes.length === 1 && product.sizes[0] === 'ONE') {
      sizeOptionsEl.innerHTML = `<button class="pdp-size-btn active" data-size="ONE SIZE" onclick="selectSize(this)">One Size</button>`;
    } else {
      sizeOptionsEl.innerHTML = product.sizes.map((s, i) => `
        <button class="pdp-size-btn ${i === 0 ? 'active' : ''}" data-size="${s}" onclick="selectSize(this)">${s}</button>`
      ).join('');
    }
    const sizeNameEl = document.getElementById('selected-size-name');
    if (sizeNameEl) sizeNameEl.textContent = product.sizes[0] === 'ONE' ? 'One Size' : product.sizes[0];
    productData.selectedSize = product.sizes[0];
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
     7. RELATED PRODUCTS DYNAMIC RENDER
     ------------------------------------------------------------------ */
  const relatedSection = document.getElementById('related-products-grid');
  if (relatedSection) {
    const related = Object.values(LOCAL_CATALOG)
      .filter(p => p.id !== product.id && p.specialty === product.specialty)
      .slice(0, 4);
    if (related.length === 0) {
      const allOthers = Object.values(LOCAL_CATALOG).filter(p => p.id !== product.id).slice(0, 4);
      related.push(...allOthers);
    }
    relatedSection.innerHTML = related.map(p => `
      <div class="pdp-related-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
        <div class="pdp-related-img-wrap">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
        </div>
        <div class="pdp-related-info">
          <div class="pdp-related-name">${p.name}</div>
          <div class="pdp-related-price">${p.price.toLocaleString()} DZD</div>
        </div>
        <button class="mc-btn mc-btn-primary mc-btn-sm" style="margin-top:0.5rem;width:100%;"
          onclick="event.stopPropagation(); if(window.MedicareCart) window.MedicareCart.addItem({productId:'${p.id}',id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price},qty:1,image:'${p.images[0]}'})">
          🛒 Quick Add
        </button>
      </div>`
    ).join('');
  }

  // Also try DB for related products
  if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
    try {
      const dbRelated = await window.MedicareDB.getProducts({ specialty: product.specialty, limit: 5 });
      if (dbRelated && dbRelated.length > 1 && relatedSection) {
        const filtered = dbRelated.filter(p => p.id !== product.id).slice(0, 4);
        if (filtered.length > 0) {
          relatedSection.innerHTML = filtered.map(p => `
            <div class="pdp-related-card" onclick="window.location.href='product-detail.html?id=${p.id}'" style="cursor:pointer;">
              <div class="pdp-related-img-wrap">
                <img src="${(p.images||[])[0]||'assets/medicare_scrubs_hero_1786614154492.png'}" alt="${p.name}" loading="lazy">
              </div>
              <div class="pdp-related-info">
                <div class="pdp-related-name">${p.name}</div>
                <div class="pdp-related-price">${Number(p.price).toLocaleString()} DZD</div>
              </div>
              <button class="mc-btn mc-btn-primary mc-btn-sm" style="margin-top:0.5rem;width:100%;"
                onclick="event.stopPropagation(); if(window.MedicareCart) window.MedicareCart.addItem({productId:'${p.id}',id:'${p.id}',name:'${String(p.name).replace(/'/g,"\\'")}',price:${p.price},qty:1,image:'${(p.images||[])[0]||''}'})">
                🛒 Quick Add
              </button>
            </div>`
          ).join('');
        }
      }
    } catch (e) { /* silently ignore */ }
  }

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

  if (imageBox && zoomLens && mainImg) {
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
    wa.href = `https://wa.me/213550000000?text=${encodeURIComponent(msg)}`;
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

  window.pdpUpdateQty = function(idx, delta) {
    if (window.MedicareCart) window.MedicareCart.updateQty(idx, delta);
    renderCart();
  };

  window.addPDPToCart = function() {
    if (window.MedicareCart) {
      window.MedicareCart.addItem({
        productId: productData.id,
        id: productData.id,
        name: productData.title,
        nameAr: productData.titleAr,
        price: productData.price,
        qty: productData.qty || 1,
        size: productData.selectedSize,
        color: productData.selectedColor,
        image: productData.img
      });
    }
    renderCart();
    cartOverlay?.classList.add('open');
    showToast(`✓ Added to cart! (${productData.selectedSize || ''} · ${productData.selectedColor || ''})`);
  };

  window.addBundleToCart = function() {
    const bundleItems = [
      { productId:'MC-101', id:'MC-101', name:'Obsidian Flex Scrub Set',       nameAr:'سكراب أوبسيديان', price:10700, qty:1, image:'assets/medicare_scrubs_hero_1786614154492.png' },
      { productId:'MC-110', id:'MC-110', name:'Clinical Cushion Clogs',         nameAr:'قبقاب طبي',       price:9000,  qty:1, image:'assets/medicare_footwear_1786615096505.png' },
      { productId:'MC-108', id:'MC-108', name:'Titanium Master Stethoscope',    nameAr:'سماعة تيتانيوم',  price:19800, qty:1, image:'assets/medicare_stethoscope_1786614166370.png' }
    ];
    if (window.MedicareCart) bundleItems.forEach(b => window.MedicareCart.addItem(b));
    renderCart();
    cartOverlay?.classList.add('open');
    showToast('⚡ Complete Clinical Bundle added!');
  };

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
     17. LANGUAGE TOGGLE
     ------------------------------------------------------------------ */
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      document.documentElement.setAttribute('dir', isRTL ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', isRTL ? 'en' : 'ar');
      langToggleBtn.querySelector('.btn-text').textContent = isRTL ? 'العربية' : 'English';
      if (!isRTL && titleEl) titleEl.textContent = product.name_ar;
      if (isRTL  && titleEl) titleEl.textContent = product.name;
      showToast(isRTL ? '🌐 Switched to English' : '🌐 تم التبديل إلى العربية');
    });
  }

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
