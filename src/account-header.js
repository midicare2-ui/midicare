/* ==========================================================================
   MEDICARE — GLOBAL CUSTOMER ACCOUNT HEADER CONTROLLER
   Dynamically renders My Account link/button in header:
   - When logged out: Shows Login/Register link
   - When logged in: Shows Customer Name + Quick Logout / Account Dashboard
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAccountWidget();
  window.addEventListener('storage', renderHeaderAccountWidget);
});

function renderHeaderAccountWidget() {
  const customer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : JSON.parse(localStorage.getItem('medicare_customer_session') || 'null');
  
  // Target all account buttons across header
  const accountBtns = document.querySelectorAll('.mc-account-btn, [title*="Account"], [aria-label*="Account"], [onclick*="order-tracking.html"]');

  accountBtns.forEach(btn => {
    // Avoid overriding admin buttons or non-header elements
    if (btn.closest('main') || btn.closest('.adm-sidebar') || btn.closest('.adm-topbar')) return;

    if (customer && customer.name) {
      const nameParts = customer.name.trim().split(' ');
      const displayName = nameParts[0] + (nameParts[1] ? ' ' + nameParts[1][0] + '.' : '');
      
      btn.innerHTML = `<span style="font-size:13px; font-weight:700; display:inline-flex; align-items:center; gap:4px; font-family:var(--font-family-display);">👤 ${displayName}</span>`;
      btn.title = `Logged in as ${customer.name} — Open Dashboard`;
      btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'account.html';
      };
    } else {
      btn.innerHTML = `<span>👤</span>`;
      btn.title = `My Account — Login / Register`;
      btn.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'account.html';
      };
    }
  });
}

window.renderHeaderAccountWidget = renderHeaderAccountWidget;
