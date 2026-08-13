/* ==========================================================================
   MEDICARE — E-COMMERCE HOMEPAGE INTERACTIVE ENGINE  v2.0
   Full bilingual EN/AR, Cart Drawer, Hero Carousel, Search, RTL, Scroll-Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* ------------------------------------------------------------------
     STATE
     ------------------------------------------------------------------ */
  let currentLang = 'en';
  // Cart is managed globally by MedicareCart (src/cart.js)
  let wishlistCount = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]').length || 2;
  let currentSlide = 0;
  const TOTAL_SLIDES = 3;
  let autoSlideTimer = null;

  /* ------------------------------------------------------------------
     DOM REFS
     ------------------------------------------------------------------ */
  const htmlRoot       = document.documentElement;
  const langToggleBtn  = document.getElementById('lang-toggle-btn');
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
     BILINGUAL COPY MATRIX
     ------------------------------------------------------------------ */
  const copy = {
    en: {
      langBtn: '🌐 العربية',
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
      specialtyTabs: ['All Specialties (الكل)', 'Medicine (الطب)', 'Pharmacy (الصيدلة)', 'Dentistry (طب الأسنان)', 'Nursing (التمريض)'],
      sectionFeatured: 'Featured & Best-Seller Essentials',
      sectionFeaturedSub: 'Highest rated products engineered for daily clinical practice.',
      sectionKits: 'Student Starter Kits & Bundles',
      sectionKitsSub: 'All-in-one curated equipment bundles for 1st-year & clinical students.',
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
      langBtn: '🌐 English',
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
     2. SMART PREDICTIVE SEARCH
     ------------------------------------------------------------------ */
  const PRODUCTS = [
    { id:'MC-101', name:'Obsidian Flex Antimicrobial Scrubs', nameAr:'سكراب أوبسيديان المضاد للبكتيريا', cat:'Medical Wear', catAr:'ملابس طبية', price:'10,700 DZD', img:'assets/medicare_scrubs_hero_1786614154492.png' },
    { id:'MC-202', name:'Titanium Master Precision Stethoscope', nameAr:'سماعة تيتانيوم الدقيقة', cat:'Diagnostic', catAr:'تشخيص', price:'19,800 DZD', img:'assets/medicare_stethoscope_1786614166370.png' },
    { id:'MC-303', name:'Executive Fluid-Shield Lab Coat', nameAr:'معطف مختبر مقاوم للسوائل', cat:'Lab Coats', catAr:'معاطف', price:'13,400 DZD', img:'assets/medicare_lab_coat_1786614177321.png' },
    { id:'MC-404', name:'Obsidian Clinical Cushion Clogs', nameAr:'قبقاب طبي بمقدمة مغلقة', cat:'Footwear', catAr:'أحذية', price:'9,000 DZD', img:'assets/medicare_footwear_1786615096505.png' },
    { id:'MC-KIT-1', name:'1st Year Pharmacy Starter Kit', nameAr:'حقيبة الصيدلة — السنة الأولى', cat:'Starter Kits', catAr:'حقائب المبتدئين', price:'17,400 DZD', img:'assets/medicare_starter_kit_1786615195273.png' },
    { id:'MC-KIT-2', name:'Clinical Surgery Starter Pack', nameAr:'حقيبة الجراحة السريرية', cat:'Starter Kits', catAr:'حقائب المبتدئين', price:'37,200 DZD', img:'assets/medicare_medical_bag_1786614187700.png' }
  ];

  if (searchInput && searchDropdown) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { searchDropdown.classList.remove('show'); return; }

      const t = copy[currentLang];
      const hits = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.cat.toLowerCase().includes(q) ||
        p.catAr.includes(q)
      );

      if (hits.length === 0) {
        searchDropdown.innerHTML = `<div style="padding:.75rem;font-size:13px;color:var(--color-neutral-500)">${currentLang==='ar'?'لا توجد نتائج':'No results found'}</div>`;
      } else {
        searchDropdown.innerHTML = `
          <div class="mc-search-group-title">${currentLang==='ar'?'نتائج فورية':'Quick results'}</div>
          ${hits.map(p => `
            <a href="product-detail.html?id=${p.id}" class="mc-search-item" onclick="searchDropdown.classList.remove('show')">
              <img src="${p.img}" class="mc-search-item-img" alt="${currentLang==='ar'?p.nameAr:p.name}">
              <div class="mc-search-item-info">
                <span class="mc-search-item-title">${currentLang==='ar'?p.nameAr:p.name}</span>
                <span class="mc-search-item-price">${p.price} • ${currentLang==='ar'?p.catAr:p.cat}</span>
              </div>
            </a>
          `).join('')}`;
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
     6. FULL BILINGUAL RTL / LTR SWITCH
     ------------------------------------------------------------------ */
  function applyLanguage(lang) {
    const t = copy[lang];
    const isRTL = lang === 'ar';

    htmlRoot.setAttribute('lang', lang);
    htmlRoot.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Lang toggle button
    if (langToggleBtn) langToggleBtn.querySelector('.btn-text').textContent = t.langBtn;

    // Announcement bar
    if (announceBar) {
      announceBar.innerHTML = t.announceItems.map(item =>
        `<span class="mc-announce-item">${item}</span>`
      ).join('');
    }

    // Search
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    // Cart drawer texts
    renderCart();

    // Hero slides — re-render in-place
    const slides = sliderTrack?.querySelectorAll('.mc-slide');
    if (slides) {
      slides.forEach((slide, i) => {
        const tagEl    = slide.querySelector('.mc-slide-tag');
        const titleEl  = slide.querySelector('.mc-slide-title');
        const descEl   = slide.querySelector('.mc-slide-desc');
        const ctasEl   = slide.querySelector('.mc-slide-ctas');
        if (tagEl)   tagEl.textContent = t.heroTag[i];
        if (titleEl) titleEl.textContent = t.heroTitle[i];
        if (descEl)  descEl.textContent = t.heroDesc[i];
        if (ctasEl && t.heroCta[i]) {
          const anchors = ctasEl.querySelectorAll('a');
          t.heroCta[i].forEach((label, j) => {
            if (anchors[j]) anchors[j].textContent = label;
          });
        }
      });
    }

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

    // Product "Add to Cart" buttons
    document.querySelectorAll('.mc-add-to-cart-btn').forEach(btn => {
      btn.textContent = t.addToCart;
    });

    // Bundle order buttons
    document.querySelectorAll('.mc-order-bundle-btn').forEach(btn => {
      btn.textContent = t.orderBundle;
    });

    showToast(isRTL ? '🌐 تم التبديل إلى العربية' : '🌐 Switched to English');
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  }

  function setAttr(id, attr, val) {
    const el = document.getElementById(id);
    if (el && val) el.setAttribute(attr, val);
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ar' : 'en';
      applyLanguage(currentLang);
    });
  }

  /* ------------------------------------------------------------------
     7. SCROLL-REVEAL INTERSECTION OBSERVER
     ------------------------------------------------------------------ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.mc-reveal').forEach(el => observer.observe(el));

});
