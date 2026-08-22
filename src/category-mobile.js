/* ==========================================================================
   MEDICARE — MOBILE CATEGORY CAROUSEL & APP-STYLE BROWSING ENGINE
   Horizontal category pills, category carousels (2.2 cards visible),
   Supabase live data integration, persistent bottom navigation bar
   ========================================================================== */

(function() {
  'use strict';

  // Category Definitions in requested order
  const CATEGORIES = [
    {
      id: 'bestsellers',
      name: '🔥 Best Sellers & Featured',
      nameAr: '🔥 الأكثر مبيعاً والمميزة',
      filterKey: 'isBestSeller',
      filterVal: true,
      specialty: 'all',
      searchKeywords: []
    },
    {
      id: 'scrubs',
      name: '🩺 Scrubs & Medical Apparel',
      nameAr: '🩺 أطقم وسكرابات طبية',
      specialty: 'medicine',
      searchKeywords: ['scrub', 'pants', 'tunic', 'v-neck', 'jogger', 'طقم سكراب', 'بنطلون', 'سكراب']
    },
    {
      id: 'lab-coats',
      name: '🥼 Lab Coats & Blouses',
      nameAr: '🥼 معاطف ومآزر طبية',
      specialty: 'pharmacy',
      searchKeywords: ['lab coat', 'coat', 'blouse', 'apron', 'معطف', 'مريلة']
    },
    {
      id: 'calots',
      name: '🧢 Calots & Scrub Caps',
      nameAr: '🧢 طواقي وقبعات جراحية',
      specialty: 'medicine',
      searchKeywords: ['cap', 'calot', 'hat', 'طاقية', 'قبعة']
    },
    {
      id: 'footwear',
      name: '👟 Medical Clogs & Footwear',
      nameAr: '👟 أحذية وقباقيب طبية',
      specialty: 'nursing',
      searchKeywords: ['clog', 'shoe', 'footwear', 'socks', 'mat', 'قبقاب', 'جوارب', 'حذاء']
    },
    {
      id: 'diagnostic',
      name: '🔬 Diagnostic Tools & Instruments',
      nameAr: '🔬 أدوات الفحص والتشخيص',
      specialty: 'medicine',
      searchKeywords: ['stethoscope', 'pressure', 'diagnostic', 'visor', 'loupes', 'سماعة', 'جهاز', 'ضغط']
    },
    {
      id: 'starter-kits',
      name: '🎒 Starter Kits & Bundles',
      nameAr: '🎒 حقائب وباقات الطلاب والمقيمين',
      specialty: 'bundle',
      searchKeywords: ['kit', 'bundle', 'pack', 'bag', 'حقيبة', 'باقة']
    }
  ];

  let allProducts = [];
  let isCarouselMode = true;

  // DOM Elements
  let mobPillBar = null;
  let mobCarouselRoot = null;
  let mobBottomNav = null;
  let catLayout = null;
  let catHeader = null;
  let breadcrumbBar = null;

  /* ------------------------------------------------------------------
     1. INITIALIZATION & DATA FETCHING
     ------------------------------------------------------------------ */
  async function initMobileBrowsing() {
    mobPillBar = document.getElementById('mob-pill-bar');
    mobBottomNav = document.getElementById('mob-bottom-nav');
    catLayout = document.querySelector('.mc-cat-layout');
    catHeader = document.querySelector('.mc-cat-header');
    breadcrumbBar = document.querySelector('.mc-breadcrumb-bar');

    setupBottomNav();
    setupPillFilterEvents();
    setupHeaderSearch();

    // Check URL parameters (if specialty/category is specified, activate corresponding pill)
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || urlParams.get('specialty');

    if (initialCategory && initialCategory !== 'all') {
      const matchingPill = mobPillBar?.querySelector(`.mc-mob-pill[data-filter="${initialCategory}"]`);
      if (matchingPill) {
        mobPillBar.querySelectorAll('.mc-mob-pill').forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        matchingPill.classList.add('active');
        matchingPill.setAttribute('aria-selected', 'true');
      }
      if (typeof window.setCategoryFilter === 'function') {
        window.setCategoryFilter(initialCategory);
      }
    }

    // Live update bottom nav cart badge
    updateMobCartBadge();
    window.addEventListener('medicare_cart_updated', updateMobCartBadge);
  }

  async function fetchAllProducts() {
    // 1. Try Supabase via window.MedicareDB
    if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        const sbData = await window.MedicareDB.getProducts({ limit: 100 });
        if (sbData && sbData.length > 0) {
          // Normalize Supabase format to standard catalog format
          return sbData.map(p => ({
            id: p.id,
            name: p.name,
            nameAr: p.name_ar || p.nameAr || p.name,
            price: Number(p.price) || 0,
            originalPrice: p.original_price ? Number(p.original_price) : (p.originalPrice || null),
            specialty: p.specialty || 'medicine',
            badge: p.badge || null,
            isBestSeller: p.is_bestseller ?? p.isBestSeller ?? false,
            isNew: p.is_new ?? p.isNew ?? false,
            rating: p.rating || 4.8,
            reviews: p.reviews_count || p.reviews || 45,
            img: (Array.isArray(p.images) && p.images[0]) ? p.images[0] : (p.img || 'assets/medicare_scrubs_hero_1786614154492.png'),
            img2: (Array.isArray(p.images) && p.images[1]) ? p.images[1] : (p.img2 || p.img || 'assets/medicare_lab_coat_1786614177321.png'),
            colors: p.colors || ['#0E4D45'],
            sizes: p.sizes || ['S', 'M', 'L']
          }));
        }
      } catch (err) {
        console.warn('[CategoryMobile] Supabase fetch fallback to CATALOG:', err);
      }
    }

    // 2. Fallback to local CATALOG
    if (window.CATALOG && Array.isArray(window.CATALOG)) {
      return [...window.CATALOG];
    }

    return [];
  }

  /* ------------------------------------------------------------------
     2. CATEGORY SEGREGATION
     ------------------------------------------------------------------ */
  function getProductsForCategory(catDef, products) {
    const list = [...products];

    if (catDef.id === 'bestsellers') {
      return list
        .filter(p => p.isBestSeller || (p.badge === 'hot' || p.badge === 'sale') || p.rating >= 4.8)
        .slice(0, 8);
    }

    // Match by keywords in name or specialty
    return list.filter(p => {
      const nameLower = (p.name + ' ' + (p.nameAr || '')).toLowerCase();
      const matchesKeyword = catDef.searchKeywords.some(kw => nameLower.includes(kw.toLowerCase()));
      const matchesSpecialty = catDef.specialty && p.specialty === catDef.specialty;
      return matchesKeyword || (catDef.searchKeywords.length === 0 && matchesSpecialty);
    }).slice(0, 8);
  }

  /* ------------------------------------------------------------------
     3. CAROUSEL RENDERING
     ------------------------------------------------------------------ */
  function renderCarousels(products) {
    if (!mobCarouselRoot) return;

    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';

    let html = '';

    CATEGORIES.forEach((cat) => {
      const catProducts = getProductsForCategory(cat, products);
      if (catProducts.length === 0) return;

      const title = isRtl ? (cat.nameAr || cat.name) : cat.name;
      const viewAllText = isRtl ? 'عرض الكل' : 'View all';
      const chevron = isRtl ? '‹' : '›';

      html += `
        <section class="mc-mob-cat-section" data-category-id="${cat.id}">
          <!-- Section Header -->
          <div class="mc-mob-cat-header">
            <h2 class="mc-mob-cat-title">${title}</h2>
            <button class="mc-mob-cat-chevron-btn" onclick="window.MedicareMobile.openCategoryGrid('${cat.id}')" aria-label="${viewAllText} ${title}">
              <span class="mc-mob-cat-viewall">${viewAllText}</span>
              <span class="mc-mob-cat-chevron">${chevron}</span>
            </button>
          </div>

          <!-- Horizontal Product Row (~2.2 cards visible) -->
          <div class="mc-mob-carousel-track" role="region" aria-label="${title} carousel">
            ${catProducts.map(p => renderProductCard(p)).join('')}
            
            <!-- Final "View All" card -->
            <div class="mc-mob-card mc-mob-card-more" onclick="window.MedicareMobile.openCategoryGrid('${cat.id}')">
              <div class="mc-mob-more-icon">➔</div>
              <span class="mc-mob-more-text">${viewAllText}</span>
              <span class="mc-mob-more-sub">${catProducts.length}+ items</span>
            </div>
          </div>
        </section>
      `;
    });

    mobCarouselRoot.innerHTML = html;
  }

  function renderProductCard(p) {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    const displayName = isRtl ? (p.nameAr || p.name) : p.name;
    const formattedPrice = (p.price || 0).toLocaleString('fr-DZ') + ' DZD';
    
    let originalPriceHtml = '';
    if (p.originalPrice && p.originalPrice > p.price) {
      const origFormatted = p.originalPrice.toLocaleString('fr-DZ') + ' DZD';
      originalPriceHtml = `<span class="mc-mob-card-orig-price">${origFormatted}</span>`;
    }

    // Badges
    let badgeHtml = '';
    if (p.badge === 'sale' && p.originalPrice) {
      const pct = Math.round((1 - p.price / p.originalPrice) * 100);
      badgeHtml = `<span class="mc-mob-card-badge mc-badge-sale">−${pct}%</span>`;
    } else if (p.badge === 'hot' || p.isBestSeller) {
      badgeHtml = `<span class="mc-mob-card-badge mc-badge-hot">🔥 Top</span>`;
    } else if (p.badge === 'new' || p.isNew) {
      badgeHtml = `<span class="mc-mob-card-badge mc-badge-new">New</span>`;
    }

    const ratingStars = '★'.repeat(Math.floor(p.rating || 5)) + ((p.rating || 5) % 1 >= 0.5 ? '½' : '');

    return `
      <div class="mc-mob-card" data-product-id="${p.id}" onclick="window.location.href='product-detail.html?id=${p.id}'">
        <div class="mc-mob-card-img-wrap">
          <img src="${p.img}" alt="${displayName}" class="mc-mob-card-img" loading="lazy">
          ${badgeHtml}
          <button class="mc-mob-card-wishlist" onclick="event.stopPropagation(); window.MedicareMobile.toggleWishlist(event, this, '${p.name.replace(/'/g, "\\'")}')" aria-label="Save to wishlist">♥</button>
        </div>
        <div class="mc-mob-card-info">
          <div class="mc-mob-card-rating"><span class="mc-mob-stars">${ratingStars}</span> <span class="mc-mob-reviews">(${p.reviews || 45})</span></div>
          <h3 class="mc-mob-card-title">${displayName}</h3>
          <div class="mc-mob-card-pricing">
            <span class="mc-mob-card-price">${formattedPrice}</span>
            ${originalPriceHtml}
          </div>
          <button class="mc-mob-card-add-btn" onclick="event.stopPropagation(); window.MedicareMobile.quickAddToCart(event, '${p.id}', '${p.name.replace(/'/g, "\\'")}', '${(p.nameAr || p.name).replace(/'/g, "\\'")}', ${p.price}, '${p.img}')" aria-label="Add ${displayName} to cart">
            <span>🛒</span> <span>Add to Cart</span>
          </button>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------
     4. PILL FILTER BAR INTERACTIONS
     ------------------------------------------------------------------ */
  function setupPillFilterEvents() {
    if (!mobPillBar) return;

    const pills = mobPillBar.querySelectorAll('.mc-mob-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        const filterVal = pill.getAttribute('data-filter');

        const catPageTitle = document.getElementById('cat-page-title');
        const catDef = CATEGORIES.find(c => c.id === filterVal);

        if (catPageTitle) {
          if (filterVal === 'all') {
            catPageTitle.textContent = 'All Medical Products & Essentials';
          } else if (catDef) {
            catPageTitle.textContent = catDef.name.replace(/^[^\w\s\u0600-\u06FF]+/, '').trim();
          }
        }

        if (typeof window.setCategoryFilter === 'function') {
          window.setCategoryFilter(filterVal);
        } else if (typeof window.applyFilters === 'function') {
          window.applyFilters();
        }

        const catHeader = document.querySelector('.mc-cat-header');
        if (catHeader) {
          catHeader.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     6. SEARCH BAR IN STICKY HEADER
     ------------------------------------------------------------------ */
  function setupHeaderSearch() {
    const searchInput = document.getElementById('cat-search-input');
    if (!searchInput) return;

    searchInput.addEventListener('focus', () => {
      // When searching on mobile, ensure grid mode is visible so results show instantly
      if (window.innerWidth < 1024 && isCarouselMode && searchInput.value.trim().length > 0) {
        switchToGridMode('all');
      }
    });

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query.length > 0 && isCarouselMode && window.innerWidth < 1024) {
        switchToGridMode('all');
      } else if (query.length === 0 && !isCarouselMode && window.innerWidth < 1024) {
        // Return to carousels if query is cleared
        showCarouselView();
      }
    });
  }

  /* ------------------------------------------------------------------
     7. BOTTOM NAVIGATION BAR
     ------------------------------------------------------------------ */
  function setupBottomNav() {
    if (!mobBottomNav) return;

    const cartBtn = document.getElementById('mob-nav-cart');
    if (cartBtn) {
      cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Open the slide-over cart drawer
        const catCartOverlay = document.getElementById('cat-cart-overlay');
        if (catCartOverlay) {
          if (typeof window.renderCartDrawer === 'function') window.renderCartDrawer();
          catCartOverlay.classList.add('open');
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }
  }

  function updateMobCartBadge() {
    const mobCartBadge = document.getElementById('mob-cart-badge');
    const headerCartBadge = document.getElementById('cat-cart-badge');
    let count = 0;

    if (window.MedicareCart && typeof window.MedicareCart.getTotalCount === 'function') {
      count = window.MedicareCart.getTotalCount();
    }

    if (mobCartBadge) {
      mobCartBadge.textContent = count;
      mobCartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (headerCartBadge) {
      headerCartBadge.textContent = count;
      headerCartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  /* ------------------------------------------------------------------
     8. PUBLIC API EXPORTS
     ------------------------------------------------------------------ */
  window.MedicareMobile = {
    openCategoryGrid: function(categoryId) {
      switchToGridMode(categoryId);
    },
    showCarousels: function() {
      showCarouselView();
    },
    quickAddToCart: function(event, id, name, nameAr, price, img) {
      if (typeof window.addToCart === 'function') {
        window.addToCart(event, id, name, nameAr, price, img);
      }
      updateMobCartBadge();
    },
    toggleWishlist: function(event, btn, name) {
      if (typeof window.toggleWishlist === 'function') {
        window.toggleWishlist(event, btn, name);
      } else {
        btn.classList.toggle('active');
      }
    }
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileBrowsing);
  } else {
    initMobileBrowsing();
  }

})();
