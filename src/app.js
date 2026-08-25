/* ==========================================================================
   MEDICARE — E-COMMERCE HOMEPAGE INTERACTIVE ENGINE  v2.0
   Full bilingual EN/AR, Cart Drawer, Hero Carousel, Search, RTL, Scroll-Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* ------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------ */
  let currentLang = window.MC_I18N ? window.MC_I18N.getCurrentLang() : (localStorage.getItem('medicare_lang') || 'en');
  let wishlistCount = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]').length || 2;
  let currentSlide = 0;
  const TOTAL_SLIDES = 3;
  let autoSlideTimer = null;

  /* ------------------------------------------------------------------
     DOM REFS
     ------------------------------------------------------------------ */
  const htmlRoot       = document.documentElement;
  const langToggleBtn  = document.getElementById('lang-toggle-btn');
  const langDropdownMenu = document.getElementById('lang-dropdown-menu');
  const cartOverlay    = document.getElementById('cart-drawer-overlay');
  const cartToggleBtn  = document.getElementById('cart-toggle-btn');
  const cartCloseBtn   = document.getElementById('cart-close-btn');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const wishlistBadge  = document.getElementById('wishlist-badge');
  const searchInput    = document.getElementById('predictive-search-input');
  const searchDropdown = document.getElementById('predictive-search-dropdown');
  const toast          = document.getElementById('copy-toast');
  const sliderTrack    = document.getElementById('hero-slider-track');
  const sliderDots     = document.querySelectorAll('.mc-dot');
  const announceBar    = document.getElementById('announce-bar');
  const cartShipping   = document.getElementById('cart-shipping-text');
  const cartCheckoutBtn= document.getElementById('cart-checkout-btn');
  const cartSubLabel   = document.getElementById('cart-subtotal-label');
  const cartTitleSpan  = document.getElementById('cart-title-text');

  /* ------------------------------------------------------------------
     TRILINGUAL COPY MATRIX (EN 🇬🇧 | AR 🇩🇿 | FR 🇫🇷)
     ------------------------------------------------------------------ */
  const copy = {
    en: {
      langBtn: '🇬🇧 English',
      announceItems: ['🚚 Free Express Shipping on Orders Above 5,000 DZD', '💵 Cash on Delivery — All 58 Wilayas', '🎓 Student Bundles — Save up to 25%'],
      searchPlaceholder: 'Search scrubs, stethoscopes, lab coats, starter kits…',
      cartTitle: '🛒 Shopping Cart',
      cartShipping: '🚚 Fast Shipping — 58 Wilayas • Cash on Delivery',
      cartSubtotal: 'Subtotal:',
      cartCheckout: 'Proceed to Checkout (COD)',
      cartEmpty: 'Your cart is currently empty.',
      heroTag: ['✨ New 2026 Collection', '🎓 Student Discount Active', '🩺 Precision Acoustics'],
      heroTitle: ['Obsidian Flex Antimicrobial Scrubs', '2026 Medical Student Starter Kits', 'Titanium Master Diagnostic Gear'],
      heroDesc: [
        'Engineered for 24-hour shift endurance — 4-way stretch flex fabric with liquid-shield barrier.',
        'Complete gear & apparel bundles for Medicine, Pharmacy, Dentistry, and Nursing students. Save up to 25%.',
        'Ultra-sensitive acoustic stethoscopes crafted in brushed matte titanium. Free lifetime calibration.'
      ],
      heroCta: [['Shop Scrubs', 'Explore Student Kits'], ['View Student Bundles'], ['Shop Diagnostic Tools']],
      sectionCategory: 'Shop by Category & Specialty',
      sectionCategorySub: 'Tailored essentials for Medicine, Pharmacy, Dentistry, and Nursing professionals.',
      specialtyTabs: ['All Specialties (All)', 'Medicine (Med)', 'Pharmacy (Pharm)', 'Dentistry (Dent)', 'Nursing (RN)'],
      sectionFeatured: 'Featured & Best-Seller Essentials',
      sectionFeaturedSub: 'Highest rated products engineered for daily clinical practice.',
      sectionKits: 'Student Starter Kits & Bundles',
      sectionKitsSub: 'All-in-one curated equipment bundles for 1st-year & clinical students with bundle savings.',
      addToCart: 'Add to Cart',
      orderBundle: 'Order Bundle',
      reviewTitle: 'Trusted by Medical Professionals',
      reviewSub: 'What resident doctors, surgeons, and pharmacy students say about MEDICARE.',
      communityTitle: 'Join 15,000+ Medical Professionals',
      communitySub: 'Subscribe for VIP student discounts, new product launches, and WhatsApp order updates.',
      whatsappCta: '💬 Join WhatsApp VIP Group',
      newsletterPlaceholder: 'Enter your email address…',
      subscribe: 'Subscribe',
      viewAll: 'View All Products →',
      taxNote: 'Tax Exempt for MD/RN',
    },
    ar: {
      langBtn: '🇩🇿 العربية',
      announceItems: ['🚚 شحن مجاني على الطلبات فوق 5,000 دج', '💵 الدفع عند الاستلام — جميع الـ 58 ولاية', '🎓 حقائب الطلاب — وفّر حتى 25%'],
      searchPlaceholder: 'ابحث عن سكراب، سماعة، معطف مختبر، أو حقيبة طلاب…',
      cartTitle: '🛒 سلة التسوق',
      cartShipping: '🚚 توصيل سريع — 58 ولاية • الدفع عند الاستلام',
      cartSubtotal: 'المجموع الفرعي:',
      cartCheckout: 'إتمام الشراء (الدفع عند الاستلام)',
      cartEmpty: 'سلة التسوق فارغة حاليًا.',
      heroTag: ['✨ مجموعة 2026 الجديدة', '🎓 خصم الطلاب متاح', '🩺 دقة صوتية فائقة'],
      heroTitle: ['سكراب أوبسيديان المضاد للبكتيريا', 'حقائب طلاب الطب 2026', 'أجهزة التشخيص الدقيقة تيتانيوم'],
      heroDesc: [
        'مصمم لتحمّل نوبات 24 ساعة — قماش مرن 4 اتجاهات مع طبقة عازلة للسوائل.',
        'حقائب متكاملة للملابس والمعدات لطلاب الطب والصيدلة وطب الأسنان والتمريض. وفّر حتى 25%.',
        'سماعات طبية فائقة الحساسية من التيتانيوم المصقول. معايرة مجانية مدى الحياة.'
      ],
      heroCta: [['تسوق السكراب', 'استعرض حقائب الطلاب'], ['عرض الحقائب'], ['تسوق أدوات التشخيص']],
      sectionCategory: 'تسوق حسب الفئة والتخصص',
      sectionCategorySub: 'مستلزمات مخصصة لأطباء الطب والصيدلة وطب الأسنان والتمريض.',
      specialtyTabs: ['الكل', 'الطب البشري', 'الصيدلة', 'طب الأسنان', 'التمريض'],
      sectionFeatured: 'المنتجات المميزة والأكثر مبيعاً',
      sectionFeaturedSub: 'أعلى المنتجات تقييماً ومصممة للممارسة السريرية اليومية.',
      sectionKits: 'حقائب المبتدئين — مجموعات الطلاب',
      sectionKitsSub: 'حقائب معدات متكاملة للطلاب في السنة الأولى وأثناء التدريب السريري.',
      addToCart: 'أضف إلى السلة',
      orderBundle: 'اطلب الحقيبة',
      reviewTitle: 'موثوق من قِبَل المختصين الطبيين',
      reviewSub: 'ما يقوله الأطباء المقيمون والجراحون وطلاب الصيدلة عن MEDICARE.',
      communityTitle: 'انضم لأكثر من 15,000 متخصص طبي',
      communitySub: 'اشترك للحصول على خصومات VIP للطلاب وإشعارات المنتجات الجديدة.',
      whatsappCta: '💬 انضم لمجموعة واتساب VIP',
      newsletterPlaceholder: 'أدخل بريدك الإلكتروني…',
      subscribe: 'اشترك',
      viewAll: 'عرض كل المنتجات ←',
      taxNote: 'معفى من الضريبة لـ MD/RN',
    },
    fr: {
      langBtn: '🇫🇷 Français',
      announceItems: ['🚚 Livraison Express Gratuite dès 5 000 DZD', '💵 Paiement à la Livraison — 58 Wilayas', '🎓 Packs Étudiants — Économisez jusqu’à 25%'],
      searchPlaceholder: 'Rechercher blouses, stéthoscopes, tenues, packs...',
      cartTitle: '🛒 Panier d’Achat',
      cartShipping: '🚚 Livraison Express — 58 Wilayas • Paiement à la Livraison',
      cartSubtotal: 'Sous-total :',
      cartCheckout: 'Passer la Commande (Paiement à la Livraison)',
      cartEmpty: 'Votre panier est actuellement vide.',
      heroTag: ['✨ Nouvelle Collection 2026', '🎓 Remise Étudiante Active', '🩺 Acoustique de Précision'],
      heroTitle: ['Tenues Médicales Obsidian Flex Antibactériennes', 'Kits d’Équipement Étudiants en Médecine 2026', 'Instruments de Diagnostic Titane Master'],
      heroDesc: [
        'Conçues pour l’endurance des gardes de 24h — tissu extensible 4 directions avec barrière déperlante.',
        'Packs complets de tenues et matériel pour étudiants en Médecine, Pharmacie, Dentaire et Soins. Jusqu’à 25% d’économie.',
        'Stéthoscopes haute sensibilité acoustique usinés en titane brossé. Étalonnage acoustique offert à vie.'
      ],
      heroCta: [['Découvrir les Tenues', 'Explorer les Packs Étudiants'], ['Voir les Packs Étudiants'], ['Acheter Matériel Diagnostic']],
      sectionCategory: 'Acheter par Catégorie & Spécialité',
      sectionCategorySub: 'Équipements cliniques conçus sur mesure pour Médecine, Dentaire, Pharmacie et Soins.',
      specialtyTabs: ['Toutes Spécialités (Tous)', 'Médecine (Méd)', 'Pharmacie (Pharm)', 'Dentaire (Dent)', 'Soins (Inf)'],
      sectionFeatured: 'Essentiels Populaires & Meilleures Ventes',
      sectionFeaturedSub: 'Matériel certifié et testé pour la pratique clinique et hospitalière quotidienne.',
      sectionKits: 'Kits Étudiants & Packs Complets',
      sectionKitsSub: 'Packs d’équipement tout-en-un pour étudiants de 1ère année et stages cliniques avec économies réelles.',
      addToCart: 'Ajouter au panier',
      orderBundle: 'Commander le Pack',
      reviewTitle: 'Avis Médicaux Vérifiés',
      reviewSub: 'Recommandé par des internes, chirurgiens et étudiants en santé à travers toute l’Algérie.',
      communityTitle: 'Rejoignez plus de 15 000 Professionnels de Santé',
      communitySub: 'Recevez les offres exclusives étudiants, les lancements de collections et les alertes WhatsApp VIP.',
      whatsappCta: '💬 Rejoindre le Groupe VIP WhatsApp',
      newsletterPlaceholder: 'Entrez votre adresse email…',
      subscribe: 'S’inscrire',
      viewAll: 'Voir Tous les Produits →',
      taxNote: 'Exonéré de Taxe Professionnels de Santé',
    }
  };

  /* ------------------------------------------------------------------
     TOAST UTILITY
     ------------------------------------------------------------------ */
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ------------------------------------------------------------------
     1. HERO CAROUSEL — auto-slide, dots, arrow keys
     ------------------------------------------------------------------ */
  function goToSlide(idx) {
    currentSlide = (idx + TOTAL_SLIDES) % TOTAL_SLIDES;
    const dir = htmlRoot.getAttribute('dir') === 'rtl' ? 1 : -1;
    if (sliderTrack) sliderTrack.style.transform = `translateX(${currentSlide * dir * 100}%)`;
    sliderDots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function startAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  sliderDots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startAutoSlide(); }));
  startAutoSlide();

  // Keyboard & swipe support
  let touchStartX = 0;
  if (sliderTrack) {
    sliderTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    sliderTrack.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
      startAutoSlide();
    });
  }

  /* ------------------------------------------------------------------
     2. SMART PREDICTIVE SEARCH (Live Dynamic Products)
     ------------------------------------------------------------------ */
  function getLiveSearchProducts() {
    let prods = [];
    try {
      const custom = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      prods = [...custom];
    } catch (e) {}
    if (window.PRODUCT_CATALOG && Array.isArray(window.PRODUCT_CATALOG)) {
      window.PRODUCT_CATALOG.forEach(p => {
        if (!prods.some(cp => String(cp.id) === String(p.id))) prods.push(p);
      });
    }
    return prods.map(p => ({
      id: p.id,
      name: p.name || 'Product',
      nameAr: p.name_ar || p.nameAr || p.name || 'منتج',
      nameFr: p.name_fr || p.nameFr || p.name || 'Produit',
      cat: p.category || p.specialty || 'General',
      catAr: p.category || p.specialty || 'عام',
      catFr: p.category || p.specialty || 'Général',
      price: Number(p.price || 0),
      img: (Array.isArray(p.images) && p.images[0]) || p.image || p.img || ''
    }));
  }

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { searchDropdown.classList.remove('show'); return; }

      const liveProducts = getLiveSearchProducts();
      const hits = liveProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.nameFr.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q) ||
        p.catAr.toLowerCase().includes(q) ||
        p.catFr.toLowerCase().includes(q)
      );

      const noResLabel = currentLang === 'ar' ? 'لم يتم العثور على نتائج' : (currentLang === 'fr' ? 'Aucun résultat trouvé' : 'No results found');
      const quickResLabel = currentLang === 'ar' ? 'نتائج فورية' : (currentLang === 'fr' ? 'Résultats instantanés' : 'Quick results');

      if (hits.length === 0) {
        searchDropdown.innerHTML = `<div style="padding:.75rem;font-size:13px;color:var(--color-neutral-500)">${noResLabel}</div>`;
      } else {
        searchDropdown.innerHTML = `
          <div class="mc-search-group-title">${quickResLabel}</div>
          ${hits.map(p => {
            const title = currentLang === 'ar' ? p.nameAr : (currentLang === 'fr' ? p.nameFr : p.name);
            const category = currentLang === 'ar' ? p.catAr : (currentLang === 'fr' ? p.catFr : p.cat);
            const priceFormatted = window.MC_I18N ? window.MC_I18N.formatCurrency(p.price, currentLang) : `${p.price.toLocaleString()} DZD`;
            return `
            <a href="product-detail.html?id=${p.id}" class="mc-search-item" onclick="searchDropdown.classList.remove('show')">
              <img src="${p.img}" class="mc-search-item-img" alt="${title}">
              <div class="mc-search-item-info">
                <span class="mc-search-item-title">${title}</span>
                <span class="mc-search-item-price">${priceFormatted} • ${category}</span>
              </div>
            </a>
          `}).join('')}`;
      }
      searchDropdown.classList.add('show');
    });

    document.addEventListener('click', e => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target))
        searchDropdown.classList.remove('show');
    });
  }

  /* ------------------------------------------------------------------
     3. CART DRAWER
     ------------------------------------------------------------------ */
  function renderCart() {
    const t = copy[currentLang];
    const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
    const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;
    const subtotal = window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;

    if (cartCountBadge) cartCountBadge.textContent = totalQty;
    if (cartSubLabel)   cartSubLabel.textContent   = t.cartSubtotal;
    if (cartShipping)   cartShipping.textContent   = t.cartShipping;
    if (cartCheckoutBtn)cartCheckoutBtn.textContent= t.cartCheckout;
    if (cartTitleSpan)  cartTitleSpan.textContent  = t.cartTitle;

    const body = document.getElementById('cart-drawer-body');
    const totalEl = document.getElementById('cart-subtotal-val');

    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">${t.cartEmpty}</div>`;
      if (totalEl) totalEl.textContent = '0 DZD';
      return;
    }

    body.innerHTML = cart.map((item, idx) => {
      const displayName = currentLang === 'ar' ? (item.nameAr || item.name) : item.name;
      const imgSrc = item.image || item.img;
      return `
        <div class="mc-cart-item">
          <img src="${imgSrc}" class="mc-cart-item-img" alt="${displayName}">
          <div class="mc-cart-item-info">
            <span class="mc-cart-item-title">${displayName}</span>
            <span class="mc-cart-item-price">${Number(item.price).toLocaleString()} DZD</span>
            <div class="mc-cart-qty-ctrl">
              <button class="mc-qty-btn" onclick="window.updateQty(${idx},-1)">−</button>
              <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
              <button class="mc-qty-btn" onclick="window.updateQty(${idx},1)">+</button>
            </div>
          </div>
          <button onclick="window.updateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px;line-height:1;padding:0 0.25rem;" title="Remove">✕</button>
        </div>`;
    }).join('');

    if (totalEl) totalEl.textContent = subtotal.toLocaleString() + ' DZD';
  }
  window.renderCart = renderCart;
  window.renderCartDrawer = renderCart;

  window.updateQty = function(idx, delta) {
    if (window.MedicareCart) window.MedicareCart.updateQty(idx, delta);
    renderCart();
  };

  window.addToCart = function(id, name, nameAr, price, img) {
    if (window.MedicareCart) {
      window.MedicareCart.addItem({ productId: id, id, name, nameAr, price, qty: 1, image: img });
    }
    renderCart();
    if (cartOverlay) cartOverlay.classList.add('open');
    showToast(currentLang === 'ar' ? `✓ تمت إضافة "${nameAr}" للسلة` : `✓ "${name}" added to cart!`);
  };

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => cartOverlay?.classList.add('open'));
  if (cartCloseBtn)  cartCloseBtn.addEventListener('click',  () => cartOverlay?.classList.remove('open'));
  if (cartOverlay)   cartOverlay.addEventListener('click',   e => { if (e.target === cartOverlay) cartOverlay.classList.remove('open'); });

  renderCart();

  /* ------------------------------------------------------------------
     4. WISHLIST TOGGLE
     ------------------------------------------------------------------ */
  document.querySelectorAll('.mc-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('active');
      wishlistCount += btn.classList.contains('active') ? 1 : -1;
      if (wishlistBadge) wishlistBadge.textContent = Math.max(0, wishlistCount);
      showToast(btn.classList.contains('active')
        ? (currentLang === 'ar' ? '♥ تم الحفظ في المفضلة' : '♥ Saved to Wishlist')
        : (currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist'));
    });
  });

  /* ------------------------------------------------------------------
     5. SPECIALTY FILTERING TABS
     ------------------------------------------------------------------ */
  const specialtyTabs = document.querySelectorAll('.mc-specialty-tab');
  const productCards  = document.querySelectorAll('[data-specialty]');

  specialtyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      specialtyTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const specialty = tab.dataset.specialty;
      productCards.forEach(card => {
        const s = card.dataset.specialty;
        card.style.display = (specialty === 'all' || s === specialty || s === 'all') ? '' : 'none';
      });
    });
  });

  /* ------------------------------------------------------------------
     6. FULL TRILINGUAL RTL / LTR SWITCH (AR 🇩🇿 | EN 🇬🇧 | FR 🇫🇷)
     ------------------------------------------------------------------ */
  function applyLanguage(lang) {
    if (!['ar', 'en', 'fr'].includes(lang)) lang = 'en';
    currentLang = lang;
    const t = copy[lang] || copy.en;
    const isRTL = lang === 'ar';

    htmlRoot.setAttribute('lang', lang);
    htmlRoot.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    try {
      localStorage.setItem('medicare_lang', lang);
    } catch (e) {}

    // Lang toggle button & active state in dropdown
    if (langToggleBtn) {
      const btnText = langToggleBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = t.langBtn;
    }

    if (langDropdownMenu) {
      langDropdownMenu.querySelectorAll('.mc-lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
      });
    }

    // Announcement bar (uses dynamic CMS settings if available)
    if (typeof window.renderGlobalAnnouncementBar === 'function') {
      window.renderGlobalAnnouncementBar();
    } else if (announceBar) {
      announceBar.innerHTML = t.announceItems.map(item =>
        `<span class="mc-announce-item">${item}</span>`
      ).join('');
    }

    // Search
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // Cart drawer texts
    renderCart();

    // Hero slides — re-render in-place with language translations and custom CMS colors
    const slides = sliderTrack?.querySelectorAll('.mc-slide');
    if (slides) {
      slides.forEach((slide, i) => {
        const tagEl    = slide.querySelector('.mc-slide-tag');
        const titleEl  = slide.querySelector('.mc-slide-title');
        const descEl   = slide.querySelector('.mc-slide-desc');
        const ctasEl   = slide.querySelector('.mc-slide-ctas');
        if (tagEl && t.heroTag[i])   tagEl.textContent = t.heroTag[i];
        if (titleEl && t.heroTitle[i]) titleEl.textContent = t.heroTitle[i];
        if (descEl && t.heroDesc[i])  descEl.textContent = t.heroDesc[i];
        if (ctasEl && t.heroCta[i]) {
          const anchors = ctasEl.querySelectorAll('a');
          t.heroCta[i].forEach((label, j) => {
            if (anchors[j]) anchors[j].textContent = label;
          });
        }
      });
    }

    // Apply custom CMS colors & gradients if configured
    applyCustomHeroBanners(lang);

    // Re-position slider for RTL direction change
    goToSlide(currentSlide);

    // Specialty tabs
    const tabEls = document.querySelectorAll('.mc-specialty-tab');
    if (t.specialtyTabs) tabEls.forEach((tab, i) => {
      if (t.specialtyTabs[i]) tab.textContent = t.specialtyTabs[i];
    });

    // Section headings
    setText('section-category-title', t.sectionCategory);
    setText('section-category-sub',   t.sectionCategorySub);
    setText('section-featured-title', t.sectionFeatured);
    setText('section-featured-sub',   t.sectionFeaturedSub);
    setText('section-kits-title',     t.sectionKits);
    setText('section-kits-sub',       t.sectionKitsSub);
    setText('section-review-title',   t.reviewTitle);
    setText('section-review-sub',     t.reviewSub);
    setText('community-title',        t.communityTitle);
    setText('community-sub',          t.communitySub);
    setText('whatsapp-cta-text',      t.whatsappCta);
    setAttr('newsletter-input',       'placeholder', t.newsletterPlaceholder);
    setText('subscribe-btn',          t.subscribe);
    setText('view-all-btn',           t.viewAll);

    // Re-render student bundles in currently active language
    renderHomeBundles();

    // Product "Add to Cart" buttons
    document.querySelectorAll('.mc-add-to-cart-btn').forEach(btn => {
      btn.textContent = t.addToCart;
    });

    // Apply custom CMS Community & WhatsApp section settings
    applyCustomCommunitySettings(lang);

    // Apply custom CMS Trust & Assurance Badges
    renderTrustBadges(lang);

    const langNotice = isRTL ? '🌐 تم التبديل إلى العربية' : (lang === 'fr' ? '🌐 Changé en Français' : '🌐 Switched to English');
    showToast(langNotice);

    window.dispatchEvent(new CustomEvent('medicare_language_changed', { detail: { lang, isRTL } }));
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }

  function setAttr(id, attr, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  }

  // Trilingual Language Switcher Interactions
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (langDropdownMenu) {
        langDropdownMenu.classList.toggle('show');
      } else {
        // Fallback cycle EN -> AR -> FR
        const nextLang = currentLang === 'en' ? 'ar' : (currentLang === 'ar' ? 'fr' : 'en');
        if (window.MC_I18N) window.MC_I18N.setLang(nextLang);
        applyLanguage(nextLang);
      }
    });
  }

  if (langDropdownMenu) {
    langDropdownMenu.querySelectorAll('.mc-lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = btn.dataset.lang;
        if (window.MC_I18N) window.MC_I18N.setLang(selected);
        applyLanguage(selected);
        langDropdownMenu.classList.remove('show');
      });
    });

    document.addEventListener('click', e => {
      if (langToggleBtn && !langToggleBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
        langDropdownMenu.classList.remove('show');
      }
    });
  }

  window.addEventListener('medicare_language_changed', (e) => {
    if (e.detail && e.detail.lang && e.detail.lang !== currentLang) {
      applyLanguage(e.detail.lang);
    }
  });

  /* ------------------------------------------------------------------
     8. CUSTOM CMS HERO BANNER COLOR STYLER
     ------------------------------------------------------------------ */
  function applyCustomHeroBanners(lang = currentLang) {
    const raw = localStorage.getItem('medicare_hero_banners');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data) return;
      const slides = sliderTrack?.querySelectorAll('.mc-slide');
      if (!slides || slides.length === 0) return;

      const isAR = lang === 'ar';
      const items = [data.b1, data.b2];

      items.forEach((item, i) => {
        if (!item || !slides[i]) return;
        const slide = slides[i];

        // Background gradient
        if (item.bgStart && item.bgEnd) {
          slide.style.background = `linear-gradient(135deg, ${item.bgStart} 0%, ${item.bgEnd} 100%)`;
        } else if (item.bgStart) {
          slide.style.background = item.bgStart;
        }

        // Text colors
        if (item.textColor) {
          slide.style.color = item.textColor;
          const title = slide.querySelector('.mc-slide-title');
          if (title) {
            title.style.background = 'none';
            title.style.webkitBackgroundClip = 'unset';
            title.style.webkitTextFillColor = item.textColor;
            title.style.color = item.textColor;
          }
          const desc = slide.querySelector('.mc-slide-desc');
          if (desc) desc.style.color = item.textColor;
        }

        // Tag badge
        const tagEl = slide.querySelector('.mc-slide-tag');
        if (tagEl) {
          if (isAR && item.tagAr) tagEl.textContent = item.tagAr;
          else if (!isAR && item.tag) tagEl.textContent = item.tag;
          if (item.btnColor) {
            tagEl.style.borderColor = item.btnColor;
            tagEl.style.color = item.textColor || '#FFFFFF';
            tagEl.style.backgroundColor = `rgba(20, 184, 166, 0.2)`;
          }
        }

        // Title
        const titleEl = slide.querySelector('.mc-slide-title');
        if (titleEl) {
          if (isAR && item.titleAr) titleEl.textContent = item.titleAr;
          else if (!isAR && item.title) titleEl.textContent = item.title;
        }

        // Description
        const descEl = slide.querySelector('.mc-slide-desc');
        if (descEl) {
          if (isAR && item.descAr) descEl.textContent = item.descAr;
          else if (!isAR && item.desc) descEl.textContent = item.desc;
        }

        // Buttons
        if (item.btnColor) {
          const mainBtn = slide.querySelector('.mc-btn-accent, .mc-btn-primary');
          if (mainBtn) {
            mainBtn.style.backgroundColor = item.btnColor;
            mainBtn.style.borderColor = item.btnColor;
          }
        }
      });
    } catch (e) {
      console.warn('Error applying custom hero banners:', e);
    }
  }

  // Initial load of custom banner styles
  applyCustomHeroBanners(currentLang);

  // Real-time synchronization event
  window.addEventListener('medicare_hero_banners_updated', () => {
    applyCustomHeroBanners(currentLang);
  });

  /* ------------------------------------------------------------------
     9. CUSTOM CMS COMMUNITY & WHATSAPP SECTION STYLER
     ------------------------------------------------------------------ */
  function applyCustomCommunitySettings(lang = currentLang) {
    const raw = localStorage.getItem('medicare_community_settings');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (!data) return;

      const isAR = lang === 'ar';
      const boxEl     = document.querySelector('.mc-community-box');
      const titleEl   = document.getElementById('community-title');
      const descEl    = document.getElementById('community-sub');
      const waBtnEl   = document.getElementById('whatsapp-cta-text');
      const subBtnEl  = document.getElementById('subscribe-btn');

      // Background gradient or color
      if (boxEl) {
        if (data.bgStart && data.bgEnd) {
          boxEl.style.background = `linear-gradient(135deg, ${data.bgStart} 0%, ${data.bgEnd} 100%)`;
        } else if (data.bgStart) {
          boxEl.style.background = data.bgStart;
        }
      }

      // Title & Text colors
      if (titleEl) {
        if (isAR && data.titleAr) titleEl.textContent = data.titleAr;
        else if (!isAR && data.titleEn) titleEl.textContent = data.titleEn;
        if (data.textColor) titleEl.style.color = data.textColor;
      }

      // Subtitle
      if (descEl) {
        if (isAR && data.descAr) descEl.textContent = data.descAr;
        else if (!isAR && data.descEn) descEl.textContent = data.descEn;
        if (data.textColor) descEl.style.color = data.textColor;
      }

      // WhatsApp Button & Link
      if (waBtnEl) {
        if (data.waText) waBtnEl.textContent = data.waText;
        if (data.waLink) waBtnEl.href = data.waLink;
        if (data.waBtnColor) {
          waBtnEl.style.backgroundColor = data.waBtnColor;
          waBtnEl.style.boxShadow = `0 4px 16px ${data.waBtnColor}55`;
        }
      }

      // Subscribe button
      if (subBtnEl && data.subBtnColor) {
        subBtnEl.style.backgroundColor = data.subBtnColor;
        subBtnEl.style.borderColor = data.subBtnColor;
      }
    } catch (e) {
      console.warn('Error applying custom community settings:', e);
    }
  }

  // Initial load of custom community settings
  applyCustomCommunitySettings(currentLang);

  // Real-time synchronization event
  window.addEventListener('medicare_community_updated', () => {
    applyCustomCommunitySettings(currentLang);
  });

  /* ------------------------------------------------------------------
     10. CUSTOM CMS TRUST & ASSURANCE BADGES RENDERER
     ------------------------------------------------------------------ */
  const DEFAULT_TRUST_DATA = {
    enabled: true,
    bgColor: '#062E29',
    textColor: '#FFFFFF',
    items: [
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
    ]
  };

  function renderTrustBadges(lang = currentLang) {
    const trustBar = document.getElementById('mc-trust-bar');
    const trustGrid = document.getElementById('mc-trust-grid');
    if (!trustBar || !trustGrid) return;

    let data = DEFAULT_TRUST_DATA;
    try {
      const raw = localStorage.getItem('medicare_trust_badges');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          data = { ...DEFAULT_TRUST_DATA, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Error reading trust badges settings:', e);
    }

    if (data.enabled === false) {
      trustBar.style.display = 'none';
      return;
    }

    trustBar.style.display = '';
    if (data.bgColor) trustBar.style.backgroundColor = data.bgColor;
    if (data.textColor) trustBar.style.color = data.textColor;

    const isAR = lang === 'ar';
    const items = data.items || DEFAULT_TRUST_DATA.items;

    trustGrid.innerHTML = items.map(it => {
      const title = isAR ? (it.titleAr || it.titleEn) : (it.titleEn || it.titleAr);
      const sub = isAR ? (it.subAr || it.subEn) : (it.subEn || it.subAr);
      return `
        <div class="mc-trust-item">
          <div class="mc-trust-icon">${it.icon || '🛡️'}</div>
          <div>
            <div class="mc-trust-title" style="color:${data.textColor || '#FFFFFF'};">${title || ''}</div>
            <div class="mc-trust-sub">${sub || ''}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Initial load
  renderTrustBadges(currentLang);

  // Real-time synchronization events
  window.addEventListener('medicare_trust_badges_updated', () => {
    renderTrustBadges(currentLang);
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'medicare_trust_badges') renderTrustBadges(currentLang);
  });

  /* ------------------------------------------------------------------
     11. SCROLL-REVEAL INTERSECTION OBSERVER
     ------------------------------------------------------------------ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.mc-reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      el.classList.add('visible');
    }
    observer.observe(el);
  });

  /* ------------------------------------------------------------------
     10. NEWSLETTER SUBSCRIPTION HANDLER
     ------------------------------------------------------------------ */
  window.handleNewsletterSubmit = async function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-input');
    const msgEl      = document.getElementById('newsletter-msg');
    const submitBtn  = document.getElementById('subscribe-btn');
    const email = emailInput ? emailInput.value.trim() : '';

    // Basic email format validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      if (msgEl) {
        msgEl.textContent = '⚠️ Please enter a valid email address.';
        msgEl.style.color = 'var(--color-warning-600, #d97706)';
      }
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Subscribing…'; }

    try {
      const result = window.MedicareDB
        ? await window.MedicareDB.subscribeNewsletter(email)
        : { success: false };

      if (result && result.success) {
        if (msgEl) {
          msgEl.textContent = '✓ Subscribed! Welcome to the MEDICARE community.';
          msgEl.style.color = 'var(--color-success-600, #16a34a)';
        }
        if (emailInput) emailInput.value = '';
        showToast('✓ Subscribed to MEDICARE updates!');
      } else {
        if (msgEl) {
          msgEl.textContent = '⚠️ Could not subscribe. Please try again.';
          msgEl.style.color = 'var(--color-warning-600, #d97706)';
        }
      }
    } catch (err) {
      console.warn('[Newsletter] Subscription error:', err);
      if (msgEl) {
        msgEl.textContent = '⚠️ Network error. Please try again later.';
        msgEl.style.color = 'var(--color-warning-600, #d97706)';
      }
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Subscribe'; }
    }
  };

  /* ------------------------------------------------------------------
     DYNAMIC FEATURED & BEST-SELLER PRODUCTS ENGINE
     ------------------------------------------------------------------ */
  async function renderFeaturedProducts(lang = currentLang) {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;

    let products = [];
    if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        products = await window.MedicareDB.getProducts({ limit: 12 });
      } catch (e) {
        console.warn('[Storefront] getProducts failed:', e);
      }
    }

    if (!products || products.length === 0) {
      if (typeof window !== 'undefined' && window.PRODUCT_CATALOG) {
        products = [...window.PRODUCT_CATALOG];
      }
    }

    // Merge custom products from admin
    try {
      const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      customProds.forEach(cp => {
        if (!products.some(p => p.id === cp.id)) {
          products.unshift(cp);
        }
      });
    } catch (e) {}

    // Apply stock overrides from admin / checkout
    const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');

    if (products.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--color-neutral-500);">No products found in catalog.</div>';
      return;
    }

    const featured = products.slice(0, 8);

    const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="%23f8fafc"><rect width="400" height="400" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="50" fill="%2394a3b8">🩺</text></svg>';
    grid.innerHTML = featured.map(p => {
      const stock = overrides[p.id] !== undefined ? Number(overrides[p.id]) : (Number(p.stock) ?? 10);
      const isOutOfStock = stock <= 0;
      const title = (lang === 'ar' && p.name_ar) ? p.name_ar : p.name;
      const specialty = p.specialty || 'medicine';
      const img = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : (p.image || p.img || defaultPlaceholderSvg);
      const badgeText = isOutOfStock
        ? (lang === 'ar' ? '⚠️ غير متوفر' : '⚠️ Out of Stock')
        : (p.is_bestseller ? (lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Seller') : (p.is_new ? (lang === 'ar' ? 'جديد' : 'New') : ''));

      return `
        <div class="mc-card mc-product-card" data-specialty="${specialty}" style="cursor:pointer; opacity:${isOutOfStock ? '0.75' : '1'};" onclick="window.location.href='product-detail.html?id=${p.id}'">
          <div class="mc-product-img-wrapper">
            <img src="${img}" alt="${title}" class="mc-product-img" loading="lazy" onerror="this.src='${defaultPlaceholderSvg}'">
            <div class="mc-product-badge-group">
              ${badgeText ? `<span class="mc-badge ${isOutOfStock ? 'mc-badge-neutral' : 'mc-badge-primary'}">${badgeText}</span>` : ''}
              ${p.material ? `<span class="mc-badge mc-badge-accent">${p.material}</span>` : ''}
            </div>
            <button class="mc-wishlist-btn" onclick="event.stopPropagation(); if(window.toggleWishlist) window.toggleWishlist('${p.id}')" aria-label="Add to Wishlist">♥</button>
          </div>
          <div class="mc-product-content">
            <div class="mc-product-category">${p.category || 'Medical Wear'} • ${specialty}</div>
            <h3 class="mc-product-title">${title}</h3>
            <p class="mc-product-desc">${p.description ? p.description.substring(0, 90) + '...' : ''}</p>
            <div class="mc-product-footer">
              <div class="mc-price-group">
                <span class="mc-price-main">${Number(p.price || 0).toLocaleString()} DZD</span>
                ${p.original_price ? `<span class="mc-price-original">${Number(p.original_price).toLocaleString()} DZD</span>` : ''}
                <span class="mc-price-sub" style="color:${isOutOfStock ? '#EF4444' : '#15803D'}; font-weight:700;">
                  ${isOutOfStock ? (lang === 'ar' ? '⚠️ نفد من المخزون' : '⚠️ Out of Stock') : (lang === 'ar' ? `المتوفر: ${stock} قطع` : `In Stock: ${stock} units`)}
                </span>
              </div>
              <button class="mc-btn mc-btn-primary mc-btn-sm mc-add-to-cart-btn" 
                ${isOutOfStock ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}
                onclick="event.stopPropagation(); if(window.addToCart) window.addToCart('${p.id}', '${title.replace(/'/g, "\\'")}', '${(p.name_ar || title).replace(/'/g, "\\'")}', ${p.price}, '${img}')">
                ${isOutOfStock ? (lang === 'ar' ? 'غير متوفر' : 'Sold Out') : (lang === 'ar' ? 'أضف للسلة' : 'Add to Cart')}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------
     DYNAMIC HOMEPAGE BUNDLES & STARTER KITS (WHAT'S INCLUDED BREAKDOWN)
     ------------------------------------------------------------------ */
  function renderHomeBundles(lang = currentLang) {
    const section = document.getElementById('starter-kits');
    const container = document.getElementById('starter-kits-container');
    if (!section || !container) return;

    let bundles = [];
    try {
      const raw = localStorage.getItem('medicare_bundles');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          bundles = parsed.filter(b => b.active !== false);
        }
      }
    } catch (e) {}

    const allProds = getLiveSearchProducts();

    // Default canonical bundle if none configured in admin
    if (bundles.length === 0 && allProds.length > 0) {
      const defaultIds = allProds.slice(0, 5).map(p => p.id);
      bundles = [{
        id: 'bundle-clinical-look',
        name: 'Complete The Clinical Look',
        name_ar: 'باقة المظهر السريري المتكامل',
        name_fr: 'Pack Clinique Complet',
        bundlePrice: 15000,
        productIds: defaultIds,
        active: true
      }];
    }

    if (bundles.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';

    const isAR = lang === 'ar';
    const isFR = lang === 'fr';
    const defaultPlaceholderSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="%23f8fafc"><rect width="80" height="80" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36">🎁</text></svg>';

    container.innerHTML = bundles.map(bundle => {
      let items = (bundle.productIds || []).map(id => allProds.find(p => String(p.id) === String(id))).filter(Boolean);
      if (items.length === 0 && allProds.length > 0) {
        items = allProds.slice(0, Math.min(5, allProds.length));
      }

      const totalVal = items.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);
      const bundlePrice = Number(bundle.bundlePrice || 15000);
      const anchorImg = (items[0]?.images && items[0]?.images[0]) || items[0]?.image || items[0]?.img || defaultPlaceholderSvg;
      const savings = Math.max(0, totalVal - bundlePrice);
      const savingsPct = totalVal > 0 ? Math.round((savings / totalVal) * 100) : 0;

      const bundleTitle = isAR ? (bundle.name_ar || bundle.name) : (isFR ? (bundle.name_fr || bundle.name) : bundle.name);
      const badgeText = isAR ? '✨ الباقة الأكثر توفيراً — خصم حقيقي' : (isFR ? '✨ MEILLEURE OFFRE — PACK CLINIQUE' : '✨ BEST VALUE — CLINICAL BUNDLE');
      const whatsIncludedTitle = isAR ? '🩺 ماذا تتضمن هذه الباقة؟' : (isFR ? '🩺 Ce qui est inclus dans ce pack :' : "🩺 What's Included in This Bundle:");
      const totalValLabel = isAR ? 'القيمة الإجمالية منفصلة:' : (isFR ? 'Valeur totale à l’unité :' : 'Total Individual Value:');
      const youSaveLabel = isAR ? 'وفرت:' : (isFR ? 'Vous Économisez :' : 'You Save:');
      const orderBtnLabel = isAR 
        ? `اطلب الباقة الآن (${bundlePrice.toLocaleString('ar-DZ')} دج)` 
        : (isFR ? `Commander le Pack (${bundlePrice.toLocaleString('fr-FR')} DZD)` : `Order Bundle (${bundlePrice.toLocaleString('en-US')} DZD)`);

      const formattedTotalVal = window.MC_I18N ? window.MC_I18N.formatCurrency(totalVal, lang) : `${totalVal.toLocaleString()} DZD`;
      const formattedBundlePrice = window.MC_I18N ? window.MC_I18N.formatCurrency(bundlePrice, lang) : `${bundlePrice.toLocaleString()} DZD`;
      const formattedSavings = window.MC_I18N ? window.MC_I18N.formatCurrency(savings, lang) : `${savings.toLocaleString()} DZD`;

      return `
        <div class="mc-bundle-card">
          <div class="mc-bundle-img-wrapper">
            <img src="${anchorImg}" alt="${bundleTitle}" class="mc-bundle-img">
            ${savingsPct > 0 ? `<span class="mc-bundle-save-badge">${isAR ? `وفر ${savingsPct}%` : (isFR ? `-${savingsPct}%` : `SAVE ${savingsPct}%`)}</span>` : ''}
          </div>

          <div class="mc-bundle-info">
            <span class="mc-bundle-tag-badge">${badgeText}</span>
            <h3 class="mc-product-title" style="font-size:1.45rem; font-weight:800; color:var(--color-primary-950); margin:0.25rem 0 0.5rem 0;">
              ${bundleTitle}
            </h3>

            <!-- What's Included Section -->
            <div class="mc-bundle-included-box">
              <div class="mc-bundle-included-title">
                ${whatsIncludedTitle}
                <span style="font-size:0.75rem; font-weight:600; color:var(--color-primary-700); background:var(--color-primary-100); padding:2px 8px; border-radius:12px;">
                  ${items.length} ${isAR ? 'قطع' : (isFR ? 'articles' : 'items')}
                </span>
              </div>
              <div class="mc-bundle-items-grid">
                ${items.map(it => {
                  const itName = isAR ? (it.nameAr || it.name) : (isFR ? (it.nameFr || it.name) : it.name);
                  const itPriceFormatted = window.MC_I18N ? window.MC_I18N.formatCurrency(it.price, lang) : `${it.price.toLocaleString()} DZD`;
                  return `
                    <div class="mc-bundle-item-row">
                      <img src="${it.img || defaultPlaceholderSvg}" alt="${itName}" class="mc-bundle-item-thumb" onerror="this.src='${defaultPlaceholderSvg}'">
                      <div class="mc-bundle-item-meta">
                        <span class="mc-bundle-item-name" title="${itName}">1× ${itName}</span>
                        <span class="mc-bundle-item-price">${itPriceFormatted}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Pricing Summary & CTA -->
            <div class="mc-bundle-pricing-summary">
              <div class="mc-bundle-price-block">
                ${totalVal > bundlePrice ? `
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="mc-bundle-original-val">${totalValLabel} ${formattedTotalVal}</span>
                    <span class="mc-bundle-save-text">(${youSaveLabel} ${formattedSavings})</span>
                  </div>
                ` : ''}
                <div class="mc-bundle-final-price">${formattedBundlePrice}</div>
              </div>

              <button class="mc-btn mc-btn-accent mc-order-bundle-btn" style="padding:0.85rem 1.75rem; font-size:1rem; font-weight:700;"
                onclick="if(window.addToCart) window.addToCart('${bundle.id}', '${bundleTitle.replace(/'/g, "\\'")}', '${(bundle.name_ar || bundleTitle).replace(/'/g, "\\'")}', ${bundlePrice}, '${anchorImg}')">
                ${orderBtnLabel}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ------------------------------------------------------------------
     DYNAMIC CATEGORY COUNTS — real product counts per category
     ------------------------------------------------------------------ */
  async function updateCategoryCounts() {
    // Gather all live products from same sources as featured
    let allProducts = [];

    if (window.MedicareDB && typeof window.MedicareDB.getProducts === 'function') {
      try {
        const dbProds = await window.MedicareDB.getProducts({ limit: 500 });
        if (Array.isArray(dbProds)) allProducts.push(...dbProds);
      } catch (e) {}
    }

    try {
      const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      customProds.forEach(cp => {
        if (!allProducts.some(p => String(p.id) === String(cp.id))) {
          allProducts.push(cp);
        }
      });
    } catch (e) {}

    if (window.PRODUCT_CATALOG && Array.isArray(window.PRODUCT_CATALOG)) {
      window.PRODUCT_CATALOG.forEach(p => {
        if (!allProducts.some(c => String(c.id) === String(p.id))) {
          allProducts.push(p);
        }
      });
    }

    const total = allProducts.length;
    if (total === 0) return; // Nothing loaded yet, keep static text

    // Count per category type keyword match
    function countByKeyword(keywords) {
      return allProducts.filter(p => {
        const cat = ((p.category || '') + ' ' + (p.specialty || '') + ' ' + (p.name || '')).toLowerCase();
        return keywords.some(kw => cat.includes(kw));
      }).length;
    }

    const scrubsCount     = countByKeyword(['scrub', 'سكراب']);
    const labCoatCount    = countByKeyword(['lab coat', 'lab_coat', 'blouse', 'معطف', 'مختبر']);
    const footwearCount   = countByKeyword(['footwear', 'shoe', 'clog', 'حذاء']);
    const diagnosticCount = countByKeyword(['diagnostic', 'stethoscope', 'monitor', 'تشخيص']);
    const dentistryCount  = countByKeyword(['dentist', 'dental', 'أسنان']);

    // Update DOM — map card index to count (always overwrite even if 0)
    const catCounts = document.querySelectorAll('.mc-cat-count');
    if (catCounts.length >= 5) {
      catCounts[0].textContent = scrubsCount > 0     ? `${scrubsCount} products`     : (total > 0 ? '0 products' : catCounts[0].textContent);
      catCounts[1].textContent = labCoatCount > 0    ? `${labCoatCount} products`    : (total > 0 ? '0 products' : catCounts[1].textContent);
      catCounts[2].textContent = footwearCount > 0   ? `${footwearCount} products`   : (total > 0 ? '0 products' : catCounts[2].textContent);
      catCounts[3].textContent = diagnosticCount > 0 ? `${diagnosticCount} products` : (total > 0 ? '0 products' : catCounts[3].textContent);
      catCounts[4].textContent = dentistryCount > 0  ? `${dentistryCount} products`  : (total > 0 ? '0 products' : catCounts[4].textContent);
      // catCounts[5] is Starter Kits "Save 25%" — leave as-is
    }

    // Update all "48 Products" / "All 48" text occurrences with real total
    if (total > 0) {
      document.querySelectorAll('a, button, span').forEach(el => {
        const txt = el.textContent || '';
        if (/\d+ Products?/i.test(txt) || /All \d+/i.test(txt) || /Shop All \d+/i.test(txt)) {
          el.textContent = el.textContent
            .replace(/All \d+ Products?/gi, `All ${total} Products`)
            .replace(/Shop All \d+ Products?/gi, `Shop All ${total} Products`)
            .replace(/View Full Catalog — All \d+ Products?/gi, `View Full Catalog — All ${total} Products`)
            .replace(/Browse All \d+ Products?/gi, `Browse All ${total} Products`)
            .replace(/Shop All \d+/gi, `Shop All ${total}`);
        }
      });

      // Update the dedicated view-all-btn
      const viewAllBtn = document.getElementById('view-all-btn');
      if (viewAllBtn) viewAllBtn.textContent = `🛍️ Shop All ${total} Products →`;
    }
  }

  // Initial Featured Products, Bundles & Category Counts render
  renderFeaturedProducts();
  renderHomeBundles();
  updateCategoryCounts();

  /* ------------------------------------------------------------------
     HOMEPAGE REVIEWS — load real reviews from Supabase
     ------------------------------------------------------------------ */
  async function loadHomeReviews() {
    const grid = document.getElementById('home-reviews-grid');
    if (!grid) return;

    let reviews = [];
    try {
      if (window.MedicareDB && typeof window.MedicareDB.getReviews === 'function') {
        const res = await window.MedicareDB.getReviews({ limit: 6 });
        if (Array.isArray(res)) reviews = res;
        else if (res && Array.isArray(res.data)) reviews = res.data;
      }
    } catch (e) {
      console.warn('[Home] Could not load reviews:', e);
    }

    if (reviews.length === 0) {
      reviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]').slice(0, 6);
    }

    if (reviews.length === 0) {
      grid.innerHTML = `
        <div class="mc-review-card" style="grid-column:1/-1; text-align:center; padding:3rem 1rem; color:var(--color-neutral-400);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">💬</div>
          <div style="font-size:15px; font-weight:700; margin-bottom:0.4rem;">No Reviews Yet</div>
          <div style="font-size:13px;">Be the first to leave a review! \u0643\u0646 \u0623\u0648\u0644 \u0645\u0646 \u064a\u0643\u062a\u0628 \u062a\u0642\u064a\u064a\u0645\u0627\u064b.</div>
        </div>`;
      return;
    }

    grid.innerHTML = reviews.map(r => {
      const rating   = Math.round(r.rating || 5);
      const stars    = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
      const name     = r.customer_name || r.author || 'Verified Customer';
      const role     = r.specialty_tag || r.role || 'Medical Professional';
      const comment  = r.comment || r.body || '';
      const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'MD';
      return `
        <div class="mc-review-card">
          <div class="mc-review-stars">${stars}</div>
          <p class="mc-review-text">"${comment}"</p>
          <div class="mc-review-author">
            <div class="mc-avatar">${initials}</div>
            <div class="mc-author-info">
              <span class="mc-author-name">${name}</span>
              <span class="mc-author-role">${role}</span>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  loadHomeReviews();

  // Listeners for live product and stock updates from Admin & Checkout
  window.addEventListener('medicare_stock_updated', () => renderFeaturedProducts());
  window.addEventListener('medicare_products_updated', () => {
    renderFeaturedProducts();
    renderHomeBundles();
    updateCategoryCounts();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'medicare_stock_overrides' || e.key === 'medicare_custom_products') {
      renderFeaturedProducts();
      updateCategoryCounts();
    }
    if (e.key === 'medicare_bundles') {
      renderHomeBundles();
    }
    if (e.key === 'medicare_reviews_db') {
      loadHomeReviews();
    }
  });

  // ── BroadcastChannel: استقبال تحديثات المنتجات من الأدمن فوراً (cross-tab)
  try {
    const _homeBc = new BroadcastChannel('medicare_products_channel');
    _homeBc.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'product_updated') {
        renderFeaturedProducts();
        renderHomeBundles();
        updateCategoryCounts();
      }
    });
  } catch(e) {}

});

