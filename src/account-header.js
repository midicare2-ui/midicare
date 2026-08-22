/* ==========================================================================
   MEDICARE — GLOBAL STOREFRONT CONTROLLER
   1. Dynamically renders My Account link/button in header
   2. Dynamically synchronizes Top Announcement Bar across all pages from Admin CMS
   ========================================================================== */

const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  bgColor: '#0A3A34',
  textColor: '#F0FDF4',
  items: [
    { en: '🚚 Free Express Shipping on Orders Above 5,000 DZD', ar: '🚚 شحن مجاني على الطلبات فوق 5,000 دج', link: '' },
    { en: '💵 Cash on Delivery — All 58 Wilayas', ar: '💵 الدفع عند الاستلام — جميع الـ 58 ولاية', link: '' },
    { en: '🎓 Student Bundles — Save up to 25%', ar: '🎓 حقائب الطلاب — وفّر حتى 25%', link: 'category.html?specialty=bundle' }
  ]
};

function getAnnouncementSettings() {
  try {
    const raw = localStorage.getItem('medicare_announcement_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_ANNOUNCEMENT;
}

function renderGlobalAnnouncementBar() {
  const bars = document.querySelectorAll('.mc-announce-bar, #announce-bar');
  if (!bars.length) return;

  const settings = getAnnouncementSettings();
  const isRtl = document.documentElement.getAttribute('dir') === 'rtl' || document.documentElement.getAttribute('lang') === 'ar';

  bars.forEach(bar => {
    if (settings.enabled === false) {
      bar.style.display = 'none';
      return;
    }

    bar.style.display = 'flex';
    if (settings.bgColor) bar.style.backgroundColor = settings.bgColor;
    if (settings.textColor) bar.style.color = settings.textColor;

    const itemsHtml = settings.items.map(item => {
      const text = isRtl ? (item.ar || item.en) : (item.en || item.ar);
      if (item.link) {
        return `<a href="${item.link}" class="mc-announce-item" style="color:inherit; text-decoration:none; display:inline-flex; align-items:center; gap:0.35rem;"><span>${text}</span></a>`;
      }
      return `<span class="mc-announce-item"><span>${text}</span></span>`;
    }).join('');

    bar.innerHTML = itemsHtml;
  });
}

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

function normalizeSearchText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // remove arabic tashkeel
    .trim();
}

function getGlobalSearchCatalog() {
  let list = [];
  try {
    const custom = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
    if (Array.isArray(custom)) list.push(...custom);
  } catch (e) {}

  if (window.PRODUCT_CATALOG && Array.isArray(window.PRODUCT_CATALOG)) {
    window.PRODUCT_CATALOG.forEach(p => {
      if (!list.some(item => String(item.id) === String(p.id))) list.push(p);
    });
  } else if (window.CATALOG && Array.isArray(window.CATALOG)) {
    window.CATALOG.forEach(p => {
      if (!list.some(item => String(item.id) === String(p.id))) list.push(p);
    });
  }

  return list;
}

function initGlobalSearchInputs() {
  const searchContainers = document.querySelectorAll('.mc-search-container');
  
  searchContainers.forEach(container => {
    const input = container.querySelector('.mc-search-input');
    const dropdown = container.querySelector('.mc-search-dropdown');
    if (!input) return;

    if (!input.dataset.searchBound) {
      input.dataset.searchBound = 'true';

      const handleInputSearch = () => {
        const rawQ = input.value.trim();
        const normQ = normalizeSearchText(rawQ);
        const isRtl = document.documentElement.getAttribute('dir') === 'rtl' || document.documentElement.getAttribute('lang') === 'ar';

        // In-page category filter if on category.html
        if (window.location.pathname.includes('category.html') && typeof window.runCatalogSearch === 'function') {
          window.runCatalogSearch(rawQ);
        }

        if (!dropdown) return;

        if (!normQ) {
          dropdown.classList.remove('show');
          dropdown.innerHTML = '';
          return;
        }

        const catalog = getGlobalSearchCatalog();
        const tokens = normQ.split(/\s+/).filter(Boolean);

        const matches = catalog.filter(p => {
          const text = normalizeSearchText([
            p.name, p.nameAr, p.name_ar, p.description, p.descriptionAr, p.description_ar,
            p.category, p.specialty, p.brand, p.material, p.sku
          ].filter(Boolean).join(' '));

          return text.includes(normQ) || tokens.every(tok => text.includes(tok));
        });

        if (matches.length === 0) {
          dropdown.innerHTML = `
            <div style="padding: 0.85rem; font-size: 13px; color: var(--color-neutral-500); text-align: center;">
              ${isRtl ? '🔍 لا توجد نتائج مطابقة' : '🔍 No products found'}
            </div>
          `;
        } else {
          const hits = matches.slice(0, 7);
          const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="%23f8fafc"><rect width="100" height="100" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="%2394a3b8">🩺</text></svg>';
          dropdown.innerHTML = `
            <div class="mc-search-group-title">
              ${isRtl ? `نتائج البحث (${matches.length})` : `Search Results (${matches.length})`}
            </div>
            ${hits.map(p => {
              const displayName = isRtl ? (p.nameAr || p.name_ar || p.name) : p.name;
              const displayCat = p.category || p.specialty || 'Medical Wear';
              const price = Number(p.price || 0).toLocaleString();
              const img = (Array.isArray(p.images) && p.images[0]) || p.img || defaultPlaceholderSvg;

              return `
                <a href="product-detail.html?id=${p.id}" class="mc-search-item" onclick="this.closest('.mc-search-dropdown').classList.remove('show')">
                  <img src="${img}" class="mc-search-item-img" alt="${displayName}" onerror="this.src='${defaultPlaceholderSvg}'">
                  <div class="mc-search-item-info">
                    <span class="mc-search-item-title" style="font-weight:700; font-size:13px; color:var(--color-neutral-900);">${displayName}</span>
                    <span class="mc-search-item-price" style="font-size:12px; color:var(--color-primary-700); font-weight:600;">${price} DZD • ${displayCat}</span>
                  </div>
                </a>
              `;
            }).join('')}
            ${matches.length > 7 ? `
              <a href="category.html?search=${encodeURIComponent(rawQ)}" class="mc-search-item" style="justify-content:center; font-weight:700; color:var(--color-primary-700); font-size:12.5px; border-top:1px solid var(--color-neutral-200); margin-top:0.25rem;">
                ${isRtl ? `عرض كافة الـ ${matches.length} نتيجة ←` : `View all ${matches.length} results →`}
              </a>
            ` : ''}
          `;
        }

        dropdown.classList.add('show');
      };

      input.addEventListener('input', handleInputSearch);
      input.addEventListener('focus', () => {
        if (input.value.trim() && dropdown) handleInputSearch();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = (input.value || '').trim();
          if (query) {
            e.preventDefault();
            if (dropdown) dropdown.classList.remove('show');
            if (window.location.pathname.includes('category.html') && typeof window.runCatalogSearch === 'function') {
              window.runCatalogSearch(query);
            } else {
              window.location.href = `category.html?search=${encodeURIComponent(query)}`;
            }
          }
        }
      });
    }
  });

  // Global document click listener to hide dropdowns
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.mc-search-container').forEach(container => {
      const dropdown = container.querySelector('.mc-search-dropdown');
      if (dropdown && !container.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeaderAccountWidget();
  renderGlobalAnnouncementBar();
  initGlobalSearchInputs();
  window.addEventListener('storage', () => {
    renderHeaderAccountWidget();
    renderGlobalAnnouncementBar();
  });
  window.addEventListener('medicare_announcement_updated', renderGlobalAnnouncementBar);
  window.addEventListener('medicare_language_changed', renderGlobalAnnouncementBar);
});

// Expose globally
window.renderHeaderAccountWidget = renderHeaderAccountWidget;
window.renderGlobalAnnouncementBar = renderGlobalAnnouncementBar;
window.getAnnouncementSettings = getAnnouncementSettings;
window.initGlobalSearchInputs = initGlobalSearchInputs;
window.getGlobalSearchCatalog = getGlobalSearchCatalog;



