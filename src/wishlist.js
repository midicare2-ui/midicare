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
  let attachedPhotos = []; // Array of base64 data URLs

  window.openReviewModal = function() {
    reviewModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeReviewModal = function() {
    reviewModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (reviewModal) {
    reviewModal.addEventListener('click', e => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && reviewModal?.classList.contains('open')) closeReviewModal();
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
    if (attachedPhotos.length === 0) { previewContainer.innerHTML = ''; return; }
    previewContainer.innerHTML = attachedPhotos.map((src, index) => `
      <div class="rev-preview-item">
        <img src="${src}" alt="Photo ${index + 1}">
        <button type="button" class="remove-btn" onclick="removeAttachedPhoto(${index})" title="Remove">✕</button>
      </div>
    `).join('');
  }

  window.removeAttachedPhoto = function(index) {
    attachedPhotos.splice(index, 1);
    renderPhotoPreviews();
  };

  function processImageFiles(files) {
    if (!files || files.length === 0) return;
    const maxFiles = 4, maxSize = 5 * 1024 * 1024;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { showToast('⚠️ Images only (JPG, PNG, WEBP)'); return; }
      if (file.size > maxSize) { showToast(`⚠️ "${file.name}" exceeds 5MB`); return; }
      if (attachedPhotos.length >= maxFiles) { showToast(`⚠️ Max ${maxFiles} photos`); return; }
      const reader = new FileReader();
      reader.onload = e => { attachedPhotos.push(e.target.result); renderPhotoPreviews(); showToast(`📷 "${file.name}" attached!`); };
      reader.readAsDataURL(file);
    });
  }

  window.handlePhotoSelect = function(e) {
    processImageFiles(e.target.files);
    e.target.value = '';
  };

  window.openReviewPhotoLightbox = function(src) {
    const lb = document.createElement('div');
    lb.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:1rem;';
    lb.innerHTML = `<img src="${src}" style="max-width:92vw;max-height:90vh;border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,0.6);object-fit:contain;">`;
    lb.addEventListener('click', () => lb.remove());
    document.body.appendChild(lb);
  };

  // Drag & drop on dropzone
  const dropzone = document.getElementById('rev-photo-dropzone');
  if (dropzone) {
    ['dragenter','dragover'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dropzone.classList.add('dragover'); }, false));
    ['dragleave','drop'].forEach(ev => dropzone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); dropzone.classList.remove('dragover'); }, false));
    dropzone.addEventListener('drop', e => { if (e.dataTransfer?.files) processImageFiles(e.dataTransfer.files); }, false);
  }

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
    const currentPhotos = [...attachedPhotos];

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
        ${currentPhotos.length > 0 ? `
          <div class="pdp-review-photos" style="margin-bottom:0.75rem;">
            ${currentPhotos.map(p => `<img src="${p}" alt="Review Photo" class="pdp-review-photo-thumb" onclick="openReviewPhotoLightbox('${p}')" title="Click to view">`).join('')}
          </div>
        ` : ''}
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

    const currentProductId = (window.productData && window.productData.id)
      || new URLSearchParams(window.location.search).get('id')
      || null;

    if (window.MedicareDB && typeof window.MedicareDB.submitReview === 'function') {
      window.MedicareDB.submitReview({
        customer_name: author,
        specialty_tag: role,
        rating: currentSelectedRating,
        comment: `${title}: ${body}`,
        product_id: currentProductId,
        photos: currentPhotos
      }).catch(err => console.warn('[Wishlist] submitReview failed:', err));
    } else if (currentProductId) {
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      localReviews.unshift({ id: 'REV-' + Date.now(), customer_name: author, specialty_tag: role, rating: currentSelectedRating, comment: `${title}: ${body}`, product_id: currentProductId, is_approved: true, created_at: new Date().toISOString(), photos: currentPhotos });
      localStorage.setItem('medicare_reviews_db', JSON.stringify(localReviews));
    }

    e.target.reset();
    attachedPhotos = [];
    renderPhotoPreviews();
    window.setRating(5);
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

  /* ------------------------------------------------------------------
     7. DYNAMIC REVIEWS LOADING & RENDERING
     ------------------------------------------------------------------ */
  async function loadAndRenderReviews(sortBy) {
    const overviewEl  = document.getElementById('rev-overview-card');
    const listEl      = document.getElementById('reviews-list-container');
    const showingEl   = document.getElementById('rev-showing-label');

    let reviews = [];
    try {
      if (window.MedicareDB && typeof window.MedicareDB.getReviews === 'function') {
        const res = await window.MedicareDB.getReviews({ limit: 50 });
        if (res && Array.isArray(res)) reviews = res;
        else if (res && Array.isArray(res.data)) reviews = res.data;
      }
    } catch (e) {
      console.warn('[Wishlist] Could not load reviews from Supabase:', e);
    }

    // Fallback: check localStorage
    if (reviews.length === 0) {
      reviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
    }

    // Apply sort
    const sort = sortBy || (document.getElementById('review-sort-select')?.value || 'recent');
    if (sort === 'recent')  reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'highest') reviews.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    if (sort === 'lowest')  reviews.sort((a, b) => (a.rating || 5) - (b.rating || 5));
    if (sort === 'helpful') reviews.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));

    // Render overview histogram
    if (overviewEl) {
      if (reviews.length === 0) {
        overviewEl.innerHTML = `
          <div style="text-align:center; padding:2rem; color:var(--color-neutral-400);">
            <div style="font-size:2rem; margin-bottom:0.5rem;">⭐</div>
            <div style="font-size:14px; margin-bottom:1rem;">No reviews yet — be the first!</div>
            <button class="mc-btn mc-btn-accent" onclick="openReviewModal()">✍️ Write a Review</button>
          </div>`;
      } else {
        const total = reviews.length;
        const avg   = (reviews.reduce((s, r) => s + (r.rating || 5), 0) / total).toFixed(1);
        const stars = [5,4,3,2,1].map(s => {
          const cnt = reviews.filter(r => Math.round(r.rating || 5) === s).length;
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          return `<div class="pdp-histo-row"><span>${s} Stars</span><div class="pdp-histo-bar-bg"><div class="pdp-histo-bar-fill" style="width:${pct}%"></div></div><span>${pct}% (${cnt})</span></div>`;
        }).join('');
        const starsFill = Math.round(avg);
        const starsDisplay = '★'.repeat(starsFill) + '☆'.repeat(5 - starsFill);
        overviewEl.innerHTML = `
          <div class="rev-score-box">
            <div class="rev-score-big">${avg}</div>
            <div class="rev-score-stars">${starsDisplay}</div>
            <div style="font-size:12.5px; color:var(--color-neutral-500); font-weight:600;">Based on ${total} review${total !== 1 ? 's' : ''}</div>
          </div>
          <div class="pdp-review-histogram">${stars}</div>
          <div style="text-align:center;">
            <button class="mc-btn mc-btn-accent" onclick="openReviewModal()">✍️ Write a Review — أضف تقييمك</button>
          </div>`;
      }
    }

    // Render review cards
    if (showingEl) {
      showingEl.textContent = reviews.length > 0 ? `Showing ${reviews.length} Review${reviews.length !== 1 ? 's' : ''}` : '';
    }

    if (listEl) {
      if (reviews.length === 0) {
        listEl.innerHTML = `
          <div class="rev-empty-state" style="text-align:center; padding:3rem 1rem; color:var(--color-neutral-400);">
            <div style="font-size:2.5rem; margin-bottom:0.75rem;">💬</div>
            <div style="font-size:16px; font-weight:700; margin-bottom:0.5rem;">No Reviews Yet</div>
            <div style="font-size:13px;">Be the first to share your experience! كن أول من يكتب تقييماً.</div>
            <button class="mc-btn mc-btn-accent mc-btn-sm" style="margin-top:1.25rem;" onclick="openReviewModal()">✍️ Write a Review</button>
          </div>`;
      } else {
        listEl.innerHTML = reviews.map(r => {
          const rating     = r.rating || 5;
          const starsHtml  = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
          const authorName = r.customer_name || r.author || 'Verified Customer';
          const role       = r.specialty_tag || r.role || 'Verified Buyer';
          const dateFmt    = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric' }) : 'Recently';
          const comment    = r.comment || r.body || '';
          const helpful    = r.helpful_count || 0;
          const photosHtml = (r.photos && r.photos.length > 0)
            ? `<div class="pdp-review-photos" style="margin-bottom:0.75rem;">${r.photos.map(p => `<img src="${p}" alt="Review Photo" class="pdp-review-photo-thumb">`).join('')}</div>`
            : '';
          const ownerReply = r.owner_reply
            ? `<div class="rev-owner-reply-box">
                <div class="rev-owner-title"><span>💬 Official Response from MEDICARE Team</span></div>
                <div>${r.owner_reply}</div>
               </div>`
            : '';
          return `
            <div class="rev-card">
              <div class="rev-user-header">
                <div class="rev-user-name">
                  <span>${authorName}</span>
                  <span class="rev-verified-tag">✓ ${role}</span>
                </div>
                <span style="font-size:12px; color:var(--color-neutral-400);">${dateFmt}</span>
              </div>
              <div style="color:var(--color-accent-500); margin-bottom:0.35rem; font-size:14px;">${starsHtml}</div>
              <p style="font-size:13.5px; color:var(--color-neutral-700); line-height:1.6; margin:0 0 0.875rem 0;">${comment}</p>
              ${photosHtml}
              <div style="display:flex; justify-content:flex-end;">
                <button class="rev-helpful-btn" onclick="voteHelpful(this, ${helpful})">
                  👍 Helpful (<span class="vote-count">${helpful}</span>)
                </button>
              </div>
              ${ownerReply}
            </div>`;
        }).join('');
      }
    }
  }

  // Wire sort dropdown
  const sortSelect = document.getElementById('review-sort-select');
  if (sortSelect) sortSelect.addEventListener('change', e => loadAndRenderReviews(e.target.value));

  // Initial render
  renderWishlist();
  renderCart();
  loadAndRenderReviews();

});
