/* ==========================================================================
   MEDICARE — ORDER TRACKING & ACCOUNT INTERACTIVE ENGINE
   Guest Order Lookup, Timeline Updates, Reorder System, Account Tabs, RTL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  let cart = (window.MedicareCart && typeof window.MedicareCart.getCart === 'function')
    ? window.MedicareCart.getCart()
    : JSON.parse(localStorage.getItem('medicare_cart') || '[]');

  const toast = document.getElementById('copy-toast');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const cartOverlay = document.getElementById('trk-cart-overlay');
  const cartBtn = document.getElementById('trk-cart-btn');
  const cartClose = document.getElementById('trk-cart-close');

  /* ------------------------------------------------------------------
     1. GUEST ORDER LOOKUP
     ------------------------------------------------------------------ */
  window.handleGuestLookup = async function(e) {
    if (e) e.preventDefault();
    const orderNum = document.getElementById('lookup-ordernum')?.value.trim();
    const phone = document.getElementById('lookup-phone')?.value.trim();

    if (!orderNum || !phone) {
      showToast('Please enter both your Order Number and Phone Number');
      return;
    }

    let orderData = null;
    if (window.MedicareDB && typeof window.MedicareDB.trackOrder === 'function') {
      orderData = await window.MedicareDB.trackOrder(orderNum, phone);
    }

    const timelineCard = document.getElementById('order-timeline-card');
    const notFoundCard = document.getElementById('trk-not-found-card');

    if (!orderData) {
      // ORDER NOT FOUND STATE
      if (timelineCard) timelineCard.style.display = 'none';
      if (notFoundCard) {
        notFoundCard.style.display = 'block';
        notFoundCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      showToast('❌ Order not found — check your order number and phone number');
      return;
    }

    // ORDER FOUND STATE
    if (notFoundCard) notFoundCard.style.display = 'none';
    if (timelineCard) timelineCard.style.display = 'block';

    const ordNo = orderData.order_number || orderData.id || orderNum.toUpperCase();
    const displayId = document.getElementById('trk-order-id-display');
    if (displayId) displayId.textContent = `Order #${ordNo.replace(/^#/, '')}`;

    const dateDisplay = document.getElementById('trk-order-date-display');
    if (dateDisplay) {
      const createdDate = orderData.created_at ? new Date(orderData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today';
      dateDisplay.textContent = `Placed on ${createdDate} • Cash on Delivery (COD)`;
    }

    const badge = document.getElementById('trk-status-badge');
    const statusMap = {
      'Pending':    { class: 'dash-status-warning', text: '⏳ Order Placed — Pending Confirmation' },
      'Confirmed':  { class: 'dash-status-info',    text: '✅ Confirmed — Processing' },
      'Preparing':  { class: 'dash-status-info',    text: '📦 Preparing in Warehouse' },
      'Shipped':    { class: 'dash-status-shipped', text: '🚚 In Transit — Express Delivery' },
      'Delivered':  { class: 'dash-status-success', text: '🎉 Delivered Successfully' },
      'Cancelled':  { class: 'dash-status-error',   text: '❌ Order Cancelled' }
    };
    const sInfo = statusMap[orderData.status] || { class: 'dash-status-info', text: orderData.status };
    if (badge) {
      badge.className = `dash-status-badge ${sInfo.class}`;
      badge.textContent = sInfo.text;
    }

    const totalEl = document.getElementById('trk-total-display');
    if (totalEl) totalEl.textContent = `Total: ${Number(orderData.total || 0).toLocaleString()} DZD`;

    const custEl = document.getElementById('trk-customer-name');
    if (custEl) custEl.textContent = orderData.customer_name || 'Customer';

    const destEl = document.getElementById('trk-destination');
    if (destEl) destEl.textContent = `${orderData.wilaya || 'Algeria'}${orderData.commune ? ' (' + orderData.commune + ')' : ''}`;

    const courierEl = document.getElementById('trk-courier-name');
    if (courierEl) courierEl.textContent = orderData.delivery_type === 'stopdesk' ? 'Yalidine Stop-Desk Agency' : 'ZR Express Home Delivery';

    // TIMELINE STEPS PROGRESS
    const steps = ['step-placed', 'step-confirmed', 'step-preparing', 'step-shipped', 'step-delivered'];
    const statusOrder = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(orderData.status);

    steps.forEach((stepId, idx) => {
      const stepEl = document.getElementById(stepId);
      if (!stepEl) return;
      stepEl.classList.remove('completed', 'active');
      if (orderData.status === 'Cancelled') {
        // do nothing
      } else if (idx < currentIndex) {
        stepEl.classList.add('completed');
      } else if (idx === currentIndex) {
        stepEl.classList.add('active');
      }
    });

    const fillLine = document.getElementById('trk-timeline-line-fill');
    if (fillLine) {
      const pct = orderData.status === 'Cancelled' ? 0 : Math.min(100, Math.max(15, ((currentIndex + 1) / steps.length) * 100));
      fillLine.style.width = `${pct}%`;
    }

    timelineCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(`✓ Order Found — Status: ${orderData.status}`);
  };

  /* ------------------------------------------------------------------
     2. ACCOUNT DASHBOARD TABS
     ------------------------------------------------------------------ */
  window.switchDashTab = function(btn, tabId) {
    document.querySelectorAll('.dash-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.dash-tab-content').forEach(t => t.style.display = 'none');

    btn.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
  };

  /* ------------------------------------------------------------------
     3. 1-CLICK REORDER SYSTEM
     ------------------------------------------------------------------ */
  window.reorderItems = function(...itemIds) {
    const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
    itemIds.forEach(id => {
      let item = customProds.find(p => String(p.id) === String(id));
      if (!item && window.getProductById) item = window.getProductById(id);
      if (item) {
        if (window.MedicareCart && typeof window.MedicareCart.addItem === 'function') {
          window.MedicareCart.addItem({
            productId: item.id,
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1,
            image: (Array.isArray(item.images) && item.images[0]) || item.img || ''
          });
        }
      }
    });

    renderCart();
    cartOverlay?.classList.add('open');
    showToast('🔄 Items added to cart for reorder!');
  };

  /* ------------------------------------------------------------------
     4. CART DRAWER MANAGEMENT
     ------------------------------------------------------------------ */
  function renderCart() {
    const body = document.getElementById('trk-cart-body');
    const totalEl = document.getElementById('trk-cart-total');
    const badge = document.getElementById('trk-cart-badge');

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    if (badge) badge.textContent = totalQty;

    if (!body) return;

    let grand = 0;
    if (cart.length === 0) {
      body.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">Your cart is empty.</div>';
      if (totalEl) totalEl.textContent = '0 DZD';
      return;
    }

    body.innerHTML = cart.map((item, idx) => {
      grand += item.price * item.qty;
      return `
        <div class="mc-cart-item">
          <img src="${item.img}" class="mc-cart-item-img" alt="${item.name}">
          <div class="mc-cart-item-info">
            <span class="mc-cart-item-title">${item.name}</span>
            <span class="mc-cart-item-price">${item.price.toLocaleString()} DZD</span>
            <div class="mc-cart-qty-ctrl">
              <button class="mc-qty-btn" onclick="trkUpdateQty(${idx},-1)">−</button>
              <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
              <button class="mc-qty-btn" onclick="trkUpdateQty(${idx},1)">+</button>
            </div>
          </div>
          <button onclick="trkUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px">✕</button>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = `${grand.toLocaleString()} DZD`;
  }

  window.trkUpdateQty = function(idx, delta) {
    if (!cart[idx]) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCart();
  };

  if (cartBtn) cartBtn.addEventListener('click', () => { cartOverlay?.classList.add('open'); renderCart(); });
  if (cartClose) cartClose.addEventListener('click', () => cartOverlay?.classList.remove('open'));
  if (cartOverlay) cartOverlay.addEventListener('click', e => { if (e.target === cartOverlay) cartOverlay.classList.remove('open'); });

  renderCart();

  /* ------------------------------------------------------------------
     5. TOAST & LANGUAGE TOGGLE
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

});
