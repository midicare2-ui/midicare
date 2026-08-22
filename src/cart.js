/* ==========================================================================
   MEDICARE — SHARED CART STATE ENGINE
   Centralized cart manager stored in localStorage under 'medicare_cart',
   synced with Supabase customer account if authenticated, and synced
   across all open tabs / pages.
   ========================================================================== */

(function() {
  const STORAGE_KEY = 'medicare_cart';

  window.MedicareCart = {
    getCart() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },

    saveCart(cartItems) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.warn('[MedicareCart] localStorage save warning:', e);
      }
      try {
        this.notifyListeners();
      } catch (e) {}
      try {
        this.syncWithSupabase(cartItems);
      } catch (e) {}
    },

    addItem(item) {
      if (!item) return this.getCart();
      // Standardized Cart Item Shape: { productId, id, name, nameAr, price, qty, size, color, image }
      const cart = this.getCart();
      const pId = item.productId || item.id || null;
      if (!pId) return this.getCart();
      const size = item.size || 'M';
      const color = item.color || 'Obsidian Teal';
      const qty = Math.max(1, Number(item.qty) || 1);
      const price = Number(item.price) || 0;

      const existingIndex = cart.findIndex(i => 
        (i.productId === pId || i.id === pId) && i.size === size && i.color === color
      );

      if (existingIndex > -1) {
        cart[existingIndex].qty = (Number(cart[existingIndex].qty) || 0) + qty;
      } else {
        cart.push({
          productId: pId,
          id: pId,
          name: item.name || 'Obsidian Flex Scrub Set',
          nameAr: item.nameAr || item.name_ar || item.name || 'طقم سكراب أوبسيديان',
          price: price,
          qty: qty,
          size: size,
          color: color,
          image: item.image || item.img || 'assets/medicare_scrubs_hero_1786614154492.png'
        });
      }

      this.saveCart(cart);
      return cart;
    },

    updateQty(index, delta) {
      const cart = this.getCart();
      if (!cart[index]) return cart;

      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
      return cart;
    },

    removeItem(index) {
      const cart = this.getCart();
      if (cart[index]) {
        cart.splice(index, 1);
        this.saveCart(cart);
      }
      return cart;
    },

    clearCart() {
      this.saveCart([]);
    },

    getTotalCount() {
      return this.getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    },

    getSubtotal() {
      return this.getCart().reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    },

    notifyListeners() {
      window.dispatchEvent(new CustomEvent('medicare_cart_updated', { detail: this.getCart() }));
    },

    async syncWithSupabase(cartItems) {
      // Cart state is stored in localStorage only.
      // We intentionally skip Supabase sync here because:
      // 1. Customer IDs generated client-side (CUST-xxx) are not valid UUIDs → causes 400.
      // 2. Creating a new supabase client here causes "Multiple GoTrueClient instances" warnings.
      // The cart is always available via localStorage('medicare_cart') on all pages.
    }
  };

  // Listen to cross-tab storage changes
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      window.MedicareCart.notifyListeners();
    }
  });

  /* ------------------------------------------------------------------
     GLOBAL CART DRAWER OPEN / CLOSE CONTROLLER
     ------------------------------------------------------------------ */
  window.openGlobalCartDrawer = function() {
    const cartOverlay =
      document.getElementById('cart-drawer-overlay') ||
      document.getElementById('pdp-cart-overlay') ||
      document.getElementById('cat-cart-overlay') ||
      document.getElementById('wsh-cart-overlay') ||
      document.getElementById('trk-cart-overlay') ||
      document.getElementById('acc-cart-overlay');

    if (cartOverlay) {
      if (typeof window.renderCartDrawer === 'function') {
        try { window.renderCartDrawer(); } catch (e) {}
      }
      if (typeof window.renderCart === 'function') {
        try { window.renderCart(); } catch (e) {}
      }
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else if (!window.location.pathname.endsWith('checkout.html')) {
      window.location.href = 'checkout.html';
    }
  };

  window.closeGlobalCartDrawer = function() {
    document.querySelectorAll('.mc-cart-drawer-overlay').forEach(el => el.classList.remove('open'));
    document.body.style.overflow = '';
  };

  // Global backdrop and close button listener
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList && e.target.classList.contains('mc-cart-drawer-overlay')) {
      window.closeGlobalCartDrawer();
    }
    if (e.target && (e.target.classList?.contains('mc-cart-close') || e.target.id?.includes('cart-close'))) {
      window.closeGlobalCartDrawer();
    }
  });

  /* ------------------------------------------------------------------
     GLOBAL MOBILE BOTTOM NAV SYNC & HANDLERS
     ------------------------------------------------------------------ */
  function updateGlobalMobCartBadge() {
    const mobCartBadge = document.getElementById('mob-cart-badge');
    if (mobCartBadge && window.MedicareCart) {
      const count = window.MedicareCart.getTotalCount();
      mobCartBadge.textContent = count;
      mobCartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  function initGlobalMobBottomNav() {
    updateGlobalMobCartBadge();

    const mobNavCartBtn = document.getElementById('mob-nav-cart');
    if (mobNavCartBtn && !mobNavCartBtn.dataset.bound) {
      mobNavCartBtn.dataset.bound = 'true';
      mobNavCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openGlobalCartDrawer();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalMobBottomNav);
  } else {
    initGlobalMobBottomNav();
  }

  window.addEventListener('medicare_cart_updated', updateGlobalMobCartBadge);
})();

