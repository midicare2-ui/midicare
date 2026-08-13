/* ==========================================================================
   MEDICARE — ADMIN DASHBOARD & STAFF PERMISSIONS ENGINE
   Auth Guard, Dynamic Sidebar Filtering, Granular Permission Matrix,
   Staff CRUD, Audit Activity Logger, Inactivity Auto-Logout
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

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
  let staffList = [
    { id: 'STF-101', name: 'Dr. Karim Owner', email: 'owner@medicare.dz', role: 'Owner', status: 'Active', permissions: ['all'], lastLogin: 'Just now' },
    { id: 'STF-102', name: 'Youcef Manager', email: 'manager@medicare.dz', role: 'Store Manager', status: 'Active', permissions: ['products', 'inventory', 'categories', 'coupons', 'homepage', 'reports'], lastLogin: 'Today, 09:15' },
    { id: 'STF-103', name: 'Farid Order Handler', email: 'handler@medicare.dz', role: 'Order Handler', status: 'Active', permissions: ['orders', 'customers', 'reviews'], lastLogin: 'Today, 10:40' },
    { id: 'STF-104', name: 'Sara Support', email: 'support@medicare.dz', role: 'Support & Content', status: 'Active', permissions: ['reviews', 'homepage'], lastLogin: 'Yesterday, 16:20' }
  ];

  /* ------------------------------------------------------------------
     3. AUDIT ACTIVITY LOG STORE
     ------------------------------------------------------------------ */
  let auditLogs = [
    { timestamp: '2026-08-13 11:45:10', staff: 'Farid Order Handler', action: 'Updated Order Status', target: 'Order #MC-9418 → Shipped', ip: '105.101.42.12 (Algiers)' },
    { timestamp: '2026-08-13 11:20:04', staff: 'Youcef Manager', action: 'Updated Variant Stock', target: 'Obsidian Flex Scrub Set (Size M +10)', ip: '105.101.42.12 (Algiers)' },
    { timestamp: '2026-08-13 10:15:33', staff: 'Dr. Karim Owner', action: 'Created Coupon Code', target: 'STUDENT10 (10% OFF)', ip: '197.200.12.88 (Oran)' }
  ];

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

  applySidebarPermissionFilter();

  /* ------------------------------------------------------------------
     5. MODULE SWITCHER WITH PERMISSION CHECK
     ------------------------------------------------------------------ */
  window.switchModule = function(btn, modId) {
    if (!hasPermission(modId)) {
      document.querySelectorAll('.adm-module-panel').forEach(p => p.classList.remove('active'));
      const deniedBox = document.getElementById('adm-access-denied');
      if (deniedBox) deniedBox.classList.add('active');
      showToast('⛔ Access Restricted: Required permission missing');
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
      'mod-coupons': '🎁 Coupons & Starter Kit Bundles',
      'mod-reviews': '✍️ Customer Reviews Moderation',
      'mod-staff': '🔐 Staff Members & Granular Permissions',
      'mod-audit': '📜 System Audit Activity Log',
      'mod-homepage': '🖼️ Homepage Content Manager (CMS)',
      'mod-delivery': '🚚 58 Wilayas & Delivery Fee Rates',
      'mod-reports': '📈 Analytics & Sales Reports'
    };

    const headerTitle = document.getElementById('adm-header-title');
    if (headerTitle && titleMap[modId]) headerTitle.textContent = titleMap[modId];
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
  renderAuditTable();

  /* ------------------------------------------------------------------
     10. DYNAMIC ORDERS MANAGEMENT & WORKFLOW ENGINE
     ------------------------------------------------------------------ */
  let allAdminOrders = [];
  let currentOrderFilter = 'all';

  async function loadAndRenderOrders() {
    if (window.MedicareDB && typeof window.MedicareDB.getOrders === 'function') {
      try {
        allAdminOrders = await window.MedicareDB.getOrders();
      } catch (e) {
        console.warn('[Admin] Failed to fetch orders from MedicareDB:', e);
      }
    }
    renderOrdersTables();
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
    renderOrdersTables();
  };

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
        const items = Array.isArray(order.items) ? order.items : [];
        const itemsRows = items.map(item => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #E2E8F0;">${item.nameAr || item.name} ${item.size ? '(' + item.size + ')' : ''}</td>
            <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:center;">${item.qty || 1}</td>
            <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:right;">${Number(item.price || 0).toLocaleString()} DZD</td>
            <td style="padding:8px; border-bottom:1px solid #E2E8F0; text-align:right;"><strong>${(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString()} DZD</strong></td>
          </tr>
        `).join('');

        const deliveryCompany = order.delivery_company || (order.delivery_type === 'stopdesk' ? 'Yalidine Express (Stop-Desk Pickup)' : 'ZR Express (Home Delivery)');
        const fullAddress = [order.address && order.address !== 'N/A' ? order.address : '', order.commune, order.wilaya].filter(Boolean).join(', ') || order.wilaya || 'N/A';
        
        const qrDataText = `ORDER: #${cleanId}\nCLIENT: ${order.customer_name}\nPHONE: ${order.phone}\nADDRESS: ${fullAddress}\nDELIVERY: ${deliveryCompany}\nTOTAL COD: ${Number(order.total || 0).toLocaleString()} DZD`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataText)}`;

        printArea.innerHTML = `
          <!-- SHIPPING LABEL & CLIENT CARD (PROMINENT FOR PRINT & EXPRESS COURIERS) -->
          <div style="border:2px dashed #0E4D45; background:#F0FDF4; padding:1.2rem; border-radius:10px; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; gap:1.25rem;">
            <div style="flex:1;">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                <span style="background:#0E4D45; color:#FFFFFF; font-size:11px; font-weight:800; padding:3px 10px; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">📦 Shipping Label / وصل التسليم</span>
                <span style="font-size:13px; font-weight:800; color:#0E4D45;">#${cleanId}</span>
              </div>

              <div style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:5px;">
                👤 <span style="color:#64748B; font-size:13px; font-weight:600;">الاسم واللقب (Client Name):</span> <strong style="color:#0E4D45;">${order.customer_name}</strong>
              </div>

              <div style="font-size:14px; font-weight:700; color:#1E293B; margin-bottom:5px;">
                📞 <span style="color:#64748B; font-size:13px; font-weight:600;">رقم الهاتف (Phone):</span> <code style="background:#E2E8F0; padding:2px 8px; border-radius:4px; font-size:15px; font-weight:800;">${order.phone}</code>
              </div>

              <div style="font-size:13px; color:#334155; margin-bottom:5px;">
                📍 <span style="color:#64748B; font-size:13px; font-weight:600;">العنوان الكامل (Full Address):</span> <strong>${fullAddress}</strong>
              </div>

              <div style="font-size:13px; color:#0E4D45; font-weight:800;">
                🚚 <span style="color:#64748B; font-size:13px; font-weight:600;">شركة/نوع التوصيل (Courier):</span> <strong>${deliveryCompany}</strong>
              </div>
            </div>

            <!-- QR CODE BOX -->
            <div style="text-align:center; background:#FFFFFF; padding:8px; border:1px solid #CBD5E1; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.06); flex-shrink:0;">
              <img src="${qrUrl}" alt="Order QR Code" width="130" height="130" style="display:block; border-radius:4px;">
              <span style="font-size:10px; font-weight:800; color:#475569; display:block; margin-top:4px; letter-spacing:0.04em;">SCAN ORDER QR</span>
            </div>
          </div>

          <!-- INVOICE HEADER DETAILS -->
          <div style="display:flex; justify-content:space-between; margin-bottom:1rem; padding-bottom:1rem; border-bottom:2px solid #E2E8F0; font-size:13px;">
            <div>
              <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary-900);">🏥 MEDICARE Algeria — Official Order Invoice</h4>
              <strong>Customer Name:</strong> ${order.customer_name}<br>
              <strong>Phone Number:</strong> <code>${order.phone}</code><br>
              <strong>Full Address:</strong> ${fullAddress}<br>
              <strong>Order Status:</strong> <span class="adm-badge adm-badge-info">${order.status}</span>
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

          <!-- ACTION BUTTONS (HIDDEN WHEN PRINTING) -->
          <div class="no-print" style="display:flex; gap:0.5rem; justify-content:flex-end;">
            <button class="mc-btn mc-btn-primary mc-btn-sm" onclick="window.print()">🖨️ Print Invoice & Shipping Label</button>
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

  // Automatically fetch & render orders on load
  loadAndRenderOrders();

});
