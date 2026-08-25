/* ==========================================================================
   MEDICARE — CUSTOMER ACCOUNT & DASHBOARD ENGINE v2.0
   Supabase Customer Auth, Order History Filtering, Reorder System,
   Saved Addresses, Wishlist Sync, Cart Drawer Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  const authView = document.getElementById('account-auth-view');
  const dashView = document.getElementById('account-dashboard-view');
  const toast    = document.getElementById('copy-toast');

  /* ------------------------------------------------------------------
     0. TOAST NOTIFICATION HELPER
     ------------------------------------------------------------------ */
  function showToast(msg) {
    let toastEl = document.getElementById('copy-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'copy-toast';
      toastEl.className = 'mc-copy-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2500);
  }
  window.showToast = showToast;

  /* ------------------------------------------------------------------
     1. INIT ACCOUNT VIEW BASED ON AUTH SESSION
     ------------------------------------------------------------------ */
  async function initAccountPage() {
    const customer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : JSON.parse(localStorage.getItem('medicare_customer_session') || 'null');

    if (!customer) {
      if (authView) authView.style.display = 'block';
      if (dashView) dashView.style.display = 'none';
    } else {
      if (authView) authView.style.display = 'none';
      if (dashView) dashView.style.display = 'block';
      await renderCustomerDashboard(customer);
    }
  }
  window.initAccountPage = initAccountPage;

  /* ------------------------------------------------------------------
     2. AUTH TAB SWITCHER
     ------------------------------------------------------------------ */
  window.switchAuthTab = function(tab) {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnReg   = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-login');
    const formReg   = document.getElementById('form-register');

    if (tab === 'login') {
      btnLogin?.classList.add('active');
      btnReg?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formReg)   formReg.style.display   = 'none';
    } else {
      btnReg?.classList.add('active');
      btnLogin?.classList.remove('active');
      if (formReg)   formReg.style.display   = 'block';
      if (formLogin) formLogin.style.display = 'none';
    }
  };

  /* ------------------------------------------------------------------
     3. LOGIN HANDLER
     ------------------------------------------------------------------ */
  window.handleCustomerLogin = async function(e) {
    e.preventDefault();
    const emailOrPhone = document.getElementById('login-input')?.value.trim();
    const password     = document.getElementById('login-password')?.value;

    if (!emailOrPhone || !password) {
      showToast('❌ Please fill out all required fields');
      return;
    }

    if (window.MedicareDB && typeof window.MedicareDB.signInCustomer === 'function') {
      const res = await window.MedicareDB.signInCustomer({ emailOrPhone, password });
      if (res.success && res.customer) {
        showToast(`🎉 Welcome back, ${res.customer.name}!`);
        if (window.renderHeaderAccountWidget) window.renderHeaderAccountWidget();
        await initAccountPage();
      } else {
        showToast(`❌ ${res.error || 'Login failed'}`);
      }
    }
  };

  /* ------------------------------------------------------------------
     5. REGISTER HANDLER
     ------------------------------------------------------------------ */
  window.handleCustomerRegister = async function(e) {
    e.preventDefault();
    const name     = document.getElementById('reg-fullname')?.value.trim();
    const phone    = document.getElementById('reg-phone')?.value.trim();
    const email    = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const role     = document.getElementById('reg-role')?.value;

    if (!name || !phone || !password) {
      showToast('❌ Please fill out Name, Phone, and Password');
      return;
    }

    if (window.MedicareDB && typeof window.MedicareDB.signUpCustomer === 'function') {
      const res = await window.MedicareDB.signUpCustomer({ name, phone, email, password, medical_role: role });
      if (res.success && res.customer) {
        showToast(`🎉 Account created! Welcome ${res.customer.name}`);
        if (window.renderHeaderAccountWidget) window.renderHeaderAccountWidget();
        await initAccountPage();
      } else {
        showToast('❌ Registration failed. Please try again.');
      }
    }
  };

  /* ------------------------------------------------------------------
     6. LOGOUT HANDLER
     ------------------------------------------------------------------ */
  window.handleCustomerLogout = function() {
    if (window.MedicareDB && typeof window.MedicareDB.signOutCustomer === 'function') {
      window.MedicareDB.signOutCustomer();
    } else {
      localStorage.removeItem('medicare_customer_session');
    }
    showToast('🚪 Logged out of your account');
    if (window.renderHeaderAccountWidget) window.renderHeaderAccountWidget();
    initAccountPage();
  };

  /* ------------------------------------------------------------------
     7. DASHBOARD TAB SWITCHER
     ------------------------------------------------------------------ */
  window.switchDashTab = function(tabName) {
    document.querySelectorAll('.acc-dash-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.acc-dash-panel').forEach(p => p.style.display = 'none');

    const btn = document.getElementById(`dash-tab-btn-${tabName}`);
    const panel = document.getElementById(`dash-panel-${tabName}`);
    if (btn) btn.classList.add('active');
    if (panel) panel.style.display = 'block';
  };

  /* ------------------------------------------------------------------
     8. DASHBOARD DATA RENDERER
     ------------------------------------------------------------------ */
  let currentCustomerOrders = [];

  async function renderCustomerDashboard(customer) {
    const nameEl    = document.getElementById('dash-cust-name');
    const roleEl    = document.getElementById('dash-cust-role');
    const contactEl = document.getElementById('dash-cust-contact');

    if (nameEl)    nameEl.textContent    = customer.name || 'Customer Profile';
    if (roleEl)    roleEl.textContent    = customer.medical_role || 'Medical Customer';
    if (contactEl) contactEl.textContent = `📞 ${customer.phone || 'N/A'}${customer.email ? ' • ✉️ ' + customer.email : ''}`;

    // 1. Order History
    if (window.MedicareDB && typeof window.MedicareDB.getCustomerOrders === 'function') {
      currentCustomerOrders = await window.MedicareDB.getCustomerOrders(customer);
    } else {
      currentCustomerOrders = [];
    }
    renderCustomerOrdersList(currentCustomerOrders);

    // 2. Saved Addresses
    renderCustomerAddressesList(customer);

    // 3. Saved Wishlist
    const wishlist = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]');
    renderCustomerWishlistEmbed();

    // 4. Populate Stats Bar
    const spent = currentCustomerOrders.reduce((s, o) => s + (o.total || 0), 0);
    const addrs = customer.addresses || [];
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('stat-orders', currentCustomerOrders.length);
    set('stat-spent', spent > 0 ? spent.toLocaleString() + ' DZD' : '0 DZD');
    set('stat-wishlist', wishlist.length);
    set('stat-addresses', addrs.length);
  }

  let currentActiveOrderFilter = 'all';

  window.setOrderFilter = function(status, pillEl) {
    currentActiveOrderFilter = status;
    document.querySelectorAll('.acc-filter-pill').forEach(p => p.classList.remove('active'));
    if (pillEl) pillEl.classList.add('active');
    filterOrdersList();
  };

  window.filterOrdersList = function() {
    const query = document.getElementById('order-search-input')?.value.toLowerCase().trim() || '';
    
    let filtered = currentCustomerOrders;

    if (currentActiveOrderFilter !== 'all') {
      filtered = filtered.filter(o => (o.status || '').toLowerCase() === currentActiveOrderFilter.toLowerCase());
    }

    if (query) {
      filtered = filtered.filter(o => {
        const num = String(o.order_number || o.id).toLowerCase();
        const wilaya = String(o.wilaya || '').toLowerCase();
        const itemsStr = Array.isArray(o.items) ? o.items.map(i => (i.name || '') + ' ' + (i.nameAr || '')).join(' ').toLowerCase() : '';
        return num.includes(query) || wilaya.includes(query) || itemsStr.includes(query);
      });
    }

    renderCustomerOrdersList(filtered);
  };

  function renderCustomerOrdersList(orders) {
    const container  = document.getElementById('dash-orders-container');
    const countBadge = document.getElementById('dash-orders-count');
    if (countBadge) countBadge.textContent = currentCustomerOrders.length;
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="acc-empty-state">
          <span class="acc-empty-icon">📦</span>
          <h3 class="acc-empty-title">No Matching Orders Found</h3>
          <p class="acc-empty-sub">Explore our medical scrubs, lab coats, and diagnostic gear to place an order.</p>
          <a href="category.html" class="acc-empty-cta">🛍️ Browse Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(o => {
      const ordNo = o.order_number || o.id;
      const cleanNo = ordNo.replace(/^#/, '');
      const statusBadge = getStatusBadgeHTML(o.status);
      const items = Array.isArray(o.items) ? o.items : [];
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Order';

      const itemsListHTML = items.map(item => `
        <div class="acc-order-item-row">
          <div>
            <div class="acc-order-item-name">${item.nameAr || item.name}</div>
            ${item.size ? `<div class="acc-order-item-meta">Size: ${item.size}${item.color ? ' · ' + item.color : ''}</div>` : ''}
          </div>
          <div class="acc-order-item-price">${item.qty || 1} × ${Number(item.price || 0).toLocaleString()} DZD</div>
        </div>
      `).join('');

      return `
        <div class="acc-order-card">
          <div class="acc-order-header">
            <div>
              <div class="acc-order-num">Order #${cleanNo}</div>
              <div class="acc-order-date">Placed on ${dateStr} • Cash on Delivery</div>
            </div>
            ${statusBadge}
          </div>
          <div class="acc-order-body">${itemsListHTML}</div>
          <div class="acc-order-footer">
            <div>
              <div class="acc-order-total">${Number(o.total || 0).toLocaleString()} DZD</div>
              <div class="acc-order-location">📍 ${o.wilaya || 'Algeria'}${o.commune ? ' — ' + o.commune : ''}</div>
            </div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
              <a href="order-tracking.html?order=${cleanNo}" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.5rem 1rem; background:#F1F5F9; color:#334155; border-radius:999px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:700; text-decoration:none; transition:all 0.18s;" onmouseover="this.style.background='#E2E8F0'" onmouseout="this.style.background='#F1F5F9'">
                🚚 Track Order
              </a>
              <button class="acc-reorder-btn" onclick="reorderPastOrder('${ordNo}')">
                🔄 Reorder
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getStatusBadgeHTML(status) {
    const badgeMap = {
      'Pending':   '<span class="dash-status-badge dash-status-warning">⏳ Pending</span>',
      'Confirmed': '<span class="dash-status-badge dash-status-info">✅ Confirmed</span>',
      'Preparing': '<span class="dash-status-badge dash-status-info">📦 Preparing</span>',
      'Shipped':   '<span class="dash-status-badge dash-status-shipped">🚚 Shipped</span>',
      'Delivered': '<span class="dash-status-badge dash-status-success">🎉 Delivered</span>',
      'Cancelled': '<span class="dash-status-badge dash-status-error">❌ Cancelled</span>'
    };
    return badgeMap[status] || `<span class="dash-status-badge dash-status-info">${status}</span>`;
  }

  /* ------------------------------------------------------------------
     9. REORDER PAST ORDER ACTION
     ------------------------------------------------------------------ */
  window.reorderPastOrder = function(orderId) {
    const cleanId = String(orderId).replace(/^#/, '');
    const order = currentCustomerOrders.find(o => (o.order_number || o.id || '').replace(/^#/, '') === cleanId);

    if (!order || !order.items || order.items.length === 0) {
      showToast('❌ Unable to reorder: Order details missing');
      return;
    }

    if (window.MedicareCart) {
      order.items.forEach(item => {
        window.MedicareCart.addItem({
          productId: item.productId || item.id,
          id: item.id || item.productId,
          name: item.name,
          nameAr: item.nameAr || item.name,
          price: item.price,
          qty: item.qty || 1,
          size: item.size || 'M',
          color: item.color || 'Obsidian Teal',
          image: item.image || item.img || 'assets/medicare_scrubs_hero_1786614154492.png'
        });
      });
    }

    renderCartDrawer();
    const drawerOverlay = document.getElementById('acc-cart-overlay');
    if (drawerOverlay) drawerOverlay.classList.add('open');
    showToast(`✓ Added ${order.items.length} items from Order #${cleanId} to Cart!`);
  };

  /* ------------------------------------------------------------------
     10. SAVED ADDRESSES RENDERER & FORM
     ------------------------------------------------------------------ */
  function renderCustomerAddressesList(customer) {
    const container = document.getElementById('dash-addresses-list');
    if (!container) return;

    const addrs = customer.addresses || [];
    if (addrs.length === 0) {
      container.innerHTML = '<div style="font-size:13px; color:#64748B; padding:0.5rem 0;">No saved shipping addresses yet. Add one below for faster checkout.</div>';
      return;
    }

    container.innerHTML = addrs.map((a, i) => `
      <div style="border:1px solid #E2E8F0; padding:1rem; border-radius:8px; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong>📍 Address #${i + 1} — ${a.wilaya}</strong><br>
          <span style="font-size:13px; color:#475569;">Commune: ${a.commune} • ${a.address}</span>
        </div>
        <span class="mc-card-badge mc-badge-new">Saved</span>
      </div>
    `).join('');
  }

  window.handleSaveAddressSubmit = async function(e) {
    e.preventDefault();
    const wilaya  = document.getElementById('new-addr-wilaya')?.value;
    const commune = document.getElementById('new-addr-commune')?.value.trim();
    const street  = document.getElementById('new-addr-street')?.value.trim();

    if (!wilaya || !commune || !street) {
      showToast('Please fill out all address fields');
      return;
    }

    const customer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;
    if (customer && window.MedicareDB && typeof window.MedicareDB.saveCustomerAddress === 'function') {
      await window.MedicareDB.saveCustomerAddress(customer, { wilaya, commune, address: street });
      showToast('📍 New address saved to profile!');
      renderCustomerAddressesList(customer);
      e.target.reset();
    }
  };

  /* ------------------------------------------------------------------
     11. WISHLIST EMBED RENDERER
     ------------------------------------------------------------------ */
  function renderCustomerWishlistEmbed() {
    const container = document.getElementById('dash-wishlist-container');
    if (!container) return;

    const wishlist = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]');
    if (wishlist.length === 0) {
      container.innerHTML = `
        <div class="acc-empty-state" style="grid-column:1/-1;">
          <span class="acc-empty-icon">❤️</span>
          <h3 class="acc-empty-title">Your Wishlist is Empty</h3>
          <p class="acc-empty-sub">Save items while browsing to find them here anytime.</p>
          <a href="category.html" class="acc-empty-cta">🛍️ Discover Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = wishlist.slice(0, 8).map(item => `
      <div class="acc-wish-card">
        <img src="${item.img}" alt="${item.name}" class="acc-wish-img" onclick="window.location.href='product-detail.html?id=${item.id}'" loading="lazy">
        <div class="acc-wish-body">
          <div class="acc-wish-name">${item.name}</div>
          <div class="acc-wish-price">${Number(item.price).toLocaleString()} DZD</div>
          <button class="acc-wish-add-btn" onclick="if(window.MedicareCart) window.MedicareCart.addItem({productId:'${item.id}',id:'${item.id}',name:'${item.name.replace(/'/g,"\\'")}',price:${item.price},qty:1,image:'${item.img}'}); showToast('✓ Added to cart');">
            🛒 Move to Cart
          </button>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------
     12. CART DRAWER UTILITIES FOR ACCOUNT PAGE
     ------------------------------------------------------------------ */
  function renderCartDrawer() {
    const body    = document.getElementById('acc-cart-body');
    const totalEl = document.getElementById('acc-cart-total');
    const badge   = document.getElementById('acc-cart-badge');
    const cart    = window.MedicareCart ? window.MedicareCart.getCart() : [];
    const count   = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;
    const subtotal= window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;

    if (badge) badge.textContent = count;
    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">Your cart is empty.</div>';
      if (totalEl) totalEl.textContent = '0 DZD';
      return;
    }

    body.innerHTML = cart.map((item, idx) => `
      <div class="mc-cart-item">
        <img src="${item.image || item.img}" class="mc-cart-item-img" alt="${item.name}">
        <div class="mc-cart-item-info">
          <span class="mc-cart-item-title">${item.nameAr || item.name}</span>
          <span class="mc-cart-item-price">${Number(item.price).toLocaleString()} DZD ${item.size ? '(' + item.size + ')' : ''}</span>
          <div class="mc-cart-qty-ctrl">
            <button class="mc-qty-btn" onclick="accUpdateQty(${idx},-1)">−</button>
            <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
            <button class="mc-qty-btn" onclick="accUpdateQty(${idx},1)">+</button>
          </div>
        </div>
        <button onclick="accUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px">✕</button>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = `${subtotal.toLocaleString()} DZD`;
  }

  window.accUpdateQty = function(idx, delta) {
    if (window.MedicareCart) window.MedicareCart.updateQty(idx, delta);
    renderCartDrawer();
  };

  const cartOverlay = document.getElementById('acc-cart-overlay');
  const cartBtn     = document.getElementById('acc-cart-btn');
  const cartClose   = document.getElementById('acc-cart-close');

  if (cartBtn)     cartBtn.addEventListener('click',  () => { renderCartDrawer(); cartOverlay?.classList.add('open'); });
  if (cartClose)   cartClose.addEventListener('click', () => cartOverlay?.classList.remove('open'));
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) cartOverlay.classList.remove('open'); });
  window.addEventListener('medicare_cart_updated', renderCartDrawer);
  renderCartDrawer();

  /* ------------------------------------------------------------------
     14. ADVANCED UX UTILITIES (Password Toggle, Strength, Modals)
     ------------------------------------------------------------------ */
  window.togglePasswordVisibility = function(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.textContent = '🙈';
    } else {
      input.type = 'password';
      if (btnEl) btnEl.textContent = '👁️';
    }
  };

  window.checkPasswordStrength = function(password) {
    const bar = document.getElementById('strength-bar');
    const txt = document.getElementById('strength-text');
    if (!bar || !txt) return;

    let score = 0;
    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 25;

    bar.style.width = `${score}%`;

    if (score <= 25) {
      bar.style.backgroundColor = '#EF4444';
      txt.textContent = 'Password strength: Weak ⚠️';
      txt.style.color = '#EF4444';
    } else if (score <= 50) {
      bar.style.backgroundColor = '#F59E0B';
      txt.textContent = 'Password strength: Fair 🟡';
      txt.style.color = '#F59E0B';
    } else if (score <= 75) {
      bar.style.backgroundColor = '#3B82F6';
      txt.textContent = 'Password strength: Good 🟢';
      txt.style.color = '#3B82F6';
    } else {
      bar.style.backgroundColor = '#10B981';
      txt.textContent = 'Password strength: Strong 💪';
      txt.style.color = '#10B981';
    }
  };

  window.validateMedicalLicense = function(val) {
    const badge = document.getElementById('license-badge');
    if (!badge) return;
    if (val.trim().length >= 4) {
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  };

  /* Modal Controls: Forgot Password */
  window.openForgotPasswordModal = function() {
    const modal = document.getElementById('modal-forgot-password');
    if (modal) modal.classList.add('open');
  };
  window.closeForgotPasswordModal = function() {
    const modal = document.getElementById('modal-forgot-password');
    if (modal) modal.classList.remove('open');
  };
  window.handleForgotPasswordSubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('forgot-input')?.value.trim();
    if (!input) return;
    closeForgotPasswordModal();
    showToast(`📩 Verification code sent to ${input}`);
  };

  /* Modal Controls: Edit Profile */
  window.openEditProfileModal = function() {
    const customer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;
    if (!customer) return;

    const nameInput  = document.getElementById('edit-prof-name');
    const phoneInput = document.getElementById('edit-prof-phone');
    const emailInput = document.getElementById('edit-prof-email');
    const roleSelect = document.getElementById('edit-prof-role');

    if (nameInput)  nameInput.value  = customer.name || '';
    if (phoneInput) phoneInput.value = customer.phone || '';
    if (emailInput) emailInput.value = customer.email || '';
    if (roleSelect) roleSelect.value = customer.medical_role || 'Medicine & Surgery';

    const modal = document.getElementById('modal-edit-profile');
    if (modal) modal.classList.add('open');
  };

  window.closeEditProfileModal = function() {
    const modal = document.getElementById('modal-edit-profile');
    if (modal) modal.classList.remove('open');
  };

  window.handleSaveProfileSubmit = async function(e) {
    e.preventDefault();
    const name  = document.getElementById('edit-prof-name')?.value.trim();
    const phone = document.getElementById('edit-prof-phone')?.value.trim();
    const email = document.getElementById('edit-prof-email')?.value.trim();
    const role  = document.getElementById('edit-prof-role')?.value;

    if (!name || !phone) {
      showToast('❌ Name and Phone are required');
      return;
    }

    const customer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : JSON.parse(localStorage.getItem('medicare_customer_session') || '{}');
    customer.name = name;
    customer.phone = phone;
    customer.email = email;
    customer.medical_role = role;

    localStorage.setItem('medicare_customer_session', JSON.stringify(customer));
    if (window.MedicareDB && typeof window.MedicareDB.saveCustomerSession === 'function') {
      window.MedicareDB.saveCustomerSession(customer);
    }

    closeEditProfileModal();
    showToast('✨ Account profile updated!');
    if (window.renderHeaderAccountWidget) window.renderHeaderAccountWidget();
    await renderCustomerDashboard(customer);
  };
  window.handleEditProfileSubmit = window.handleSaveProfileSubmit;

  // Initial load
  await initAccountPage();

});

