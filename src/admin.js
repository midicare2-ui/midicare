/* ==========================================================================
   MEDICARE — ADMIN DASHBOARD & STAFF PERMISSIONS ENGINE
   Auth Guard, Dynamic Sidebar Filtering, Granular Permission Matrix,
   Staff CRUD, Audit Activity Logger, Inactivity Auto-Logout
   ========================================================================== */

/* Global Toast Notification Handler */
window.showToast = function(msg) {
  const toast = document.getElementById('copy-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
};

document.addEventListener('DOMContentLoaded', () => {

  // Auto-clean any legacy oversized base64 strings to free browser localStorage quota
  try {
    const rawCustom = localStorage.getItem('medicare_custom_products');
    if (rawCustom && rawCustom.length > 500000) {
      const parsed = JSON.parse(rawCustom);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.map(p => ({
          ...p,
          images: (p.images || []).map(img => (typeof img === 'string' && img.length > 70000) ? '' : img),
          image: (typeof p.image === 'string' && p.image.length > 70000) ? '' : (p.image || '')
        }));
        localStorage.setItem('medicare_custom_products', JSON.stringify(cleaned));
      }
    }
  } catch (e) {}

  /* ------------------------------------------------------------------
     1. AUTH SESSION GUARD
     ------------------------------------------------------------------ */
  const sessionRaw = localStorage.getItem('medicare_admin_session');
  if (!sessionRaw) {
    // Unauthenticated access -> redirect to login portal
    window.location.href = 'admin-login.html';
    return;
  }

  const session = JSON.parse(sessionRaw);
  const currentUser = session.user;

  // Update Top Bar & Sidebar User Info
  const sidebarUserLabel = document.getElementById('sidebar-role-label');
  if (sidebarUserLabel) {
    sidebarUserLabel.textContent = `${currentUser.name} (${currentUser.role})`;
  }

  /* ------------------------------------------------------------------
     2. STAFF MEMBERS STORE
     ------------------------------------------------------------------ */
  // Staff list — loaded dynamically from Supabase by renderStaffTable()
  let staffList = [];

  /* ------------------------------------------------------------------
     3. AUDIT ACTIVITY LOG STORE
     ------------------------------------------------------------------ */
  // Audit log — new actions are prepended by logAuditAction(); real log loaded from Supabase
  let auditLogs = [];

  function logAuditAction(action, target) {
    if (window.MedicareDB && typeof window.MedicareDB.logAudit === 'function') {
      window.MedicareDB.logAudit(currentUser.name, action, target);
    }
    auditLogs.unshift({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      staff: currentUser.name,
      action: action,
      target: target,
      ip: '105.101.42.12 (Algeria)'
    });
    renderAuditTable();
  }

  /* ------------------------------------------------------------------
     8. LOGOUT HANDLER
     ------------------------------------------------------------------ */
  window.handleAdminLogout = async function() {
    if (window.MedicareDB && typeof window.MedicareDB.signOut === 'function') {
      await window.MedicareDB.signOut();
    } else {
      localStorage.removeItem('medicare_admin_session');
    }
    showToast('🚪 Logged out. Redirecting...');
    setTimeout(() => {
      window.location.href = 'admin-login.html';
    }, 600);
  };

  /* ------------------------------------------------------------------
     4. PERMISSION GUARD ENGINE & DYNAMIC SIDEBAR
     ------------------------------------------------------------------ */
  function hasPermission(moduleKey) {
    if (!currentUser) return false;
    if (currentUser.permissions.includes('all')) return true;

    const modulePermMap = {
      'mod-dashboard': true, // All staff can see dashboard home
      'mod-products': currentUser.permissions.includes('products'),
      'mod-inventory': currentUser.permissions.includes('inventory') || currentUser.permissions.includes('products'),
      'mod-orders': currentUser.permissions.includes('orders'),
      'mod-customers': currentUser.permissions.includes('customers') || currentUser.permissions.includes('orders'),
      'mod-categories': currentUser.permissions.includes('categories') || currentUser.permissions.includes('products'),
      'mod-coupons': currentUser.permissions.includes('coupons'),
      'mod-bundles': currentUser.permissions.includes('coupons') || currentUser.permissions.includes('products') || currentUser.role === 'Owner',
      'mod-reviews': currentUser.permissions.includes('reviews'),
      'mod-staff': currentUser.permissions.includes('staff') || currentUser.role === 'Owner',
      'mod-audit': currentUser.permissions.includes('audit') || currentUser.role === 'Owner',
      'mod-homepage': currentUser.permissions.includes('homepage'),
      'mod-delivery': currentUser.permissions.includes('delivery') || currentUser.role === 'Owner',
      'mod-reports': currentUser.permissions.includes('reports')
    };

    return !!modulePermMap[moduleKey];
  }

  function applySidebarPermissionFilter() {
    const navItems = {
      'mod-products': document.querySelector("button[onclick*='mod-products']"),
      'mod-inventory': document.querySelector("button[onclick*='mod-inventory']"),
      'mod-orders': document.querySelector("button[onclick*='mod-orders']"),
      'mod-customers': document.querySelector("button[onclick*='mod-customers']"),
      'mod-categories': document.querySelector("button[onclick*='mod-categories']"),
      'mod-coupons': document.querySelector("button[onclick*='mod-coupons']"),
      'mod-bundles': document.querySelector("button[onclick*='mod-bundles']"),
      'mod-reviews': document.querySelector("button[onclick*='mod-reviews']"),
      'mod-staff': document.getElementById('nav-item-staff'),
      'mod-audit': document.getElementById('nav-item-audit'),
      'mod-homepage': document.getElementById('nav-item-homepage'),
      'mod-delivery': document.getElementById('nav-item-delivery'),
      'mod-reports': document.getElementById('nav-item-reports')
    };

    Object.keys(navItems).forEach(key => {
      const btn = navItems[key];
      if (btn) {
        if (!hasPermission(key)) {
          btn.style.opacity = '0.4';
          btn.style.cursor = 'not-allowed';
        }
      }
    });
  }

  function updateSidebarBadges() {
    // 1. Orders badge: active/pending orders
    const ordersBadge = document.getElementById('nav-badge-orders');
    if (ordersBadge) {
      let orders = [];
      try {
        orders = (typeof allAdminOrders !== 'undefined' && Array.isArray(allAdminOrders) && allAdminOrders.length > 0)
          ? allAdminOrders
          : JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      } catch (e) {}
      const activeOrders = orders.filter(o => o && o.status !== 'Delivered' && o.status !== 'Cancelled');
      if (activeOrders.length > 0) {
        ordersBadge.textContent = activeOrders.length;
        ordersBadge.style.display = 'inline-block';
      } else {
        ordersBadge.style.display = 'none';
      }
    }

    // 2. Products badge: real product count
    const prodsBadge = document.getElementById('nav-badge-products');
    if (prodsBadge) {
      let prods = [];
      try {
        prods = typeof getCombinedProductsList === 'function'
          ? getCombinedProductsList()
          : JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      } catch (e) {}
      if (prods.length > 0) {
        prodsBadge.textContent = prods.length;
        prodsBadge.style.display = 'inline-block';
      } else {
        prodsBadge.style.display = 'none';
      }
    }

    // 3. Inventory badge: low stock items (stock <= 5)
    const invBadge = document.getElementById('nav-badge-inventory');
    if (invBadge) {
      let prods = [];
      try {
        prods = typeof getCombinedProductsList === 'function'
          ? getCombinedProductsList()
          : JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      } catch (e) {}
      const lowStockCount = prods.filter(p => Number(p.stock) <= 5).length;
      if (lowStockCount > 0) {
        invBadge.textContent = lowStockCount;
        invBadge.style.display = 'inline-block';
      } else {
        invBadge.style.display = 'none';
      }
    }

    // 4. Reviews badge: pending moderation reviews
    const revBadge = document.getElementById('nav-badge-reviews');
    if (revBadge) {
      let reviews = [];
      try {
        reviews = window._allAdminReviews || JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      } catch (e) {}
      const pendingCount = reviews.filter(r => r && r.is_approved === false).length;
      if (pendingCount > 0) {
        revBadge.textContent = pendingCount;
        revBadge.style.display = 'inline-block';
      } else {
        revBadge.style.display = 'none';
      }
    }

    // 5. Staff badge: total active staff
    const staffBadge = document.getElementById('nav-badge-staff');
    if (staffBadge) {
      let staffList = [];
      try {
        staffList = (typeof staffMembers !== 'undefined' && Array.isArray(staffMembers))
          ? staffMembers
          : JSON.parse(localStorage.getItem('medicare_staff_roles') || '[]');
      } catch (e) {}
      if (staffList.length > 0) {
        staffBadge.textContent = staffList.length;
        staffBadge.style.display = 'inline-block';
      } else {
        staffBadge.style.display = 'none';
      }
    }
  }

  applySidebarPermissionFilter();
  updateSidebarBadges();

  /* ------------------------------------------------------------------
     5. MOBILE DRAWER NAVIGATION
     ------------------------------------------------------------------ */
  const admSidebar   = document.getElementById('adm-sidebar');
  const admBackdrop  = document.getElementById('adm-sidebar-backdrop');

  window.openAdminDrawer = function() {
    if (!admSidebar) return;
    admSidebar.classList.add('adm-drawer-open');
    if (admBackdrop) admBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent page scroll behind drawer
  };

  window.closeAdminDrawer = function() {
    if (!admSidebar) return;
    admSidebar.classList.remove('adm-drawer-open');
    if (admBackdrop) admBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.toggleAdminDrawer = function() {
    if (admSidebar && admSidebar.classList.contains('adm-drawer-open')) {
      window.closeAdminDrawer();
    } else {
      window.openAdminDrawer();
    }
  };

  // Close drawer and modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeAdminDrawer();
      document.querySelectorAll('.adm-modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });

  // Close modals when clicking backdrop overlay
  document.querySelectorAll('.adm-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  /* ------------------------------------------------------------------
     6. MODULE SWITCHER WITH PERMISSION CHECK
     ------------------------------------------------------------------ */
  window.switchModule = function(btn, modId) {
    if (!hasPermission(modId)) {
      document.querySelectorAll('.adm-module-panel').forEach(p => p.classList.remove('active'));
      const deniedBox = document.getElementById('adm-access-denied');
      if (deniedBox) deniedBox.classList.add('active');
      showToast('⛔ Access Restricted: Required permission missing');
      // Still close drawer on mobile even on denied access
      if (window.innerWidth < 1024) window.closeAdminDrawer();
      return;
    }

    if (btn) {
      document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    document.querySelectorAll('.adm-module-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(modId);
    if (target) target.classList.add('active');

    const titleMap = {
      'mod-dashboard': '📊 Executive Dashboard Overview',
      'mod-orders': '📦 Orders Management & Workflow',
      'mod-products': '👕 Products Catalog Management',
      'mod-inventory': '🏬 Variant Stock & Low-Stock Alerts',
      'mod-customers': '👥 Medical Customer Directory',
      'mod-categories': '🏷️ Categories & Specialty Tags',
      'mod-coupons': '🎟️ Discount Coupons & Promo Codes',
      'mod-bundles': '🎁 Frequently Bought Together Bundles & Offers',
      'mod-reviews': '✍️ Customer Reviews Moderation',
      'mod-staff': '🔐 Staff Members & Granular Permissions',
      'mod-audit': '📜 System Audit Activity Log',
      'mod-homepage': '🖼️ Homepage Content Manager (CMS)',
      'mod-delivery': '🚚 58 Wilayas & Delivery Fee Rates',
      'mod-reports': '📈 Analytics & Sales Reports'
    };

    const headerTitle = document.getElementById('adm-header-title');
    if (headerTitle && titleMap[modId]) headerTitle.textContent = titleMap[modId];

    // Dynamic refresh when opening specific modules
    if (modId === 'mod-dashboard') {
      if (typeof updateDashboardKPIs === 'function') updateDashboardKPIs();
      if (typeof renderSalesChart === 'function') renderSalesChart(currentChartPeriod || '7d');
      if (typeof renderTopSellers === 'function') renderTopSellers();
      if (typeof renderOrdersTables === 'function') renderOrdersTables();
    } else if (modId === 'mod-orders') {
      if (typeof loadAndRenderOrders === 'function') loadAndRenderOrders();
    } else if (modId === 'mod-customers') {
      if (typeof buildCustomerDirectory === 'function') buildCustomerDirectory();
      if (typeof renderCustomerDirectory === 'function') renderCustomerDirectory();
    } else if (modId === 'mod-categories') {
      if (typeof renderCategoryCounts === 'function') renderCategoryCounts();
    } else if (modId === 'mod-reports') {
      if (typeof renderSpecialtyReports === 'function') renderSpecialtyReports();
    } else if (modId === 'mod-homepage') {
      if (typeof initAnnouncementCMS === 'function') initAnnouncementCMS();
      if (typeof initHeroCMS === 'function') initHeroCMS();
      if (typeof initCommunityCMS === 'function') initCommunityCMS();
      if (typeof initTrustBadgesCMS === 'function') initTrustBadgesCMS();
    } else if (modId === 'mod-reviews') {
      if (typeof renderAdminReviews === 'function') renderAdminReviews();
    } else if (modId === 'mod-inventory') {
      if (typeof renderBulkStockTable === 'function') renderBulkStockTable();
      if (typeof initWarehouseReturnModule === 'function') initWarehouseReturnModule();
      if (typeof renderWarehouseLogsTable === 'function') renderWarehouseLogsTable();
    }

    // Auto-close drawer on mobile after selecting a module
    if (window.innerWidth < 1024) window.closeAdminDrawer();
  };

  /* ------------------------------------------------------------------
     6. STAFF MANAGEMENT RENDER & ACTIONS
     ------------------------------------------------------------------ */
  function renderStaffTable() {
    const tbody = document.getElementById('admin-staff-table-body');
    if (!tbody) return;

    tbody.innerHTML = staffList.map(s => `
      <tr>
        <td>
          <strong>${s.name}</strong>
          ${s.role === 'Owner' ? '<span class="adm-badge adm-badge-warning" style="margin-left:0.25rem;">Owner</span>' : ''}
        </td>
        <td><code>${s.email}</code></td>
        <td><strong>${s.role}</strong></td>
        <td>
          <span style="font-size:11.5px; color:#64748B;">
            ${s.permissions.includes('all') ? 'Full Access (All Modules)' : s.permissions.join(', ')}
          </span>
        </td>
        <td>
          <span class="adm-badge ${s.status === 'Active' ? 'adm-badge-success' : 'adm-badge-error'}">
            ${s.status}
          </span>
        </td>
        <td>${s.lastLogin}</td>
        <td>
          ${s.role !== 'Owner' ? `
            <button class="adm-btn-icon" onclick="toggleStaffStatus('${s.id}')" title="Toggle Status">${s.status === 'Active' ? '⏸️' : '▶️'}</button>
            <button class="adm-btn-icon" onclick="deleteStaff('${s.id}')" title="Delete Account">🗑️</button>
          ` : '<span style="font-size:11px; color:#94A3B8;">Protected</span>'}
        </td>
      </tr>
    `).join('');
  }

  window.toggleStaffStatus = function(id) {
    const staff = staffList.find(s => s.id === id);
    if (staff) {
      staff.status = staff.status === 'Active' ? 'Suspended' : 'Active';
      renderStaffTable();
      logAuditAction('Toggled Staff Status', `${staff.name} → ${staff.status}`);
      showToast(`✓ Staff member ${staff.name} is now ${staff.status}`);
    }
  };

  window.deleteStaff = function(id) {
    const staff = staffList.find(s => s.id === id);
    if (staff) {
      staffList = staffList.filter(s => s.id !== id);
      renderStaffTable();
      logAuditAction('Deleted Staff Account', staff.name);
      showToast(`🗑️ Deleted staff account for ${staff.name}`);
    }
  };

  window.openAddStaffModal = function() {
    document.getElementById('modal-add-staff')?.classList.add('open');
  };

  window.closeAddStaffModal = function() {
    document.getElementById('modal-add-staff')?.classList.remove('open');
  };

  window.onRolePresetChange = function(preset) {
    const permProducts  = document.getElementById('perm-products');
    const permInventory = document.getElementById('perm-inventory');
    const permOrders    = document.getElementById('perm-orders');
    const permCoupons   = document.getElementById('perm-coupons');
    const permReviews   = document.getElementById('perm-reviews');
    const permHomepage  = document.getElementById('perm-homepage');
    const permDelivery  = document.getElementById('perm-delivery');
    const permReports   = document.getElementById('perm-reports');

    if (preset === 'Store Manager') {
      if (permProducts) permProducts.checked = true;
      if (permInventory) permInventory.checked = true;
      if (permOrders) permOrders.checked = true;
      if (permCoupons) permCoupons.checked = true;
      if (permReviews) permReviews.checked = true;
      if (permHomepage) permHomepage.checked = true;
      if (permDelivery) permDelivery.checked = true;
      if (permReports) permReports.checked = true;
    } else if (preset === 'Order Handler') {
      if (permProducts) permProducts.checked = false;
      if (permInventory) permInventory.checked = false;
      if (permOrders) permOrders.checked = true;
      if (permCoupons) permCoupons.checked = false;
      if (permReviews) permReviews.checked = true;
      if (permHomepage) permHomepage.checked = false;
      if (permDelivery) permDelivery.checked = false;
      if (permReports) permReports.checked = false;
    } else if (preset === 'Support & Content') {
      if (permProducts) permProducts.checked = false;
      if (permInventory) permInventory.checked = false;
      if (permOrders) permOrders.checked = false;
      if (permCoupons) permCoupons.checked = false;
      if (permReviews) permReviews.checked = true;
      if (permHomepage) permHomepage.checked = true;
      if (permDelivery) permDelivery.checked = false;
      if (permReports) permReports.checked = false;
    }
  };

  window.saveStaffSubmit = function(e) {
    e.preventDefault();
    const name  = document.getElementById('stf-name')?.value.trim();
    const email = document.getElementById('stf-email')?.value.trim();
    const role  = document.getElementById('stf-role-preset')?.value;

    const perms = [];
    if (document.getElementById('perm-products')?.checked) perms.push('products');
    if (document.getElementById('perm-inventory')?.checked) perms.push('inventory');
    if (document.getElementById('perm-orders')?.checked) perms.push('orders');
    if (document.getElementById('perm-coupons')?.checked) perms.push('coupons');
    if (document.getElementById('perm-reviews')?.checked) perms.push('reviews');
    if (document.getElementById('perm-homepage')?.checked) perms.push('homepage');
    if (document.getElementById('perm-delivery')?.checked) perms.push('delivery');
    if (document.getElementById('perm-reports')?.checked) perms.push('reports');

    const newStaff = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      role,
      status: 'Active',
      permissions: perms,
      lastLogin: 'Never'
    };

    staffList.push(newStaff);
    renderStaffTable();
    closeAddStaffModal();
    logAuditAction('Created Staff Member', `${name} (${role})`);
    showToast(`🎉 Staff account created for ${name}!`);
  };

  /* ------------------------------------------------------------------
     6.5 DYNAMIC COUPON MANAGEMENT ENGINE (CRUD)
     ------------------------------------------------------------------ */
  const DEFAULT_COUPONS = [
    {
      id: 'CPN-101',
      code: 'STUDENT10',
      type: 'percentage',
      value: 10,
      usage_limit: 500,
      used_count: 142,
      expiry_date: '',
      status: 'Active',
      createdAt: '2026-08-01T00:00:00.000Z'
    },
    {
      id: 'CPN-102',
      code: 'MEDICARE2026',
      type: 'fixed',
      value: 2000,
      usage_limit: 200,
      used_count: 89,
      expiry_date: '2026-12-31',
      status: 'Active',
      createdAt: '2026-08-05T00:00:00.000Z'
    }
  ];

  function getStoredCoupons() {
    try {
      const raw = localStorage.getItem('medicare_coupons');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[Admin] Error reading medicare_coupons:', e);
    }
    localStorage.setItem('medicare_coupons', JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
  }

  function saveStoredCoupons(coupons) {
    localStorage.setItem('medicare_coupons', JSON.stringify(coupons));
    window.dispatchEvent(new CustomEvent('medicare_coupons_updated'));
    renderCouponsTable();
  }

  function renderCouponsTable() {
    const tbody = document.getElementById('admin-coupons-table-body');
    if (!tbody) return;

    const coupons = getStoredCoupons();
    if (coupons.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#64748B;">No coupons created yet. Click "+ Create Coupon" above.</td></tr>';
      return;
    }

    tbody.innerHTML = coupons.map(c => {
      const discountLabel = c.type === 'percentage'
        ? `<span style="font-weight:700; color:var(--adm-primary,#064E3B);">${c.value}% OFF</span>`
        : `<span style="font-weight:700; color:var(--adm-primary,#064E3B);">${Number(c.value).toLocaleString()} DZD OFF</span>`;

      const limitLabel = c.usage_limit ? `${Number(c.usage_limit).toLocaleString()} uses` : 'Unlimited';
      const usedLabel = `${Number(c.used_count || 0).toLocaleString()} uses`;

      let expiryLabel = '<span style="color:#94A3B8; font-size:12px;">No Expiry</span>';
      if (c.expiry_date) {
        const d = new Date(c.expiry_date + 'T23:59:59');
        const isExpired = !isNaN(d.getTime()) && d < new Date();
        expiryLabel = `<span style="font-size:12px; ${isExpired ? 'color:#EF4444; font-weight:700;' : 'color:#475569;'}">${c.expiry_date}${isExpired ? ' (Expired)' : ''}</span>`;
      }

      const statusBadge = `<span class="adm-badge ${c.status === 'Active' ? 'adm-badge-success' : 'adm-badge-error'}">${c.status}</span>`;

      return `
        <tr>
          <td><strong style="letter-spacing:0.5px; font-family:monospace; font-size:13.5px;">${c.code}</strong></td>
          <td>${discountLabel}</td>
          <td>${limitLabel}</td>
          <td>${usedLabel}</td>
          <td>${expiryLabel}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="adm-btn-icon" onclick="openEditCouponModal('${c.id}')" title="Edit Coupon">✏️</button>
            <button class="adm-btn-icon" onclick="toggleCouponStatus('${c.id}')" title="Toggle Active/Inactive">${c.status === 'Active' ? '⏸️' : '▶️'}</button>
            <button class="adm-btn-icon" onclick="deleteCoupon('${c.id}')" title="Delete Coupon">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.openCouponModal = function() {
    const modal = document.getElementById('modal-coupon');
    if (!modal) return;
    document.getElementById('modal-coupon-title').textContent = '🎁 Create New Discount Coupon';
    document.getElementById('cpn-edit-id').value = '';
    document.getElementById('cpn-code').value = '';
    document.getElementById('cpn-type').value = 'percentage';
    document.getElementById('cpn-value').value = '10';
    document.getElementById('cpn-limit').value = '500';
    document.getElementById('cpn-expiry').value = '';
    document.getElementById('cpn-status').value = 'Active';
    window.onCouponTypeChange('percentage');
    modal.classList.add('open');
  };

  window.openEditCouponModal = function(id) {
    const coupons = getStoredCoupons();
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    const modal = document.getElementById('modal-coupon');
    if (!modal) return;

    document.getElementById('modal-coupon-title').textContent = `✏️ Edit Coupon: ${coupon.code}`;
    document.getElementById('cpn-edit-id').value = coupon.id;
    document.getElementById('cpn-code').value = coupon.code;
    document.getElementById('cpn-type').value = coupon.type || 'percentage';
    document.getElementById('cpn-value').value = coupon.value;
    document.getElementById('cpn-limit').value = coupon.usage_limit || 500;
    document.getElementById('cpn-expiry').value = coupon.expiry_date || '';
    document.getElementById('cpn-status').value = coupon.status || 'Active';
    window.onCouponTypeChange(coupon.type || 'percentage');
    modal.classList.add('open');
  };

  window.closeCouponModal = function() {
    document.getElementById('modal-coupon')?.classList.remove('open');
  };

  window.onCouponTypeChange = function(type) {
    const valLabel = document.getElementById('cpn-value-label');
    const valInput = document.getElementById('cpn-value');
    if (!valLabel || !valInput) return;

    if (type === 'percentage') {
      valLabel.innerHTML = 'Discount Percentage (%) <span class="required">*</span>';
      valInput.placeholder = 'e.g. 15';
      valInput.max = '100';
      valInput.min = '1';
    } else {
      valLabel.innerHTML = 'Fixed Discount Amount (DZD) <span class="required">*</span>';
      valInput.placeholder = 'e.g. 2000';
      valInput.removeAttribute('max');
      valInput.min = '100';
    }
  };

  window.saveCouponSubmit = function(e) {
    e.preventDefault();
    const editId = document.getElementById('cpn-edit-id')?.value.trim();
    const code = document.getElementById('cpn-code')?.value.trim().toUpperCase();
    const type = document.getElementById('cpn-type')?.value;
    const value = parseFloat(document.getElementById('cpn-value')?.value);
    const limit = parseInt(document.getElementById('cpn-limit')?.value) || 0;
    const expiry = document.getElementById('cpn-expiry')?.value.trim() || '';
    const status = document.getElementById('cpn-status')?.value || 'Active';

    if (!code) {
      showToast('⚠️ Please enter a coupon code');
      return;
    }

    if (isNaN(value) || value <= 0) {
      showToast('⚠️ Please enter a valid discount value greater than 0');
      return;
    }

    if (type === 'percentage' && (value < 1 || value > 100)) {
      showToast('⚠️ Percentage discount must be between 1% and 100%');
      return;
    }

    if (limit <= 0) {
      showToast('⚠️ Usage limit must be at least 1');
      return;
    }

    const coupons = getStoredCoupons();

    // Check duplicate code
    const duplicate = coupons.find(c => c.code.toUpperCase() === code && c.id !== editId);
    if (duplicate) {
      showToast(`⚠️ Coupon code "${code}" already exists!`);
      return;
    }

    if (editId) {
      // Edit existing coupon
      const idx = coupons.findIndex(c => c.id === editId);
      if (idx !== -1) {
        coupons[idx] = {
          ...coupons[idx],
          code,
          type,
          value,
          usage_limit: limit,
          expiry_date: expiry,
          status,
          updatedAt: new Date().toISOString()
        };
        saveStoredCoupons(coupons);
        logAuditAction('Updated Coupon Code', `${code} (${type === 'percentage' ? value + '%' : value + ' DZD'})`);
        showToast(`✓ Coupon "${code}" updated successfully!`);
      }
    } else {
      // Create new coupon
      const newCoupon = {
        id: `CPN-${Math.floor(100 + Math.random() * 900)}`,
        code,
        type,
        value,
        usage_limit: limit,
        used_count: 0,
        expiry_date: expiry,
        status,
        createdAt: new Date().toISOString()
      };
      coupons.unshift(newCoupon);
      saveStoredCoupons(coupons);
      logAuditAction('Created Coupon Code', `${code} (${type === 'percentage' ? value + '%' : value + ' DZD'})`);
      showToast(`🎉 Coupon "${code}" created successfully!`);
    }

    closeCouponModal();
  };

  window.toggleCouponStatus = function(id) {
    const coupons = getStoredCoupons();
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    coupon.status = coupon.status === 'Active' ? 'Inactive' : 'Active';
    saveStoredCoupons(coupons);
    logAuditAction('Toggled Coupon Status', `${coupon.code} → ${coupon.status}`);
    showToast(`✓ Coupon ${coupon.code} is now ${coupon.status}`);
  };

  window.deleteCoupon = function(id) {
    const coupons = getStoredCoupons();
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    if (!confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;

    const filtered = coupons.filter(c => c.id !== id);
    saveStoredCoupons(filtered);
    logAuditAction('Deleted Coupon Code', coupon.code);
    showToast(`🗑️ Coupon "${coupon.code}" deleted`);
  };

  const couponModalEl = document.getElementById('modal-coupon');
  if (couponModalEl) {
    couponModalEl.addEventListener('click', e => {
      if (e.target === couponModalEl) closeCouponModal();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && couponModalEl?.classList.contains('open')) {
      closeCouponModal();
    }
  });

  /* ------------------------------------------------------------------
     7. AUDIT ACTIVITY LOG RENDER
     ------------------------------------------------------------------ */
  function renderAuditTable() {
    const tbody = document.getElementById('admin-audit-table-body');
    if (!tbody) return;

    tbody.innerHTML = auditLogs.map(a => `
      <tr>
        <td><code>${a.timestamp}</code></td>
        <td><strong>${a.staff}</strong></td>
        <td><span class="adm-badge adm-badge-info">${a.action}</span></td>
        <td>${a.target}</td>
        <td><span style="font-size:11px; color:#64748B;">${a.ip}</span></td>
      </tr>
    `).join('');
  }

  /* ------------------------------------------------------------------
     8. LOGOUT HANDLER
     ------------------------------------------------------------------ */
  window.handleAdminLogout = function() {
    localStorage.removeItem('medicare_admin_session');
    showToast('🚪 Logged out. Redirecting...');
    setTimeout(() => {
      window.location.href = 'admin-login.html';
    }, 600);
  };

  /* ------------------------------------------------------------------
     9. INACTIVITY AUTO-LOGOUT TIMER (15 Minutes)
     ------------------------------------------------------------------ */
  let inactivityTimer;
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      alert('⚠️ Session expired due to inactivity. Please log in again.');
      handleAdminLogout();
    }, 15 * 60 * 1000); // 15 mins
  }

  window.addEventListener('mousemove', resetInactivityTimer);
  window.addEventListener('keydown', resetInactivityTimer);
  resetInactivityTimer();

  function showToast(msg) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // Initial renders
  renderStaffTable();
  renderCouponsTable();
  renderAuditTable();

  // Listeners for real-time coupon updates
  window.addEventListener('medicare_coupons_updated', renderCouponsTable);
  window.addEventListener('storage', e => {
    if (e.key === 'medicare_coupons') renderCouponsTable();
  });

  /* ------------------------------------------------------------------
     10. DYNAMIC ORDERS MANAGEMENT, REAL-TIME ANALYTICS & DASHBOARD ENGINE
     ------------------------------------------------------------------ */
  let allAdminOrders = [];
  let currentOrderFilter = 'all';
  let currentChartPeriod = '7d';
  let allCustomerRecords = [];

  async function loadAndRenderOrders() {
    if (window.MedicareDB && typeof window.MedicareDB.getOrders === 'function') {
      try {
        allAdminOrders = await window.MedicareDB.getOrders();
      } catch (e) {
        console.warn('[Admin] Failed to fetch orders from MedicareDB:', e);
      }
    }
    
    // Refresh all dependent dashboard analytics & views
    renderOrdersTables();
    updateDashboardKPIs();
    renderSalesChart(currentChartPeriod);
    renderTopSellers();
    buildCustomerDirectory();
    renderCustomerDirectory();
    renderCategoryCounts();
    renderSpecialtyReports();
    updateOrderTabCounters();
    updateSidebarBadges();
  }

  function updateDashboardKPIs() {
    const orders = Array.isArray(allAdminOrders) ? allAdminOrders : [];
    const validOrders = orders.filter(o => o && o.status !== 'Cancelled');

    // 1. Today's date in local YYYY-MM-DD
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayPrefix = `${todayYear}-${todayMonth}-${todayDay}`;

    // Yesterday's date
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const yestPrefix = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

    const todayOrders = validOrders.filter(o => o.created_at && o.created_at.startsWith(todayPrefix));
    const yesterdayOrders = validOrders.filter(o => o.created_at && o.created_at.startsWith(yestPrefix));

    // Today's Orders KPI
    const ordersValEl = document.getElementById('kpi-today-orders-val');
    const ordersTrendEl = document.getElementById('kpi-today-orders-trend');
    if (ordersValEl) ordersValEl.textContent = todayOrders.length;
    if (ordersTrendEl) {
      if (yesterdayOrders.length > 0) {
        const diff = todayOrders.length - yesterdayOrders.length;
        const pct = Math.round((diff / yesterdayOrders.length) * 100);
        ordersTrendEl.className = `adm-kpi-trend ${diff >= 0 ? 'adm-trend-up' : 'adm-trend-down'}`;
        ordersTrendEl.textContent = `${diff >= 0 ? '↑ +' : '↓ '}${pct}% vs yesterday (${yesterdayOrders.length})`;
      } else if (todayOrders.length > 0) {
        ordersTrendEl.className = 'adm-kpi-trend adm-trend-up';
        ordersTrendEl.textContent = `↑ ${todayOrders.length} new ${todayOrders.length === 1 ? 'order' : 'orders'} today`;
      } else {
        ordersTrendEl.className = 'adm-kpi-trend';
        ordersTrendEl.textContent = 'No orders recorded today';
      }
    }

    // Today's Revenue (COD) KPI
    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const revValEl = document.getElementById('kpi-today-revenue-val');
    const revTrendEl = document.getElementById('kpi-today-revenue-trend');
    if (revValEl) revValEl.textContent = `${todayRevenue.toLocaleString()} DZD`;
    if (revTrendEl) {
      const allTimeRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      revTrendEl.textContent = allTimeRevenue > 0 ? `All-time volume: ${allTimeRevenue.toLocaleString()} DZD` : 'Cash on Delivery volume';
    }

    // Low Stock Alerts KPI
    const allProducts = typeof getCombinedProductsList === 'function' ? getCombinedProductsList() : [];
    let lowStockCount = 0;
    allProducts.forEach(p => {
      const stock = Number(p.stock ?? 0);
      if (stock <= 5) lowStockCount++;
    });
    const lowStockValEl = document.getElementById('kpi-low-stock-val');
    const lowStockTrendEl = document.getElementById('kpi-low-stock-trend');
    if (lowStockValEl) lowStockValEl.textContent = `${lowStockCount} ${lowStockCount === 1 ? 'Item' : 'Items'}`;
    if (lowStockTrendEl) {
      lowStockTrendEl.className = `adm-kpi-trend ${lowStockCount > 0 ? 'adm-trend-down' : 'adm-trend-up'}`;
      lowStockTrendEl.textContent = lowStockCount > 0 ? '≤ 5 units (requires restock)' : 'All product stocks healthy';
    }

    // Pending Dispatch KPI
    const pendingDispatchOrders = validOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes((o.status || '').toLowerCase()));
    const pendingValEl = document.getElementById('kpi-pending-dispatch-val');
    const pendingTrendEl = document.getElementById('kpi-pending-dispatch-trend');
    if (pendingValEl) pendingValEl.textContent = `${pendingDispatchOrders.length} ${pendingDispatchOrders.length === 1 ? 'Order' : 'Orders'}`;
    if (pendingTrendEl) {
      const couriers = [...new Set(pendingDispatchOrders.map(o => o.courier_company).filter(Boolean))];
      pendingTrendEl.textContent = couriers.length > 0 ? couriers.join(' • ') : 'ZR Express / Yalidine';
    }
  }

  function updateOrderTabCounters() {
    const orders = Array.isArray(allAdminOrders) ? allAdminOrders : [];
    const counts = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      shipped: 0,
      delivered: 0
    };
    orders.forEach(o => {
      const s = (o.status || '').toLowerCase();
      if (s === 'pending') counts.pending++;
      else if (s === 'preparing' || s === 'confirmed') counts.preparing++;
      else if (s === 'shipped') counts.shipped++;
      else if (s === 'delivered') counts.delivered++;
    });

    const setBtn = (id, label, count) => {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = `${label} (${count})`;
    };
    setBtn('btn-filter-order-all', 'All', counts.all);
    setBtn('btn-filter-order-pending', 'Pending', counts.pending);
    setBtn('btn-filter-order-preparing', 'Preparing', counts.preparing);
    setBtn('btn-filter-order-shipped', 'Shipped', counts.shipped);
    setBtn('btn-filter-order-delivered', 'Delivered', counts.delivered);
  }

  window.updateChartPeriod = function(period) {
    currentChartPeriod = period;
    document.getElementById('btn-chart-7d')?.classList.toggle('active', period === '7d');
    document.getElementById('btn-chart-30d')?.classList.toggle('active', period === '30d');
    renderSalesChart(period);
  };

  function renderSalesChart(period = '7d') {
    const chartBox = document.getElementById('chart-bars-box');
    if (!chartBox) return;

    const orders = (Array.isArray(allAdminOrders) ? allAdminOrders : []).filter(o => o && o.status !== 'Cancelled');
    const numDays = period === '30d' ? 30 : 7;
    const now = new Date();

    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayLabel = period === '7d'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      
      const dayRevenue = orders
        .filter(o => o.created_at && o.created_at.startsWith(isoPrefix))
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

      days.push({ dateStr: isoPrefix, label: dayLabel, revenue: dayRevenue, isToday: i === 0 });
    }

    const maxRev = Math.max(...days.map(d => d.revenue), 1000);

    chartBox.innerHTML = days.map(d => {
      const heightPct = Math.max(8, Math.round((d.revenue / maxRev) * 100));
      return `
        <div class="adm-chart-bar-group" title="${d.dateStr}: ${d.revenue.toLocaleString()} DZD">
          <div class="adm-chart-bar ${d.isToday ? 'highlight' : ''}" style="height:${heightPct}%;"></div>
          <span style="font-size:10px; font-weight:${d.isToday ? '700' : '500'}; color:${d.isToday ? 'var(--adm-primary)' : 'var(--adm-muted-fg)'};">${d.label}</span>
        </div>
      `;
    }).join('');
  }

  function renderTopSellers() {
    const container = document.getElementById('dashboard-top-sellers');
    if (!container) return;

    const orders = (Array.isArray(allAdminOrders) ? allAdminOrders : []).filter(o => o && o.status !== 'Cancelled');
    const productStats = {};

    orders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(item => {
          const key = item.id || item.sku || item.name || 'Unknown Item';
          if (!productStats[key]) {
            productStats[key] = {
              name: item.name || item.nameAr || key,
              image: item.image || item.img || 'assets/medicare_scrubs_hero_1786614154492.png',
              qty: 0,
              revenue: 0
            };
          }
          const q = Number(item.quantity || item.qty || 1);
          const p = Number(item.price || 0);
          productStats[key].qty += q;
          productStats[key].revenue += q * p;
        });
      }
    });

    const sorted = Object.values(productStats).sort((a, b) => b.qty - a.qty).slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem; color:var(--adm-muted-fg); font-size:12.5px;">
          📦 No product sales recorded yet. When customer orders are placed, top selling products will appear here.
        </div>
      `;
      return;
    }

    container.innerHTML = sorted.map((p, idx) => `
      <div style="display:flex; align-items:center; gap:0.75rem; padding:0.4rem 0; border-bottom:${idx < sorted.length - 1 ? '1px solid var(--adm-border)' : 'none'};">
        <img src="${p.image}" alt="${p.name}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; background:#f1f5f9;" onerror="this.src='assets/medicare_scrubs_hero_1786614154492.png'">
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${p.name}">
            ${p.name}
          </div>
          <div style="font-size:11px; color:#64748B;">
            <strong style="color:var(--adm-foreground);">${p.qty} sold</strong> • ${p.revenue.toLocaleString()} DZD
          </div>
        </div>
      </div>
    `).join('');
  }

  function buildCustomerDirectory() {
    const orders = Array.isArray(allAdminOrders) ? allAdminOrders : [];
    const customerMap = new Map();

    orders.forEach(o => {
      const phone = (o.phone || '').trim();
      const email = (o.email || '').trim().toLowerCase();
      const name = (o.customer_name || 'Guest Customer').trim();
      const key = phone || email || name;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: name,
          phone: phone || 'N/A',
          email: email,
          wilaya: o.wilaya || 'Algeria',
          specialty: o.specialty || o.medical_role || 'Healthcare Customer',
          totalOrders: 0,
          lifetimeSpend: 0,
          lastActive: o.created_at || new Date().toISOString()
        });
      }

      const rec = customerMap.get(key);
      rec.totalOrders++;
      rec.lifetimeSpend += Number(o.total || 0);
      if (new Date(o.created_at) > new Date(rec.lastActive)) {
        rec.lastActive = o.created_at;
        rec.wilaya = o.wilaya || rec.wilaya;
      }
    });

    allCustomerRecords = Array.from(customerMap.values()).sort((a, b) => b.lifetimeSpend - a.lifetimeSpend);
  }

  function renderCustomerDirectory(list = null) {
    const tbody = document.getElementById('admin-customers-table-body');
    if (!tbody) return;

    const data = list || allCustomerRecords;
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#64748B;">No customer records found yet. Customers who place orders or register will appear here.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(c => {
      const dateFormatted = c.lastActive ? new Date(c.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
      return `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td><span style="font-size:12px; color:#0F766E; font-weight:600;">${c.specialty}</span></td>
          <td><code>${c.phone}</code></td>
          <td>${c.wilaya}</td>
          <td><strong>${c.totalOrders} ${c.totalOrders === 1 ? 'order' : 'orders'}</strong></td>
          <td><strong style="color:var(--color-primary-600, #0E4D45);">${c.lifetimeSpend.toLocaleString()} DZD</strong></td>
          <td style="font-size:11.5px; color:#64748B;">${dateFormatted}</td>
        </tr>
      `;
    }).join('');
  }

  window.filterCustomerDirectory = function(q) {
    const query = (q || '').toLowerCase().trim();
    if (!query) {
      renderCustomerDirectory(allCustomerRecords);
      return;
    }
    const filtered = allCustomerRecords.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.phone.toLowerCase().includes(query) ||
      c.wilaya.toLowerCase().includes(query) ||
      c.specialty.toLowerCase().includes(query)
    );
    renderCustomerDirectory(filtered);
  };

  function renderCategoryCounts() {
    const treeList = document.getElementById('admin-categories-tree-list');
    if (!treeList) return;

    const allProducts = typeof getCombinedProductsList === 'function' ? getCombinedProductsList() : [];
    const counts = {
      'Scrubs': 0,
      'Lab Coats': 0,
      'Footwear': 0,
      'Diagnostic Tools': 0,
      'Medical Bags': 0,
      'Starter Kits': 0
    };

    allProducts.forEach(p => {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('scrub')) counts['Scrubs']++;
      else if (cat.includes('lab') || cat.includes('coat')) counts['Lab Coats']++;
      else if (cat.includes('foot') || cat.includes('clog') || cat.includes('shoe')) counts['Footwear']++;
      else if (cat.includes('diagnos') || cat.includes('stetho') || cat.includes('tool')) counts['Diagnostic Tools']++;
      else if (cat.includes('bag')) counts['Medical Bags']++;
      else if (cat.includes('kit') || cat.includes('bundle')) counts['Starter Kits']++;
      else counts['Scrubs']++;
    });

    const categoryIcons = {
      'Scrubs': '👕',
      'Lab Coats': '🥼',
      'Footwear': '👟',
      'Diagnostic Tools': '🩺',
      'Medical Bags': '🎒',
      'Starter Kits': '📦'
    };

    treeList.innerHTML = Object.entries(counts).map(([catName, count]) => `
      <li style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0.6rem; border-radius:6px; background:var(--adm-card-bg); border:1px solid var(--adm-border);">
        <span>${categoryIcons[catName] || '🏷️'} <strong>${catName}</strong></span>
        <span class="adm-badge adm-badge-info" style="font-weight:700;">${count} ${count === 1 ? 'product' : 'products'}</span>
      </li>
    `).join('');
  }

  function renderSpecialtyReports() {
    const container = document.getElementById('admin-reports-specialty-box');
    if (!container) return;

    const orders = (Array.isArray(allAdminOrders) ? allAdminOrders : []).filter(o => o && o.status !== 'Cancelled');
    const specialtyTotals = {
      'Medicine & Surgery (أطباء البشري)': { icon: '🩺', revenue: 0, count: 0 },
      'Pharmacy (الصيدلة)': { icon: '💊', revenue: 0, count: 0 },
      'Dentistry (طب الأسنان)': { icon: '🦷', revenue: 0, count: 0 },
      'Nursing (التمريض)': { icon: '🏥', revenue: 0, count: 0 },
      'General Healthcare (الرعاية الطبية العامة)': { icon: '⚕️', revenue: 0, count: 0 }
    };

    let totalGrossRevenue = 0;

    orders.forEach(o => {
      const orderTotal = Number(o.total || 0);
      totalGrossRevenue += orderTotal;

      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach(item => {
          const spec = (item.specialty || o.specialty || '').toLowerCase();
          const itemRev = Number(item.price || 0) * Number(item.quantity || item.qty || 1);
          if (spec.includes('pharm')) {
            specialtyTotals['Pharmacy (الصيدلة)'].revenue += itemRev;
            specialtyTotals['Pharmacy (الصيدلة)'].count++;
          } else if (spec.includes('dent')) {
            specialtyTotals['Dentistry (طب الأسنان)'].revenue += itemRev;
            specialtyTotals['Dentistry (طب الأسنان)'].count++;
          } else if (spec.includes('nurs')) {
            specialtyTotals['Nursing (التمريض)'].revenue += itemRev;
            specialtyTotals['Nursing (التمريض)'].count++;
          } else if (spec.includes('med') || spec.includes('surg')) {
            specialtyTotals['Medicine & Surgery (أطباء البشري)'].revenue += itemRev;
            specialtyTotals['Medicine & Surgery (أطباء البشري)'].count++;
          } else {
            specialtyTotals['General Healthcare (الرعاية الطبية العامة)'].revenue += itemRev;
            specialtyTotals['General Healthcare (الرعاية الطبية العامة)'].count++;
          }
        });
      } else {
        specialtyTotals['Medicine & Surgery (أطباء البشري)'].revenue += orderTotal;
        specialtyTotals['Medicine & Surgery (أطباء البشري)'].count++;
      }
    });

    if (totalGrossRevenue === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--adm-muted-fg); font-size:13px;">
          📊 No sales data recorded yet. When orders are fulfilled, the medical specialty distribution will be generated automatically.
        </div>
      `;
      return;
    }

    const items = Object.entries(specialtyTotals).filter(([_, data]) => data.revenue > 0);
    if (items.length === 0) {
      items.push(['Medicine & Surgery (أطباء البشري)', { icon: '🩺', revenue: totalGrossRevenue, count: orders.length }]);
    }

    container.innerHTML = items.map(([specName, data]) => {
      const pct = Math.round((data.revenue / totalGrossRevenue) * 100);
      return `
        <div style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700; margin-bottom:4px;">
            <span>${data.icon} ${specName}</span>
            <span>${pct}% (${data.revenue.toLocaleString()} DZD)</span>
          </div>
          <div style="height:8px; background:var(--adm-border, #E2E8F0); border-radius:9999px; overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:var(--color-primary-600, #0E4D45); border-radius:9999px; transition:width 0.4s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderOrdersTables() {
    const dashboardTbody = document.getElementById('admin-dashboard-orders-body');
    const ordersModuleTbody = document.getElementById('admin-orders-table-body');

    // 1. Dashboard Recent Orders (Top 5)
    if (dashboardTbody) {
      const recent = allAdminOrders.slice(0, 5);
      if (recent.length === 0) {
        dashboardTbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:2rem;color:#64748B;">No orders recorded yet.</td></tr>';
      } else {
        dashboardTbody.innerHTML = recent.map(o => {
          const ordNo = o.order_number || o.id;
          const statusBadge = getStatusBadgeHTML(o.status);
          const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today';
          return `
            <tr>
              <td><strong>#${ordNo.replace(/^#/, '')}</strong></td>
              <td>${o.customer_name || 'Guest Customer'}</td>
              <td>${o.wilaya || 'Algeria'}</td>
              <td>${dateStr}</td>
              <td><strong>${Number(o.total || 0).toLocaleString()} DZD</strong></td>
              <td>${o.delivery_type === 'stopdesk' ? 'Stop-Desk' : 'Home Delivery'}</td>
              <td>${statusBadge}</td>
              <td><button class="adm-btn-icon" onclick="openOrderDetailModal('${ordNo}')" title="View Details">👁️</button></td>
            </tr>`;
        }).join('');
      }
    }

    // 2. Orders Module Table (Filtered)
    if (ordersModuleTbody) {
      let filtered = [...allAdminOrders];
      if (currentOrderFilter !== 'all') {
        filtered = filtered.filter(o => (o.status || '').toLowerCase() === currentOrderFilter.toLowerCase());
      }

      if (filtered.length === 0) {
        ordersModuleTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:3rem;color:#64748B;">No orders matching filter "${currentOrderFilter}".</td></tr>`;
      } else {
        ordersModuleTbody.innerHTML = filtered.map(o => {
          const ordNo = o.order_number || o.id;
          const status = o.status || 'Pending';
          return `
            <tr>
              <td><strong>#${ordNo.replace(/^#/, '')}</strong></td>
              <td>
                <strong>${o.customer_name || 'Guest'}</strong>
              </td>
              <td><code>${o.phone || 'N/A'}</code></td>
              <td>
                ${o.wilaya || 'Algeria'} ${o.commune ? '(' + o.commune + ')' : ''}<br>
                <span style="font-size:11px; color:#64748B;">${o.delivery_type === 'stopdesk' ? '🏢 Stop-Desk Agency' : '🏠 Home Delivery'}</span>
              </td>
              <td><strong>${Number(o.total || 0).toLocaleString()} DZD</strong></td>
              <td>
                <select class="chk-select" style="height:32px; font-size:12px; font-weight:700; width:140px;" onchange="updateOrderStatusFromAdmin('${ordNo}', this.value)">
                  <option value="Pending"   ${status === 'Pending'   ? 'selected' : ''}>⏳ Pending</option>
                  <option value="Confirmed" ${status === 'Confirmed' ? 'selected' : ''}>✅ Confirmed</option>
                  <option value="Preparing" ${status === 'Preparing' ? 'selected' : ''}>📦 Preparing</option>
                  <option value="Shipped"   ${status === 'Shipped'   ? 'selected' : ''}>🚚 Shipped</option>
                  <option value="Delivered" ${status === 'Delivered' ? 'selected' : ''}>🎉 Delivered</option>
                  <option value="Cancelled" ${status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
                </select>
              </td>
              <td>
                <button class="adm-btn-icon" onclick="openOrderDetailModal('${ordNo}')" title="View Order Details & Invoice">👁️</button>
              </td>
            </tr>`;
        }).join('');
      }
    }
  }

  function getStatusBadgeHTML(status) {
    const badgeMap = {
      'Pending':   '<span class="adm-badge adm-badge-warning">⏳ Pending</span>',
      'Confirmed': '<span class="adm-badge adm-badge-info">✅ Confirmed</span>',
      'Preparing': '<span class="adm-badge adm-badge-info">📦 Preparing</span>',
      'Shipped':   '<span class="adm-badge adm-badge-info">🚚 Shipped</span>',
      'Delivered': '<span class="adm-badge adm-badge-success">🎉 Delivered</span>',
      'Cancelled': '<span class="adm-badge adm-badge-error">❌ Cancelled</span>'
    };
    return badgeMap[status] || `<span class="adm-badge adm-badge-info">${status}</span>`;
  }

  window.filterOrderTab = function(btn, filterType) {
    currentOrderFilter = filterType;
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    renderOrdersTables();
  };

  window.updateOrderStatusFromAdmin = async function(orderId, newStatus) {
    if (window.MedicareDB && typeof window.MedicareDB.updateOrderStatus === 'function') {
      await window.MedicareDB.updateOrderStatus(orderId, newStatus);
    }
    const order = allAdminOrders.find(o => (o.order_number || o.id) === orderId);
    if (order) {
      order.status = newStatus;
    }
    logAuditAction('Updated Order Status', `Order #${orderId} → ${newStatus}`);
    showToast(`✓ Order #${orderId} updated to "${newStatus}"`);
    
    // Refresh all affected tables and KPIs
    renderOrdersTables();
    updateDashboardKPIs();
    renderSalesChart(currentChartPeriod);
    renderTopSellers();
    buildCustomerDirectory();
    renderCustomerDirectory();
    renderSpecialtyReports();
    updateOrderTabCounters();
  };

  /* ------------------------------------------------------------------
     1D BARCODE GENERATOR (Code 39 Pure Vector SVG — 100% Offline & Instant)
     ------------------------------------------------------------------ */
  function generateBarcodeSVG(code) {
    const clean = String(code || '').toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '');
    if (!clean) return '';
    const chars = {
      '0':'000110100', '1':'100100001', '2':'001100001', '3':'101100000', '4':'000110001',
      '5':'100110000', '6':'001110000', '7':'000100101', '8':'100100100', '9':'001100100',
      'A':'100001001', 'B':'001001001', 'C':'101001000', 'D':'000011001', 'E':'100011000',
      'F':'001011000', 'G':'000001101', 'H':'100001100', 'I':'001001100', 'J':'000011100',
      'K':'100000011', 'L':'001000011', 'M':'101000010', 'N':'000010011', 'O':'100010010',
      'P':'001010010', 'Q':'000000111', 'R':'100000110', 'S':'001000110', 'T':'000010110',
      'U':'110000001', 'V':'011000001', 'W':'111000000', 'X':'010010001', 'Y':'110010000',
      'Z':'011010000', '-':'010000101', '.':'110000100', ' ':'011000100', '$':'010101000',
      '/':'010100010', '+':'010001010', '%':'000101010', '*':'010010100'
    };
    const encoded = '*' + clean + '*';
    let rects = '';
    let x = 6;
    const narrow = 2;
    const wide = 4.5;
    const height = 40;

    for (let i = 0; i < encoded.length; i++) {
      const pattern = chars[encoded[i]] || chars['-'];
      for (let j = 0; j < 9; j++) {
        const isBar = (j % 2 === 0);
        const isWide = pattern[j] === '1';
        const w = isWide ? wide : narrow;
        if (isBar) {
          rects += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="#0F172A" />`;
        }
        x += w;
      }
      x += narrow; // inter-character gap
    }
    x += 6;

    return `
      <svg viewBox="0 0 ${x} ${height + 15}" width="200" height="50" xmlns="http://www.w3.org/2000/svg" style="display:block; max-width:100%;">
        ${rects}
        <text x="${x / 2}" y="${height + 12}" text-anchor="middle" font-family="'JetBrains Mono', monospace, sans-serif" font-size="10" font-weight="700" fill="#334155" letter-spacing="1.5">${clean}</text>
      </svg>
    `;
  }

  function generateShippingLabelHTML(order) {
    const cleanId = String(order.order_number || order.id || '').replace(/^#/, '');
    const deliveryCompany = order.delivery_company || (order.delivery_type === 'stopdesk' ? 'Yalidine Express (Stop-Desk Pickup)' : 'ZR Express (Home Delivery)');
    const fullAddress = [order.address && order.address !== 'N/A' ? order.address : '', order.commune, order.wilaya].filter(Boolean).join(', ') || order.wilaya || 'N/A';
    const qrDataText = `ORDER: #${cleanId}\nCLIENT: ${order.customer_name}\nPHONE: ${order.phone}\nADDRESS: ${fullAddress}\nDELIVERY: ${deliveryCompany}\nTOTAL COD: ${Number(order.total || 0).toLocaleString()} DZD`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`;
    const barcodeSVG = generateBarcodeSVG(cleanId);

    return `
      <!-- SHIPPING LABEL & CLIENT CARD (PROMINENT FOR PRINT & EXPRESS COURIERS) -->
      <div id="print-label-section" class="print-shipping-label-card" style="border:2px dashed #0E4D45; background:#F0FDF4; padding:1.2rem; border-radius:10px; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; gap:1.25rem;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="background:#0E4D45; color:#FFFFFF; font-size:11px; font-weight:800; padding:3px 10px; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">📦 Shipping Label / وصل التسليم</span>
            <span style="font-size:13px; font-weight:800; color:#0E4D45;">#${cleanId}</span>
          </div>

          <div style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:5px;">
            👤 <span style="color:#64748B; font-size:13px; font-weight:600;">الاسم واللقب (Client Name):</span> <strong style="color:#0E4D45;">${order.customer_name || 'Guest Customer'}</strong>
          </div>

          <div style="font-size:14px; font-weight:700; color:#1E293B; margin-bottom:5px;">
            📞 <span style="color:#64748B; font-size:13px; font-weight:600;">رقم الهاتف (Phone):</span> <code style="background:#E2E8F0; padding:2px 8px; border-radius:4px; font-size:15px; font-weight:800;">${order.phone || 'N/A'}</code>
          </div>

          <div style="font-size:13px; color:#334155; margin-bottom:5px;">
            📍 <span style="color:#64748B; font-size:13px; font-weight:600;">العنوان الكامل (Full Address):</span> <strong>${fullAddress}</strong>
          </div>

          <div style="font-size:13px; color:#0E4D45; font-weight:800; margin-bottom:8px;">
            🚚 <span style="color:#64748B; font-size:13px; font-weight:600;">شركة/نوع التوصيل (Courier):</span> <strong>${deliveryCompany}</strong>
          </div>

          <!-- 1D BARCODE (OFFLINE VECTOR SVG) -->
          <div style="margin-top:6px; background:#FFFFFF; padding:4px 8px; border-radius:6px; display:inline-block; border:1px solid #E2E8F0;">
            ${barcodeSVG}
          </div>
        </div>

        <!-- QR CODE BOX -->
        <div style="text-align:center; background:#FFFFFF; padding:8px; border:1px solid #CBD5E1; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.06); flex-shrink:0; min-width:135px; min-height:145px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <img src="${qrUrl}" alt="Order QR Code" width="130" height="130" style="display:block; border-radius:4px; object-fit:contain;" loading="eager">
          <span style="font-size:10px; font-weight:800; color:#475569; display:block; margin-top:4px; letter-spacing:0.04em;">SCAN ORDER QR</span>
        </div>
      </div>
    `;
  }

  function generateInvoiceHTML(order) {
    const cleanId = String(order.order_number || order.id || '').replace(/^#/, '');
    const deliveryCompany = order.delivery_company || (order.delivery_type === 'stopdesk' ? 'Yalidine Express (Stop-Desk Pickup)' : 'ZR Express (Home Delivery)');
    const fullAddress = [order.address && order.address !== 'N/A' ? order.address : '', order.commune, order.wilaya].filter(Boolean).join(', ') || order.wilaya || 'N/A';
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsRows = items.map(item => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #E2E8F0;">${item.nameAr || item.name} ${item.size ? '(' + item.size + ')' : ''}</td>
        <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:center;">${item.qty || 1}</td>
        <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:right;">${Number(item.price || 0).toLocaleString()} DZD</td>
        <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:right;"><strong>${(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString()} DZD</strong></td>
      </tr>
    `).join('');

    return `
      <!-- INVOICE SECTION (WRAPPED FOR SEPARATE PRINTING) -->
      <div id="print-invoice-section" class="print-invoice-card">
        <!-- INVOICE HEADER DETAILS -->
        <div style="display:flex; justify-content:space-between; margin-bottom:1rem; padding-bottom:1rem; border-bottom:2px solid #E2E8F0; font-size:13px;">
          <div>
            <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary-900);">🏥 MEDICARE Algeria — Official Order Invoice</h4>
            <strong>Customer Name:</strong> ${order.customer_name || 'Guest Customer'}<br>
            <strong>Phone Number:</strong> <code>${order.phone || 'N/A'}</code><br>
            <strong>Full Address:</strong> ${fullAddress}<br>
            <strong>Order Status:</strong> <span class="adm-badge adm-badge-info">${order.status || 'Confirmed'}</span>
          </div>
          <div style="text-align:right;">
            <strong>Order #:</strong> #${cleanId}<br>
            <strong>Payment Method:</strong> Cash on Delivery (COD)<br>
            <strong>Courier Company:</strong> ${deliveryCompany}<br>
            <strong>Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString() : 'Recent'}
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <table style="width:100%; border-collapse:collapse; font-size:13px; margin-bottom:1rem;">
          <thead>
            <tr style="background:#F8FAFC; text-align:left;">
              <th style="padding:8px; border-bottom:2px solid #CBD5E1;">Item Description</th>
              <th style="padding:8px; border-bottom:2px solid #CBD5E1; text-align:center;">Qty</th>
              <th style="padding:8px; border-bottom:2px solid #CBD5E1; text-align:right;">Unit Price</th>
              <th style="padding:8px; border-bottom:2px solid #CBD5E1; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows || '<tr><td colspan="4" style="padding:1rem; text-align:center; color:#64748B;">No item breakdown available.</td></tr>'}
          </tbody>
        </table>

        <!-- TOTAL SUMMARY -->
        <div style="display:flex; justify-content:flex-end; font-size:13px; margin-bottom:1.5rem;">
          <div style="width:260px; background:#F1F5F9; padding:0.75rem 1rem; border-radius:8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Subtotal:</span> <span>${Number(order.subtotal || order.total || 0).toLocaleString()} DZD</span></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Delivery Fee:</span> <span>${Number(order.delivery_fee || 0).toLocaleString()} DZD</span></div>
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:15px; border-top:1px solid #CBD5E1; padding-top:4px; margin-top:4px;"><span>Total COD:</span> <span style="color:var(--color-primary-900);">${Number(order.total || 0).toLocaleString()} DZD</span></div>
          </div>
        </div>
      </div>
    `;
  }

  window.openOrderDetailModal = function(orderId) {
    const cleanId = String(orderId).replace(/^#/, '');
    const order = allAdminOrders.find(o => (o.order_number || o.id || '').replace(/^#/, '') === cleanId);
    const modal = document.getElementById('modal-order-detail');
    if (!modal) return;

    if (order) {
      const titleEl = document.getElementById('order-modal-title');
      if (titleEl) titleEl.textContent = `Order #${cleanId} — Details & Invoice`;

      const printArea = document.getElementById('print-area');
      if (printArea) {
        printArea.innerHTML = `
          ${generateShippingLabelHTML(order)}
          ${generateInvoiceHTML(order)}

          <!-- ACTION BUTTONS (HIDDEN WHEN PRINTING) -->
          <div class="no-print" style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:flex-end;">
            <button class="mc-btn mc-btn-primary mc-btn-sm" onclick="printShippingLabel('${cleanId}')">🏷️ Print Label</button>
            <button class="mc-btn mc-btn-secondary mc-btn-sm" onclick="printInvoice('${cleanId}')">🧾 Print Invoice</button>
            <button class="mc-btn mc-btn-secondary mc-btn-sm" onclick="closeOrderDetailModal()">Close</button>
          </div>
        `;
      }
    }
    modal.classList.add('open');
  };

  window.closeOrderDetailModal = function() {
    document.getElementById('modal-order-detail')?.classList.remove('open');
  };

  async function waitForImagesToLoad(container) {
    if (!container) return;
    const images = Array.from(container.querySelectorAll('img'));
    if (images.length === 0) return;
    await Promise.all(images.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 800);
      });
    }));
  }

  window.printShippingLabel = async function(orderId) {
    if (orderId && (!document.getElementById('modal-order-detail')?.classList.contains('open'))) {
      openOrderDetailModal(orderId);
    }
    const printArea = document.getElementById('print-area');
    showToast('⏳ جاري تجهيز وصل الشحن والباركود...');
    await waitForImagesToLoad(printArea);

    document.body.classList.remove('printing-invoice-only', 'printing-all-labels', 'printing-all-invoices');
    document.body.classList.add('printing-label-only');
    console.log('[Print Label] document.body.className:', document.body.className);
    window.print();
  };

  window.printInvoice = async function(orderId) {
    if (orderId && (!document.getElementById('modal-order-detail')?.classList.contains('open'))) {
      openOrderDetailModal(orderId);
    }
    const printArea = document.getElementById('print-area');
    await waitForImagesToLoad(printArea);

    document.body.classList.remove('printing-label-only', 'printing-all-labels', 'printing-all-invoices');
    document.body.classList.add('printing-invoice-only');
    console.log('[Print Invoice] document.body.className:', document.body.className);
    window.print();
  };

  window.printInvoiceOnly = window.printInvoice;

  window.printFullOrder = async function() {
    const printArea = document.getElementById('print-area');
    await waitForImagesToLoad(printArea);

    document.body.classList.remove('printing-label-only', 'printing-invoice-only', 'printing-all-labels', 'printing-all-invoices');
    console.log('[Print Full Order] document.body.className:', document.body.className);
    window.print();
  };

  /* ------------------------------------------------------------------
     BULK BARCODE GENERATION & PREVIEW (STEP 1)
     ------------------------------------------------------------------ */
  window.generateAndPreviewAllLabels = async function() {
    const confirmedOrders = allAdminOrders.filter(o => (o.status || '').toLowerCase() === 'confirmed');
    if (!confirmedOrders || confirmedOrders.length === 0) {
      showToast('⚠️ لا توجد طلبات مؤكدة (Confirmed) لتوليد الباركود لها.');
      return;
    }

    const modal = document.getElementById('modal-batch-labels-preview');
    const previewBody = document.getElementById('batch-preview-body');
    const titleEl = document.getElementById('batch-preview-modal-title');
    if (!modal || !previewBody) return;

    if (titleEl) {
      titleEl.textContent = `📦 وصلات الشحن والباركود (${confirmedOrders.length} طلب مؤكد)`;
    }

    // Render all shipping labels with vector SVG barcode + QR code
    previewBody.innerHTML = confirmedOrders.map((order, idx) => `
      <div style="margin-bottom: 1.5rem; background: #FFFFFF; border-radius: 10px; border: 1px solid #E2E8F0; padding: 0.75rem;">
        <div style="font-size: 12px; font-weight: 800; color: #64748B; margin-bottom: 0.5rem; display:flex; justify-content:space-between;">
          <span>📄 وصل رقم ${idx + 1} من ${confirmedOrders.length}</span>
          <span style="color:#0E4D45;">طلب #${(order.order_number || order.id || '').replace(/^#/, '')}</span>
        </div>
        ${generateShippingLabelHTML(order)}
      </div>
    `).join('');

    modal.classList.add('open');
    showToast(`✅ تم إنشاء وتوليد الباركود لـ ${confirmedOrders.length} طلب!`);
  };

  window.closeBatchLabelsModal = function() {
    document.getElementById('modal-batch-labels-preview')?.classList.remove('open');
  };

  /* ------------------------------------------------------------------
     BULK PRINTING FOR ALL CONFIRMED ORDERS (STEP 2)
     ------------------------------------------------------------------ */
  window.printAllLabels = async function() {
    const confirmedOrders = allAdminOrders.filter(o => (o.status || '').toLowerCase() === 'confirmed');
    if (!confirmedOrders || confirmedOrders.length === 0) {
      showToast('No confirmed orders to print');
      return;
    }

    let batchContainer = document.getElementById('batch-print-container');
    if (!batchContainer) {
      batchContainer = document.createElement('div');
      batchContainer.id = 'batch-print-container';
      document.body.appendChild(batchContainer);
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const headerHTML = `
      <div class="batch-print-header no-print-page-break" style="margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:2px solid #0E4D45; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:18px; color:#0E4D45;">📦 Batch Print — Shipping Labels</h2>
          <span style="font-size:12px; color:#64748B;">MEDICARE Store Admin Dispatch</span>
        </div>
        <div style="text-align:right; font-size:12px; color:#334155;">
          <strong>${confirmedOrders.length} Confirmed Order${confirmedOrders.length > 1 ? 's' : ''}</strong><br>
          <span>${todayDate}</span>
        </div>
      </div>
    `;

    const ordersHTML = confirmedOrders.map(order => `
      <div class="batch-order-page" style="page-break-after: always; break-after: page; margin-bottom: 2rem;">
        ${generateShippingLabelHTML(order)}
      </div>
    `).join('');

    batchContainer.innerHTML = headerHTML + ordersHTML;

    showToast('⏳ جاري تجهيز وصلات الشحن والباركود للطباعة...');
    await waitForImagesToLoad(batchContainer);

    document.body.classList.remove('printing-all-invoices', 'printing-label-only', 'printing-invoice-only');
    document.body.classList.add('printing-all-labels');
    console.log('[Batch Print Labels] document.body.className:', document.body.className);
    window.print();
  };

  window.printAllInvoices = function() {
    const confirmedOrders = allAdminOrders.filter(o => (o.status || '').toLowerCase() === 'confirmed');
    if (!confirmedOrders || confirmedOrders.length === 0) {
      showToast('No confirmed orders to print');
      return;
    }

    let batchContainer = document.getElementById('batch-print-container');
    if (!batchContainer) {
      batchContainer = document.createElement('div');
      batchContainer.id = 'batch-print-container';
      document.body.appendChild(batchContainer);
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const headerHTML = `
      <div class="batch-print-header no-print-page-break" style="margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:2px solid #0E4D45; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:18px; color:#0E4D45;">🧾 Batch Print — Invoices</h2>
          <span style="font-size:12px; color:#64748B;">MEDICARE Store Accounting & Billing</span>
        </div>
        <div style="text-align:right; font-size:12px; color:#334155;">
          <strong>${confirmedOrders.length} Confirmed Order${confirmedOrders.length > 1 ? 's' : ''}</strong><br>
          <span>${todayDate}</span>
        </div>
      </div>
    `;

    const ordersHTML = confirmedOrders.map(order => `
      <div class="batch-order-page" style="page-break-after: always; break-after: page; margin-bottom: 2rem;">
        ${generateInvoiceHTML(order)}
      </div>
    `).join('');

    batchContainer.innerHTML = headerHTML + ordersHTML;

    document.body.classList.remove('printing-all-labels', 'printing-label-only', 'printing-invoice-only');
    document.body.classList.add('printing-all-invoices');
    console.log('[Batch Print Invoices] document.body.className:', document.body.className);
    window.print();
  };

  window.addEventListener('afterprint', () => {
    document.body.classList.remove(
      'printing-label-only',
      'printing-invoice-only',
      'printing-all-labels',
      'printing-all-invoices'
    );
    const batchContainer = document.getElementById('batch-print-container');
    if (batchContainer) batchContainer.innerHTML = '';
  });




  /* ------------------------------------------------------------------
     10. PRODUCT MODAL & DRAG/DROP IMAGE UPLOADER
     ------------------------------------------------------------------ */
  let uploadedProductImages = [];

  function initImageUploader() {
    const dropzone  = document.getElementById('adm-dropzone');
    const fileInput = document.getElementById('p-file-input');

    if (!dropzone || !fileInput) return;

    // Trigger File Browser on Click
    dropzone.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });

    // File selection change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleImageFiles(e.target.files);
      }
    });

    // Drag and Drop hover states
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = 'var(--adm-primary)';
        dropzone.style.background = '#F0FDF4';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      }, false);
    });

    // Drop files
    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleImageFiles(dt.files);
      }
    });
  }

  async function handleImageFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('❌ يرجى اختيار صورة صالحة (PNG, JPG, WEBP)');
      return;
    }

    for (const file of validFiles) {
      showToast(`⏳ جاري معالجة "${file.name}"...`);

      let url = null;

      // Try Supabase Storage first
      if (window.MedicareDB && typeof window.MedicareDB.uploadProductImage === 'function') {
        const result = await window.MedicareDB.uploadProductImage(file);
        url = result.url;
      }

      // Fallback to local compressed base64 if storage not available
      if (!url) {
        url = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              let w = img.width;
              let h = img.height;
              const maxDim = 800;
              if (w > h && w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
              const canvas = document.createElement('canvas');
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      }

      if (url) {
        uploadedProductImages.push(url);
        renderImagePreviews();
        showToast(`✅ تم إضافة "${file.name}" بنجاح!`);
      } else {
        showToast(`❌ فشل معالجة "${file.name}"`);
      }
    }
  }

  window.removeUploadedImage = function(idx) {
    uploadedProductImages.splice(idx, 1);
    renderImagePreviews();
    showToast('🗑️ Image removed');
  };

  // -----------------------------------------------------------------------
  // 10. UNIFIED 'PRODUCT OPTIONS & MEDIA' ENGINE (Colors, Sizes, Gallery)
  // -----------------------------------------------------------------------
  let _editingProductId = null;   // null = Add mode  |  string id = Edit mode

  // Tab switcher inside Product Modal
  window.switchProductModalTab = function(tabId, btn) {
    document.querySelectorAll('.adm-modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.adm-modal-tab-pane').forEach(p => {
      p.style.display = 'none';
      p.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    const target = document.getElementById(tabId);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
    }
  };

  // Trilingual sub-tab switcher for Descriptions tab in Product Modal
  window.switchDescLangTab = function(lang) {
    const langs = ['en', 'fr', 'ar'];
    langs.forEach(l => {
      const panel = document.getElementById(`desc-panel-${l}`);
      const btn = document.getElementById(`desc-tab-${l}`);
      if (panel) panel.style.display = (l === lang) ? 'block' : 'none';
      if (btn) {
        if (l === lang) {
          btn.classList.add('active');
          btn.style.background = 'var(--adm-primary, #0E4D45)';
          btn.style.color = '#FFF';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'var(--adm-secondary, #F1F5F9)';
          btn.style.color = 'var(--adm-foreground, #0F172A)';
        }
      }
    });
  };

  // Sub-tab switcher inside 'Product Options & Media' tab
  window.switchOptionsSubTab = function(subtabName, btn) {
    const subtabs = ['colors', 'sizes', 'media'];
    subtabs.forEach(name => {
      const panel = document.getElementById(`subtab-content-${name}`);
      const b = document.getElementById(`subtab-btn-${name}`);
      if (panel) panel.style.display = (name === subtabName) ? 'block' : 'none';
      if (b) {
        if (name === subtabName) {
          b.classList.add('active');
          b.style.background = 'var(--color-primary-600)';
          b.style.color = '#FFF';
          b.style.borderColor = 'var(--color-primary-600)';
        } else {
          b.classList.remove('active');
          b.style.background = '#F8FAFC';
          b.style.color = '#334155';
          b.style.borderColor = '#CBD5E1';
        }
      }
    });
  };

  // Live price & discount calculator preview
  window.updatePricePreview = function() {
    const price = parseFloat(document.getElementById('p-price')?.value) || 0;
    const orig = parseFloat(document.getElementById('p-original-price')?.value) || 0;
    const box = document.getElementById('p-discount-preview-box');
    const txt = document.getElementById('p-discount-preview-text');
    if (!box || !txt) return;

    if (orig > price && price > 0) {
      const diff = orig - price;
      const pct = Math.round((diff / orig) * 100);
      txt.textContent = `SAVE ${diff.toLocaleString()} DZD (${pct}% OFF) — Badge preview: −${pct}%`;
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  };

  /* --------------------------------------------------------------------------
     MEDIA & GALLERY INTERACTIVE MANAGER (Main Hero, Reorder, Upload, Delete)
     -------------------------------------------------------------------------- */
  function renderImagePreviews() {
    const grid = document.getElementById('p-image-preview-grid');
    const countBadge = document.getElementById('gallery-count-badge');
    const mainInput = document.getElementById('p-main-img-url');
    if (!grid) return;

    if (countBadge) countBadge.textContent = uploadedProductImages.length;

    if (mainInput && uploadedProductImages.length > 0) {
      mainInput.value = uploadedProductImages[0];
    } else if (mainInput) {
      mainInput.value = '';
    }

    if (uploadedProductImages.length === 0) {
      grid.innerHTML = `
        <div style="width:100%; text-align:center; padding:1.5rem; color:#94A3B8; font-size:12.5px;">
          📷 No gallery images uploaded yet. Drop files above or paste a direct image URL.
        </div>`;
      return;
    }

    grid.innerHTML = uploadedProductImages.map((src, i) => `
      <div style="position:relative; width:100px; height:105px; border-radius:8px; overflow:hidden; border:2px solid ${i === 0 ? 'var(--color-primary-600)' : '#CBD5E1'}; background:#FFF; display:flex; flex-direction:column; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="position:relative; flex:1; width:100%; overflow:hidden;">
          <img src="${src}" style="width:100%; height:100%; object-fit:cover;" alt="Product preview ${i+1}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' fill=\\'%2394a3b8\\' viewBox=\\'0 0 24 24\\'><path d=\\'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z\\'/></svg>'">
          ${i === 0 ? '<span style="position:absolute; top:3px; left:3px; background:#0E4D45; color:#FFF; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; letter-spacing:0.5px;">⭐ MAIN</span>' : ''}
          <button type="button" onclick="removeGalleryImage(${i})" style="position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:50%; background:rgba(220,38,38,0.85); color:#FFF; border:none; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center;" title="Delete image">✕</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:2px 4px; background:#F8FAFC; border-top:1px solid #E2E8F0; font-size:10px;">
          ${i !== 0 ? `<button type="button" onclick="setAsMainImage(${i})" style="background:none; border:none; color:var(--color-primary-700); font-weight:700; font-size:10px; cursor:pointer; padding:0;" title="Set as primary hero image">⭐ Set Main</button>` : '<span style="color:#0E4D45; font-weight:800;">Primary</span>'}
          <div style="display:flex; gap:2px;">
            ${i > 0 ? `<button type="button" onclick="moveGalleryImage(${i}, ${i-1})" style="background:none; border:none; cursor:pointer; font-size:11px; padding:0 2px;" title="Move left">◀</button>` : ''}
            ${i < uploadedProductImages.length - 1 ? `<button type="button" onclick="moveGalleryImage(${i}, ${i+1})" style="background:none; border:none; cursor:pointer; font-size:11px; padding:0 2px;" title="Move right">▶</button>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  window.setAsMainImage = function(index) {
    if (index > 0 && index < uploadedProductImages.length) {
      const selected = uploadedProductImages.splice(index, 1)[0];
      uploadedProductImages.unshift(selected);
      renderImagePreviews();
      showToast('⭐ Set as Primary Hero Image!');
    }
  };

  window.moveGalleryImage = function(fromIndex, toIndex) {
    if (fromIndex >= 0 && fromIndex < uploadedProductImages.length && toIndex >= 0 && toIndex < uploadedProductImages.length) {
      const item = uploadedProductImages.splice(fromIndex, 1)[0];
      uploadedProductImages.splice(toIndex, 0, item);
      renderImagePreviews();
    }
  };

  window.syncMainImagePreview = function() {
    const url = document.getElementById('p-main-img-url')?.value.trim();
    if (url) {
      if (uploadedProductImages.length > 0) {
        uploadedProductImages[0] = url;
      } else {
        uploadedProductImages.push(url);
      }
      renderImagePreviews();
    }
  };

  window.addImageUrlFromInput = function() {
    const input = document.getElementById('p-add-image-url-input');
    const url = input?.value.trim();
    if (!url) return;
    uploadedProductImages.push(url);
    if (input) input.value = '';
    renderImagePreviews();
    showToast('🖼️ Gallery image URL added!');
  };

  window.removeGalleryImage = function(index) {
    uploadedProductImages.splice(index, 1);
    renderImagePreviews();
    showToast('🗑️ Image removed');
  };

  /* --------------------------------------------------------------------------
     COLORS MANAGER (Add, Hex picker, Default flag, Delete, Reorder)
     -------------------------------------------------------------------------- */
  window.addColorRow = function(name = '', hex = '#0E4D45', img = '', isDefault = false) {
    const container = document.getElementById('p-colors-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'adm-color-variant-row';
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center; background:#FFFFFF; padding:0.6rem; border-radius:6px; border:1px solid #E2E8F0; box-shadow:0 1px 2px rgba(0,0,0,0.03); flex-wrap:wrap;';
    row.innerHTML = `
      <input type="color" value="${hex}" style="width:38px; height:34px; border:none; border-radius:4px; cursor:pointer; background:none;" onchange="this.nextElementSibling.value=this.value">
      <input type="text" class="chk-input" placeholder="#HEX" value="${hex}" style="width:85px; font-size:12px; font-family:monospace;" onchange="this.previousElementSibling.value=this.value">
      <input type="text" class="chk-input" placeholder="Color Name (e.g. Black, White, Navy)" value="${name}" style="flex:1; min-width:140px; font-size:13px; font-weight:600;">
      <input type="text" class="chk-input" placeholder="Optional Image URL for this color" value="${img}" style="flex:1.2; min-width:140px; font-size:12px;">
      <label style="display:flex; align-items:center; gap:0.3rem; font-size:11.5px; color:#475569; cursor:pointer; user-select:none; white-space:nowrap;">
        <input type="radio" name="p-color-default-radio" class="p-color-default" ${isDefault ? 'checked' : ''} style="accent-color:var(--color-primary-600); cursor:pointer;">
        Default
      </label>
      <div style="display:flex; gap:3px;">
        <button type="button" class="adm-btn-icon" onclick="moveColorRow(this, -1)" style="padding:4px 6px; font-size:11px;" title="Move Up">▲</button>
        <button type="button" class="adm-btn-icon" onclick="moveColorRow(this, 1)" style="padding:4px 6px; font-size:11px;" title="Move Down">▼</button>
        <button type="button" class="adm-btn-icon" onclick="this.closest('.adm-color-variant-row').remove()" style="background:#FEE2E2; color:#DC2626; border-radius:4px; padding:4px 8px;" title="Remove Color">✕</button>
      </div>
    `;
    container.appendChild(row);
  };

  window.moveColorRow = function(btn, dir) {
    const row = btn.closest('.adm-color-variant-row');
    if (!row) return;
    if (dir === -1 && row.previousElementSibling) {
      row.parentNode.insertBefore(row, row.previousElementSibling);
    } else if (dir === 1 && row.nextElementSibling) {
      row.parentNode.insertBefore(row.nextElementSibling, row);
    }
  };

  function getColorsData() {
    const rows = document.querySelectorAll('.adm-color-variant-row');
    const colors = [];
    rows.forEach((r, idx) => {
      const inputs = r.querySelectorAll('input[type="text"], input[type="color"]');
      const radio = r.querySelector('.p-color-default');
      const hex = inputs[0]?.value || '#0E4D45';
      const name = inputs[2]?.value.trim() || `Color ${idx+1}`;
      const img = inputs[3]?.value.trim() || '';
      const isDefault = radio ? radio.checked : (idx === 0);
      if (name) colors.push({ name, hex, img, is_default: isDefault });
    });
    return colors;
  }

  function setColorsData(colorsList) {
    const container = document.getElementById('p-colors-container');
    if (!container) return;
    container.innerHTML = '';
    if (Array.isArray(colorsList) && colorsList.length > 0) {
      colorsList.forEach((c, idx) => {
        if (typeof c === 'string') {
          window.addColorRow(c, c.startsWith('#') ? c : '#0E4D45', '', idx === 0);
        } else {
          window.addColorRow(c.name || '', c.hex || '#0E4D45', c.img || '', c.is_default || idx === 0);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
     SIZES MANAGER (Presets, Pills, Custom Sizes)
     -------------------------------------------------------------------------- */
  window.applySizesPreset = function(sizesArr) {
    const container = document.getElementById('p-sizes-pills-container');
    if (!container || !Array.isArray(sizesArr)) return;
    const allPills = container.querySelectorAll('input[name="p-size-opt"]');
    const set = new Set(sizesArr);

    allPills.forEach(cb => {
      cb.checked = set.has(cb.value);
      set.delete(cb.value);
    });

    // Append any extra sizes not in standard template
    set.forEach(val => {
      if (val) {
        const label = document.createElement('label');
        label.className = 'adm-size-pill';
        label.innerHTML = `<input type="checkbox" name="p-size-opt" value="${val}" checked> ${val}`;
        container.appendChild(label);
      }
    });

    showToast(`📏 Applied size preset (${sizesArr.length} sizes)`);
  };

  window.addCustomSizePill = function() {
    const input = document.getElementById('p-custom-size-input');
    const val = input?.value.trim();
    if (!val) return;
    const container = document.getElementById('p-sizes-pills-container');
    if (!container) return;

    // Check if already exists
    const existing = Array.from(container.querySelectorAll('input[name="p-size-opt"]')).find(cb => cb.value.toLowerCase() === val.toLowerCase());
    if (existing) {
      existing.checked = true;
      if (input) input.value = '';
      showToast(`📏 Size "${val}" selected!`);
      return;
    }

    const label = document.createElement('label');
    label.className = 'adm-size-pill';
    label.innerHTML = `<input type="checkbox" name="p-size-opt" value="${val}" checked> ${val}`;
    container.appendChild(label);
    if (input) input.value = '';
    showToast(`📏 Size "${val}" added!`);
  };

  function getSizesData() {
    const checkboxes = document.querySelectorAll('input[name="p-size-opt"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  function setSizesData(sizesList) {
    const container = document.getElementById('p-sizes-pills-container');
    if (!container) return;
    const allPills = container.querySelectorAll('input[name="p-size-opt"]');
    const sizeSet = new Set(Array.isArray(sizesList) ? sizesList : []);

    allPills.forEach(cb => {
      cb.checked = sizeSet.has(cb.value);
      sizeSet.delete(cb.value);
    });

    sizeSet.forEach(val => {
      if (val) {
        const label = document.createElement('label');
        label.className = 'adm-size-pill';
        label.innerHTML = `<input type="checkbox" name="p-size-opt" value="${val}" checked> ${val}`;
        container.appendChild(label);
      }
    });
  }

  // Features Builder
  window.addFeatureRow = function(title = '', desc = '', icon = '🛡️') {
    const container = document.getElementById('p-features-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'adm-feature-row';
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:flex-start; background:#F8FAFC; padding:0.6rem; border-radius:6px; border:1px solid #E2E8F0;';
    row.innerHTML = `
      <input type="text" class="chk-input" placeholder="Icon (e.g. 🛡️)" value="${icon}" style="width:60px; text-align:center; font-size:16px;">
      <div style="flex:1; display:flex; flex-direction:column; gap:0.35rem;">
        <input type="text" class="chk-input" placeholder="Feature Title (e.g. Silver-Ion Antimicrobial Shield)" value="${title}" style="font-weight:700; font-size:13px;">
        <textarea class="chk-input" placeholder="Feature Description (e.g. Inhibits bacterial growth during 24h rotations...)" style="height:48px; font-size:12px; line-height:1.4;">${desc}</textarea>
      </div>
      <button type="button" class="adm-btn-icon" onclick="this.parentElement.remove()" style="background:#FEE2E2; color:#DC2626; border-radius:4px; padding:4px 8px;" title="Remove Feature">✕</button>
    `;
    container.appendChild(row);
  };

  function getFeaturesData() {
    const rows = document.querySelectorAll('.adm-feature-row');
    const features = [];
    rows.forEach(r => {
      const icon = r.querySelector('input[type="text"]')?.value.trim() || '✨';
      const title = r.querySelectorAll('input[type="text"]')[1]?.value.trim() || '';
      const desc = r.querySelector('textarea')?.value.trim() || '';
      if (title) features.push({ icon, title, desc });
    });
    return features;
  }

  function setFeaturesData(featuresList) {
    const container = document.getElementById('p-features-container');
    if (!container) return;
    container.innerHTML = '';
    if (Array.isArray(featuresList) && featuresList.length > 0) {
      featuresList.forEach(f => window.addFeatureRow(f.title, f.desc, f.icon || '✨'));
    } else {
      window.addFeatureRow('Silver-Ion Antimicrobial Shield', 'Inhibits bacterial growth and odor accumulation during 24h rotations.', '🛡️');
      window.addFeatureRow('Fluid-Shield Barrier', 'Hydrophobic nano-coating repels blood, fluids, and liquid spills on contact.', '💧');
      window.addFeatureRow('Reinforced Utility Pockets', 'Dedicated smartphone, stethoscope loop, and pen slots.', '👜');
      window.addFeatureRow('Breathable Heat Release', 'Underarm and back mesh ventilation keep you cool under operating lights.', '❄️');
    }
  }

  // Specs Key-Value Builder
  window.addSpecRow = function(key = '', val = '') {
    const container = document.getElementById('p-specs-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'adm-spec-row';
    row.style.cssText = 'display:flex; gap:0.5rem; align-items:center; background:#F8FAFC; padding:0.4rem; border-radius:6px; border:1px solid #E2E8F0;';
    row.innerHTML = `
      <input type="text" class="chk-input" placeholder="Spec Key (e.g. Fabric Composition)" value="${key}" style="flex:1; font-weight:600; font-size:12.5px;">
      <input type="text" class="chk-input" placeholder="Spec Value (e.g. 72% Poly, 21% Rayon, 7% Spandex)" value="${val}" style="flex:1.5; font-size:12.5px;">
      <button type="button" class="adm-btn-icon" onclick="this.parentElement.remove()" style="background:#FEE2E2; color:#DC2626; border-radius:4px; padding:4px 8px;" title="Remove Spec">✕</button>
    `;
    container.appendChild(row);
  };

  function getSpecsData() {
    const rows = document.querySelectorAll('.adm-spec-row');
    const specs = {};
    rows.forEach(r => {
      const inputs = r.querySelectorAll('input');
      const key = inputs[0]?.value.trim();
      const val = inputs[1]?.value.trim();
      if (key && val) specs[key] = val;
    });
    return specs;
  }

  function setSpecsData(specsObj) {
    const container = document.getElementById('p-specs-container');
    if (!container) return;
    container.innerHTML = '';
    if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
      Object.entries(specsObj).forEach(([k, v]) => window.addSpecRow(k, v));
    } else {
      window.addSpecRow('Fabric Composition', '72% Polyester, 21% Rayon, 7% Spandex (4-Way Stretch Flex)');
      window.addSpecRow('Fit Type', 'Modern Athletic Clinical Fit');
      window.addSpecRow('Pocket Count', '6 Reinforced Ergonomic Utility Pockets');
      window.addSpecRow('Antimicrobial Grade', 'Hospital-Grade Silver-Ion Protection');
    }
  }

  // Size Guide Helpers
  window.toggleSizeGuideFields = function(enabled) {
    const box = document.getElementById('p-sizeguide-config-box');
    if (box) box.style.opacity = enabled ? '1' : '0.4';
  };

  window.applySizeGuideTemplate = function(tpl) {
    const note = document.getElementById('p-sizeguide-note');
    if (!note) return;
    if (tpl === 'footwear') {
      note.value = 'Compare your EU shoe size with foot length in CM. For half sizes, we recommend ordering one size up.';
    } else if (tpl === 'stethoscope') {
      note.value = 'Standard medical diagnostic sizing. Ergonomic headset adjusts to all ear canal angles.';
    } else {
      note.value = 'For the best tailored clinical fit, measure your chest, waist, and hips with a flexible tape measure over thin clothing.';
    }
  };

  /** Open modal in ADD mode */
  window.openAddProductModal = function() {
    _editingProductId = null;
    uploadedProductImages = [];
    renderImagePreviews();

    // Reset fields
    _setField('p-name', '');
    _setField('p-name-ar', '');
    _setField('p-name-fr', '');
    _setField('p-sku', '');
    _setField('p-price', '');
    _setField('p-original-price', '');
    _setField('p-stock', '25');
    _setField('p-min-stock', '5');
    _setSelect('p-category', 'Scrubs');
    _setSelect('p-specialty', 'medicine');
    _setField('p-brand', 'MEDICARE PRO');
    _setSelect('p-status', 'active');
    _setSelect('p-badge', '');
    _setCheckbox('p-is-bestseller', false);
    _setCheckbox('p-is-new', true);
    _setField('p-short-desc', '');
    _setField('p-short-desc-fr', '');
    _setField('p-short-desc-ar', '');
    _setField('p-desc', '');
    _setField('p-desc-fr', '');
    _setField('p-desc-ar', '');
    _setField('p-care-instructions', 'Machine wash cold with like colors inside out.\nTumble dry low or line dry in shade.\nDo not bleach or use fabric softeners.\nIron on low heat if needed.');
    _setField('p-care-instructions-fr', 'Lavage en machine à froid avec des couleurs similaires.\nSéchage à basse température.\nNe pas utiliser d’eau de javel.');
    _setField('p-care-instructions-ar', 'غسيل بارد في الغسالة مع ألوان مماثلة مقلوباً.\nتجفيف بدرجة حرارة منخفضة أو في الظل.\nلا تستخدم المبيضات.');
    _setCheckbox('p-sizeguide-enabled', true);
    _setField('p-sizeguide-note', 'For the best tailored clinical fit, measure your chest, waist, and hips with a flexible tape measure over thin clothing.');
    _setField('p-delivery-info', 'We ship directly to all 58 Wilayas in Algeria via express courier partners with Cash on Delivery (COD) payment support. Algiers: 24–48 hours (400 DZD). Major Cities: 48–72 hours (600 DZD). Free shipping on orders above 5,000 DZD.');
    _setField('p-delivery-info-fr', 'Livraison express dans les 58 Wilayas d’Algérie avec paiement à la livraison. Alger: 24–48h. Grandes villes: 48–72h. Livraison gratuite dès 5 000 DZD.');
    _setField('p-delivery-info-ar', 'توصيل سريع لكافة الـ 58 ولاية في الجزائر مع الدفع عند الاستلام. العاصمة: 24–48 ساعة. المدن الكبرى: 48–72 ساعة. شحن مجاني للطلبات فوق 5,000 دج.');
    _setField('p-return-info', '14-Day Free Exchange across all 58 Wilayas. Product must be in original condition with tags attached.');
    _setField('p-return-info-fr', 'Échange gratuit sous 14 jours dans les 58 Wilayas. Le produit doit être dans son état d’origine avec étiquettes.');
    _setField('p-return-info-ar', 'استبدال مجاني للمقاسات خلال 14 يوماً عبر كافة الـ 58 ولاية.');
    _setField('p-trust-badges', '🚚 58 Wilayas COD, 🔄 14-Day Free Exchange, 🛡️ Antimicrobial Shield');

    setColorsData([]);
    setSizesData(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
    setFeaturesData([]);
    setSpecsData({});
    updatePricePreview();
    if (typeof window.switchDescLangTab === 'function') window.switchDescLangTab('en');

    // Switch to first tab
    window.switchProductModalTab('tab-p-basic', document.querySelector('.adm-modal-tab-btn'));

    const title = document.getElementById('modal-product-title');
    const btn   = document.getElementById('modal-product-save-btn');
    if (title) title.textContent = '+ Add New Product to Catalog';
    if (btn)   btn.textContent  = '💾 Save Product to Store Catalog';

    const modal = document.getElementById('modal-add-product');
    if (modal) modal.classList.add('open');
  };

  /** Open modal in EDIT mode pre-filled with rich product data */
  window.openEditProductModal = async function(productId) {
    let prod = null;

    // 1. Try Supabase first
    if (window.MedicareDB && typeof window.MedicareDB.getProductById === 'function') {
      try {
        prod = await window.MedicareDB.getProductById(productId);
      } catch (e) {}
    }

    // 2. Fallback to combined list
    if (!prod) {
      const allProds = getCombinedProductsList();
      prod = allProds.find(p => String(p.id) === String(productId));
    }

    if (!prod) { showToast('❌ Product not found'); return; }

    _editingProductId = productId;
    uploadedProductImages = Array.isArray(prod.images) && prod.images.length > 0
      ? [...prod.images]
      : (prod.images ? [prod.images] : (prod.img ? [prod.img] : []));
    renderImagePreviews();

    // Pre-fill fields
    _setField('p-name',  prod.name  || '');
    _setField('p-name-ar', prod.name_ar || prod.name || '');
    _setField('p-name-fr', prod.name_fr || prod.name || '');
    _setField('p-sku',   prod.sku   || prod.id || '');
    _setField('p-price', prod.price || '');
    _setField('p-original-price', prod.original_price || '');
    _setField('p-stock', prod.stock != null ? prod.stock : '25');
    _setField('p-min-stock', prod.min_stock != null ? prod.min_stock : '5');
    _setSelect('p-category', prod.category || 'Scrubs');
    _setSelect('p-specialty', prod.specialty || 'medicine');
    _setField('p-brand', prod.brand || 'MEDICARE PRO');
    _setSelect('p-status', prod.status || 'active');
    _setSelect('p-badge', prod.badge || '');
    _setCheckbox('p-is-bestseller', !!prod.is_bestseller);
    _setCheckbox('p-is-new', !!prod.is_new);
    _setField('p-short-desc', prod.short_description || prod.description || '');
    _setField('p-short-desc-fr', prod.short_description_fr || prod.short_description || prod.description || '');
    _setField('p-short-desc-ar', prod.short_description_ar || prod.short_description || prod.description || '');
    _setField('p-desc', prod.description || '');
    _setField('p-desc-fr', prod.description_fr || prod.description || '');
    _setField('p-desc-ar', prod.description_ar || prod.description || '');

    const careStr = Array.isArray(prod.care_instructions) ? prod.care_instructions.join('\n') : (prod.care_instructions || 'Machine wash cold with like colors.\nTumble dry low.');
    const careFrStr = Array.isArray(prod.care_instructions_fr) ? prod.care_instructions_fr.join('\n') : (prod.care_instructions_fr || '');
    const careArStr = Array.isArray(prod.care_instructions_ar) ? prod.care_instructions_ar.join('\n') : (prod.care_instructions_ar || '');
    _setField('p-care-instructions', careStr);
    _setField('p-care-instructions-fr', careFrStr);
    _setField('p-care-instructions-ar', careArStr);

    const sizeGuideObj = prod.size_guide || {};
    _setCheckbox('p-sizeguide-enabled', sizeGuideObj.enabled !== false);
    _setField('p-sizeguide-note', sizeGuideObj.note || 'For the best tailored clinical fit, measure your chest, waist, and hips in CM.');

    _setField('p-delivery-info', prod.delivery_info || 'We ship directly to all 58 Wilayas in Algeria via express courier with Cash on Delivery (COD). Free shipping on orders above 5,000 DZD.');
    _setField('p-delivery-info-fr', prod.delivery_info_fr || '');
    _setField('p-delivery-info-ar', prod.delivery_info_ar || '');
    _setField('p-return-info', prod.return_info || '14-Day Free Exchange across all 58 Wilayas.');
    _setField('p-return-info-fr', prod.return_info_fr || '');
    _setField('p-return-info-ar', prod.return_info_ar || '');
    _setField('p-trust-badges', Array.isArray(prod.trust_badges) ? prod.trust_badges.join(', ') : (prod.trust_badges || '🚚 58 Wilayas COD, 🔄 14-Day Free Exchange, 🛡️ Antimicrobial Shield'));

    setColorsData(prod.colors || []);
    setSizesData(prod.sizes || ['S','M','L','XL']);
    setFeaturesData(prod.features || []);
    setSpecsData(prod.specifications || {});
    updatePricePreview();
    if (typeof window.switchDescLangTab === 'function') window.switchDescLangTab('en');

    // Switch to first tab
    window.switchProductModalTab('tab-p-basic', document.querySelector('.adm-modal-tab-btn'));

    const title = document.getElementById('modal-product-title');
    const btn   = document.getElementById('modal-product-save-btn');
    if (title) title.textContent = `✏️ Edit Product — ${prod.name}`;
    if (btn)   btn.textContent  = '✅ Update Product';

    const modal = document.getElementById('modal-add-product');
    if (modal) modal.classList.add('open');
  };

  window.closeAddProductModal = function() {
    const modal = document.getElementById('modal-add-product');
    if (modal) modal.classList.remove('open');
    _editingProductId = null;
  };

  function _setField(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val != null ? val : '';
  }

  function _setCheckbox(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = !!checked;
  }

  function _setSelect(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    for (let i = 0; i < el.options.length; i++) {
      if (el.options[i].value === val) { el.selectedIndex = i; break; }
    }
  }

  /* ------------------------------------------------------------------
     11. PRODUCTS CATALOG STORE & TABLE RENDERER
     ------------------------------------------------------------------ */
  let allAdminProducts = [];

  function getStockOverrides() {
    try {
      return JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
    } catch (e) {
      return {};
    }
  }

  function getCombinedProductsList() {
    const stockOverrides = getStockOverrides();
    const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
    const customMapped = customProds.map(p => {
      const override = stockOverrides[p.id];
      const stockVal = override != null ? (typeof override === 'object' ? override.total : Number(override)) : (p.stock || 25);
      return {
        ...p,
        nameAr: p.name_ar || p.nameAr || p.name,
        name_ar: p.name_ar || p.nameAr || p.name,
        stock: stockVal,
        image: (p.images && p.images[0]) || p.img || ''
      };
    });

    const standardMapped = allAdminProducts.map(p => {
      const override = stockOverrides[p.id];
      const stockVal = override != null ? (typeof override === 'object' ? override.total : Number(override)) : (p.stock || 20);
      return {
        ...p,
        nameAr: p.name_ar || p.nameAr || p.name,
        name_ar: p.name_ar || p.nameAr || p.name,
        stock: stockVal,
        image: (p.images && p.images[0]) || p.img || ''
      };
    });

    // Merge and deduplicate by ID (custom products take precedence)
    const combined = [...customMapped];
    standardMapped.forEach(sp => {
      if (!combined.some(cp => String(cp.id) === String(sp.id))) {
        combined.push(sp);
      }
    });

    return combined;
  }

  function getAllCatalogProducts() {
    return getCombinedProductsList();
  }
  window.getAllCatalogProducts = getAllCatalogProducts;
  window.getCombinedProductsList = getCombinedProductsList;

  async function loadAdminProducts() {
    if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        const dbProds = await window.MedicareDB.getProducts();
        if (Array.isArray(dbProds) && dbProds.length > 0) {
          allAdminProducts = dbProds.map(p => {
            const norm = (typeof normalizeProduct === 'function') ? normalizeProduct(p) : p;
            return {
              ...norm,
              id: p.id,
              name: p.name,
              nameAr: p.name_ar || p.nameAr || p.name,
              name_ar: p.name_ar || p.nameAr || p.name,
              sku: p.sku || p.id,
              category: p.category || (p.specialty ? (p.specialty.charAt(0).toUpperCase() + p.specialty.slice(1)) : 'Medical Wear'),
              specialty: p.specialty || 'medicine',
              price: p.price,
              stock: p.stock != null ? p.stock : 20,
              image: (p.images && p.images[0]) || p.img || ''
            };
          });
          if (typeof window !== 'undefined') {
            window.PRODUCT_CATALOG = allAdminProducts;
          }
        }
      } catch (e) {
        console.warn('[Admin] Error loading Supabase products:', e);
      }
    }
    renderProductsTable();
    renderBulkStockTable();
    updateSidebarBadges();
  }
  window.loadAdminProducts = loadAdminProducts;

  function renderProductsTable() {
    const tbody = document.getElementById('admin-products-table-body');
    if (!tbody) return;

    const list = getCombinedProductsList();

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:#94A3B8;">No products in store yet. Click "+ Add Product" to create your first medical product.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const imgUrl = p.image || (p.images && p.images[0]) || '';
      return `
      <tr data-product-id="${p.id}">
        <td>
          ${imgUrl ? `
            <img src="${imgUrl}" alt="${p.name}"
                 style="width:44px; height:44px; border-radius:8px; object-fit:cover; border:1px solid #E2E8F0; background:#F8FAFC;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display:none; width:44px; height:44px; border-radius:8px; background:#F1F5F9; border:1px solid #E2E8F0; align-items:center; justify-content:center; font-size:18px;">🩺</div>
          ` : `
            <div style="width:44px; height:44px; border-radius:8px; background:#F1F5F9; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center; font-size:18px;">🩺</div>
          `}
        </td>
        <td>
          <strong>${p.name}</strong>
          ${p.name_ar ? `<div style="font-size:11px; color:#64748B;">${p.name_ar}</div>` : ''}
        </td>
        <td><code style="background:#F1F5F9; padding:2px 6px; border-radius:4px; font-size:12px;">${p.sku || p.id}</code></td>
        <td><span class="adm-badge adm-badge-info">${p.category || 'Medical Wear'}</span></td>
        <td><span style="font-size:12px; text-transform:capitalize; color:#475569;">${p.specialty}</span></td>
        <td><strong style="color:#0E4D45;">${Number(p.price).toLocaleString()} DZD</strong></td>
        <td>
          <span class="adm-badge ${p.stock > 10 ? 'adm-badge-success' : p.stock > 0 ? 'adm-badge-warning' : 'adm-badge-danger'}">
            ${p.stock > 0 ? p.stock + ' in stock' : 'Out of Stock'}
          </span>
        </td>
        <td><span class="adm-badge ${p.status === 'draft' ? 'adm-badge-warning' : p.status === 'archived' ? 'adm-badge-danger' : 'adm-badge-success'}">${p.status || 'Active'}</span></td>
        <td style="display:flex; gap:6px; align-items:center;">
          <button class="adm-btn-icon" onclick="openEditProductModal('${p.id}')" title="Edit Product"
                  style="background:#EFF6FF; color:#1D4ED8; border-radius:6px; padding:5px 8px; border:1px solid #BFDBFE; font-size:14px;">✏️</button>
          <a href="product-detail.html?id=${p.id}" target="_blank" class="adm-btn-icon" title="View on Storefront"
             style="background:#F0FDF4; color:#15803D; border-radius:6px; padding:5px 8px; border:1px solid #BBF7D0; font-size:14px; text-decoration:none;">👁️</a>
          <button class="adm-btn-icon" onclick="deleteAdminProduct('${p.id}')" title="Delete Product"
                  style="background:#FEF2F2; color:#DC2626; border-radius:6px; padding:5px 8px; border:1px solid #FECACA; font-size:14px;">🗑️</button>
        </td>
      </tr>`;
    }).join('');
    updateSidebarBadges();
  }

  window.deleteAdminProduct = async function(productId) {
    if (!confirm(`حذف هذا المنتج نهائياً؟ Delete this product permanently?`)) return;

    // 1. Delete from Supabase
    let sbStatus = '';
    if (window.MedicareDB && typeof window.MedicareDB.deleteProduct === 'function') {
      const res = await window.MedicareDB.deleteProduct(productId);
      sbStatus = res.success ? '☁️ Removed from Supabase' : '⚠️ Supabase offline, removed locally';
    } else {
      sbStatus = '💾 Removed locally (Supabase not connected)';
    }

    // 2. Remove from localStorage
    const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
    localStorage.setItem('medicare_custom_products', JSON.stringify(customProds.filter(p => String(p.id) !== String(productId))));

    // 3. Remove from in-memory default products
    allAdminProducts = allAdminProducts.filter(p => String(p.id) !== String(productId));

    renderProductsTable();
    window.dispatchEvent(new CustomEvent('medicare_products_updated'));
    logAuditAction('Deleted Product', `Product ID: ${productId}`);
    showToast(`🗑️ Product deleted. ${sbStatus}`);
  };

  window.filterAdminProducts = function(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('#admin-products-table-body tr');
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
  };

  window.filterAdminCategory = function(category) {
    const rows = document.querySelectorAll('#admin-products-table-body tr');
    rows.forEach(r => {
      if (category === 'all') {
        r.style.display = '';
      } else {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(category.toLowerCase()) ? '' : 'none';
      }
    });
  };

  /**
   * saveProductSubmit — handles BOTH Add and Edit modes.
   * Gathers all 10 tabs into a unified, rich product object.
   */
  /**
   * saveProductSubmit — handles BOTH Add and Edit modes.
   * Gathers all 10 tabs into a unified, rich product object.
   */
  window.saveProductSubmit = async function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const saveBtn = document.getElementById('modal-product-save-btn');
    const originalBtnText = saveBtn ? saveBtn.textContent : '💾 Save Product';

    try {
      // --- Read Basic Info ---
      const nameInput    = document.getElementById('p-name');
      const nameArInput  = document.getElementById('p-name-ar');
      const nameFrInput  = document.getElementById('p-name-fr');
      const skuInput     = document.getElementById('p-sku');
      const catEl        = document.getElementById('p-category');
      const specEl       = document.getElementById('p-specialty');
      const brandInput   = document.getElementById('p-brand');
      const statusEl     = document.getElementById('p-status');

      // --- Read Pricing ---
      const priceInput   = document.getElementById('p-price');
      const origPriceInp = document.getElementById('p-original-price');
      const badgeEl      = document.getElementById('p-badge');
      const isBestseller = !!document.getElementById('p-is-bestseller')?.checked;
      const isNew        = !!document.getElementById('p-is-new')?.checked;

      // --- Read Descriptions (Trilingual) ---
      const shortDescInp   = document.getElementById('p-short-desc');
      const shortDescFrInp = document.getElementById('p-short-desc-fr');
      const shortDescArInp = document.getElementById('p-short-desc-ar');
      const descInp        = document.getElementById('p-desc');
      const descFrInp      = document.getElementById('p-desc-fr');
      const descArInp      = document.getElementById('p-desc-ar');

      // --- Read Inventory ---
      const stockInput   = document.getElementById('p-stock');
      const minStockInp  = document.getElementById('p-min-stock');

      // --- Read Care & Size Guide & Delivery ---
      const careInp      = document.getElementById('p-care-instructions');
      const careFrInp    = document.getElementById('p-care-instructions-fr');
      const careArInp    = document.getElementById('p-care-instructions-ar');
      const sgEnabled    = !!document.getElementById('p-sizeguide-enabled')?.checked;
      const sgTemplate   = document.getElementById('p-sizeguide-template')?.value || 'scrubs';
      const sgNote       = document.getElementById('p-sizeguide-note')?.value.trim() || '';
      const deliveryInp  = document.getElementById('p-delivery-info');
      const deliveryFrInp= document.getElementById('p-delivery-info-fr');
      const deliveryArInp= document.getElementById('p-delivery-info-ar');
      const returnInp    = document.getElementById('p-return-info');
      const returnFrInp  = document.getElementById('p-return-info-fr');
      const returnArInp  = document.getElementById('p-return-info-ar');
      const trustInp     = document.getElementById('p-trust-badges');

      const name      = (nameInput  ? nameInput.value.trim()          : '');
      const nameAr    = (nameArInput? nameArInput.value.trim()        : name);
      const nameFr    = (nameFrInput? nameFrInput.value.trim()        : name);
      const skuRaw    = (skuInput   ? skuInput.value.trim()           : '');
      const priceRaw  = (priceInput ? parseFloat(priceInput.value)    : NaN);
      const origPrice = (origPriceInp && origPriceInp.value) ? parseFloat(origPriceInp.value) : null;
      const stockRaw  = (stockInput ? parseInt(stockInput.value, 10)  : NaN);
      const minStock  = (minStockInp ? parseInt(minStockInp.value, 10): 5);
      const category  = (catEl      ? catEl.value                     : 'Scrubs');
      const specialty = (specEl     ? specEl.value                    : 'medicine');
      const brand     = (brandInput ? brandInput.value.trim()         : 'MEDICARE PRO');
      const status    = (statusEl   ? statusEl.value                  : 'active');
      const badge     = (badgeEl    ? badgeEl.value                   : '');

      // Validation
      if (!name) {
        const basicTabBtn = document.querySelector(".adm-modal-tab-btn[onclick*='tab-p-basic']") || document.querySelector('.adm-modal-tab-btn');
        window.switchProductModalTab('tab-p-basic', basicTabBtn);
        showToast('⚠️ يرجى كتابة اسم المنتج أولاً (Product Name is required)');
        _showFieldError(nameInput, 'اسم المنتج مطلوب');
        return;
      }
      if (isNaN(priceRaw) || priceRaw <= 0) {
        const priceTabBtn = document.querySelector(".adm-modal-tab-btn[onclick*='tab-p-pricing']") || document.querySelectorAll('.adm-modal-tab-btn')[1];
        window.switchProductModalTab('tab-p-pricing', priceTabBtn);
        showToast('⚠️ يرجى كتابة سعر صحيح للمنتج بالدينار (Price in DZD is required)');
        _showFieldError(priceInput, 'السعر مطلوب');
        return;
      }

      // Disable button during save
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = '⏳ Saving... جاري الحفظ'; }

      const sku   = skuRaw || (_editingProductId || `MC-${Math.floor(100 + Math.random() * 900)}`);
      const mainImgUrlInput = document.getElementById('p-main-img-url')?.value.trim();
      if (mainImgUrlInput && !uploadedProductImages.includes(mainImgUrlInput)) {
        uploadedProductImages.unshift(mainImgUrlInput);
      }

      const finalImages = uploadedProductImages.length > 0
        ? [...uploadedProductImages]
        : [];

      const careList = careInp ? careInp.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
      const careFrList = careFrInp ? careFrInp.value.split('\n').map(s => s.trim()).filter(Boolean) : careList;
      const careArList = careArInp ? careArInp.value.split('\n').map(s => s.trim()).filter(Boolean) : careList;

      const trustBadgesList = trustInp && trustInp.value
        ? trustInp.value.split(',').map(s => s.trim()).filter(Boolean)
        : ['🚚 58 Wilayas COD', '🔄 14-Day Free Exchange', '🛡️ Antimicrobial Shield'];

      const colorsData = (typeof getColorsData === 'function') ? getColorsData() : [];
      const sizesData = (typeof getSizesData === 'function') ? getSizesData() : ['S', 'M', 'L', 'XL'];
      const featuresData = (typeof getFeaturesData === 'function') ? getFeaturesData() : [];
      const specsData = (typeof getSpecsData === 'function') ? getSpecsData() : {};

      // Map to complete, unified schema
      const productData = {
        id:                   sku,
        sku:                  sku,
        name:                 name,
        name_ar:              nameAr || name,
        name_fr:              nameFr || name,
        category:             category,
        specialty:            specialty,
        brand:                brand || 'MEDICARE PRO',
        status:               status,
        price:                priceRaw,
        original_price:       origPrice,
        badge:                badge,
        is_new:               isNew,
        is_bestseller:        isBestseller,
        images:               finalImages,
        short_description:    shortDescInp ? shortDescInp.value.trim() : '',
        short_description_fr: shortDescFrInp ? shortDescFrInp.value.trim() : (shortDescInp ? shortDescInp.value.trim() : ''),
        short_description_ar: shortDescArInp ? shortDescArInp.value.trim() : (shortDescInp ? shortDescInp.value.trim() : ''),
        description:          descInp ? descInp.value.trim() : '',
        description_fr:       descFrInp ? descFrInp.value.trim() : (descInp ? descInp.value.trim() : ''),
        description_ar:       descArInp ? descArInp.value.trim() : (descInp ? descInp.value.trim() : ''),
        colors:               colorsData,
        sizes:                sizesData,
        features:             featuresData,
        features_fr:          featuresData,
        features_ar:          featuresData,
        specifications:       specsData,
        specifications_fr:    specsData,
        specifications_ar:    specsData,
        care_instructions:    careList,
        care_instructions_fr: careFrList,
        care_instructions_ar: careArList,
        size_guide: {
          enabled:  sgEnabled,
          template: sgTemplate,
          note:     sgNote
        },
        delivery_info:        deliveryInp ? deliveryInp.value.trim() : '',
        delivery_info_fr:     deliveryFrInp ? deliveryFrInp.value.trim() : (deliveryInp ? deliveryInp.value.trim() : ''),
        delivery_info_ar:     deliveryArInp ? deliveryArInp.value.trim() : (deliveryInp ? deliveryInp.value.trim() : ''),
        return_info:          returnInp   ? returnInp.value.trim()   : '',
        return_info_fr:       returnFrInp ? returnFrInp.value.trim() : (returnInp ? returnInp.value.trim() : ''),
        return_info_ar:       returnArInp ? returnArInp.value.trim() : (returnInp ? returnInp.value.trim() : ''),
        trust_badges:         trustBadgesList,
        stock:                isNaN(stockRaw) ? 25 : stockRaw,
        min_stock:            minStock,
        rating:               5.00,
        reviews_count:        0
      };

      // 1. Try Supabase
      let sbResult = { success: false, error: 'not tried' };
      if (window.MedicareDB && typeof window.MedicareDB.saveProduct === 'function') {
        try {
          sbResult = await window.MedicareDB.saveProduct(productData, !!_editingProductId);
        } catch (sbErr) {
          console.warn('[Admin] Supabase save error:', sbErr);
        }
      }

      // 2. Persist to localStorage
      let customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      if (_editingProductId) {
        const idx = customProds.findIndex(p => String(p.id) === String(_editingProductId));
        if (idx >= 0) {
          customProds[idx] = productData;
        } else {
          customProds.unshift(productData);
          allAdminProducts = allAdminProducts.filter(p => String(p.id) !== String(_editingProductId));
        }
      } else {
        customProds.unshift(productData);
      }

      const safeSaveCustomList = (list) => {
        try {
          localStorage.setItem('medicare_custom_products', JSON.stringify(list));
        } catch (e1) {
          // Tier 1 fallback: strip oversized base64 images
          try {
            const sanitized = list.map(p => ({
              ...p,
              images: (p.images || []).map(img => (typeof img === 'string' && img.length > 50000) ? '' : img),
              image: (typeof p.image === 'string' && p.image.length > 50000) ? '' : (p.image || '')
            }));
            localStorage.setItem('medicare_custom_products', JSON.stringify(sanitized));
          } catch (e2) {
            // Tier 2 fallback: clean audit logs and keep only recent items
            try {
              localStorage.removeItem('medicare_audit_db');
              localStorage.setItem('medicare_custom_products', JSON.stringify(list.slice(0, 15)));
            } catch (e3) {}
          }
        }
      };
      safeSaveCustomList(customProds);

      // 3. Update stock override
      try {
        const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
        overrides[sku] = isNaN(stockRaw) ? 25 : stockRaw;
        localStorage.setItem('medicare_stock_overrides', JSON.stringify(overrides));
      } catch (e) {}

      // 4. Notify system
      window.dispatchEvent(new CustomEvent('medicare_products_updated', { detail: productData }));
      window.dispatchEvent(new CustomEvent('medicare_stock_updated', { detail: { productId: sku, newStock: isNaN(stockRaw) ? 25 : stockRaw } }));

      // 5. Feedback
      const sbStatus = sbResult && sbResult.success ? '☁️ متزامن مع Supabase' : '💾 تم الحفظ بنجاح';
      if (_editingProductId) {
        logAuditAction('Updated Product', `${name} (${sku}) — ${priceRaw} DZD`);
        showToast(`✅ تم تحديث المنتج "${name}" بنجاح! ${sbStatus}`);
      } else {
        logAuditAction('Added New Product', `${name} (${sku}) — ${priceRaw} DZD`);
        showToast(`🎉 تم نشر وحفظ المنتج "${name}" بنجاح! ${sbStatus}`);
      }

      // 6. Close and reset
      closeAddProductModal();
      renderProductsTable();
      updateSidebarBadges();
      uploadedProductImages = [];
      renderImagePreviews();

    } catch (err) {
      console.error('[Admin Save Product Exception]:', err);
      showToast('❌ حدث خطأ أثناء الحفظ: ' + (err.message || 'Error'));
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = originalBtnText;
      }
    }
  };

  /** Show inline validation error under a field */
  function _showFieldError(inputEl, msg) {
    if (!inputEl) { alert(msg); return; }
    inputEl.focus();
    inputEl.style.borderColor = '#EF4444';
    inputEl.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.2)';
    // Remove error style after 2s
    setTimeout(() => {
      inputEl.style.borderColor = '';
      inputEl.style.boxShadow   = '';
    }, 2000);
    // Show small error message below the field
    let errEl = inputEl.parentNode.querySelector('.field-error-msg');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'field-error-msg';
      errEl.style.cssText = 'color:#EF4444;font-size:12px;margin:4px 0 0 2px;font-weight:600;';
      inputEl.parentNode.appendChild(errEl);
    }
    errEl.textContent = msg;
    setTimeout(() => { if (errEl) errEl.remove(); }, 2500);
  }

  /* ==========================================================================
     HOMEPAGE & ANNOUNCEMENT BAR CMS ENGINE
     ========================================================================== */
  let currentPreviewLang = 'en';

  const DEFAULT_ANNOUNCEMENT_DATA = {
    enabled: true,
    bgColor: '#0A3A34',
    textColor: '#F0FDF4',
    items: [
      { en: '🚚 Free Express Shipping on Orders Above 5,000 DZD', ar: '🚚 شحن مجاني على الطلبات فوق 5,000 دج', link: '' },
      { en: '💵 Cash on Delivery — All 58 Wilayas', ar: '💵 الدفع عند الاستلام — جميع الـ 58 ولاية', link: '' },
      { en: '🎓 Student Bundles — Save up to 25%', ar: '🎓 حقائب الطلاب — وفّر حتى 25%', link: 'category.html?specialty=bundle' }
    ]
  };

  function getSavedAnnouncementSettings() {
    try {
      const raw = localStorage.getItem('medicare_announcement_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ANNOUNCEMENT_DATA;
  }

  function initAnnouncementCMS() {
    const settings = getSavedAnnouncementSettings();
    const enabledCheck = document.getElementById('adm-ann-enabled');
    const bgColorInput = document.getElementById('adm-ann-bg-color');
    const bgHexInput = document.getElementById('adm-ann-bg-hex');
    const textColorInput = document.getElementById('adm-ann-text-color');
    const textHexInput = document.getElementById('adm-ann-text-hex');
    const container = document.getElementById('adm-ann-items-container');

    if (enabledCheck) enabledCheck.checked = settings.enabled !== false;
    if (bgColorInput) bgColorInput.value = settings.bgColor || '#0A3A34';
    if (bgHexInput) bgHexInput.value = settings.bgColor || '#0A3A34';
    if (textColorInput) textColorInput.value = settings.textColor || '#F0FDF4';
    if (textHexInput) textHexInput.value = settings.textColor || '#F0FDF4';

    if (container) {
      container.innerHTML = '';
      const items = settings.items && settings.items.length ? settings.items : DEFAULT_ANNOUNCEMENT_DATA.items;
      items.forEach((item, index) => {
        addAnnouncementItemRow(item, index);
      });
    }

    updateAnnouncementLivePreview();
  }

  window.addAnnouncementItemRow = function(itemData = null, index = null) {
    const container = document.getElementById('adm-ann-items-container');
    if (!container) return;

    const rowIdx = index !== null ? index : container.querySelectorAll('.adm-ann-row').length;
    const item = itemData || { en: '', ar: '', link: '' };

    const row = document.createElement('div');
    row.className = 'adm-ann-row';
    row.style.cssText = 'background:var(--adm-card-bg); border:1px solid var(--adm-border); border-radius:8px; padding:1rem; position:relative;';

    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
        <span style="font-size:12px; font-weight:800; color:var(--adm-foreground);">📌 Message Item #${rowIdx + 1}</span>
        <button type="button" onclick="removeAnnouncementItemRow(this)" style="background:none; border:none; color:#EF4444; font-size:12px; font-weight:700; cursor:pointer;" title="Delete Message">
          🗑️ Remove
        </button>
      </div>

      <div class="chk-form-grid two-col" style="margin-bottom:0.5rem;">
        <div class="chk-form-group">
          <label class="chk-label" style="font-size:11.5px;">English Text (with Emoji):</label>
          <input type="text" class="chk-input adm-ann-en" value="${(item.en || '').replace(/"/g, '&quot;')}" placeholder="e.g. 🚚 Free Express Shipping Above 5,000 DZD" oninput="updateAnnouncementLivePreview()">
        </div>
        <div class="chk-form-group">
          <label class="chk-label" style="font-size:11.5px;">النص بالعربية (مع إيموجي):</label>
          <input type="text" class="chk-input adm-ann-ar" dir="rtl" value="${(item.ar || '').replace(/"/g, '&quot;')}" placeholder="مثال: 🚚 شحن مجاني على الطلبات فوق 5,000 دج" oninput="updateAnnouncementLivePreview()">
        </div>
      </div>

      <div class="chk-form-group">
        <label class="chk-label" style="font-size:11.5px;">Optional Clickable URL / Link (رابط اختياري):</label>
        <input type="text" class="chk-input adm-ann-link" value="${(item.link || '').replace(/"/g, '&quot;')}" placeholder="e.g. category.html or delivery-pricing.html" oninput="updateAnnouncementLivePreview()">
      </div>
    `;

    container.appendChild(row);
    updateAnnouncementLivePreview();
  };

  window.removeAnnouncementItemRow = function(btn) {
    const row = btn.closest('.adm-ann-row');
    if (row) {
      row.remove();
      // Re-number remaining items
      const container = document.getElementById('adm-ann-items-container');
      if (container) {
        container.querySelectorAll('.adm-ann-row').forEach((r, idx) => {
          const title = r.querySelector('span');
          if (title) title.textContent = `📌 Message Item #${idx + 1}`;
        });
      }
      updateAnnouncementLivePreview();
    }
  };

  window.onColorChange = function() {
    const bgCol = document.getElementById('adm-ann-bg-color')?.value;
    const txtCol = document.getElementById('adm-ann-text-color')?.value;
    const bgHex = document.getElementById('adm-ann-bg-hex');
    const txtHex = document.getElementById('adm-ann-text-hex');

    if (bgHex && bgCol) bgHex.value = bgCol;
    if (txtHex && txtCol) txtHex.value = txtCol;
    updateAnnouncementLivePreview();
  };

  window.onHexChange = function(type, hexVal) {
    if (!hexVal.startsWith('#')) hexVal = '#' + hexVal;
    if (/^#[0-9A-Fa-f]{6}$/.test(hexVal)) {
      if (type === 'bg') {
        const bgPicker = document.getElementById('adm-ann-bg-color');
        if (bgPicker) bgPicker.value = hexVal;
      } else {
        const txtPicker = document.getElementById('adm-ann-text-color');
        if (txtPicker) txtPicker.value = hexVal;
      }
      updateAnnouncementLivePreview();
    }
  };

  window.setQuickColor = function(type, colorHex) {
    if (type === 'bg') {
      const bgPicker = document.getElementById('adm-ann-bg-color');
      const bgHex = document.getElementById('adm-ann-bg-hex');
      if (bgPicker) bgPicker.value = colorHex;
      if (bgHex) bgHex.value = colorHex;
    } else {
      const txtPicker = document.getElementById('adm-ann-text-color');
      const txtHex = document.getElementById('adm-ann-text-hex');
      if (txtPicker) txtPicker.value = colorHex;
      if (txtHex) txtHex.value = colorHex;
    }
    updateAnnouncementLivePreview();
  };

  window.setPreviewLang = function(lang) {
    currentPreviewLang = lang;
    document.getElementById('btn-prev-en')?.classList.toggle('active', lang === 'en');
    document.getElementById('btn-prev-ar')?.classList.toggle('active', lang === 'ar');
    updateAnnouncementLivePreview();
  };

  window.updateAnnouncementLivePreview = function() {
    const previewBar = document.getElementById('adm-ann-preview-bar');
    if (!previewBar) return;

    const enabled = document.getElementById('adm-ann-enabled')?.checked ?? true;
    const bgColor = document.getElementById('adm-ann-bg-color')?.value || '#0A3A34';
    const textColor = document.getElementById('adm-ann-text-color')?.value || '#F0FDF4';

    if (!enabled) {
      previewBar.style.display = 'flex';
      previewBar.style.backgroundColor = '#94A3B8';
      previewBar.style.color = '#FFFFFF';
      previewBar.innerHTML = '<em>⚠️ Announcement Bar is currently DISABLED / HIDDEN (الشريط معطّل حالياً)</em>';
      return;
    }

    previewBar.style.display = 'flex';
    previewBar.style.backgroundColor = bgColor;
    previewBar.style.color = textColor;
    previewBar.setAttribute('dir', currentPreviewLang === 'ar' ? 'rtl' : 'ltr');

    const container = document.getElementById('adm-ann-items-container');
    const rows = container ? container.querySelectorAll('.adm-ann-row') : [];

    if (rows.length === 0) {
      previewBar.innerHTML = '<em>(No messages added. Click "+ Add Another Message" below)</em>';
      return;
    }

    let itemsHtml = '';
    rows.forEach(row => {
      const enVal = row.querySelector('.adm-ann-en')?.value.trim();
      const arVal = row.querySelector('.adm-ann-ar')?.value.trim();
      const linkVal = row.querySelector('.adm-ann-link')?.value.trim();
      const text = currentPreviewLang === 'ar' ? (arVal || enVal) : (enVal || arVal);

      if (text) {
        if (linkVal) {
          itemsHtml += `<span style="display:inline-flex; align-items:center; gap:0.35rem; text-decoration:underline;">${text} ↗</span>`;
        } else {
          itemsHtml += `<span>${text}</span>`;
        }
      }
    });

    previewBar.innerHTML = itemsHtml || '<em>(Fill in the message fields below)</em>';
  };

  window.saveAnnouncementSettings = function() {
    const enabled = document.getElementById('adm-ann-enabled')?.checked ?? true;
    const bgColor = document.getElementById('adm-ann-bg-color')?.value || '#0A3A34';
    const textColor = document.getElementById('adm-ann-text-color')?.value || '#F0FDF4';

    const container = document.getElementById('adm-ann-items-container');
    const rows = container ? container.querySelectorAll('.adm-ann-row') : [];

    const items = [];
    rows.forEach(row => {
      const en = row.querySelector('.adm-ann-en')?.value.trim() || '';
      const ar = row.querySelector('.adm-ann-ar')?.value.trim() || '';
      const link = row.querySelector('.adm-ann-link')?.value.trim() || '';
      if (en || ar) {
        items.push({ en, ar, link });
      }
    });

    if (items.length === 0) {
      items.push({ en: '🚚 Free Express Shipping on Orders Above 5,000 DZD', ar: '🚚 شحن مجاني على الطلبات فوق 5,000 دج', link: '' });
    }

    const payload = {
      enabled,
      bgColor,
      textColor,
      items,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('medicare_announcement_settings', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('medicare_announcement_updated'));

    logAuditAction('Updated Announcement Bar', `${items.length} items • ${enabled ? 'Active' : 'Disabled'} • ${bgColor}`);
    showToast('🎉 Announcement Bar saved & published live across all store pages!');
  };

  /* ==========================================================================
     HERO CAROUSEL BANNERS CMS & COLOR CUSTOMIZATION ENGINE
     ========================================================================== */
  const DEFAULT_HERO_DATA = {
    b1: {
      title: 'Obsidian Flex Antimicrobial Scrubs',
      titleAr: 'أطقم سكراب أوبسيديان فليكس الطبية',
      tag: '✨ New 2026 Collection',
      tagAr: '✨ مجموعة 2026 الجديدة',
      desc: 'Engineered for 24-hour shift endurance — 4-way stretch flex fabric with liquid-shield barrier.',
      descAr: 'مصمم لتحمّل نوبات 24 ساعة — قماش مرن 4 اتجاهات مع طبقة عازلة للسوائل.',
      bgStart: '#0A3A34',
      bgEnd: '#062824',
      textColor: '#FFFFFF',
      btnColor: '#14B8A6'
    },
    b2: {
      title: '2026 Medical Student Starter Kits',
      titleAr: 'باقات وحقائب طلاب الطب والصيدلة 2026',
      tag: '🎓 Student Discount Active',
      tagAr: '🎓 خصم الطلاب متاح',
      desc: 'Complete gear & apparel bundles for Medicine, Pharmacy, Dentistry, and Nursing students. Save up to 25%.',
      descAr: 'حقائب متكاملة للملابس والمعدات لطلاب الطب والصيدلة وطب الأسنان والتمريض. وفّر حتى 25%.',
      bgStart: '#0F172A',
      bgEnd: '#1E3A5F',
      textColor: '#FFFFFF',
      btnColor: '#F59E0B'
    }
  };

  function getSavedHeroData() {
    try {
      const raw = localStorage.getItem('medicare_hero_banners');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.b1 || parsed.b2)) {
          return {
            b1: { ...DEFAULT_HERO_DATA.b1, ...(parsed.b1 || {}) },
            b2: { ...DEFAULT_HERO_DATA.b2, ...(parsed.b2 || {}) }
          };
        }
      }
    } catch (e) {}
    return DEFAULT_HERO_DATA;
  }

  function initHeroCMS() {
    const data = getSavedHeroData();

    // Slide 1
    const b1 = data.b1;
    _setVal('banner1-title', b1.title);
    _setVal('banner1-title-ar', b1.titleAr);
    _setVal('banner1-tag', b1.tag);
    _setVal('banner1-tag-ar', b1.tagAr);
    _setVal('banner1-desc', b1.desc);
    _setVal('banner1-desc-ar', b1.descAr);
    _setVal('banner1-bg-start', b1.bgStart);
    _setVal('banner1-bg-start-hex', b1.bgStart);
    _setVal('banner1-bg-end', b1.bgEnd);
    _setVal('banner1-bg-end-hex', b1.bgEnd);
    _setVal('banner1-text-color', b1.textColor);
    _setVal('banner1-text-hex', b1.textColor);
    _setVal('banner1-btn-color', b1.btnColor);
    _setVal('banner1-btn-hex', b1.btnColor);

    // Slide 2
    const b2 = data.b2;
    _setVal('banner2-title', b2.title);
    _setVal('banner2-title-ar', b2.titleAr);
    _setVal('banner2-tag', b2.tag);
    _setVal('banner2-tag-ar', b2.tagAr);
    _setVal('banner2-desc', b2.desc);
    _setVal('banner2-desc-ar', b2.descAr);
    _setVal('banner2-bg-start', b2.bgStart);
    _setVal('banner2-bg-start-hex', b2.bgStart);
    _setVal('banner2-bg-end', b2.bgEnd);
    _setVal('banner2-bg-end-hex', b2.bgEnd);
    _setVal('banner2-text-color', b2.textColor);
    _setVal('banner2-text-hex', b2.textColor);
    _setVal('banner2-btn-color', b2.btnColor);
    _setVal('banner2-btn-hex', b2.btnColor);

    updateHeroLivePreview(1);
    updateHeroLivePreview(2);
  }

  function _setVal(id, val) {
    const el = document.getElementById(id);
    if (el && val != null) el.value = val;
  }

  window.onHeroColorInput = function(num) {
    const bgStart = document.getElementById(`banner${num}-bg-start`)?.value;
    const bgEnd   = document.getElementById(`banner${num}-bg-end`)?.value;
    const txt     = document.getElementById(`banner${num}-text-color`)?.value;
    const btn     = document.getElementById(`banner${num}-btn-color`)?.value;

    if (bgStart) _setVal(`banner${num}-bg-start-hex`, bgStart);
    if (bgEnd)   _setVal(`banner${num}-bg-end-hex`, bgEnd);
    if (txt)     _setVal(`banner${num}-text-hex`, txt);
    if (btn)     _setVal(`banner${num}-btn-hex`, btn);

    updateHeroLivePreview(num);
  };

  window.onHeroHexInput = function(num, type, hexVal) {
    const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexVal);
    if (!valid) return;

    if (type === 'start') _setVal(`banner${num}-bg-start`, hexVal);
    if (type === 'end')   _setVal(`banner${num}-bg-end`, hexVal);
    if (type === 'text')  _setVal(`banner${num}-text-color`, hexVal);
    if (type === 'btn')   _setVal(`banner${num}-btn-color`, hexVal);

    updateHeroLivePreview(num);
  };

  window.setHeroQuickColor = function(num, bgStart, bgEnd, text, btn) {
    _setVal(`banner${num}-bg-start`, bgStart);
    _setVal(`banner${num}-bg-start-hex`, bgStart);
    _setVal(`banner${num}-bg-end`, bgEnd);
    _setVal(`banner${num}-bg-end-hex`, bgEnd);
    _setVal(`banner${num}-text-color`, text);
    _setVal(`banner${num}-text-hex`, text);
    _setVal(`banner${num}-btn-color`, btn);
    _setVal(`banner${num}-btn-hex`, btn);

    updateHeroLivePreview(num);
  };

  window.updateHeroLivePreview = function(num) {
    const prevBox   = document.getElementById(`hero-prev-${num}`);
    const tagEl     = document.getElementById(`hero-prev-${num}-tag`);
    const titleEl   = document.getElementById(`hero-prev-${num}-title`);
    const descEl    = document.getElementById(`hero-prev-${num}-desc`);
    const btnEl     = document.getElementById(`hero-prev-${num}-btn`);

    if (!prevBox) return;

    const bgStart   = document.getElementById(`banner${num}-bg-start`)?.value || '#0A3A34';
    const bgEnd     = document.getElementById(`banner${num}-bg-end`)?.value || '#062824';
    const textColor = document.getElementById(`banner${num}-text-color`)?.value || '#FFFFFF';
    const btnColor  = document.getElementById(`banner${num}-btn-color`)?.value || '#14B8A6';
    const titleVal  = document.getElementById(`banner${num}-title`)?.value || 'Slide Title';
    const tagVal    = document.getElementById(`banner${num}-tag`)?.value || 'Featured';
    const descVal   = document.getElementById(`banner${num}-desc`)?.value || 'Slide description.';

    prevBox.style.background = `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`;
    prevBox.style.color = textColor;

    if (titleEl) {
      titleEl.textContent = titleVal;
      titleEl.style.color = textColor;
    }
    if (tagEl) {
      tagEl.textContent = tagVal;
      tagEl.style.borderColor = btnColor;
      tagEl.style.color = textColor;
    }
    if (descEl) {
      descEl.textContent = descVal;
      descEl.style.color = textColor;
    }
    if (btnEl) {
      btnEl.style.backgroundColor = btnColor;
      btnEl.style.color = '#042F2E';
    }
  };

  window.saveHeroBanners = function() {
    const b1 = {
      title: document.getElementById('banner1-title')?.value.trim() || DEFAULT_HERO_DATA.b1.title,
      titleAr: document.getElementById('banner1-title-ar')?.value.trim() || DEFAULT_HERO_DATA.b1.titleAr,
      tag: document.getElementById('banner1-tag')?.value.trim() || DEFAULT_HERO_DATA.b1.tag,
      tagAr: document.getElementById('banner1-tag-ar')?.value.trim() || DEFAULT_HERO_DATA.b1.tagAr,
      desc: document.getElementById('banner1-desc')?.value.trim() || DEFAULT_HERO_DATA.b1.desc,
      descAr: document.getElementById('banner1-desc-ar')?.value.trim() || DEFAULT_HERO_DATA.b1.descAr,
      bgStart: document.getElementById('banner1-bg-start')?.value || '#0A3A34',
      bgEnd: document.getElementById('banner1-bg-end')?.value || '#062824',
      textColor: document.getElementById('banner1-text-color')?.value || '#FFFFFF',
      btnColor: document.getElementById('banner1-btn-color')?.value || '#14B8A6'
    };

    const b2 = {
      title: document.getElementById('banner2-title')?.value.trim() || DEFAULT_HERO_DATA.b2.title,
      titleAr: document.getElementById('banner2-title-ar')?.value.trim() || DEFAULT_HERO_DATA.b2.titleAr,
      tag: document.getElementById('banner2-tag')?.value.trim() || DEFAULT_HERO_DATA.b2.tag,
      tagAr: document.getElementById('banner2-tag-ar')?.value.trim() || DEFAULT_HERO_DATA.b2.tagAr,
      desc: document.getElementById('banner2-desc')?.value.trim() || DEFAULT_HERO_DATA.b2.desc,
      descAr: document.getElementById('banner2-desc-ar')?.value.trim() || DEFAULT_HERO_DATA.b2.descAr,
      bgStart: document.getElementById('banner2-bg-start')?.value || '#0F172A',
      bgEnd: document.getElementById('banner2-bg-end')?.value || '#1E3A5F',
      textColor: document.getElementById('banner2-text-color')?.value || '#FFFFFF',
      btnColor: document.getElementById('banner2-btn-color')?.value || '#F59E0B'
    };

    const payload = { b1, b2, updatedAt: new Date().toISOString() };
    localStorage.setItem('medicare_hero_banners', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('medicare_hero_banners_updated'));

    logAuditAction('Updated Hero Banners & Colors', `Slide 1: ${b1.title} (${b1.bgStart}) • Slide 2: ${b2.title} (${b2.bgStart})`);
    showToast('🎉 Hero banners and custom colors saved & published live to homepage!');
  };

  window.toggleAdminTheme = function() {
    const html = document.documentElement;
    const curr = html.getAttribute('data-admin-theme') || 'light';
    const next = curr === 'light' ? 'dark' : 'light';
    html.setAttribute('data-admin-theme', next);
    showToast(`🌙 Theme switched to ${next} mode`);
  };

  /* ==========================================================================
     COMMUNITY & WHATSAPP VIP CMS ENGINE
     ========================================================================== */
  const DEFAULT_COMMUNITY_DATA = {
    titleEn: 'Join 15,000+ Medical Professionals',
    titleAr: 'انضم لأكثر من 15,000 متخصص طبي',
    descEn: 'Subscribe for VIP student discounts, new product launches, and instant WhatsApp order updates.',
    descAr: 'اشترك للحصول على خصومات VIP للطلاب وإشعارات المنتجات الجديدة وتحديثات الطلبات.',
    waText: '💬 Join WhatsApp VIP — انضم للمجموعة',
    waLink: 'https://wa.me/213662497253',
    bgStart: '#064E3B',
    bgEnd: '#022C22',
    textColor: '#FFFFFF',
    waBtnColor: '#22C55E',
    subBtnColor: '#EA580C'
  };

  function getSavedCommunityData() {
    try {
      const raw = localStorage.getItem('medicare_community_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.titleEn || parsed.titleAr || parsed.bgStart)) {
          return { ...DEFAULT_COMMUNITY_DATA, ...parsed };
        }
      }
    } catch (e) {}
    return DEFAULT_COMMUNITY_DATA;
  }

  function initCommunityCMS() {
    const data = getSavedCommunityData();

    _setVal('comm-title-en', data.titleEn);
    _setVal('comm-title-ar', data.titleAr);
    _setVal('comm-desc-en', data.descEn);
    _setVal('comm-desc-ar', data.descAr);
    _setVal('comm-wa-text', data.waText);
    _setVal('comm-wa-link', data.waLink);

    _setVal('comm-bg-start', data.bgStart);
    _setVal('comm-bg-start-hex', data.bgStart);
    _setVal('comm-bg-end', data.bgEnd);
    _setVal('comm-bg-end-hex', data.bgEnd);
    _setVal('comm-text-color', data.textColor);
    _setVal('comm-text-hex', data.textColor);
    _setVal('comm-wa-btn-color', data.waBtnColor);
    _setVal('comm-wa-btn-hex', data.waBtnColor);
    _setVal('comm-sub-btn-color', data.subBtnColor);
    _setVal('comm-sub-btn-hex', data.subBtnColor);

    updateCommunityLivePreview();
  }

  window.onCommunityColorInput = function() {
    const bgStart = document.getElementById('comm-bg-start')?.value;
    const bgEnd   = document.getElementById('comm-bg-end')?.value;
    const txt     = document.getElementById('comm-text-color')?.value;
    const waBtn   = document.getElementById('comm-wa-btn-color')?.value;
    const subBtn  = document.getElementById('comm-sub-btn-color')?.value;

    if (bgStart) _setVal('comm-bg-start-hex', bgStart);
    if (bgEnd)   _setVal('comm-bg-end-hex', bgEnd);
    if (txt)     _setVal('comm-text-hex', txt);
    if (waBtn)   _setVal('comm-wa-btn-hex', waBtn);
    if (subBtn)  _setVal('comm-sub-btn-hex', subBtn);

    updateCommunityLivePreview();
  };

  window.onCommunityHexInput = function(type, hexVal) {
    const valid = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexVal);
    if (!valid) return;

    if (type === 'bgStart') _setVal('comm-bg-start', hexVal);
    if (type === 'bgEnd')   _setVal('comm-bg-end', hexVal);
    if (type === 'text')    _setVal('comm-text-color', hexVal);
    if (type === 'waBtn')   _setVal('comm-wa-btn-color', hexVal);
    if (type === 'subBtn')  _setVal('comm-sub-btn-color', hexVal);

    updateCommunityLivePreview();
  };

  window.setCommunityQuickColor = function(bgStart, bgEnd, text, waBtn, subBtn) {
    _setVal('comm-bg-start', bgStart);
    _setVal('comm-bg-start-hex', bgStart);
    _setVal('comm-bg-end', bgEnd);
    _setVal('comm-bg-end-hex', bgEnd);
    _setVal('comm-text-color', text);
    _setVal('comm-text-hex', text);
    _setVal('comm-wa-btn-color', waBtn);
    _setVal('comm-wa-btn-hex', waBtn);
    _setVal('comm-sub-btn-color', subBtn);
    _setVal('comm-sub-btn-hex', subBtn);

    updateCommunityLivePreview();
  };

  window.updateCommunityLivePreview = function() {
    const prevBox = document.getElementById('comm-preview-box');
    const titleEl = document.getElementById('comm-prev-title');
    const descEl  = document.getElementById('comm-prev-desc');
    const waBtnEl = document.getElementById('comm-prev-wa-btn');
    const subBtnEl= document.getElementById('comm-prev-sub-btn');

    if (!prevBox) return;

    const bgStart    = document.getElementById('comm-bg-start')?.value || '#064E3B';
    const bgEnd      = document.getElementById('comm-bg-end')?.value || '#022C22';
    const textColor  = document.getElementById('comm-text-color')?.value || '#FFFFFF';
    const waBtnColor = document.getElementById('comm-wa-btn-color')?.value || '#22C55E';
    const subBtnColor= document.getElementById('comm-sub-btn-color')?.value || '#EA580C';

    const titleVal   = document.getElementById('comm-title-en')?.value || DEFAULT_COMMUNITY_DATA.titleEn;
    const descVal    = document.getElementById('comm-desc-en')?.value || DEFAULT_COMMUNITY_DATA.descEn;
    const waTextVal  = document.getElementById('comm-wa-text')?.value || DEFAULT_COMMUNITY_DATA.waText;

    prevBox.style.background = `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`;
    prevBox.style.color = textColor;

    if (titleEl) {
      titleEl.textContent = titleVal;
      titleEl.style.color = textColor;
    }
    if (descEl) {
      descEl.textContent = descVal;
      descEl.style.color = textColor;
    }
    if (waBtnEl) {
      waBtnEl.textContent = waTextVal;
      waBtnEl.style.backgroundColor = waBtnColor;
      waBtnEl.style.boxShadow = `0 4px 14px ${waBtnColor}55`;
    }
    if (subBtnEl) {
      subBtnEl.style.backgroundColor = subBtnColor;
    }
  };

  window.saveCommunityCMS = function() {
    const data = {
      titleEn: document.getElementById('comm-title-en')?.value.trim() || DEFAULT_COMMUNITY_DATA.titleEn,
      titleAr: document.getElementById('comm-title-ar')?.value.trim() || DEFAULT_COMMUNITY_DATA.titleAr,
      descEn: document.getElementById('comm-desc-en')?.value.trim() || DEFAULT_COMMUNITY_DATA.descEn,
      descAr: document.getElementById('comm-desc-ar')?.value.trim() || DEFAULT_COMMUNITY_DATA.descAr,
      waText: document.getElementById('comm-wa-text')?.value.trim() || DEFAULT_COMMUNITY_DATA.waText,
      waLink: document.getElementById('comm-wa-link')?.value.trim() || DEFAULT_COMMUNITY_DATA.waLink,
      bgStart: document.getElementById('comm-bg-start')?.value || '#064E3B',
      bgEnd: document.getElementById('comm-bg-end')?.value || '#022C22',
      textColor: document.getElementById('comm-text-color')?.value || '#FFFFFF',
      waBtnColor: document.getElementById('comm-wa-btn-color')?.value || '#22C55E',
      subBtnColor: document.getElementById('comm-sub-btn-color')?.value || '#EA580C',
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('medicare_community_settings', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('medicare_community_updated'));

    logAuditAction('Updated Community & WhatsApp Section', `${data.titleEn} (${data.bgStart})`);
    showToast('🎉 Community & WhatsApp VIP section saved & published live to homepage!');
  };

  /* ==========================================================================
     TRUST & ASSURANCE BADGES CMS ENGINE
     ========================================================================== */
  const DEFAULT_TRUST_ITEMS = [
    {
      icon: '💵',
      titleEn: 'Cash on Delivery',
      titleAr: 'الدفع عند الاستلام',
      subEn: 'Pay safely upon inspection at your doorstep (الدفع عند الاستلام).',
      subAr: 'ادفع بأمان عند معاينة طلبك على باب منزلك في جميع الولايات.'
    },
    {
      icon: '🚚',
      titleEn: 'Delivery to 58 Wilayas',
      titleAr: 'التوصيل لجميع الـ 58 ولاية',
      subEn: 'Fast express shipping across all regions of Algeria (التوصيل لجميع الـ 58 ولاية).',
      subAr: 'شحن سريع ومضمون لكافة بلديات ودوائر التراب الوطني.'
    },
    {
      icon: '🔄',
      titleEn: '14-Day Easy Returns',
      titleAr: 'استرجاع واستبدال 14 يوم',
      subEn: 'Hassle-free sizing exchanges and returns policy.',
      subAr: 'إمكانية تبديل المقاسات أو استرجاع المنتج بكل سهولة وبدون تعقيد.'
    },
    {
      icon: '🛡️',
      titleEn: '100% Medical Grade',
      titleAr: 'جودة طبية معتمدة 100%',
      subEn: 'Antimicrobial & fluid-repellent certified materials.',
      subAr: 'أقمشة مضادة للميكروبات وعازلة للسوائل مطابقة للمعايير الصحية.'
    }
  ];

  const DEFAULT_TRUST_DATA = {
    enabled: true,
    bgColor: '#062E29',
    textColor: '#FFFFFF',
    items: DEFAULT_TRUST_ITEMS
  };

  let currentTrustPreviewLang = 'en';

  window.setTrustPreviewLang = function(lang) {
    currentTrustPreviewLang = lang;
    document.getElementById('btn-trust-prev-en')?.classList.toggle('active', lang === 'en');
    document.getElementById('btn-trust-prev-ar')?.classList.toggle('active', lang === 'ar');
    updateTrustLivePreview();
  };

  function normalizeTrustItem(it, fallbackIndex = 0) {
    const fb = DEFAULT_TRUST_ITEMS[fallbackIndex % DEFAULT_TRUST_ITEMS.length] || DEFAULT_TRUST_ITEMS[0];
    if (!it) return { ...fb };
    return {
      icon: it.icon || fb.icon,
      titleEn: it.titleEn || it.title || fb.titleEn,
      titleAr: it.titleAr || fb.titleAr,
      subEn: it.subEn || it.sub || it.descEn || it.desc || fb.subEn,
      subAr: it.subAr || it.descAr || fb.subAr
    };
  }

  function getSavedTrustData() {
    try {
      const raw = localStorage.getItem('medicare_trust_badges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          return {
            enabled: parsed.enabled !== false,
            bgColor: parsed.bgColor || DEFAULT_TRUST_DATA.bgColor,
            textColor: parsed.textColor || DEFAULT_TRUST_DATA.textColor,
            items: parsed.items.map((it, idx) => normalizeTrustItem(it, idx))
          };
        }
      }
    } catch (e) {}
    return {
      ...DEFAULT_TRUST_DATA,
      items: DEFAULT_TRUST_ITEMS.map(it => ({ ...it }))
    };
  }

  function renderTrustBadgeRows(items) {
    const container = document.getElementById('adm-trust-items-container');
    if (!container) return;

    const list = (items && items.length > 0)
      ? items.map((it, idx) => normalizeTrustItem(it, idx))
      : DEFAULT_TRUST_ITEMS.map(it => ({ ...it }));

    container.innerHTML = '';
    list.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'adm-trust-row';
      row.style.cssText = 'background:var(--adm-card-bg, #ffffff); border:1px solid var(--adm-border); border-radius:10px; padding:1.25rem; box-shadow:var(--adm-shadow-sm);';
      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; border-bottom:1px solid var(--adm-border); padding-bottom:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-weight:800; font-size:13px; color:var(--adm-foreground);">Badge #${index + 1}</span>
            <span class="adm-trust-icon-badge" style="font-size:18px;">${item.icon || '🛡️'}</span>
          </div>
          ${list.length > 1 ? `
            <button type="button" class="mc-btn mc-btn-ghost mc-btn-sm" style="color:#EF4444; padding:0.2rem 0.5rem; font-size:12px;" onclick="deleteTrustBadgeRow(${index})">
              🗑️ Remove (حذف)
            </button>
          ` : ''}
        </div>

        <div style="display:grid; grid-template-columns:80px 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem;">
          <div class="chk-form-group">
            <label class="chk-label">Icon:</label>
            <input type="text" class="chk-input adm-trust-icon" value="${_trustEsc(item.icon || '🛡️')}" oninput="updateTrustLivePreview()" style="text-align:center; font-size:18px;" maxlength="4">
          </div>
          <div class="chk-form-group">
            <label class="chk-label">Title (English):</label>
            <input type="text" class="chk-input adm-trust-title-en" value="${_trustEsc(item.titleEn || '')}" oninput="updateTrustLivePreview()" placeholder="e.g. Cash on Delivery">
          </div>
          <div class="chk-form-group">
            <label class="chk-label">العنوان (العربية):</label>
            <input type="text" class="chk-input adm-trust-title-ar" value="${_trustEsc(item.titleAr || '')}" oninput="updateTrustLivePreview()" placeholder="مثال: الدفع عند الاستلام" dir="rtl">
          </div>
        </div>

        <div class="chk-form-grid two-col">
          <div class="chk-form-group">
            <label class="chk-label">Description / Subtitle (English):</label>
            <input type="text" class="chk-input adm-trust-sub-en" value="${_trustEsc(item.subEn || '')}" oninput="updateTrustLivePreview()" placeholder="e.g. Pay safely upon inspection at your doorstep.">
          </div>
          <div class="chk-form-group">
            <label class="chk-label">الوصف / النص الإضافي (العربية):</label>
            <input type="text" class="chk-input adm-trust-sub-ar" value="${_trustEsc(item.subAr || '')}" oninput="updateTrustLivePreview()" placeholder="مثال: ادفع بأمان عند معاينة طلبك على باب منزلك." dir="rtl">
          </div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  window.addTrustBadgeRow = function() {
    const items = getCurrentTrustItemsFromUI();
    items.push({
      icon: '✨',
      titleEn: 'New Guarantee',
      titleAr: 'ميزة أو ضمان جديد',
      subEn: 'Description of your guaranteed service or customer perk.',
      subAr: 'وصف الخدمة المميزة أو الضمان المقدم لعملائك.'
    });
    renderTrustBadgeRows(items);
    updateTrustLivePreview();
  };

  window.deleteTrustBadgeRow = function(idx) {
    const items = getCurrentTrustItemsFromUI();
    items.splice(idx, 1);
    renderTrustBadgeRows(items);
    updateTrustLivePreview();
  };

  window.resetTrustBadgesToDefault = function() {
    if (!confirm('Are you sure you want to reset all Trust Badges to default MEDICARE settings?')) return;
    initTrustBadgesCMS(DEFAULT_TRUST_DATA);
    showToast('🔄 Trust Badges reset to defaults (click Save to publish)');
  };

  function getCurrentTrustItemsFromUI() {
    const container = document.getElementById('adm-trust-items-container');
    const rows = container ? container.querySelectorAll('.adm-trust-row') : [];
    const items = [];
    rows.forEach((row, idx) => {
      const fb = DEFAULT_TRUST_ITEMS[idx % DEFAULT_TRUST_ITEMS.length] || DEFAULT_TRUST_ITEMS[0];
      const icon = row.querySelector('.adm-trust-icon')?.value.trim() || fb.icon;
      const titleEn = row.querySelector('.adm-trust-title-en')?.value.trim() || fb.titleEn;
      const titleAr = row.querySelector('.adm-trust-title-ar')?.value.trim() || fb.titleAr;
      const subEn = row.querySelector('.adm-trust-sub-en')?.value.trim() || fb.subEn;
      const subAr = row.querySelector('.adm-trust-sub-ar')?.value.trim() || fb.subAr;

      items.push({ icon, titleEn, titleAr, subEn, subAr });
    });
    return items.length > 0 ? items : DEFAULT_TRUST_ITEMS.map(it => ({ ...it }));
  }

  window.updateTrustLivePreview = function() {
    const previewBar = document.getElementById('adm-trust-preview-bar');
    const previewGrid = document.getElementById('adm-trust-preview-grid');
    if (!previewBar || !previewGrid) return;

    const enabled = document.getElementById('adm-trust-enabled')?.checked ?? true;
    const bgColor = document.getElementById('adm-trust-bg-color')?.value || '#062E29';
    const textColor = document.getElementById('adm-trust-text-color')?.value || '#FFFFFF';

    previewBar.style.backgroundColor = bgColor;
    previewBar.style.opacity = enabled ? '1' : '0.4';

    const items = getCurrentTrustItemsFromUI();
    const isAr = currentTrustPreviewLang === 'ar';

    previewGrid.innerHTML = items.map(it => {
      const title = isAr ? (it.titleAr || it.titleEn) : (it.titleEn || it.titleAr);
      const sub = isAr ? (it.subAr || it.subEn) : (it.subEn || it.subAr);
      return `
        <div style="display:flex; align-items:flex-start; gap:0.75rem; direction:${isAr ? 'rtl' : 'ltr'}; text-align:${isAr ? 'right' : 'left'};">
          <div style="width:38px; height:38px; border-radius:50%; background:rgba(20, 184, 166, 0.25); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
            ${it.icon || '🛡️'}
          </div>
          <div>
            <div style="font-weight:700; font-size:13px; color:${textColor}; margin-bottom:2px; font-family:'Plus Jakarta Sans', system-ui, sans-serif;">
              ${title || 'Title'}
            </div>
            <div style="font-size:11px; color:#A7F3D0; line-height:1.35; opacity:0.9;">
              ${sub || 'Description'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  window.onTrustColorChange = function() {
    _trustSetVal('adm-trust-bg-hex', _trustGetVal('adm-trust-bg-color'));
    _trustSetVal('adm-trust-text-hex', _trustGetVal('adm-trust-text-color'));
    updateTrustLivePreview();
  };

  window.onTrustHexChange = function(type, hex) {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      if (type === 'bg') _trustSetVal('adm-trust-bg-color', hex);
      if (type === 'text') _trustSetVal('adm-trust-text-color', hex);
      updateTrustLivePreview();
    }
  };

  window.setTrustQuickColor = function(type, hex) {
    if (type === 'bg') {
      _trustSetVal('adm-trust-bg-color', hex);
      _trustSetVal('adm-trust-bg-hex', hex);
    } else if (type === 'text') {
      _trustSetVal('adm-trust-text-color', hex);
      _trustSetVal('adm-trust-text-hex', hex);
    }
    updateTrustLivePreview();
  };

  window.saveTrustBadgesSettings = function() {
    const enabled = document.getElementById('adm-trust-enabled')?.checked ?? true;
    const bgColor = document.getElementById('adm-trust-bg-color')?.value || '#062E29';
    const textColor = document.getElementById('adm-trust-text-color')?.value || '#FFFFFF';
    const items = getCurrentTrustItemsFromUI();

    const payload = {
      enabled,
      bgColor,
      textColor,
      items,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('medicare_trust_badges', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('medicare_trust_badges_updated'));

    logAuditAction('Updated Trust Badges Bar', `${items.length} badges • ${enabled ? 'Active' : 'Disabled'} • ${bgColor}`);
    showToast('🎉 Trust Badges saved & published live across storefront!');
  };

  function _trustSetVal(id, val) {
    const el = document.getElementById(id);
    if (el && val != null) el.value = val;
  }

  function _trustGetVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function _trustEsc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function initTrustBadgesCMS(customData) {
    const data = customData || getSavedTrustData();

    const enabledCheck = document.getElementById('adm-trust-enabled');
    if (enabledCheck) enabledCheck.checked = data.enabled !== false;

    _trustSetVal('adm-trust-bg-color', data.bgColor || '#062E29');
    _trustSetVal('adm-trust-bg-hex', data.bgColor || '#062E29');
    _trustSetVal('adm-trust-text-color', data.textColor || '#FFFFFF');
    _trustSetVal('adm-trust-text-hex', data.textColor || '#FFFFFF');

    renderTrustBadgeRows(data.items || DEFAULT_TRUST_ITEMS);
    updateTrustLivePreview();
  }
  window.initTrustBadgesCMS = initTrustBadgesCMS;

  /* ------------------------------------------------------------------
     12. INVENTORY BULK STOCK MANAGEMENT
     ------------------------------------------------------------------ */
  function renderBulkStockTable() {
    const tbody = document.getElementById('inventory-bulk-tbody');
    if (!tbody) return;

    const list = getCombinedProductsList();
    const stockOverrides = getStockOverrides();

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:2rem; color:#64748B;">No products found in catalog.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(p => {
      const v = stockOverrides[p.id] || {};
      const baseStock = Number(p.stock) || 20;

      const xs = v.xs !== undefined ? Number(v.xs) : Math.max(0, Math.floor(baseStock * 0.1));
      const s  = v.s  !== undefined ? Number(v.s)  : Math.max(0, Math.floor(baseStock * 0.25));
      const m  = v.m  !== undefined ? Number(v.m)  : Math.max(0, Math.floor(baseStock * 0.35));
      const l  = v.l  !== undefined ? Number(v.l)  : Math.max(0, Math.floor(baseStock * 0.2));
      const xl = v.xl !== undefined ? Number(v.xl) : Math.max(0, baseStock - (xs + s + m + l));
      const total = xs + s + m + l + xl;

      let badgeClass = 'adm-badge-success';
      let badgeText = 'Optimal';
      if (total <= 0) {
        badgeClass = 'adm-badge-error';
        badgeText = 'Out of Stock';
      } else if (total < 10) {
        badgeClass = 'adm-badge-warning';
        badgeText = 'Low Stock';
      }

      return `
        <tr data-product-id="${p.id}">
          <td><strong>${p.name}</strong><br><code style="font-size:11px; color:#64748B;">${p.sku || p.id}</code></td>
          <td><span style="color:#475569; font-size:13px;">Standard / Colorways</span></td>
          <td><input type="number" class="chk-input stock-variant-input" data-size="xs" style="width:55px; height:32px; text-align:center;" min="0" value="${xs}" oninput="updateRowStockTotal(this)"></td>
          <td><input type="number" class="chk-input stock-variant-input" data-size="s"  style="width:55px; height:32px; text-align:center;" min="0" value="${s}"  oninput="updateRowStockTotal(this)"></td>
          <td><input type="number" class="chk-input stock-variant-input" data-size="m"  style="width:55px; height:32px; text-align:center;" min="0" value="${m}"  oninput="updateRowStockTotal(this)"></td>
          <td><input type="number" class="chk-input stock-variant-input" data-size="l"  style="width:55px; height:32px; text-align:center;" min="0" value="${l}"  oninput="updateRowStockTotal(this)"></td>
          <td><input type="number" class="chk-input stock-variant-input" data-size="xl" style="width:55px; height:32px; text-align:center;" min="0" value="${xl}" oninput="updateRowStockTotal(this)"></td>
          <td><strong class="row-total-stock" style="color:#0E4D45; font-size:14px;">${total}</strong></td>
          <td><span class="adm-badge ${badgeClass} row-alert-badge">${badgeText}</span></td>
        </tr>
      `;
    }).join('');
  }

  window.updateRowStockTotal = function(inputEl) {
    const row = inputEl.closest('tr');
    if (!row) return;
    const inputs = row.querySelectorAll('input.stock-variant-input');
    let sum = 0;
    inputs.forEach(inp => {
      const val = parseInt(inp.value, 10);
      sum += isNaN(val) || val < 0 ? 0 : val;
    });
    const totalEl = row.querySelector('.row-total-stock');
    if (totalEl) totalEl.textContent = sum;
    const badgeEl = row.querySelector('.row-alert-badge');
    if (badgeEl) {
      if (sum <= 0) {
        badgeEl.className = 'adm-badge adm-badge-error row-alert-badge';
        badgeEl.textContent = 'Out of Stock';
      } else if (sum < 10) {
        badgeEl.className = 'adm-badge adm-badge-warning row-alert-badge';
        badgeEl.textContent = 'Low Stock';
      } else {
        badgeEl.className = 'adm-badge adm-badge-success row-alert-badge';
        badgeEl.textContent = 'Optimal';
      }
    }
  };

  window.saveBulkStock = async function() {
    const tbody = document.getElementById('inventory-bulk-tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr[data-product-id]');
    const stockOverrides = getStockOverrides();
    let hasNegative = false;

    rows.forEach(r => {
      const prodId = r.getAttribute('data-product-id');
      const xs = parseInt(r.querySelector('[data-size="xs"]')?.value, 10);
      const s  = parseInt(r.querySelector('[data-size="s"]')?.value, 10);
      const m  = parseInt(r.querySelector('[data-size="m"]')?.value, 10);
      const l  = parseInt(r.querySelector('[data-size="l"]')?.value, 10);
      const xl = parseInt(r.querySelector('[data-size="xl"]')?.value, 10);

      if (isNaN(xs) || xs < 0 || isNaN(s) || s < 0 || isNaN(m) || m < 0 || isNaN(l) || l < 0 || isNaN(xl) || xl < 0) {
        hasNegative = true;
        return;
      }

      const total = xs + s + m + l + xl;
      stockOverrides[prodId] = { xs, s, m, l, xl, total };

      // Update in-memory collections
      const prod = allAdminProducts.find(p => p.id === prodId);
      if (prod) prod.stock = total;
      if (typeof window !== 'undefined' && window.PRODUCT_CATALOG) {
        const catProd = window.PRODUCT_CATALOG.find(p => p.id === prodId);
        if (catProd) catProd.stock = total;
      }
      if (typeof window !== 'undefined' && window.PRODUCT_CATALOG_MAP && window.PRODUCT_CATALOG_MAP[prodId]) {
        window.PRODUCT_CATALOG_MAP[prodId].stock = total;
      }

      // Sync with Supabase & Log adjustments
      if (window.MedicareDB && typeof window.MedicareDB.updateStock === 'function') {
        window.MedicareDB.updateStock(prodId, total, {
          logMovement: true,
          type: 'ADJUST',
          qty: total,
          stockBefore: baseStock,
          productName: prod ? prod.name : prodId,
          reason: 'Bulk Stock Matrix Update',
          staff: currentUser.name || 'Store Admin'
        }).catch(e => console.warn(e));
      }
    });

    if (hasNegative) {
      showToast('❌ Stock values cannot be negative or empty');
      return;
    }

    localStorage.setItem('medicare_stock_overrides', JSON.stringify(stockOverrides));
    window.dispatchEvent(new CustomEvent('medicare_stock_updated'));

    renderProductsTable();
    renderBulkStockTable();
    renderWarehouseLogsTable();
    initWarehouseReturnModule();
    logAuditAction('Updated Bulk Stock Levels', `Saved variant stock changes for ${rows.length} catalog items`);
    showToast('✓ Bulk Stock Changes Saved Successfully!');
  };

  /* ------------------------------------------------------------------
     12.5. RETURN TO WAREHOUSE & STOCK OPERATIONS AUDIT ENGINE
     ------------------------------------------------------------------ */
  function initWarehouseReturnModule() {
    const select = document.getElementById('ret-product-select');
    if (!select) return;

    const currentSelected = select.value;
    const products = getCombinedProductsList();

    select.innerHTML = '<option value="">-- Choose Product (اختر المنتج) --</option>' +
      products.map(p => `
        <option value="${p.id}" ${p.id === currentSelected ? 'selected' : ''}>
          ${p.name} [SKU: ${p.sku || p.id}] (Current Stock: ${p.stock ?? 0})
        </option>
      `).join('');

    calculateReturnSummary();
  }

  window.onReturnProductSelectChange = function(prodId) {
    calculateReturnSummary();
  };

  window.calculateReturnSummary = function() {
    const prodId = document.getElementById('ret-product-select')?.value;
    const qtyInput = document.getElementById('ret-qty-input');
    const returnQty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);

    const nameEl = document.getElementById('ret-calc-prod-name');
    const beforeEl = document.getElementById('ret-calc-before');
    const qtyEl = document.getElementById('ret-calc-qty');
    const afterEl = document.getElementById('ret-calc-after');

    if (!prodId) {
      if (nameEl) nameEl.textContent = 'Please select a product above';
      if (beforeEl) beforeEl.textContent = '0 units';
      if (qtyEl) qtyEl.textContent = `+${returnQty}`;
      if (afterEl) afterEl.textContent = `${returnQty} units`;
      return;
    }

    const products = getCombinedProductsList();
    const prod = products.find(p => p.id === prodId);
    const stockBefore = Number(prod ? prod.stock : 0) || 0;
    const stockAfter = stockBefore + returnQty;

    if (nameEl) nameEl.textContent = prod ? `${prod.name} (${prod.sku || prod.id})` : prodId;
    if (beforeEl) beforeEl.textContent = `${stockBefore} units`;
    if (qtyEl) qtyEl.textContent = `+${returnQty}`;
    if (afterEl) afterEl.textContent = `${stockAfter} units`;
  };

  window.handleWarehouseReturnSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const prodId = document.getElementById('ret-product-select')?.value;
    const qtyInput = document.getElementById('ret-qty-input');
    const reasonSelect = document.getElementById('ret-reason-select');
    const noteInput = document.getElementById('ret-note-input');

    if (!prodId) {
      showToast('❌ Please select a product to return');
      return;
    }

    const returnQty = Math.max(1, parseInt(qtyInput?.value, 10) || 1);
    const reason = reasonSelect?.value || 'Customer Return';
    const note = noteInput?.value.trim() || 'Warehouse Restock Return';

    const products = getCombinedProductsList();
    const prod = products.find(p => p.id === prodId);
    const stockBefore = Number(prod ? prod.stock : 0) || 0;
    const stockAfter = stockBefore + returnQty;

    // Update via MedicareDB
    if (window.MedicareDB && typeof window.MedicareDB.updateStock === 'function') {
      await window.MedicareDB.updateStock(prodId, stockAfter, {
        logMovement: true,
        type: 'RETURN',
        qty: returnQty,
        stockBefore: stockBefore,
        productName: prod ? prod.name : prodId,
        reason: `${reason}${note ? ' — ' + note : ''}`,
        staff: currentUser.name || 'Store Manager',
        orderNumber: note.includes('MC-') ? note : null
      });
    }

    logAuditAction('Processed Warehouse Return', `+${returnQty} units of ${prod ? prod.name : prodId} returned to warehouse (${reason})`);
    showToast(`🎉 Success: +${returnQty} units returned to warehouse! Stock updated: ${stockBefore} → ${stockAfter}`);

    // Reset Form & Re-render
    if (qtyInput) qtyInput.value = '1';
    if (noteInput) noteInput.value = '';
    renderProductsTable();
    renderBulkStockTable();
    initWarehouseReturnModule();
    renderWarehouseLogsTable();
    updateDashboardKPIs();
  };

  let allWarehouseLogs = [];

  function renderWarehouseLogsTable(list = null) {
    const tbody = document.getElementById('warehouse-logs-tbody');
    if (!tbody) return;

    if (!list) {
      allWarehouseLogs = window.MedicareDB && typeof window.MedicareDB.getStockLogs === 'function'
        ? window.MedicareDB.getStockLogs()
        : JSON.parse(localStorage.getItem('medicare_stock_logs') || '[]');
    }

    const data = list || allWarehouseLogs;

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2.5rem; color:#64748B;">No warehouse stock operations recorded yet. Orders and returns will be logged here.</td></tr>';
      return;
    }

    const typeBadges = {
      'RETURN': '<span class="adm-badge adm-badge-warning" style="font-weight:700;">🔄 RETURN (إرجاع)</span>',
      'OUT':    '<span class="adm-badge adm-badge-info" style="font-weight:700;">📤 OUT (بيع طلبية)</span>',
      'IN':     '<span class="adm-badge adm-badge-success" style="font-weight:700;">📥 IN (توريد)</span>',
      'ADJUST': '<span class="adm-badge adm-badge-neutral" style="font-weight:700;">⚙️ ADJUST (تعديل)</span>'
    };

    tbody.innerHTML = data.map(log => {
      const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const badge = typeBadges[log.type] || `<span class="adm-badge adm-badge-neutral">${log.type}</span>`;
      const changePrefix = log.type === 'OUT' ? '-' : '+';
      const changeColor = log.type === 'OUT' ? '#DC2626' : '#16A34A';

      return `
        <tr>
          <td style="font-size:12px; color:#64748B;">${dateStr}</td>
          <td><strong>${log.productName || log.productId}</strong></td>
          <td>${badge}</td>
          <td><strong style="color:${changeColor}; font-size:13px;">${changePrefix}${log.qty}</strong></td>
          <td style="font-size:12.5px;"><code>${log.stockBefore}</code> → <strong style="color:var(--adm-primary);">${log.stockAfter}</strong></td>
          <td style="font-size:12px;">${log.reason || 'General Adjustment'} ${log.orderNumber ? `<br><code style="font-size:11px;">#${log.orderNumber}</code>` : ''}</td>
          <td style="font-size:12px; color:#64748B;">${log.staff || 'System'}</td>
        </tr>
      `;
    }).join('');
  }

  window.filterWarehouseLogs = function(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderWarehouseLogsTable(allWarehouseLogs);
      return;
    }
    const filtered = allWarehouseLogs.filter(l =>
      (l.productName || '').toLowerCase().includes(q) ||
      (l.productId || '').toLowerCase().includes(q) ||
      (l.reason || '').toLowerCase().includes(q) ||
      (l.staff || '').toLowerCase().includes(q) ||
      (l.orderNumber || '').toLowerCase().includes(q) ||
      (l.type || '').toLowerCase().includes(q)
    );
    renderWarehouseLogsTable(filtered);
  };

  /* ------------------------------------------------------------------
     13. CUSTOMER REVIEWS MODERATION & ADMIN REPLIES
     ------------------------------------------------------------------ */
  window.renderAdminReviews = async function() {
    const tbody = document.getElementById('admin-reviews-table-body');
    if (!tbody) return;

    let reviews = [];
    if (window.MedicareDB && typeof window.MedicareDB.getReviews === 'function') {
      try {
        const dbReviews = await window.MedicareDB.getReviews();
        if (Array.isArray(dbReviews) && dbReviews.length > 0) reviews = dbReviews;
      } catch (e) {
        console.warn('[Admin] Could not load reviews from DB:', e);
      }
    }

    if (reviews.length === 0) {
      const local = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      if (local.length > 0) {
        reviews = local;
      }
    }

    window._allAdminReviews = reviews;

    if (reviews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:3rem; color:#64748B;">No customer reviews submitted yet.</td></tr>';
      return;
    }

    tbody.innerHTML = reviews.map(r => {
      const ratingVal = Number(r.rating) || 5;
      const stars = '★'.repeat(ratingVal) + '☆'.repeat(Math.max(0, 5 - ratingVal));
      const hasReply = Boolean(r.admin_reply && r.admin_reply.trim());
      return `
        <tr data-review-id="${r.id}">
          <td>
            <strong>${r.customer_name || 'Anonymous'}</strong><br>
            <span style="font-size:11.5px; color:#64748B;">${r.specialty_tag || 'Verified Buyer'}</span>
            ${r.product_id ? `<br><code style="font-size:10.5px; color:#0E4D45;">${r.product_id}</code>` : ''}
          </td>
          <td>
            <span style="color:#F59E0B; font-weight:700;">${stars}</span>
            <span style="font-size:12px; color:#64748B; margin-left:4px;">${ratingVal}.0</span>
          </td>
          <td style="max-width:320px;">
            <div style="font-size:13px; color:#1E293B;">${r.comment || ''}</div>
            ${hasReply ? `
              <div style="margin-top:6px; font-size:11.5px; color:#064E3B; background:#ECFDF5; padding:4px 8px; border-radius:4px; border-left:3px solid #059669; line-height:1.4;">
                <strong>🏥 Admin Reply:</strong> ${r.admin_reply}
              </div>
            ` : ''}
          </td>
          <td>
            <span class="adm-badge ${r.is_approved !== false ? 'adm-badge-success' : 'adm-badge-warning'}">
              ${r.is_approved !== false ? 'Approved' : 'Pending'}
            </span>
          </td>
          <td>
            <button class="mc-btn ${hasReply ? 'mc-btn-ghost' : 'mc-btn-secondary'} mc-btn-sm" onclick="openReviewReplyModal('${r.id}')">
              ${hasReply ? '✏️ Edit Reply' : '💬 Reply'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.openReviewReplyModal = function(reviewId) {
    const reviews = window._allAdminReviews || JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
    const review = reviews.find(r => r.id === reviewId);
    if (!review) {
      showToast('❌ Review not found');
      return;
    }

    const modal = document.getElementById('modal-review-reply');
    if (!modal) return;

    const idInp = document.getElementById('reply-review-id');
    const nameEl = document.getElementById('reply-customer-name');
    const starsEl = document.getElementById('reply-rating-stars');
    const commEl = document.getElementById('reply-review-comment');
    const textInp = document.getElementById('reply-text');

    if (idInp) idInp.value = review.id;
    if (nameEl) nameEl.textContent = `${review.customer_name || 'Customer'} (${review.specialty_tag || 'Verified Buyer'})`;
    if (starsEl) {
      const val = Number(review.rating) || 5;
      starsEl.textContent = '★'.repeat(val) + '☆'.repeat(Math.max(0, 5 - val));
    }
    if (commEl) commEl.textContent = `"${review.comment || ''}"`;
    if (textInp) textInp.value = review.admin_reply || '';

    modal.classList.add('open');
  };

  window.closeReviewReplyModal = function() {
    const modal = document.getElementById('modal-review-reply');
    if (modal) modal.classList.remove('open');
  };

  window.submitReviewReply = async function(e) {
    if (e) e.preventDefault();

    const idInp = document.getElementById('reply-review-id');
    const textInp = document.getElementById('reply-text');
    const reviewId = idInp ? idInp.value : '';
    const replyText = textInp ? textInp.value.trim() : '';

    if (!replyText) {
      showToast('❌ Reply text cannot be empty');
      return;
    }

    // Save to localStorage
    const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
    const review = localReviews.find(r => r.id === reviewId);
    if (review) {
      review.admin_reply = replyText;
      review.admin_reply_at = new Date().toISOString();
    } else {
      localReviews.push({
        id: reviewId,
        admin_reply: replyText,
        admin_reply_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    localStorage.setItem('medicare_reviews_db', JSON.stringify(localReviews));

    // Save to Supabase if live
    if (window.MedicareDB && window.MedicareDB.isLive && window.supabase) {
      try {
        await window.supabase.from('reviews').update({
          admin_reply: replyText,
          admin_reply_at: new Date().toISOString()
        }).eq('id', reviewId);
      } catch (err) {
        console.warn('[Admin] Supabase review reply update exception:', err);
      }
    }

    closeReviewReplyModal();
    renderAdminReviews();
    logAuditAction('Replied to Customer Review', `Review ${reviewId}: "${replyText.substring(0, 40)}..."`);
    showToast('✓ Admin reply published!');
  };

  /* ------------------------------------------------------------------
     14. 58 WILAYAS & COURIER DELIVERY FEES MATRIX
     ------------------------------------------------------------------ */
  const DEFAULT_DELIVERY_FEES = {
    capital: { home: 400, stopdesk: 250 },
    north: { home: 600, stopdesk: 350 },
    south: { home: 900, stopdesk: 500 }
  };

  window.loadDeliveryFees = function() {
    let fees = DEFAULT_DELIVERY_FEES;
    try {
      const raw = localStorage.getItem('medicare_delivery_fees');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.capital && parsed.north && parsed.south) fees = parsed;
      }
    } catch (e) {
      console.warn('[Admin] Error loading delivery fees:', e);
    }

    const capHome = document.getElementById('fee-capital-home');
    const capStop = document.getElementById('fee-capital-stopdesk');
    const northHome = document.getElementById('fee-north-home');
    const northStop = document.getElementById('fee-north-stopdesk');
    const southHome = document.getElementById('fee-south-home');
    const southStop = document.getElementById('fee-south-stopdesk');

    if (capHome) capHome.value = fees.capital.home;
    if (capStop) capStop.value = fees.capital.stopdesk;
    if (northHome) northHome.value = fees.north.home;
    if (northStop) northStop.value = fees.north.stopdesk;
    if (southHome) southHome.value = fees.south.home;
    if (southStop) southStop.value = fees.south.stopdesk;
  };

  window.saveDeliveryFees = function() {
    const capHome = parseFloat(document.getElementById('fee-capital-home')?.value);
    const capStop = parseFloat(document.getElementById('fee-capital-stopdesk')?.value);
    const northHome = parseFloat(document.getElementById('fee-north-home')?.value);
    const northStop = parseFloat(document.getElementById('fee-north-stopdesk')?.value);
    const southHome = parseFloat(document.getElementById('fee-south-home')?.value);
    const southStop = parseFloat(document.getElementById('fee-south-stopdesk')?.value);

    if (isNaN(capHome) || capHome < 0 || isNaN(capStop) || capStop < 0 ||
        isNaN(northHome) || northHome < 0 || isNaN(northStop) || northStop < 0 ||
        isNaN(southHome) || southHome < 0 || isNaN(southStop) || southStop < 0) {
      showToast('❌ Delivery fees cannot be negative or empty');
      return;
    }

    const fees = {
      capital: { home: capHome, stopdesk: capStop },
      north: { home: northHome, stopdesk: northStop },
      south: { home: southHome, stopdesk: southStop }
    };

    localStorage.setItem('medicare_delivery_fees', JSON.stringify(fees));
    window.dispatchEvent(new CustomEvent('medicare_delivery_fees_updated'));

    logAuditAction('Updated Delivery Fee Matrix', `Capital (${capHome}/${capStop} DZD), North (${northHome}/${northStop} DZD), South (${southHome}/${southStop} DZD)`);
    showToast('✓ Delivery Fees Saved!');
  };

  /* ==========================================================================
     15. FREQUENTLY BOUGHT TOGETHER BUNDLES & OFFERS ENGINE
     ========================================================================== */
  const DEFAULT_BUNDLES = [];

  function getStoredBundles() {
    try {
      const raw = localStorage.getItem('medicare_bundles');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredBundles(bundles) {
    localStorage.setItem('medicare_bundles', JSON.stringify(bundles));
    window.dispatchEvent(new CustomEvent('medicare_bundles_updated', { detail: bundles }));
  }

  function getAllCatalogProducts() {
    if (window.PRODUCT_CATALOG && Array.isArray(window.PRODUCT_CATALOG) && window.PRODUCT_CATALOG.length > 0) {
      return window.PRODUCT_CATALOG;
    }
    if (window.PRODUCT_CATALOG_MAP) {
      return Object.values(window.PRODUCT_CATALOG_MAP);
    }
    return [];
  }

  function getProductFromCatalog(id) {
    if (window.getProductById && typeof window.getProductById === 'function') {
      const p = window.getProductById(id);
      if (p) return p;
    }
    if (window.PRODUCT_CATALOG_MAP && window.PRODUCT_CATALOG_MAP[id]) {
      return window.PRODUCT_CATALOG_MAP[id];
    }
    const all = getAllCatalogProducts();
    return all.find(p => p.id === id) || null;
  }

  window.renderBundlesTable = function() {
    const tbody = document.getElementById('admin-bundles-table-body');
    if (!tbody) return;

    const bundles = getStoredBundles();
    if (bundles.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:3rem; color:var(--adm-muted-fg);">No bundles created yet. Click "+ Create Bundle" to make one.</td></tr>`;
      return;
    }

    tbody.innerHTML = bundles.map(b => {
      const anchor = getProductFromCatalog(b.anchorProductId);
      const anchorName = anchor ? (anchor.nameAr || anchor.name) : b.anchorProductId;
      const anchorImg = anchor && Array.isArray(anchor.images) && anchor.images[0] ? anchor.images[0] : (anchor?.img || 'assets/medicare_scrubs_hero_1786614154492.png');

      const items = (b.productIds || []).map(id => getProductFromCatalog(id)).filter(Boolean);
      const totalValue = items.reduce((sum, p) => sum + Number(p.price || 0), 0);
      const price = Number(b.bundlePrice || 0);
      const savings = Math.max(0, totalValue - price);
      const savingsPct = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

      const itemsThumbs = items.map(it => {
        const itImg = Array.isArray(it.images) && it.images[0] ? it.images[0] : (it.img || 'assets/medicare_scrubs_hero_1786614154492.png');
        return `
          <span title="${it.name} (${Number(it.price || 0).toLocaleString()} DZD)" style="display:inline-flex; align-items:center; gap:4px; background:var(--adm-card-bg); border:1px solid var(--adm-border); padding:2px 6px; border-radius:6px; font-size:11.5px;">
            <img src="${itImg}" alt="${it.name}" style="width:20px; height:20px; border-radius:4px; object-fit:cover;">
            <span style="max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${it.name}</span>
          </span>
        `;
      }).join('');

      return `
        <tr>
          <td>
            <strong>${b.name}</strong><br>
            <code style="font-size:11px;">${b.id}</code>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <img src="${anchorImg}" alt="${anchorName}" style="width:34px; height:34px; border-radius:6px; object-fit:cover; border:1px solid var(--adm-border);">
              <div>
                <strong style="font-size:12.5px; color:var(--adm-foreground);">${anchorName}</strong><br>
                <code style="font-size:10.5px;">${b.anchorProductId}</code>
              </div>
            </div>
          </td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:320px;">
              ${itemsThumbs || '<span style="color:var(--adm-muted-fg); font-size:11px;">No items</span>'}
            </div>
          </td>
          <td>
            <span style="font-family:monospace; font-size:13px; color:var(--adm-muted-fg); text-decoration:line-through;">
              ${totalValue.toLocaleString()} DZD
            </span>
          </td>
          <td>
            <strong style="font-size:14px; color:var(--color-primary-600);">
              ${price.toLocaleString()} DZD
            </strong>
          </td>
          <td>
            <span class="adm-badge adm-badge-success" style="font-weight:700;">
              -${savings.toLocaleString()} DZD (${savingsPct}%)
            </span>
          </td>
          <td>
            <button type="button" class="adm-badge ${b.active ? 'adm-badge-success' : 'adm-badge-warning'}" 
                    style="border:none; cursor:pointer;" 
                    onclick="toggleBundleStatus('${b.id}')"
                    title="Click to toggle status">
              ${b.active ? '● Active' : '○ Inactive'}
            </button>
          </td>
          <td>
            <div style="display:flex; gap:0.35rem;">
              <button class="adm-btn-icon" onclick="openBundleModal('${b.id}')" title="Edit Bundle">✏️</button>
              <button class="adm-btn-icon" onclick="deleteBundle('${b.id}')" title="Delete Bundle" style="color:#EF4444;">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.toggleBundleStatus = function(bundleId) {
    const bundles = getStoredBundles();
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return;

    bundle.active = !bundle.active;
    saveStoredBundles(bundles);
    renderBundlesTable();
    logAuditAction('Toggled Bundle Status', `Bundle "${bundle.name}" (${bundle.id}) → ${bundle.active ? 'Active' : 'Inactive'}`);
    showToast(`✓ Bundle "${bundle.name}" is now ${bundle.active ? 'Active' : 'Inactive'}`);
  };

  window.deleteBundle = function(bundleId) {
    if (!confirm('Are you sure you want to delete this bundle?')) return;
    let bundles = getStoredBundles();
    const bundle = bundles.find(b => b.id === bundleId);
    bundles = bundles.filter(b => b.id !== bundleId);
    saveStoredBundles(bundles);
    renderBundlesTable();
    logAuditAction('Deleted Bundle', `Bundle "${bundle?.name || bundleId}" removed`);
    showToast('✓ Bundle deleted successfully');
  };

  window.openBundleModal = async function(bundleId = null) {
    const modal = document.getElementById('modal-bundle');
    if (!modal) return;

    // Refresh products if not yet loaded
    if (allAdminProducts.length === 0 && window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        await loadAdminProducts();
      } catch(e) {}
    }

    const allProducts = getAllCatalogProducts();
    const anchorSelect = document.getElementById('b-anchor-product');
    const productsList = document.getElementById('b-products-selection-list');
    const titleEl = document.getElementById('modal-bundle-title');
    const saveBtn = modal.querySelector('button[type="submit"]');

    // Populate anchor select
    if (anchorSelect) {
      if (allProducts.length === 0) {
        anchorSelect.innerHTML = `<option value="" disabled selected>⚠️ لا توجد منتجات مسجلة في المتجر — أضف منتجاً أولاً</option>`;
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.style.opacity = '0.5';
          saveBtn.style.cursor = 'not-allowed';
          saveBtn.title = 'أضف منتجات إلى المتجر أولاً لتفعيل حفظ الحزم';
        }
      } else {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.style.cursor = 'pointer';
          saveBtn.title = '';
        }
        anchorSelect.innerHTML = allProducts.map(p => `
          <option value="${p.id}">${p.id} — ${p.nameAr || p.name_ar || p.name} (${Number(p.price || 0).toLocaleString()} DZD)</option>
        `).join('');
      }
    }

    let editingBundle = null;
    if (bundleId) {
      const bundles = getStoredBundles();
      editingBundle = bundles.find(b => b.id === bundleId);
    }

    document.getElementById('b-id').value = editingBundle ? editingBundle.id : '';
    document.getElementById('b-name').value = editingBundle ? editingBundle.name : 'Complete The Clinical Look';
    document.getElementById('b-price').value = editingBundle ? editingBundle.bundlePrice : '';
    document.getElementById('b-active').checked = editingBundle ? editingBundle.active !== false : true;

    if (titleEl) {
      titleEl.textContent = editingBundle ? `✏️ Edit Bundle: ${editingBundle.name}` : `🎁 Create / Edit Merchandising Bundle`;
    }

    const selectedAnchorId = editingBundle ? editingBundle.anchorProductId : (allProducts[0]?.id || '');
    if (anchorSelect && selectedAnchorId) anchorSelect.value = selectedAnchorId;

    const preselectedProductIds = editingBundle ? editingBundle.productIds : (selectedAnchorId ? [selectedAnchorId] : []);

    // Render product selection list
    if (productsList) {
      if (allProducts.length === 0) {
        productsList.innerHTML = `
          <div style="text-align:center; padding:1.75rem 1rem; color:var(--adm-muted-fg); font-size:13px; display:flex; flex-direction:column; align-items:center; gap:0.75rem;">
            <div>📦 لا توجد منتجات مسجلة في المتجر حتى الآن.</div>
            <button type="button" class="mc-btn mc-btn-primary mc-btn-sm" onclick="closeBundleModal(); openAddProductModal();" style="padding:0.4rem 1rem; font-size:12.5px;">
              + إضافة أول منتج للمتجر الآن
            </button>
          </div>`;
      } else {
        const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="%23f8fafc"><rect width="40" height="40" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20">🩺</text></svg>';
        productsList.innerHTML = allProducts.map(p => {
          const isChecked = preselectedProductIds.includes(p.id);
          const pImg = (Array.isArray(p.images) && p.images[0]) || p.image || p.img || defaultPlaceholderSvg;
          return `
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.4rem 0.6rem; border-radius:6px; background:var(--adm-card-bg); cursor:pointer; border:1px solid ${isChecked ? 'var(--color-primary-600)' : 'transparent'};">
              <input type="checkbox" class="bundle-prod-check" value="${p.id}" data-price="${p.price || 0}" ${isChecked ? 'checked' : ''} onchange="onBundleProductCheckChange(this)" style="width:16px; height:16px; accent-color:var(--color-primary-600); cursor:pointer;">
              <img src="${pImg}" alt="${p.name}" style="width:32px; height:32px; border-radius:4px; object-fit:cover; border:1px solid var(--adm-border); background:#f8fafc;" onerror="this.src='${defaultPlaceholderSvg}'">
              <div style="flex:1; min-width:0;">
                <div style="font-size:12.5px; font-weight:700; color:var(--adm-foreground); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.nameAr || p.name_ar || p.name}</div>
                <div style="font-size:11px; color:var(--adm-muted-fg);">${p.id} • ${p.specialty || 'General'}</div>
              </div>
              <div style="font-size:12.5px; font-weight:800; color:var(--color-primary-600); white-space:nowrap;">
                ${Number(p.price || 0).toLocaleString()} DZD
              </div>
            </label>
          `;
        }).join('');
      }
    }

    calculateBundleLiveSummary();
    modal.classList.add('open');
  };

  window.closeBundleModal = function() {
    document.getElementById('modal-bundle')?.classList.remove('open');
  };

  window.onAnchorProductChange = function() {
    const anchorSelect = document.getElementById('b-anchor-product');
    if (!anchorSelect) return;
    const selectedId = anchorSelect.value;
    // Auto-check the anchor product in products list if not checked
    const check = document.querySelector(`.bundle-prod-check[value="${selectedId}"]`);
    if (check && !check.checked) {
      check.checked = true;
      if (check.parentElement) check.parentElement.style.borderColor = 'var(--color-primary-600)';
    }
    calculateBundleLiveSummary();
  };

  window.onBundleProductCheckChange = function(input) {
    if (input && input.parentElement) {
      input.parentElement.style.borderColor = input.checked ? 'var(--color-primary-600)' : 'transparent';
    }
    calculateBundleLiveSummary();
  };

  window.calculateBundleLiveSummary = function() {
    const checkedBoxes = Array.from(document.querySelectorAll('.bundle-prod-check:checked'));
    const totalVal = checkedBoxes.reduce((sum, cb) => sum + Number(cb.getAttribute('data-price') || 0), 0);
    const priceInput = document.getElementById('b-price');
    let bundlePrice = Number(priceInput?.value || 0);

    // If bundle price is empty and we have items, suggest a 15% discount
    if ((!priceInput.value || bundlePrice === 0) && totalVal > 0 && !document.getElementById('b-id').value) {
      bundlePrice = Math.round((totalVal * 0.85) / 100) * 100;
      priceInput.value = bundlePrice;
    }

    const savings = Math.max(0, totalVal - bundlePrice);
    const savingsPct = totalVal > 0 ? Math.round((savings / totalVal) * 100) : 0;

    const totalValEl = document.getElementById('b-summary-total-val');
    const bundlePriceEl = document.getElementById('b-summary-bundle-price');
    const savingsEl = document.getElementById('b-summary-savings');

    if (totalValEl) totalValEl.textContent = `${totalVal.toLocaleString()} DZD (${checkedBoxes.length} items)`;
    if (bundlePriceEl) bundlePriceEl.textContent = `${bundlePrice.toLocaleString()} DZD`;
    if (savingsEl) {
      savingsEl.textContent = `${savings.toLocaleString()} DZD (${savingsPct}% OFF)`;
      savingsEl.style.color = savings > 0 ? '#10B981' : 'var(--adm-muted-fg)';
    }
  };

  window.saveBundleSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();

    const idInput = document.getElementById('b-id');
    const name = document.getElementById('b-name')?.value.trim();
    const anchorProductId = document.getElementById('b-anchor-product')?.value;
    const bundlePrice = Number(document.getElementById('b-price')?.value || 0);
    const active = document.getElementById('b-active')?.checked !== false;

    const checkedBoxes = Array.from(document.querySelectorAll('.bundle-prod-check:checked'));
    const productIds = checkedBoxes.map(cb => cb.value);

    if (!name) {
      showToast('❌ Please enter a bundle name');
      return;
    }
    if (!anchorProductId) {
      showToast('❌ Please select an anchor product');
      return;
    }
    if (productIds.length < 2) {
      showToast('❌ Please select at least 2 products for this bundle');
      return;
    }
    if (!bundlePrice || bundlePrice <= 0) {
      showToast('❌ Please enter a valid discounted bundle price');
      return;
    }

    let bundles = getStoredBundles();
    const bundleId = idInput?.value ? idInput.value : `bundle-${Date.now()}`;

    const newBundle = {
      id: bundleId,
      name,
      anchorProductId,
      productIds,
      bundlePrice,
      active
    };

    const existingIdx = bundles.findIndex(b => b.id === bundleId);
    if (existingIdx >= 0) {
      bundles[existingIdx] = newBundle;
      logAuditAction('Updated Bundle', `Bundle "${name}" (${bundleId}) modified`);
      showToast('✓ Bundle updated successfully!');
    } else {
      bundles.unshift(newBundle);
      logAuditAction('Created Bundle', `New bundle "${name}" (${bundleId}) created for ${anchorProductId}`);
      showToast('✓ Bundle created successfully!');
    }

    saveStoredBundles(bundles);
    renderBundlesTable();
    closeBundleModal();
  };

  // Initialize Drag & Drop image uploader
  initImageUploader();

  // Render initial Products Table and load from Supabase
  loadAdminProducts();

  // Render initial Bulk Stock Inventory Table & Warehouse Return Module
  renderBulkStockTable();
  initWarehouseReturnModule();
  renderWarehouseLogsTable();

  // Render initial Customer Reviews Moderation Table
  renderAdminReviews();

  // Load Delivery Fees Table
  loadDeliveryFees();

  // Render initial Bundles Table
  renderBundlesTable();

  // Automatically fetch & render orders on load
  loadAndRenderOrders();

  // Initialize Announcement CMS Editor
  initAnnouncementCMS();

  // Initialize Hero Carousel Banners CMS Editor
  initHeroCMS();

  // Initialize Community & WhatsApp Section CMS Editor
  initCommunityCMS();

  // Initialize Trust & Assurance Badges CMS Editor
  initTrustBadgesCMS();

  // Listeners for external storage and live orders updates
  window.addEventListener('medicare_stock_updated', () => {
    renderProductsTable();
    renderBulkStockTable();
    initWarehouseReturnModule();
    updateDashboardKPIs();
    renderCategoryCounts();
  });
  window.addEventListener('medicare_stock_logs_updated', () => {
    renderWarehouseLogsTable();
  });
  window.addEventListener('medicare_orders_updated', () => {
    loadAndRenderOrders();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'medicare_orders_db') loadAndRenderOrders();
    if (e.key === 'medicare_stock_overrides' || e.key === 'medicare_custom_products') {
      loadAdminProducts();
      initWarehouseReturnModule();
      updateDashboardKPIs();
      renderCategoryCounts();
    }
    if (e.key === 'medicare_stock_logs') {
      renderWarehouseLogsTable();
    }
  });
  window.addEventListener('medicare_reviews_updated', renderAdminReviews);
  window.addEventListener('medicare_delivery_fees_updated', loadDeliveryFees);
  window.addEventListener('medicare_bundles_updated', renderBundlesTable);

});

