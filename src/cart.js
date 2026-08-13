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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
      this.notifyListeners();
      this.syncWithSupabase(cartItems);
    },

    addItem(item) {
      // Standardized Cart Item Shape: { productId, id, name, nameAr, price, qty, size, color, image }
      const cart = this.getCart();
      const pId = item.productId || item.id;
      const size = item.size || 'M';
      const color = item.color || 'Obsidian Teal';
      const qty = item.qty || 1;

      const existingIndex = cart.findIndex(i => 
        (i.productId === pId || i.id === pId) && i.size === size && i.color === color
      );

      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
      } else {
        cart.push({
          productId: pId,
          id: pId,
          name: item.name,
          nameAr: item.nameAr || item.name_ar || item.name,
          price: Number(item.price),
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
      const customerSession = JSON.parse(localStorage.getItem('medicare_customer_session') || 'null');
      if (customerSession && customerSession.id && window.supabase) {
        try {
          const config = window.MEDICARE_CONFIG || {};
          const sb = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
          await sb
            .from('customers')
            .update({ addresses: { cart_state: cartItems } })
            .eq('id', customerSession.id);
        } catch (e) {
          console.warn('[MedicareCart] Sync with Supabase failed:', e);
        }
      }
    }
  };

  // Listen to cross-tab storage changes
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      window.MedicareCart.notifyListeners();
    }
  });
})();
