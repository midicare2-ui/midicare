/* ==========================================================================
   MEDICARE — CATEGORY PAGE INTERACTIVE ENGINE
   Filter system, Sort, Pagination, Skeleton, Empty State, Cart, RTL
   ========================================================================== */

/* ------------------------------------------------------------------
   PRODUCT DATA CATALOG (48 products, 16 per page)
   ------------------------------------------------------------------ */
const CATALOG = [
  { id:'MC-101', name:'Obsidian Flex Antimicrobial Scrub Set', nameAr:'طقم سكراب أوبسيديان المضاد للبكتيريا', specialty:'medicine', price:10700, originalPrice:13400, rating:4.8, reviews:142, material:'antimicrobial', brand:'medicare', badge:'sale', colors:['#0E4D45','#1E3A5F','#6B7280'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['XS','S','M','L','XL','XXL'], isNew:false, isBestSeller:true },
  { id:'MC-102', name:'ClinFlex 4-Way Stretch Scrub Pants', nameAr:'بنطلون سكراب مرن بـ 4 اتجاهات', specialty:'nursing', price:6800, originalPrice:null, rating:4.7, reviews:98, material:'flex', brand:'clinflex', badge:'new', colors:['#0F766E','#7C3AED','#1D4ED8'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL'], isNew:true, isBestSeller:false },
  { id:'MC-103', name:'Executive Fluid-Shield Lab Coat', nameAr:'معطف مختبر مقاوم للسوائل', specialty:'pharmacy', price:13400, originalPrice:16700, rating:4.9, reviews:211, material:'fluid-shield', brand:'medicare', badge:'hot', colors:['#F8F8F8','#1E3A5F'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL','XXL'], isNew:false, isBestSeller:true },
  { id:'MC-104', name:'SurgicalPro Nano-Coat Lab Coat', nameAr:'معطف مختبر بطلاء نانو', specialty:'medicine', price:15800, originalPrice:19000, rating:4.6, reviews:67, material:'nano-coating', brand:'surgicalpro', badge:'sale', colors:['#F8F8F8','#6B7280'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_stethoscope_1786614166370.png', sizes:['XS','S','M','L','XL'], isNew:false, isBestSeller:false },
  { id:'MC-105', name:'Pharmacy Antimicrobial Tunic Top', nameAr:'قميص صيدلة مضاد للبكتيريا', specialty:'pharmacy', price:7200, originalPrice:null, rating:4.5, reviews:54, material:'antimicrobial', brand:'pharmawear', badge:'new', colors:['#0E4D45','#BE185D','#7C3AED'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_footwear_1786615096505.png', sizes:['XS','S','M','L'], isNew:true, isBestSeller:false },
  { id:'MC-106', name:'Dental Flex Short-Sleeve Scrub Top', nameAr:'قميص سكراب دنتال قصير الكم', specialty:'dentistry', price:8500, originalPrice:10200, rating:4.7, reviews:89, material:'flex', brand:'medicare', badge:'sale', colors:['#1D4ED8','#6B7280','#0F766E'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['S','M','L','XL'], isNew:false, isBestSeller:false },
  { id:'MC-107', name:'Nursing Cotton Premium Scrub Set', nameAr:'طقم سكراب تمريض قطن فاخر', specialty:'nursing', price:9300, originalPrice:11200, rating:4.4, reviews:73, material:'cotton', brand:'medicare', badge:null, colors:['#0E4D45','#BE185D','#F8F8F8'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['XS','S','M','L','XL','XXL'], isNew:false, isBestSeller:false },
  { id:'MC-108', name:'Titanium Master Diagnostic Stethoscope', nameAr:'سماعة تيتانيوم الدقيقة', specialty:'medicine', price:19800, originalPrice:24000, rating:5.0, reviews:317, material:'antimicrobial', brand:'medicare', badge:'hot', colors:['#0E4D45','#1E3A5F','#6B7280'], img:'assets/medicare_stethoscope_1786614166370.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:false, isBestSeller:true },
  { id:'MC-109', name:'Obsidian Antimicrobial V-Neck Scrub', nameAr:'سكراب رقبة V مضاد للبكتيريا', specialty:'medicine', price:5900, originalPrice:null, rating:4.6, reviews:44, material:'antimicrobial', brand:'clinflex', badge:'new', colors:['#1E3A5F','#0E4D45'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['S','M','L','XL'], isNew:true, isBestSeller:false },
  { id:'MC-110', name:'Clinical Cushion Antibacterial Clogs', nameAr:'قبقاب طبي بمقدمة مغلقة', specialty:'nursing', price:9000, originalPrice:11300, rating:4.5, reviews:128, material:'antimicrobial', brand:'medicare', badge:'sale', colors:['#0E4D45','#F8F8F8','#1E3A5F'], img:'assets/medicare_footwear_1786615096505.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['37','38','39','40','41','42','43','44','45'], isNew:false, isBestSeller:true },
  { id:'MC-111', name:'Doctor Elite Medical Equipment Bag', nameAr:'حقيبة المعدات الطبية للأطباء', specialty:'medicine', price:14500, originalPrice:17800, rating:4.8, reviews:96, material:'fluid-shield', brand:'surgicalpro', badge:'sale', colors:['#0E4D45','#1E3A5F','#6B7280'], img:'assets/medicare_medical_bag_1786614187700.png', img2:'assets/medicare_stethoscope_1786614166370.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-112', name:'1st Year Pharmacy Starter Kit', nameAr:'حقيبة الصيدلة — السنة الأولى', specialty:'pharmacy', price:17400, originalPrice:23400, rating:4.9, reviews:183, material:'antimicrobial', brand:'medicare', badge:'bundle', colors:['#0E4D45'], img:'assets/medicare_starter_kit_1786615195273.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:false, isBestSeller:true },
  { id:'MC-113', name:'SurgicalPro Fluid-Resistant Gloves', nameAr:'قفازات مقاومة للسوائل', specialty:'medicine', price:3200, originalPrice:null, rating:4.3, reviews:31, material:'fluid-shield', brand:'surgicalpro', badge:'new', colors:['#F8F8F8','#0E4D45'], img:'assets/medicare_stethoscope_1786614166370.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL'], isNew:true, isBestSeller:false },
  { id:'MC-114', name:'Dental Operator Fluid-Shield Apron', nameAr:'مريلة طب الأسنان المقاومة للسوائل', specialty:'dentistry', price:6500, originalPrice:8000, rating:4.6, reviews:57, material:'fluid-shield', brand:'medicare', badge:'sale', colors:['#0E4D45','#F8F8F8'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-115', name:'Clinical Surgery Resident Starter Pack', nameAr:'حقيبة الجراحة السريرية للمقيمين', specialty:'medicine', price:37200, originalPrice:47900, rating:5.0, reviews:249, material:'antimicrobial', brand:'medicare', badge:'bundle', colors:['#0E4D45'], img:'assets/medicare_medical_bag_1786614187700.png', img2:'assets/medicare_starter_kit_1786615195273.png', sizes:['ONE'], isNew:false, isBestSeller:true },
  { id:'MC-116', name:'ClinFlex Compression Support Socks', nameAr:'جوارب ضغط طبية دعم مكثف', specialty:'nursing', price:2800, originalPrice:3500, rating:4.4, reviews:64, material:'flex', brand:'clinflex', badge:null, colors:['#0E4D45','#6B7280','#F8F8F8'], img:'assets/medicare_footwear_1786615096505.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL'], isNew:false, isBestSeller:false },
  // Page 2
  { id:'MC-117', name:'Nano-Coat Pharmacist Lab Coat L/S', nameAr:'معطف صيدلاني بطلاء نانو', specialty:'pharmacy', price:16900, originalPrice:20500, rating:4.7, reviews:88, material:'nano-coating', brand:'surgicalpro', badge:'sale', colors:['#F8F8F8','#1E3A5F'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL','XXL'], isNew:false, isBestSeller:false },
  { id:'MC-118', name:'Antimicrobial Nurse Cap Pack (5x)', nameAr:'طاقية تمريض مضادة للبكتيريا (5 قطع)', specialty:'nursing', price:1800, originalPrice:null, rating:4.2, reviews:29, material:'antimicrobial', brand:'pharmawear', badge:'new', colors:['#F8F8F8','#6B7280'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_footwear_1786615096505.png', sizes:['ONE'], isNew:true, isBestSeller:false },
  { id:'MC-119', name:'Dental Loupes Protective Carry Case', nameAr:'حافظة نظارة طب الأسنان', specialty:'dentistry', price:4100, originalPrice:5200, rating:4.5, reviews:42, material:'cotton', brand:'medicare', badge:'sale', colors:['#1E3A5F','#6B7280'], img:'assets/medicare_medical_bag_1786614187700.png', img2:'assets/medicare_stethoscope_1786614166370.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-120', name:'Surgery Elite 4-Pocket Scrub Top', nameAr:'قميص سكراب جراحي 4 جيوب', specialty:'medicine', price:7600, originalPrice:9200, rating:4.8, reviews:134, material:'flex', brand:'medicare', badge:'hot', colors:['#0E4D45','#6B7280','#1D4ED8'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['XS','S','M','L','XL'], isNew:false, isBestSeller:true },
  { id:'MC-121', name:'PharmaWear Knee-Length Lab Coat', nameAr:'معطف مختبر طول الركبة', specialty:'pharmacy', price:12100, originalPrice:14800, rating:4.6, reviews:76, material:'cotton', brand:'pharmawear', badge:'sale', colors:['#F8F8F8'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['XS','S','M','L','XL','XXL'], isNew:false, isBestSeller:false },
  { id:'MC-122', name:'Clinical Shoe Cover Dispensing Box', nameAr:'صندوق غطاء الحذاء الطبي', specialty:'medicine', price:2200, originalPrice:null, rating:4.1, reviews:18, material:'fluid-shield', brand:'surgicalpro', badge:null, colors:['#F8F8F8'], img:'assets/medicare_footwear_1786615096505.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-123', name:'Nursing Elite Backpack Medical Bag', nameAr:'حقيبة ظهر تمريض للمعدات', specialty:'nursing', price:11300, originalPrice:13900, rating:4.7, reviews:102, material:'fluid-shield', brand:'medicare', badge:'sale', colors:['#0E4D45','#6B7280','#1E3A5F'], img:'assets/medicare_medical_bag_1786614187700.png', img2:'assets/medicare_starter_kit_1786615195273.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-124', name:'Flex-Tech Dental Scrub Set', nameAr:'طقم سكراب دنتال مرن', specialty:'dentistry', price:9800, originalPrice:12000, rating:4.6, reviews:61, material:'flex', brand:'clinflex', badge:'sale', colors:['#0F766E','#7C3AED','#1D4ED8'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['XS','S','M','L','XL'], isNew:false, isBestSeller:false },
  { id:'MC-125', name:'Precision Aneroid Blood Pressure Monitor', nameAr:'جهاز قياس الضغط الدقيق', specialty:'medicine', price:8700, originalPrice:null, rating:4.9, reviews:198, material:'antimicrobial', brand:'surgicalpro', badge:'new', colors:['#0E4D45','#F8F8F8'], img:'assets/medicare_stethoscope_1786614166370.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:true, isBestSeller:true },
  { id:'MC-126', name:'ClinFlex Unisex Jogger Scrub Pants', nameAr:'بنطلون جوجر سكراب مرن', specialty:'nursing', price:6100, originalPrice:7500, rating:4.5, reviews:87, material:'flex', brand:'clinflex', badge:'sale', colors:['#0E4D45','#6B7280','#BE185D','#7C3AED'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_footwear_1786615096505.png', sizes:['XS','S','M','L','XL','XXL'], isNew:false, isBestSeller:false },
  { id:'MC-127', name:'Executive Embroidered Pharmacy Coat', nameAr:'معطف صيدلة مطرز فاخر', specialty:'pharmacy', price:18500, originalPrice:22000, rating:4.8, reviews:115, material:'nano-coating', brand:'medicare', badge:'hot', colors:['#F8F8F8','#1E3A5F'], img:'assets/medicare_lab_coat_1786614177321.png', img2:'assets/medicare_stethoscope_1786614166370.png', sizes:['S','M','L','XL','XXL'], isNew:false, isBestSeller:false },
  { id:'MC-128', name:'Medicine & Surgery Complete Kit 2026', nameAr:'حقيبة الطب والجراحة الكاملة 2026', specialty:'medicine', price:42000, originalPrice:55000, rating:5.0, reviews:341, material:'antimicrobial', brand:'medicare', badge:'bundle', colors:['#0E4D45'], img:'assets/medicare_starter_kit_1786615195273.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:false, isBestSeller:true },
  { id:'MC-129', name:'Nursing Cotton Comfort Boot Socks', nameAr:'جوارب بوت قطن تمريض مريحة', specialty:'nursing', price:1500, originalPrice:null, rating:4.3, reviews:22, material:'cotton', brand:'pharmawear', badge:null, colors:['#F8F8F8','#0E4D45','#6B7280'], img:'assets/medicare_footwear_1786615096505.png', img2:'assets/medicare_scrubs_hero_1786614154492.png', sizes:['S','M','L','XL'], isNew:false, isBestSeller:false },
  { id:'MC-130', name:'Dental Operative Magnification Visor', nameAr:'واقي طب الأسنان مع تكبير', specialty:'dentistry', price:22000, originalPrice:27500, rating:4.9, reviews:77, material:'fluid-shield', brand:'surgicalpro', badge:'sale', colors:['#F8F8F8','#1E3A5F'], img:'assets/medicare_stethoscope_1786614166370.png', img2:'assets/medicare_medical_bag_1786614187700.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-131', name:'Flex Cotton Blend Scrub Cap Set', nameAr:'طاقية سكراب فلكس قطن (3 قطع)', specialty:'medicine', price:3400, originalPrice:4200, rating:4.4, reviews:47, material:'cotton', brand:'medicare', badge:'sale', colors:['#0E4D45','#F8F8F8','#7C3AED'], img:'assets/medicare_scrubs_hero_1786614154492.png', img2:'assets/medicare_lab_coat_1786614177321.png', sizes:['ONE'], isNew:false, isBestSeller:false },
  { id:'MC-132', name:'Anti-Fatigue Clinical Floor Mat', nameAr:'حصيرة طبية مضادة للإرهاق', specialty:'nursing', price:7800, originalPrice:null, rating:4.6, reviews:39, material:'antimicrobial', brand:'clinflex', badge:'new', colors:['#0E4D45','#6B7280'], img:'assets/medicare_medical_bag_1786614187700.png', img2:'assets/medicare_footwear_1786615096505.png', sizes:['60x90','60x120'], isNew:true, isBestSeller:false },
];

const PRODUCTS_PER_PAGE = 16;
let currentPage = 1;
let filteredProducts = [...CATALOG];
let activeFilters = {};
let selectedSizes = new Set();
let selectedColors = new Set();
let cart = [];
let cartCount = 0;

/* ------------------------------------------------------------------
   DOM REFS
   ------------------------------------------------------------------ */
const productGrid     = document.getElementById('product-grid');
const chipsBar        = document.getElementById('chips-bar');
const paginationEl    = document.getElementById('pagination');
const resultCount     = document.getElementById('result-count');
const resultsSummary  = document.getElementById('results-summary');
const sortSelect      = document.getElementById('sort-select');
const filterOverlay   = document.getElementById('filter-overlay');
const filterTrigger   = document.getElementById('filter-trigger-btn');
const filterSheetClose= document.getElementById('filter-sheet-close');
const sidebarReset    = document.getElementById('sidebar-reset-btn');
const gridViewBtn     = document.getElementById('grid-view-btn');
const listViewBtn     = document.getElementById('list-view-btn');
const catCartBtn      = document.getElementById('cat-cart-btn');
const catCartOverlay  = document.getElementById('cat-cart-overlay');
const catCartClose    = document.getElementById('cat-cart-close');
const catCartBadge    = document.getElementById('cat-cart-badge');
const toast           = document.getElementById('copy-toast');

/* ------------------------------------------------------------------
   UTILITIES
   ------------------------------------------------------------------ */
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

function starsHTML(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function formatPrice(n) { return n.toLocaleString('fr-DZ') + ' DZD'; }

function discountPct(original, current) {
  return original ? Math.round((1 - current / original) * 100) : 0;
}

/* ------------------------------------------------------------------
   SKELETON LOADING — shown on first render
   ------------------------------------------------------------------ */
function renderSkeletons(count = 16) {
  productGrid.innerHTML = Array.from({length: count}).map(() => `
    <div class="mc-skeleton-card" role="listitem" aria-label="Loading product">
      <div class="mc-skeleton-img"></div>
      <div class="mc-skeleton-body">
        <div class="mc-skeleton-text short"></div>
        <div class="mc-skeleton-text wide"></div>
        <div class="mc-skeleton-text medium"></div>
        <div class="mc-skeleton-text short"></div>
        <div class="mc-skeleton-swatches">
          <div class="mc-skeleton-swatch"></div>
          <div class="mc-skeleton-swatch"></div>
          <div class="mc-skeleton-swatch"></div>
        </div>
      </div>
      <div class="mc-skeleton-btn"></div>
    </div>
  `).join('');
}

/* ------------------------------------------------------------------
   PRODUCT CARD RENDERER
   ------------------------------------------------------------------ */
function productCardHTML(p) {
  const disc = discountPct(p.originalPrice, p.price);
  const badgeMap = { sale:'mc-badge-sale', new:'mc-badge-new', hot:'mc-badge-hot', limited:'mc-badge-limited', bundle:'mc-badge-bundle' };
  const badgeLabel = { sale:`−${disc}%`, new:'New', hot:'🔥 Hot', limited:'Limited', bundle:'Bundle' };

  const colorSwatches = p.colors.slice(0, 4).map((c, i) => `
    <button class="mc-card-swatch ${i===0?'active':''}" style="background:${c}" title="${c}" 
      onclick="swapColor(event, '${p.id}', '${c}')" aria-label="Color ${c}"></button>
  `).join('');
  const moreColors = p.colors.length > 4 ? `<span class="mc-swatch-more">+${p.colors.length - 4}</span>` : '';

  return `
    <div class="mc-cat-card" role="listitem" data-id="${p.id}" data-specialty="${p.specialty}" data-price="${p.price}" data-rating="${p.rating}" onclick="window.location.href='product-detail.html?id=${p.id}'">
      <div class="mc-card-img-wrap">
        <img class="mc-card-img-primary" src="${p.img}" alt="${p.name}" loading="lazy">
        <img class="mc-card-img-secondary" src="${p.img2 || p.img}" alt="${p.name} alternate view" loading="lazy">

        <!-- Badges -->
        <div class="mc-card-badges">
          ${p.badge ? `<span class="mc-card-badge ${badgeMap[p.badge] || 'mc-badge-sale'}">${badgeLabel[p.badge] || p.badge}</span>` : ''}
          ${p.isBestSeller ? '<span class="mc-card-badge mc-badge-hot">Best Seller</span>' : ''}
        </div>

        <!-- Wishlist -->
        <button class="mc-card-wishlist" onclick="toggleWishlist(event, this, '${p.name}')" aria-label="Add to wishlist">♥</button>

        <!-- Quick View -->
        <button class="mc-card-quick-view" onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${p.id}'">⚡ View Details</button>
      </div>

      <div class="mc-card-body">
        <span class="mc-card-specialty">${specialtyLabel(p.specialty)}</span>
        <h3 class="mc-card-name">${p.name}</h3>

        <div class="mc-card-stars">
          <span class="mc-stars-display" aria-label="${p.rating} out of 5 stars">${starsHTML(p.rating)}</span>
          <span class="mc-review-count">(${p.reviews})</span>
        </div>

        <div class="mc-card-pricing">
          <span class="mc-card-price">${formatPrice(p.price)}</span>
          ${p.originalPrice ? `<span class="mc-card-original-price">${formatPrice(p.originalPrice)}</span>` : ''}
          ${disc >= 5 ? `<span class="mc-card-discount-pct">−${disc}%</span>` : ''}
        </div>

        <div class="mc-card-swatches">
          ${colorSwatches}${moreColors}
        </div>
      </div>

      <div class="mc-card-footer">
        <button class="mc-card-add-btn" id="add-btn-${p.id}"
          onclick="addToCart(event, '${p.id}', '${p.name.replace(/'/g,"\\'")}', '${p.nameAr.replace(/'/g,"\\'")}', ${p.price}, '${p.img}')">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;
}

function specialtyLabel(s) {
  return { medicine:'🩺 Medicine & Surgery', pharmacy:'💊 Pharmacy', dentistry:'🦷 Dentistry', nursing:'🏥 Nursing' }[s] || s;
}

/* ------------------------------------------------------------------
   EMPTY STATE
   ------------------------------------------------------------------ */
function emptyStateHTML() {
  return `
    <div class="mc-empty-state" role="status">
      <div class="mc-empty-icon">🔍</div>
      <h2 class="mc-empty-title">No products found</h2>
      <p class="mc-empty-desc">We couldn't find any products matching your current filters. Try adjusting or clearing some filters to see more results.</p>
      <div class="mc-empty-suggestions">
        <a href="#" class="mc-empty-suggest-tag" onclick="clearAllFilters(); return false;">Clear all filters</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('medicine'); return false;">Medicine</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('pharmacy'); return false;">Pharmacy</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('nursing'); return false;">Nursing</a>
        <a href="#" class="mc-empty-suggest-tag" onclick="setSpecialty('dentistry'); return false;">Dentistry</a>
      </div>
    </div>
  `;
}

function setSpecialty(s) {
  document.querySelectorAll('input[name="specialty"]').forEach(cb => { cb.checked = cb.value === s; });
  applyFilters();
}

/* ------------------------------------------------------------------
   SORT LOGIC
   ------------------------------------------------------------------ */
function sortProducts(arr) {
  const order = sortSelect?.value || 'best-selling';
  return [...arr].sort((a, b) => {
    switch (order) {
      case 'newest':     return b.isNew - a.isNew;
      case 'price-asc':  return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'top-rated':  return b.rating - a.rating || b.reviews - a.reviews;
      case 'best-selling': default: return b.isBestSeller - a.isBestSeller || b.reviews - a.reviews;
    }
  });
}

/* ------------------------------------------------------------------
   FILTER LOGIC
   ------------------------------------------------------------------ */
function applyFilters() {
  const specialties  = [...document.querySelectorAll('input[name="specialty"]:checked')].map(i => i.value);
  const materials    = [...document.querySelectorAll('input[name="material"]:checked')].map(i => i.value);
  const brands       = [...document.querySelectorAll('input[name="brand"]:checked')].map(i => i.value);
  const ratingEl     = document.querySelector('input[name="rating"]:checked');
  const minRating    = ratingEl ? parseFloat(ratingEl.value) : 0;
  const minPrice     = parseInt(document.getElementById('price-min')?.value || 0);
  const maxPrice     = parseInt(document.getElementById('price-max')?.value || 50000);

  filteredProducts = CATALOG.filter(p => {
    if (specialties.length  && !specialties.includes(p.specialty))   return false;
    if (materials.length    && !materials.includes(p.material))      return false;
    if (brands.length       && !brands.includes(p.brand))            return false;
    if (selectedSizes.size  && p.sizes.length > 0 && !p.sizes.some(s => selectedSizes.has(s))) return false;
    if (selectedColors.size && !p.colors.some(c => selectedColors.has(c))) return false;
    if (p.price < minPrice || p.price > maxPrice)                    return false;
    if (p.rating < minRating)                                        return false;
    return true;
  });

  currentPage = 1;
  renderPage();
  renderChips({ specialties, materials, brands, minRating, minPrice, maxPrice });
  updateFilterBadge();
}

/* ------------------------------------------------------------------
   RENDER PAGE (paginated slice)
   ------------------------------------------------------------------ */
function renderPage() {
  const sorted = sortProducts(filteredProducts);
  const start  = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const slice  = sorted.slice(start, start + PRODUCTS_PER_PAGE);
  const total  = filteredProducts.length;

  // Result count
  if (resultCount) {
    const end = Math.min(start + PRODUCTS_PER_PAGE, total);
    resultCount.textContent = total === 0
      ? 'No products found'
      : `Showing ${start + 1}–${end} of ${total} products`;
  }

  // Grid
  if (total === 0) {
    productGrid.innerHTML = emptyStateHTML();
    paginationEl.innerHTML = '';
    if (resultsSummary) resultsSummary.textContent = '';
    return;
  }

  productGrid.innerHTML = slice.map(productCardHTML).join('');

  // Results summary
  if (resultsSummary) {
    const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
    resultsSummary.textContent = `Page ${currentPage} of ${totalPages} · ${total} total products`;
  }

  renderPagination(total);
}

/* ------------------------------------------------------------------
   PAGINATION
   ------------------------------------------------------------------ */
function renderPagination(total) {
  if (!paginationEl) return;
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

  let html = '';

  // Prev
  html += `<button class="mc-page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">‹ Prev</button>`;

  // Pages with ellipsis
  const pages = getPageNumbers(currentPage, totalPages);
  pages.forEach(p => {
    if (p === '...') {
      html += `<span class="mc-page-dots">…</span>`;
    } else {
      html += `<button class="mc-page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})" aria-label="Page ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`;
    }
  });

  // Next
  html += `<button class="mc-page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">Next ›</button>`;

  paginationEl.innerHTML = html;
}

function getPageNumbers(cur, total) {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const pages = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

window.goPage = function(page) {
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ------------------------------------------------------------------
   ACTIVE FILTER CHIPS
   ------------------------------------------------------------------ */
function renderChips({ specialties, materials, brands, minRating, minPrice, maxPrice }) {
  if (!chipsBar) return;

  const chips = [];

  specialties.forEach(s => chips.push({ label: specialtyLabel(s), key: 'specialty', val: s }));
  materials.forEach(m   => chips.push({ label: `Material: ${m}`, key: 'material', val: m }));
  brands.forEach(b       => chips.push({ label: `Brand: ${b}`, key: 'brand', val: b }));
  selectedSizes.forEach(s => chips.push({ label: `Size: ${s}`, key: 'size', val: s }));
  selectedColors.forEach(c => chips.push({ label: `Color: ${c}`, key: 'color', val: c }));
  if (minPrice > 0)           chips.push({ label: `Min: ${formatPrice(minPrice)}`, key: 'price-min', val: minPrice });
  if (maxPrice < 50000)       chips.push({ label: `Max: ${formatPrice(maxPrice)}`, key: 'price-max', val: maxPrice });
  if (minRating > 0)          chips.push({ label: `⭐ ${minRating}+`, key: 'rating', val: minRating });

  if (chips.length === 0) {
    chipsBar.innerHTML = '';
    chipsBar.classList.remove('has-chips');
    return;
  }

  chipsBar.classList.add('has-chips');
  chipsBar.innerHTML = chips.map(c => `
    <span class="mc-chip">
      ${c.label}
      <button class="mc-chip-remove" onclick="removeChip('${c.key}', '${c.val}')" aria-label="Remove filter ${c.label}">✕</button>
    </span>
  `).join('') + `<button class="mc-clear-all-btn" onclick="clearAllFilters()">✕ Clear all</button>`;
}

window.removeChip = function(key, val) {
  if (key === 'specialty' || key === 'material' || key === 'brand') {
    document.querySelectorAll(`input[name="${key}"][value="${val}"]`).forEach(cb => cb.checked = false);
  } else if (key === 'size') {
    selectedSizes.delete(val);
    document.querySelectorAll(`.mc-size-btn[data-size="${val}"]`).forEach(b => b.classList.remove('active'));
  } else if (key === 'color') {
    selectedColors.delete(val);
    document.querySelectorAll(`.mc-color-filter-swatch[data-color="${val}"]`).forEach(b => b.classList.remove('active'));
  } else if (key === 'price-min') {
    document.getElementById('price-min').value = 0;
    updatePriceRange();
  } else if (key === 'price-max') {
    document.getElementById('price-max').value = 50000;
    updatePriceRange();
  } else if (key === 'rating') {
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  }
  applyFilters();
};

window.clearAllFilters = function() {
  document.querySelectorAll('input[name="specialty"], input[name="material"], input[name="brand"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
  document.querySelectorAll('.mc-size-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.mc-color-filter-swatch').forEach(b => b.classList.remove('active'));
  selectedSizes.clear();
  selectedColors.clear();
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  if (minEl) minEl.value = 0;
  if (maxEl) maxEl.value = 50000;
  updatePriceRange();
  applyFilters();
  showToast('All filters cleared');
};

function updateFilterBadge() {
  const count = [...document.querySelectorAll('input[name="specialty"]:checked, input[name="material"]:checked, input[name="brand"]:checked, input[name="rating"]:checked')].length
    + selectedSizes.size + selectedColors.size;
  const badge = document.getElementById('filter-count-badge');
  if (!badge) return;
  if (count > 0) { badge.style.display = ''; badge.textContent = count; }
  else { badge.style.display = 'none'; }
}

/* ------------------------------------------------------------------
   PRICE RANGE
   ------------------------------------------------------------------ */
window.updatePriceRange = function() {
  const minEl = document.getElementById('price-min');
  const maxEl = document.getElementById('price-max');
  const fillEl = document.getElementById('range-fill');
  const minLabel = document.getElementById('price-min-label');
  const maxLabel = document.getElementById('price-max-label');
  if (!minEl || !maxEl) return;

  let min = parseInt(minEl.value);
  let max = parseInt(maxEl.value);
  if (min > max) { const t = min; min = max; max = t; minEl.value = min; maxEl.value = max; }

  if (minLabel) minLabel.textContent = formatPrice(min);
  if (maxLabel) maxLabel.textContent = formatPrice(max);

  const pct1 = (min / 50000) * 100;
  const pct2 = (max / 50000) * 100;
  if (fillEl) { fillEl.style.left = pct1 + '%'; fillEl.style.width = (pct2 - pct1) + '%'; }

  // Sync mobile sliders if they exist
  const mMin = document.getElementById('m-price-min');
  const mMax = document.getElementById('m-price-max');
  if (mMin) mMin.value = min;
  if (mMax) mMax.value = max;
  updateMobilePriceRange();

  applyFilters();
};

window.updateMobilePriceRange = function() {
  const minEl = document.getElementById('m-price-min');
  const maxEl = document.getElementById('m-price-max');
  const fillEl = document.getElementById('m-range-fill');
  const minLabel = document.getElementById('m-price-min-label');
  const maxLabel = document.getElementById('m-price-max-label');
  if (!minEl || !maxEl) return;

  let min = parseInt(minEl.value);
  let max = parseInt(maxEl.value);
  if (min > max) { const t = min; min = max; max = t; minEl.value = min; maxEl.value = max; }

  if (minLabel) minLabel.textContent = formatPrice(min);
  if (maxLabel) maxLabel.textContent = formatPrice(max);

  const pct1 = (min / 50000) * 100;
  const pct2 = (max / 50000) * 100;
  if (fillEl) { fillEl.style.left = pct1 + '%'; fillEl.style.width = (pct2 - pct1) + '%'; }

  // Sync desktop sliders
  const dMin = document.getElementById('price-min');
  const dMax = document.getElementById('price-max');
  if (dMin) dMin.value = min;
  if (dMax) dMax.value = max;

  applyFilters();
};

/* ------------------------------------------------------------------
   SIZE TOGGLE
   ------------------------------------------------------------------ */
window.toggleSize = function(btn) {
  const size = btn.dataset.size;
  if (selectedSizes.has(size)) {
    selectedSizes.delete(size);
    btn.classList.remove('active');
  } else {
    selectedSizes.add(size);
    btn.classList.add('active');
  }
  // Sync all same-size buttons
  document.querySelectorAll(`.mc-size-btn[data-size="${size}"]`).forEach(b => b.classList.toggle('active', selectedSizes.has(size)));
  applyFilters();
};

/* ------------------------------------------------------------------
   COLOR TOGGLE
   ------------------------------------------------------------------ */
window.toggleColor = function(btn) {
  const color = btn.dataset.color;
  if (selectedColors.has(color)) {
    selectedColors.delete(color);
    btn.classList.remove('active');
  } else {
    selectedColors.add(color);
    btn.classList.add('active');
  }
  document.querySelectorAll(`.mc-color-filter-swatch[data-color="${color}"]`).forEach(b => b.classList.toggle('active', selectedColors.has(color)));
  applyFilters();
};

/* ------------------------------------------------------------------
   FILTER GROUP ACCORDION TOGGLE
   ------------------------------------------------------------------ */
window.toggleGroup = function(header) {
  const group = header.closest('.mc-filter-group');
  group.classList.toggle('collapsed');
};

/* ------------------------------------------------------------------
   MOBILE FILTER SHEET
   ------------------------------------------------------------------ */
function openFilterSheet()  { filterOverlay?.classList.add('open'); document.body.style.overflow = 'hidden'; }
window.closeFilterSheet = function() { filterOverlay?.classList.remove('open'); document.body.style.overflow = ''; }

if (filterTrigger)  filterTrigger.addEventListener('click', openFilterSheet);
if (filterSheetClose) filterSheetClose.addEventListener('click', closeFilterSheet);
if (filterOverlay) filterOverlay.addEventListener('click', e => { if (e.target === filterOverlay) closeFilterSheet(); });
if (sidebarReset)  sidebarReset.addEventListener('click', clearAllFilters);

/* ------------------------------------------------------------------
   VIEW TOGGLE (Grid / List)
   ------------------------------------------------------------------ */
if (gridViewBtn) gridViewBtn.addEventListener('click', () => {
  productGrid.classList.remove('list-view');
  gridViewBtn.classList.add('active');
  listViewBtn?.classList.remove('active');
});

if (listViewBtn) listViewBtn.addEventListener('click', () => {
  productGrid.classList.add('list-view');
  listViewBtn.classList.add('active');
  gridViewBtn?.classList.remove('active');
});

/* ------------------------------------------------------------------
   SORT
   ------------------------------------------------------------------ */
if (sortSelect) sortSelect.addEventListener('change', () => { currentPage = 1; renderPage(); });

/* ------------------------------------------------------------------
   CART
   ------------------------------------------------------------------ */
window.addToCart = function(event, id, name, nameAr, price, img) {
  event.stopPropagation();
  const btn = document.getElementById(`add-btn-${id}`);

  if (window.MedicareCart) {
    window.MedicareCart.addItem({
      productId: id,
      id: id,
      name: name,
      nameAr: nameAr,
      price: price,
      qty: 1,
      image: img
    });
  }

  // Button feedback
  if (btn) {
    btn.textContent = '✓ Added!';
    btn.classList.add('added');
    setTimeout(() => { btn.textContent = '🛒 Add to Cart'; btn.classList.remove('added'); }, 1600);
  }

  showToast(`✓ "${name}" added to cart!`);
  renderCartDrawer();
  catCartOverlay?.classList.add('open');
};

function renderCartDrawer() {
  const body = document.getElementById('cat-cart-body');
  const totalEl = document.getElementById('cat-cart-total');
  const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
  const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;
  const subtotal = window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;

  if (catCartBadge) catCartBadge.textContent = totalQty;
  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:var(--color-neutral-500);font-size:14px">Your cart is empty.</div>';
    if (totalEl) totalEl.textContent = '0 DZD';
    return;
  }

  body.innerHTML = cart.map((item, idx) => {
    const displayName = item.nameAr || item.name;
    const imgSrc = item.image || item.img;
    return `
      <div class="mc-cart-item">
        <img src="${imgSrc}" class="mc-cart-item-img" alt="${displayName}">
        <div class="mc-cart-item-info">
          <span class="mc-cart-item-title">${displayName}</span>
          <span class="mc-cart-item-price">${formatPrice(item.price)}</span>
          <div class="mc-cart-qty-ctrl">
            <button class="mc-qty-btn" onclick="catUpdateQty(${idx},-1)">−</button>
            <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
            <button class="mc-qty-btn" onclick="catUpdateQty(${idx},1)">+</button>
          </div>
        </div>
        <button onclick="catUpdateQty(${idx},-999)" style="background:none;border:none;cursor:pointer;color:var(--color-neutral-400);font-size:18px;padding:0 0.25rem">✕</button>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

window.catUpdateQty = function(idx, delta) {
  if (window.MedicareCart) {
    window.MedicareCart.updateQty(idx, delta);
  }
  renderCartDrawer();
};

window.addEventListener('medicare_cart_updated', renderCartDrawer);

if (catCartBtn)    catCartBtn.addEventListener('click', () => { renderCartDrawer(); catCartOverlay?.classList.add('open'); });
if (catCartClose)  catCartClose.addEventListener('click', () => catCartOverlay?.classList.remove('open'));
if (catCartOverlay) catCartOverlay.addEventListener('click', e => { if (e.target === catCartOverlay) catCartOverlay.classList.remove('open'); });

/* ------------------------------------------------------------------
   WISHLIST TOGGLE
   ------------------------------------------------------------------ */
window.toggleWishlist = function(event, btn, name) {
  event.stopPropagation();
  btn.classList.toggle('active');
  showToast(btn.classList.contains('active') ? `♥ "${name}" saved to Wishlist` : 'Removed from Wishlist');
};

/* ------------------------------------------------------------------
   QUICK VIEW (placeholder modal)
   ------------------------------------------------------------------ */
window.quickView = function(event, id) {
  event.stopPropagation();
  const p = CATALOG.find(p => p.id === id);
  if (!p) return;
  showToast(`⚡ Quick view: "${p.name}"`);
};

/* ------------------------------------------------------------------
   CARD COLOR SWATCH SWAP
   ------------------------------------------------------------------ */
window.swapColor = function(event, id, color) {
  event.stopPropagation();
  const card = document.querySelector(`.mc-cat-card[data-id="${id}"]`);
  if (!card) return;
  card.querySelectorAll('.mc-card-swatch').forEach(s => s.classList.toggle('active', s.style.backgroundColor === color || s.dataset?.color === color));
};

/* ------------------------------------------------------------------
   SEARCH BAR (minimal, delegates to filter)
   ------------------------------------------------------------------ */
const searchInput = document.getElementById('cat-search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { filteredProducts = [...CATALOG]; currentPage = 1; renderPage(); return; }
    filteredProducts = CATALOG.filter(p =>
      p.name.toLowerCase().includes(q) || p.nameAr.includes(q) ||
      p.specialty.includes(q) || p.brand.includes(q)
    );
    currentPage = 1;
    renderPage();
    renderChips({specialties:[],materials:[],brands:[],minRating:0,minPrice:0,maxPrice:50000});
  });
}

/* ------------------------------------------------------------------
   LANGUAGE TOGGLE
   ------------------------------------------------------------------ */
const langToggleBtn = document.getElementById('lang-toggle-btn');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    document.documentElement.setAttribute('dir', isRTL ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', isRTL ? 'en' : 'ar');
    langToggleBtn.querySelector('.btn-text').textContent = isRTL ? 'العربية' : 'English';
    document.documentElement.style.fontFamily = isRTL
      ? 'var(--font-family-body)'
      : '"IBM Plex Sans Arabic", "Readex Pro", sans-serif';
    showToast(isRTL ? '🌐 Switched to English' : '🌐 تم التبديل إلى العربية');
  });
}

/* ------------------------------------------------------------------
   INIT — skeleton then render
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  renderSkeletons(16);
  updatePriceRange();

  // Simulate network delay for skeleton demo
  setTimeout(() => {
    applyFilters();
  }, 750);
});
