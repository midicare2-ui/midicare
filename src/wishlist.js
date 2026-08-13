/* ==========================================================================
   MEDICARE — WISHLIST & REVIEWS INTERACTIVE ENGINE
   LocalStorage Wishlist, Share Link, Move to Cart, Interactive Review Modal,
   Star Rating Selector, Helpful Vote Counter, Store Reply System
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     DEFAULT WISHLIST DATA CATALOG (Fallback if LocalStorage is empty)
     ------------------------------------------------------------------ */
  // Load wishlist from localStorage (shared key)
  let wishlist = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]');

  // Fallback demo items if localStorage is empty
  if (wishlist.length === 0) {
    wishlist = [
      { id: 'MC-101', name: 'Obsidian Flex Antimicrobial Scrub Set', nameAr: 'طقم سكراب أوبسيديان', price: 10700, img: 'assets/medicare_scrubs_hero_1786614154492.png', specialty: 'Medicine' },
      { id: 'MC-108', name: 'Titanium Master Precision Stethoscope', nameAr: 'سماعة تيتانيوم', price: 19800, img: 'assets/medicare_stethoscope_1786614166370.png', specialty: 'Diagnostic' },
      { id: 'MC-103', name: 'Executive Fluid-Shield Lab Coat', nameAr: 'معطف مختبر مقاوم للسوائل', price: 13400, img: 'assets/medicare_lab_coat_1786614177321.png', specialty: 'Lab Coats' },
      { id: 'MC-110', name: 'Obsidian Clinical Cushion Clogs', nameAr: 'قبقاب طبي بمقدمة مغلقة', price: 9000, img: 'assets/medicare_footwear_1786615096505.png', specialty: 'Footwear' }
    ];
  }

  function saveWishlist() {
    localStorage.setItem('medicare_wishlist', JSON.stringify(wishlist));
  }

  let currentSelectedRating = 5;

  const gridEl         = document.getElementById('wishlist-grid');
  const countBadge     = document.getElementById('wsh-wishlist-count-badge');
  const totalCountEl   = document.getElementById('wsh-total-count');
  const toast          = document.getElementById('copy-toast');
  const langToggleBtn  = document.getElementById('lang-toggle-btn');
  const cartOverlay    = document.getElementById('wsh-cart-overlay');
  const cartBtn        = document.getElementById('wsh-cart-btn');
  const cartClose      = document.getElementById('wsh-cart-close');
  const reviewModal    = document.getElementById('review-modal');

  /* ------------------------------------------------------------------
     1. RENDER WISHLIST GRID
     ------------------------------------------------------------------ */
  function renderWishlist() {
    if (!gridEl) return;

    if (countBadge) countBadge.textContent = wishlist.length;
    if (totalCountEl) totalCountEl.textContent = `(${wishlist.length} Item${wishlist.length !== 1 ? 's' : ''})`;

    if (wishlist.length === 0) {
      gridEl.innerHTML = `
        <div class="wsh-empty-state" style="grid-column:1/-1;">
          <div class="wsh-empty-icon">💔</div>
          <h2 style="font-family:var(--font-family-display); font-weight:800; margin:0;">Your Wishlist is Empty</h2>
          <p style="font-size:14px; color:var(--color-neutral-500); max-width:380px;">Save your favorite scrubs, lab coats, and diagnostic tools to access them anytime.</p>
          <a href="category.html" class="mc-btn mc-btn-primary mc-btn-lg">Explore Medical Products →</a>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = wishlist.map((item, idx) => `
      <div class="wsh-card" role="listitem">
        <div class="wsh-img-wrap" onclick="window.location.href='product-detail.html?id=${item.id}'" style="cursor:pointer;">
          <img src="${item.img}" class="wsh-img" alt="${item.name}">
          <button class="wsh-remove-btn" onclick="event.stopPropagation(); removeFromWishlist(${idx})" title="Remove item" aria-label="Remove item">✕</button>
        </div>
        <div class="wsh-card-body">
          <span style="font-size:10px; font-weight:800; color:var(--color-primary-600); font-family:var(--font-family-display); text-transform:uppercase;">${item.specialty}</span>
          <h3 class="wsh-card-title" onclick="window.location.href='product-detail.html?id=${item.id}'" style="cursor:pointer;">${item.name}</h3>
          <div class="wsh-card-price">${item.price.toLocaleString()} DZD</div>
        </div>
        <div class="wsh-card-actions">
          <button class="mc-btn mc-btn-primary mc-btn-sm wsh-move-cart-btn" onclick="moveSingleToCart(${idx})">
            🛒 Move to Cart
          </button>
        </div>
      </div>
    `).join('');
  }

  window.removeFromWishlist = function(idx) {
    if (!wishlist[idx]) return;
    const name = wishlist[idx].name;
    wishlist.splice(idx, 1);
    saveWishlist();
    renderWishlist();
    showToast(`Removed "${name}" from Wishlist`);
  };

  window.moveSingleToCart = function(idx) {
    if (!wishlist[idx]) return;
    const item = wishlist[idx];

    // Use shared MedicareCart engine
    if (window.MedicareCart) {
      window.MedicareCart.addItem({
        productId: item.id,
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        price: item.price,
        qty: 1,
        image: item.img
      });
    }

    wishlist.splice(idx, 1);
    saveWishlist();
    renderWishlist();
    renderCart();
    cartOverlay?.classList.add('open');
    showToast(`✓ Moved "${item.name}" to Cart!`);
  };

  window.moveAllWishlistToCart = function() {
    if (wishlist.length === 0) {
      showToast('Wishlist is already empty!');
      return;
    }
    if (window.MedicareCart) {
      wishlist.forEach(item => window.MedicareCart.addItem({
        productId: item.id,
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        price: item.price,
        qty: 1,
        image: item.img
      }));
    }
    wishlist = [];
    saveWishlist();
    renderWishlist();
    renderCart();
    cartOverlay?.classList.add('open');
    showToast('🛒 All wishlist items moved to Cart!');
  };

  /* ------------------------------------------------------------------
     2. SHARE WISHLIST LINK GENERATOR
     ------------------------------------------------------------------ */
  window.shareWishlistLink = function() {
    const dummyLink = `${window.location.origin}${window.location.pathname}?share=MEDICARE_SAVED_LIST`;
    navigator.clipboard?.writeText(dummyLink);
    showToast('🔗 Wishlist link copied to clipboard!');
  };

  /* ------------------------------------------------------------------
     3. REVIEWS MODAL & INTERACTIVE STAR SELECTOR
     ------------------------------------------------------------------ */
  window.openReviewModal = function() {
    reviewModal?.classList.add('open');
  };

  window.closeReviewModal = function() {
    reviewModal?.classList.remove('open');
  };

  if (reviewModal) {
    reviewModal.addEventListener('click', e => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }

  window.setRating = function(val) {
    currentSelectedRating = val;
    const stars = document.querySelectorAll('#interactive-star-picker .star');
    stars.forEach((star, i) => {
      if (i < val) star.classList.add('selected');
      else star.classList.remove('selected');
    });
  };

  window.simulatePhotoUpload = function() {
    const msg = document.getElementById('rev-photo-preview-msg');
    if (msg) msg.style.display = 'block';
    showToast('📷 Photo attached!');
  };

  window.handleReviewSubmit = function(e) {
    e.preventDefault();
    const author = document.getElementById('rev-author')?.value.trim();
    const role   = document.getElementById('rev-role')?.value;
    const title  = document.getElementById('rev-headline')?.value.trim();
    const body   = document.getElementById('rev-body')?.value.trim();

    if (!author || !title || !body) {
      showToast('Please fill out all required review fields');
      return;
    }

    const container = document.getElementById('reviews-list-container');
    const starsStr = '★'.repeat(currentSelectedRating) + '☆'.repeat(5 - currentSelectedRating);

    const newReviewHTML = `
      <div class="rev-card" style="animation: fadeIn 0.4s ease;">
        <div class="rev-user-header">
          <div class="rev-user-name">
            <span>${author}</span>
            <span class="rev-verified-tag">✓ Verified Buyer (${role})</span>
          </div>
          <span style="font-size:12px; color:var(--color-neutral-400);">Just now</span>
        </div>
        <div style="color:var(--color-accent-500); margin-bottom:0.35rem; font-size:14px;">${starsStr}</div>
        <h4 style="margin:0 0 0.35rem 0; font-family:var(--font-family-display); font-size:15px; color:var(--color-neutral-900);">${title}</h4>
        <p style="font-size:13.5px; color:var(--color-neutral-700); line-height:1.6; margin:0 0 0.875rem 0;">${body}</p>
        <div style="display:flex; justify-content:flex-end;">
          <button class="rev-helpful-btn" onclick="voteHelpful(this, 1)">
            👍 Helpful (<span class="vote-count">1</span>)
          </button>
        </div>
      </div>
    `;

    if (container) {
      container.insertAdjacentHTML('afterbegin', newReviewHTML);
    }

    if (window.MedicareDB && typeof window.MedicareDB.submitReview === 'function') {
      window.MedicareDB.submitReview({
        customer_name: author,
        specialty_tag: role,
        rating: currentSelectedRating,
        comment: body,
        product_id: 'MC-101'
      });
    }

    closeReviewModal();
    showToast('🎉 Review submitted successfully!');
  };

  /* ------------------------------------------------------------------
     4. HELPFUL VOTE COUNTER
     ------------------------------------------------------------------ */
  window.voteHelpful = function(btn, initialVal) {
    if (btn.classList.contains('voted')) return;

    btn.classList.add('voted');
    const countEl = btn.querySelector('.vote-count');
    if (countEl) {
      const current = parseInt(countEl.textContent || initialVal);
      countEl.textContent = current + 1;
    }
    showToast('👍 Thank you for your feedback!');
  };

  /* ------------------------------------------------------------------
     5. CART DRAWER MANAGEMENT
     ------------------------------------------------------------------ */
  function renderCart() {
    const body = document.getElementById('wsh-cart-body');
    const totalEl = document.getElementById('wsh-cart-total');
    const badge = document.getElementById('wsh-cart-badge');
    const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
    const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;
    const subtotal = window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;

    if (badge) badge.textContent = totalQty;

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
            <span class="mc-cart-item-price">${Number(item.price).toLocaleString()} DZD</span>
            <div class="mc-cart-qty-ctrl">
              <button class="mc-qty-btn" onclick="wshUpdateQty(${idx},-1)">−</button>
              <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
              <button class="mc-qty-btn" onclick="wshUpdateQty(${idx},1)">+</button>
            </div>
          </div>
          <button onclick="wshUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px">✕</button>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = `${subtotal.toLocaleString()} DZD`;
  }

  window.wshUpdateQty = function(idx, delta) {
    if (window.MedicareCart) {
      window.MedicareCart.updateQty(idx, delta);
    }
    renderCart();
  };

  window.addEventListener('medicare_cart_updated', renderCart);

  if (cartBtn) cartBtn.addEventListener('click', () => { cartOverlay?.classList.add('open'); renderCart(); });
  if (cartClose) cartClose.addEventListener('click', () => cartOverlay?.classList.remove('open'));
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) cartOverlay.classList.remove('open'); });

  /* ------------------------------------------------------------------
     6. TOAST & LANGUAGE TOGGLE
     ------------------------------------------------------------------ */
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      document.documentElement.setAttribute('dir', isRTL ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', isRTL ? 'en' : 'ar');
      langToggleBtn.querySelector('.btn-text').textContent = isRTL ? 'العربية' : 'English';
      showToast(isRTL ? '🌐 Switched to English' : '🌐 تم التبديل إلى العربية');
    });
  }

  // Initial render
  renderWishlist();
  renderCart();

});
