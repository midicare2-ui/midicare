/**
 * ============================================================================
 * MEDICARE — TRILINGUAL i18n CENTRALIZED ENGINE (AR 🇩🇿 | EN 🇬🇧 | FR 🇫🇷)
 * High-precision medical & e-commerce localization, RTL/LTR manager & formatters
 * ============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'medicare_lang';
  const SUPPORTED_LANGS = ['ar', 'en', 'fr'];
  const DEFAULT_LANG = 'en';

  const TRANSLATIONS = {
    // ------------------------------------------------------------------------
    // ENGLISH (EN 🇬🇧)
    // ------------------------------------------------------------------------
    en: {
      // General & Brand
      brand_name: 'MEDICARE',
      tagline: 'Premium Medical Apparel & Clinical Diagnostics',
      currency: 'DZD',
      loading: 'Loading...',
      please_wait: 'Please wait...',
      error: 'An error occurred',
      something_went_wrong: 'Something went wrong. Please try again.',
      success: 'Operation completed successfully',
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      view_all: 'View All Products →',
      details: 'View Details',
      required: 'Required',
      optional: 'Optional',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',

      // Language Switcher
      lang_name: 'English',
      lang_flag: '🇬🇧',
      lang_select: 'Select Language',

      // Announcements & Header
      announce_shipping: '🚚 Free Express Shipping on Orders Above 5,000 DZD',
      announce_cod: '💵 Cash on Delivery — All 58 Wilayas',
      announce_bundles: '🎓 Student Starter Kits — Save up to 25%',
      search_placeholder: 'Search scrubs, stethoscopes, lab coats, bundles...',
      search_quick_results: 'Quick Results',
      search_no_results: 'No matching products found',
      search_all_results: 'See all results for',
      nav_home: 'Home',
      nav_products: 'Products',
      nav_categories: 'Categories',
      nav_bundles: 'Student Bundles',
      nav_about: 'About Us',
      nav_contact: 'Contact',
      nav_admin: 'Admin Portal',
      nav_track_order: 'Track Order',
      nav_wishlist: 'Wishlist',
      nav_cart: 'Cart',

      // Hero Carousel
      hero_tag_1: '✨ New 2026 Collection',
      hero_title_1: 'Obsidian Flex Antimicrobial Scrubs',
      hero_desc_1: 'Engineered for 24-hour shift endurance with 4-way stretch flex fabric and liquid-repellent shield.',
      hero_cta_1_primary: 'Shop Scrubs',
      hero_cta_1_secondary: 'Explore Student Kits',

      hero_tag_2: '🎓 Student Discount Active',
      hero_title_2: '2026 Medical Student Starter Kits',
      hero_desc_2: 'Complete curated gear bundles for Medicine, Pharmacy, Dentistry, and Nursing students. Save up to 25%.',
      hero_cta_2_primary: 'View Student Bundles',
      hero_cta_2_secondary: 'Browse Equipment',

      hero_tag_3: '🩺 Precision Acoustics',
      hero_title_3: 'Titanium Master Diagnostic Gear',
      hero_desc_3: 'Ultra-sensitive acoustic stethoscopes crafted with aerospace titanium. Lifetime free acoustic calibration.',
      hero_cta_3_primary: 'Shop Diagnostic Tools',
      hero_cta_3_secondary: 'Read Clinical Reviews',

      // Categories & Specialties
      section_categories_title: 'Shop by Category & Specialty',
      section_categories_sub: 'Tailored clinical essentials for Medical, Dental, Pharmacy, and Nursing professionals.',
      cat_all: 'All Specialties',
      cat_medicine: 'Medicine',
      cat_pharmacy: 'Pharmacy',
      cat_dentistry: 'Dentistry',
      cat_nursing: 'Nursing',
      cat_scrubs: 'Medical Scrubs',
      cat_lab_coats: 'Lab & Clinical Coats',
      cat_stethoscopes: 'Stethoscopes & Diagnostics',
      cat_kits: 'Student Starter Kits',
      cat_accessories: 'Medical Accessories',
      cat_footwear: 'Clogs & Medical Footwear',

      // Featured & Catalog
      section_featured_title: 'Featured & Best-Seller Essentials',
      section_featured_sub: 'Clinically tested equipment engineered for daily hospital and university practice.',
      filter_all: 'All Products',
      filter_category: 'Category',
      filter_specialty: 'Specialty',
      filter_price: 'Price Range',
      filter_sort: 'Sort By',
      sort_price_low: 'Price: Low to High',
      sort_price_high: 'Price: High to Low',
      sort_newest: 'Newest Arrivals',
      sort_popular: 'Most Popular',
      no_products_found: 'No products available at the moment.',
      out_of_stock: 'Out of Stock',
      in_stock: 'In Stock',
      stock_low: 'Low Stock',
      unit_items: 'items',
      unit_dzd: 'DZD',

      // Student Bundles & Kits (Specialized)
      section_bundles_title: 'Student Starter Kits & Bundles',
      section_bundles_sub: 'All-in-one curated equipment bundles for 1st-year & clinical students with verified bundle savings.',
      bundle_best_value: 'BEST VALUE BUNDLE',
      bundle_student_pack: 'STUDENT PACK',
      bundle_whats_included: "What's Included in This Bundle",
      bundle_total_value: 'Total Individual Value:',
      bundle_bundle_price: 'Special Bundle Price:',
      bundle_you_save: 'You Save:',
      bundle_savings_pct: 'OFF',
      bundle_order_now: 'Order Bundle Now',
      bundle_items_count: 'Items Included',
      bundle_qty: 'Qty:',

      // Product Card & Interaction
      add_to_cart: 'Add to Cart',
      adding_to_cart: 'Adding...',
      added_to_cart: 'Added to Cart!',
      buy_now: 'Buy Now',
      order_via_whatsapp: 'Order via WhatsApp',
      product_details: 'Product Details',
      quick_view: 'Quick View',
      wishlist_save: 'Save to Wishlist',
      wishlist_remove: 'Remove from Wishlist',
      wishlist_saved_toast: '♥ Product saved to wishlist',
      wishlist_removed_toast: 'Product removed from wishlist',

      // Product Details Page (PDP)
      pdp_badge_exclusive: 'MEDICARE Certified',
      pdp_tab_desc: 'Description & Features',
      pdp_tab_specs: 'Specifications',
      pdp_tab_care: 'Care & Maintenance',
      pdp_tab_delivery: 'Delivery & Warranty',
      pdp_tab_reviews: 'Customer Reviews',
      pdp_features_title: 'Key Clinical Features',
      pdp_specs_title: 'Technical Specifications',
      pdp_care_title: 'Care Instructions',
      pdp_delivery_title: 'Shipping & Wilaya Coverage',
      pdp_delivery_text: 'Fast 24-48h express delivery to all 58 Algerian Wilayas. Doorstep cash on delivery.',
      pdp_return_title: 'Exchange & Warranty Policy',
      pdp_return_text: '100% Free size exchange within 7 days. 2-year warranty on electronic and diagnostic tools.',
      pdp_size_guide: 'Size & Fit Guide',
      pdp_color: 'Color',
      pdp_size: 'Size',
      pdp_quantity: 'Quantity',
      pdp_share: 'Share Product',
      pdp_sku: 'SKU',
      pdp_tax_exempt: 'Hospital/University Tax Exempt',
      pdp_related_title: 'Recommended Companion Gear',

      // Reviews & Social Proof
      reviews_title: 'Verified Medical Reviews',
      reviews_sub: 'Trusted by resident doctors, hospital surgeons, and university students across Algeria.',
      reviews_write: 'Write a Review',
      reviews_rating: 'Rating',
      reviews_name: 'Full Name',
      reviews_role: 'Hospital / University Role (e.g. 3rd Year Med Student, Resident)',
      reviews_comment: 'Your Honest Feedback',
      reviews_submit: 'Submit Review',
      reviews_success: 'Thank you! Your review has been submitted.',
      reviews_verified_buyer: 'Verified Clinical Buyer',

      // Cart Drawer & Page
      cart_title: 'Shopping Cart',
      cart_empty: 'Your cart is currently empty.',
      cart_empty_sub: 'Browse our catalog to find clinical gear and scrubs.',
      cart_items_count: 'items in cart',
      cart_subtotal: 'Subtotal:',
      cart_shipping_estimate: 'Shipping calculated at checkout',
      cart_free_shipping_hint: 'Free shipping on orders above 5,000 DZD!',
      cart_checkout_btn: 'Proceed to Checkout (COD)',
      cart_clear: 'Clear Cart',
      cart_item_removed: 'Item removed from cart',

      // Checkout Page
      checkout_title: 'Cash on Delivery Checkout',
      checkout_sub: 'Fast doorstep delivery to all 58 Wilayas with cash payment upon receipt.',
      checkout_step_customer: '1. Customer Details',
      checkout_step_shipping: '2. Delivery Address & Wilaya',
      checkout_step_courier: '3. Courier & Delivery Method',
      checkout_step_summary: '4. Order Summary',
      field_full_name: 'Full Name',
      field_full_name_ph: 'Dr. / Student First and Last Name',
      field_phone: 'Phone Number',
      field_phone_ph: '05 / 06 / 07 XX XX XX XX',
      field_phone_alt: 'Alternative Phone (Optional)',
      field_wilaya: 'Wilaya (State)',
      field_wilaya_select: 'Select your Wilaya (1 to 58)',
      field_commune: 'Commune (Municipality)',
      field_commune_select: 'Select your Commune',
      field_address: 'Detailed Address',
      field_address_ph: 'Street name, neighborhood, building/room number',
      field_notes: 'Delivery Notes (Optional)',
      field_notes_ph: 'e.g. Call before delivery, delivery during morning hours',
      field_coupon: 'Discount Coupon Code',
      field_coupon_apply: 'Apply',
      coupon_applied: 'Coupon applied successfully!',
      coupon_invalid: 'Invalid or expired coupon code.',
      shipping_home: 'Home Delivery (Doorstep)',
      shipping_desk: 'Stop Desk (Pickup Station)',
      shipping_free_badge: 'FREE',
      order_summary: 'Order Summary',
      order_products_total: 'Products Total:',
      order_shipping_fee: 'Shipping Fee:',
      order_discount: 'Discount:',
      order_grand_total: 'Total to Pay on Delivery:',
      btn_place_order: 'Confirm Order (Cash on Delivery)',
      placing_order: 'Processing order...',
      order_success_title: 'Order Confirmed Successfully! 🎉',
      order_success_msg: 'Thank you for choosing MEDICARE. Our team will call you shortly to confirm delivery.',
      order_id_label: 'Order Reference ID:',
      order_track_cta: 'Track Order Status',
      order_continue_shopping: 'Continue Shopping',

      // Form Validations
      val_name_required: 'Please enter your full name.',
      val_phone_required: 'Please enter a valid Algerian phone number (10 digits).',
      val_wilaya_required: 'Please select your Wilaya.',
      val_commune_required: 'Please select your Commune.',
      val_address_required: 'Please provide your specific delivery address.',
      val_cart_empty: 'Your cart is empty. Please add products before checking out.',

      // Trust & Guarantees
      trust_fast_shipping: 'Express Delivery (58 Wilayas)',
      trust_cod: 'Cash on Delivery Guarantee',
      trust_exchange: '100% Free Size Exchange',
      trust_quality: 'Certified Hospital Quality',

      // Community & Newsletter
      community_title: 'Join 15,000+ Medical Professionals',
      community_sub: 'Subscribe for VIP student discounts, new collection launches, and direct WhatsApp alerts.',
      community_whatsapp_cta: '💬 Join WhatsApp VIP Group',
      newsletter_ph: 'Enter your medical university email or phone...',
      newsletter_btn: 'Subscribe',
      newsletter_success: 'Welcome to the MEDICARE VIP Community!',

      // Admin Dashboard & Management
      admin_portal_title: 'MEDICARE Master Operations Portal',
      admin_dashboard: 'Dashboard',
      admin_products: 'Products',
      admin_bundles: 'Bundles & Kits',
      admin_orders: 'Orders',
      admin_inventory: 'Inventory',
      admin_reviews: 'Reviews',
      admin_settings: 'Settings',
      admin_analytics: 'Analytics',
      admin_audit_logs: 'Audit Logs',
      admin_logout: 'Logout',
      admin_add_product: '+ Add New Product',
      admin_edit_product: 'Edit Product',
      admin_sync_supabase: '☁️ Sync Supabase',
      admin_search_products: 'Filter products by name, SKU or category...',
      admin_total_sales: 'Total Revenue',
      admin_pending_orders: 'Pending Orders',
      admin_active_products: 'Active Products',
      admin_low_stock_alerts: 'Low Stock Alerts',

      // Admin Product Form Trilingual Tabs
      admin_tab_en: '🇬🇧 English (Required)',
      admin_tab_fr: '🇫🇷 Français',
      admin_tab_ar: '🇩🇿 العربية',
      admin_tab_pricing: '💰 Pricing & Stock',
      admin_tab_specs: '⚙️ Details & Specs',
      admin_tab_images: '🖼️ Gallery Images',
      admin_prod_name: 'Product Name',
      admin_prod_short_desc: 'Short Description',
      admin_prod_desc: 'Detailed Clinical Description',
      admin_prod_category: 'Category',
      admin_prod_specialty: 'Specialty Focus',
      admin_prod_price: 'Base Price (DZD)',
      admin_prod_compare_price: 'Compare at Price (DZD)',
      admin_prod_stock: 'Stock Quantity',
      admin_prod_sku: 'SKU / Product Code',
      admin_prod_features: 'Bullet Features (One per line)',
      admin_prod_specs: 'Technical Specifications (JSON or Key:Value per line)',
      admin_prod_care: 'Care Instructions',
      admin_prod_delivery: 'Custom Delivery Notice',
      admin_prod_return: 'Custom Return / Warranty Terms',
      admin_prod_images_upload: 'Upload Images to Supabase Storage',
      admin_save_product_btn: 'Save & Publish Product',
      admin_delete_confirm: 'Are you sure you want to delete this product? This action cannot be undone.',
      admin_product_saved: 'Product successfully saved and synchronized!',
      admin_product_deleted: 'Product removed from system.'
    },

    // ------------------------------------------------------------------------
    // ARABIC (AR 🇩🇿)
    // ------------------------------------------------------------------------
    ar: {
      // General & Brand
      brand_name: 'MEDICARE',
      tagline: 'الألبسة والمعدات الطبية وأجهزة التشخيص السريري',
      currency: 'دج',
      loading: 'جارٍ التحميل...',
      please_wait: 'يرجى الانتظار...',
      error: 'حدث خطأ',
      something_went_wrong: 'حدث خطأ غير متوقع. يرجى المحاولة مجددًا.',
      success: 'تمت العملية بنجاح',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
      close: 'إغلاق',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      back: 'رجوع',
      view_all: 'عرض جميع المنتجات ←',
      details: 'عرض التفاصيل',
      required: 'مطلوب',
      optional: 'اختياري',
      status: 'الحالة',
      date: 'التاريخ',
      actions: 'إجراءات',

      // Language Switcher
      lang_name: 'العربية',
      lang_flag: '🇩🇿',
      lang_select: 'اختر اللغة',

      // Announcements & Header
      announce_shipping: '🚚 شحن سريع مجاني للطلبات فوق 5,000 دج',
      announce_cod: '💵 الدفع عند الاستلام — توصيل لكافة الـ 58 ولاية',
      announce_bundles: '🎓 حقائب وباقات الطلاب — وفر حتى 25%',
      search_placeholder: 'ابحث عن سكراب، سماعة، مئزر طبي، حقيبة طلابية...',
      search_quick_results: 'نتائج فورية',
      search_no_results: 'لم يتم العثور على منتجات مطابقة',
      search_all_results: 'عرض جميع النتائج لـ',
      nav_home: 'الرئيسية',
      nav_products: 'المنتجات',
      nav_categories: 'التصنيفات',
      nav_bundles: 'باقات الطلاب',
      nav_about: 'من نحن',
      nav_contact: 'اتصل بنا',
      nav_admin: 'لوحة الإدارة',
      nav_track_order: 'تتبع الطلب',
      nav_wishlist: 'المفضلة',
      nav_cart: 'السلة',

      // Hero Carousel
      hero_tag_1: '✨ تشكيلة 2026 الحصرية',
      hero_title_1: 'سكراب أوبسيديان المرن المقاوم للبكتيريا',
      hero_desc_1: 'مصمم لتحمل نوبات المناوبة الشاقة لـ 24 ساعة بقماش مريح يتمدد في 4 اتجاهات وطبقة عازلة للسوائل.',
      hero_cta_1_primary: 'تسوق السكراب الطبي',
      hero_cta_1_secondary: 'استكشف حقائب الطلاب',

      hero_tag_2: '🎓 خصم الطلاب الجامعيين',
      hero_title_2: 'حقائب معدات طلاب الطب والصيدلة 2026',
      hero_desc_2: 'باقات متكاملة من الملابس والأدوات الطبية لطلاب كليات الطب، الصيدلة، طب الأسنان وشبه الطبي. وفر حتى 25%.',
      hero_cta_2_primary: 'عرض باقات الطلاب',
      hero_cta_2_secondary: 'تصفح المعدات',

      hero_tag_3: '🩺 دقة صوتية سريرية',
      hero_title_3: 'أجهزة التشخيص الدقيقة من التيتانيوم',
      hero_desc_3: 'سماعات طبية ذات حساسية سمعية فائقة مصنعة من التيتانيوم المقاوم. معايرة صوتية مجانية مدى الحياة.',
      hero_cta_3_primary: 'تسوق أجهزة التشخيص',
      hero_cta_3_secondary: 'آراء الأطباء',

      // Categories & Specialties
      section_categories_title: 'تسوق حسب الفئة والتخصص',
      section_categories_sub: 'مستلزمات سريرية مخصصة لأطباء الطب البشري، طب الأسنان، الصيدلة، والتمريض.',
      cat_all: 'جميع التخصصات',
      cat_medicine: 'الطب البشري',
      cat_pharmacy: 'الصيدلة',
      cat_dentistry: 'طب الأسنان',
      cat_nursing: 'علوم التمريض وشبه الطبي',
      cat_scrubs: 'الأزياء الطبية (Scrubs)',
      cat_lab_coats: 'المآزر الطبية والسريرية',
      cat_stethoscopes: 'السماعات وأدوات التشخيص',
      cat_kits: 'حقائب وباقات الطلاب',
      cat_accessories: 'الملحقات والإكسسوارات الطبية',
      cat_footwear: 'أحذية وقباقيب المشافي',

      // Featured & Catalog
      section_featured_title: 'المنتجات المميزة والأكثر طلباً',
      section_featured_sub: 'معدات معتمدة ومختبرة للممارسة اليومية في المستشفيات والعيادات والجامعات.',
      filter_all: 'كافة المنتجات',
      filter_category: 'التصنيف',
      filter_specialty: 'التخصص',
      filter_price: 'نطاق السعر',
      filter_sort: 'ترتيب حسب',
      sort_price_low: 'السعر: من الأقل للأعلى',
      sort_price_high: 'السعر: من الأعلى للأقل',
      sort_newest: 'الأحدث وصولاً',
      sort_popular: 'الأكثر رواجاً',
      no_products_found: 'لا توجد منتجات متاحة حالياً.',
      out_of_stock: 'نفذت الكمية',
      in_stock: 'متوفر بالمخزون',
      stock_low: 'كمية محدودة',
      unit_items: 'قطع',
      unit_dzd: 'دج',

      // Student Bundles & Kits (Specialized)
      section_bundles_title: 'باقات وحقائب الطلاب المتكاملة',
      section_bundles_sub: 'باقات متكاملة ومختارة بعناية لطلاب السنة الأولى والتربصات السريرية مع توفير مضمون.',
      bundle_best_value: 'الباقة الأكثر توفيراً',
      bundle_student_pack: 'حقيبة الطالب المتكاملة',
      bundle_whats_included: 'ماذا تتضمن هذه الباقة السريرية؟',
      bundle_total_value: 'القيمة الإجمالية للمنتجات منفصلة:',
      bundle_bundle_price: 'سعر الباقة الخاص:',
      bundle_you_save: 'قيمة التوفير:',
      bundle_savings_pct: 'خصم',
      bundle_order_now: 'اطلب الباقة الآن',
      bundle_items_count: 'عناصر مضمنة',
      bundle_qty: 'الكمية:',

      // Product Card & Interaction
      add_to_cart: 'أضف إلى السلة',
      adding_to_cart: 'جارٍ الإضافة...',
      added_to_cart: 'تمت الإضافة للسلة!',
      buy_now: 'شراء فوري',
      order_via_whatsapp: 'طلب عبر واتساب',
      product_details: 'تفاصيل المنتج',
      quick_view: 'نظرة سريعة',
      wishlist_save: 'حفظ بالمفضلة',
      wishlist_remove: 'إزالة من المفضلة',
      wishlist_saved_toast: '♥ تم حفظ المنتج في المفضلة',
      wishlist_removed_toast: 'تمت إزالة المنتج من المفضلة',

      // Product Details Page (PDP)
      pdp_badge_exclusive: 'جودة معتمدة من MEDICARE',
      pdp_tab_desc: 'الوصف والمميزات',
      pdp_tab_specs: 'المواصفات التقنية',
      pdp_tab_care: 'العناية والغسيل',
      pdp_tab_delivery: 'الشحن والضمان',
      pdp_tab_reviews: 'تقييمات الأطباء والزبائن',
      pdp_features_title: 'أبرز المزايا والخصائص السريرية',
      pdp_specs_title: 'المواصفات الفنية والمواد',
      pdp_care_title: 'تعليمات العناية والغسيل',
      pdp_delivery_title: 'معلومات الشحن لجميع الولايات',
      pdp_delivery_text: 'توصيل سريع خلال 24-48 ساعة لجميع ولايات الجزائر الـ 58. الدفع نقداً عند استلام الطلبية.',
      pdp_return_title: 'سياسة الاستبدال والضمان',
      pdp_return_text: 'استبدال مجاني 100% للمقاسات خلال 7 أيام. ضمان سنتين على الأجهزة الإلكترونية والتشخيصية.',
      pdp_size_guide: 'دليل المقاسات والقياس الدقيق',
      pdp_color: 'اللون',
      pdp_size: 'المقاس',
      pdp_quantity: 'الكمية',
      pdp_share: 'مشاركة المنتج',
      pdp_sku: 'رمز المنتج (SKU)',
      pdp_tax_exempt: 'إعفاء ضريبي للأطباء والممرضين',
      pdp_related_title: 'منتجات ومعدات مكملة موصى بها',

      // Reviews & Social Proof
      reviews_title: 'آراء الأطباء والمختصين المعتمدة',
      reviews_sub: 'موثوق من الأطباء المقيمين، الجراحين، وطلبة الطب في مختلف المستشفيات والجامعات الجزائرية.',
      reviews_write: 'أضف تقييمك وتجربتك',
      reviews_rating: 'التقييم',
      reviews_name: 'الاسم الكامل',
      reviews_role: 'التخصص / السنة الدراسية أو المستشفى (مثال: طبيب مقيم، طالب سنة 3)',
      reviews_comment: 'رأيك وتجربتك الصادقة مع المنتج',
      reviews_submit: 'إرسال التقييم',
      reviews_success: 'شكراً لك! تم إرسال تقييمك بنجاح.',
      reviews_verified_buyer: 'مشتري سريري موثق',

      // Cart Drawer & Page
      cart_title: 'سلة المشتريات',
      cart_empty: 'سلة التسوق فارغة حالياً.',
      cart_empty_sub: 'تصفح تشكيلة الألبسة والأجهزة الطبية وابدأ التسوق.',
      cart_items_count: 'منتجات في السلة',
      cart_subtotal: 'المجموع الفرعي:',
      cart_shipping_estimate: 'يتم احتساب سعر التوصيل في صفحة الدفع',
      cart_free_shipping_hint: 'شحن مجاني على الطلبات التي تتجاوز 5,000 دج!',
      cart_checkout_btn: 'إتمام الطلب (الدفع عند الاستلام)',
      cart_clear: 'تفريغ السلة',
      cart_item_removed: 'تمت إزالة العنصر من السلة',

      // Checkout Page
      checkout_title: 'إتمام الطلب (الدفع عند الاستلام)',
      checkout_sub: 'توصيل سريع إلى باب منزلك أو العيادة في 58 ولاية مع الدفع عند الاستلام.',
      checkout_step_customer: '1. المعلومات الشخصية',
      checkout_step_shipping: '2. عنوان التوصيل والولاية',
      checkout_step_courier: '3. شركة التوصيل ونوع الاستلام',
      checkout_step_summary: '4. ملخص الطلب والتأكيد',
      field_full_name: 'الاسم واللقب',
      field_full_name_ph: 'د. / الطالب: الاسم الكامل',
      field_phone: 'رقم الهاتف',
      field_phone_ph: '05 / 06 / 07 XX XX XX XX',
      field_phone_alt: 'رقم هاتف إضافي (اختياري)',
      field_wilaya: 'الولاية',
      field_wilaya_select: 'اختر ولايتك (من 1 إلى 58)',
      field_commune: 'البلدية',
      field_commune_select: 'اختر البلدية',
      field_address: 'العنوان التفصيلي',
      field_address_ph: 'الحي، اسم الشارع، رقم العمارة أو الباب',
      field_notes: 'ملاحظات للتوصيل (اختياري)',
      field_notes_ph: 'مثال: الاتصال قبل الوصول، التوصيل في الفترة الصباحية',
      field_coupon: 'رمز قسيمة الخصم',
      field_coupon_apply: 'تطبيق الخصم',
      coupon_applied: 'تم تطبيق كود الخصم بنجاح!',
      coupon_invalid: 'كود الخصم غير صالح أو منتهي الصلاحية.',
      shipping_home: 'توصيل للمنزل / العيادة',
      shipping_desk: 'استلام من مكتب التوصيل (Stop Desk)',
      shipping_free_badge: 'مجاني',
      order_summary: 'ملخص الطلبية',
      order_products_total: 'مجموع المنتجات:',
      order_shipping_fee: 'تكلفة التوصيل:',
      order_discount: 'الخصم:',
      order_grand_total: 'المبلغ الإجمالي عند الاستلام:',
      btn_place_order: 'تأكيد الطلب الآن (الدفع عند الاستلام)',
      placing_order: 'جارٍ تسجيل الطلبية...',
      order_success_title: 'تم تأكيد طلبك بنجاح! 🎉',
      order_success_msg: 'شكراً لثقتكم بـ MEDICARE. سيتصل بكم فريقنا قريباً لتأكيد موعد التسليم.',
      order_id_label: 'رقم الطلب المرجعي:',
      order_track_cta: 'تتبع حالة الطلب',
      order_continue_shopping: 'مواصلة التسوق',

      // Form Validations
      val_name_required: 'يرجى إدخال الاسم الكامل.',
      val_phone_required: 'يرجى إدخال رقم هاتف جزائري صحيح (10 أرقام).',
      val_wilaya_required: 'يرجى تحديد الولاية.',
      val_commune_required: 'يرجى تحديد البلدية.',
      val_address_required: 'يرجى كتابة العنوان التفصيلي للتوصيل.',
      val_cart_empty: 'سلة المشتريات فارغة. يرجى إضافة منتجات قبل إتمام الطلب.',

      // Trust & Guarantees
      trust_fast_shipping: 'توصيل سريع لكافة الـ 58 ولاية',
      trust_cod: 'ضمان الدفع عند الاستلام',
      trust_exchange: 'استبدال مجاني للمقاسات',
      trust_quality: 'جودة استشفائية معتمدة',

      // Community & Newsletter
      community_title: 'انضم لأكثر من 15,000 متخصص في المجال الطبي',
      community_sub: 'اشترك للحصول على خصومات الطلاب، إعلانات التشكيلات الجديدة وعروض واتساب الحصرية.',
      community_whatsapp_cta: '💬 انضم لمجموعة واتساب VIP',
      newsletter_ph: 'أدخل بريدك الإلكتروني الجامعي أو رقم هاتفك...',
      newsletter_btn: 'اشتراك',
      newsletter_success: 'مرحباً بك في مجتمع MEDICARE الطبي!',

      // Admin Dashboard & Management
      admin_portal_title: 'لوحة التحكم الإدارية — MEDICARE',
      admin_dashboard: 'لوحة التحكم',
      admin_products: 'المنتجات',
      admin_bundles: 'الباقات والحقائب',
      admin_orders: 'الطلبات',
      admin_inventory: 'المخزون',
      admin_reviews: 'التقييمات',
      admin_settings: 'الإعدادات',
      admin_analytics: 'التحليلات',
      admin_audit_logs: 'سجل النشاطات',
      admin_logout: 'تسجيل الخروج',
      admin_add_product: '+ إضافة منتج جديد',
      admin_edit_product: 'تعديل المنتج',
      admin_sync_supabase: '☁️ مزامنة مع Supabase',
      admin_search_products: 'تصفية المنتجات حسب الاسم، الرمز أو الفئة...',
      admin_total_sales: 'إجمالي المبيعات',
      admin_pending_orders: 'الطلبات المعلقة',
      admin_active_products: 'المنتجات النشطة',
      admin_low_stock_alerts: 'تنبيهات انخفاض المخزون',

      // Admin Product Form Trilingual Tabs
      admin_tab_en: '🇬🇧 الإنجليزية (أساسي)',
      admin_tab_fr: '🇫🇷 الفرنسية',
      admin_tab_ar: '🇩🇿 العربية',
      admin_tab_pricing: '💰 التسعير والمخزون',
      admin_tab_specs: '⚙️ الخصائص والمواصفات',
      admin_tab_images: '🖼️ معرض الصور',
      admin_prod_name: 'اسم المنتج',
      admin_prod_short_desc: 'الوصف المختصر',
      admin_prod_desc: 'الوصف السريري المفصل',
      admin_prod_category: 'التصنيف',
      admin_prod_specialty: 'التخصص المستهدف',
      admin_prod_price: 'السعر الأساسي (دج)',
      admin_prod_compare_price: 'السعر قبل الخصم (دج)',
      admin_prod_stock: 'الكمية في المخزن',
      admin_prod_sku: 'رمز المنتج (SKU)',
      admin_prod_features: 'المزايا السريرية (ميزة في كل سطر)',
      admin_prod_specs: 'المواصفات التقنية (سطر لكل خاصية: قيمة)',
      admin_prod_care: 'تعليمات العناية والغسيل',
      admin_prod_delivery: 'ملاحظة التوصيل المخصصة',
      admin_prod_return: 'شروط الضمان والاستبدال',
      admin_prod_images_upload: 'رفع الصور إلى مخزن Supabase Storage',
      admin_save_product_btn: 'حفظ ونشر المنتج',
      admin_delete_confirm: 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذه العملية.',
      admin_product_saved: 'تم حفظ ومزامنة المنتج بنجاح!',
      admin_product_deleted: 'تم حذف المنتج من النظام.'
    },

    // ------------------------------------------------------------------------
    // FRENCH (FR 🇫🇷)
    // ------------------------------------------------------------------------
    fr: {
      // General & Brand
      brand_name: 'MEDICARE',
      tagline: 'Tenues Médicales & Équipements de Diagnostic Clinique',
      currency: 'DZD',
      loading: 'Chargement en cours...',
      please_wait: 'Veuillez patienter...',
      error: 'Une erreur est survenue',
      something_went_wrong: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      success: 'Opération effectuée avec succès',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      close: 'Fermer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      back: 'Retour',
      view_all: 'Voir Tous les Produits →',
      details: 'Voir Détails',
      required: 'Obligatoire',
      optional: 'Optionnel',
      status: 'Statut',
      date: 'Date',
      actions: 'Actions',

      // Language Switcher
      lang_name: 'Français',
      lang_flag: '🇫🇷',
      lang_select: 'Choisir la Langue',

      // Announcements & Header
      announce_shipping: '🚚 Livraison Express Gratuite dès 5 000 DZD d’achat',
      announce_cod: '💵 Paiement à la Livraison — 58 Wilayas',
      announce_bundles: '🎓 Packs Étudiants — Économisez jusqu’à 25%',
      search_placeholder: 'Rechercher blouses, stéthoscopes, tenues, packs...',
      search_quick_results: 'Résultats Instantanés',
      search_no_results: 'Aucun produit trouvé',
      search_all_results: 'Voir tous les résultats pour',
      nav_home: 'Accueil',
      nav_products: 'Produits',
      nav_categories: 'Catégories',
      nav_bundles: 'Packs Étudiants',
      nav_about: 'À Propos',
      nav_contact: 'Contact',
      nav_admin: 'Portail Admin',
      nav_track_order: 'Suivre Commande',
      nav_wishlist: 'Favoris',
      nav_cart: 'Panier',

      // Hero Carousel
      hero_tag_1: '✨ Nouvelle Collection 2026',
      hero_title_1: 'Tenues Médicales Obsidian Flex Antibactériennes',
      hero_desc_1: 'Conçues pour l’endurance des gardes de 24h — tissu extensible 4 directions avec barrière déperlante.',
      hero_cta_1_primary: 'Découvrir les Tenues',
      hero_cta_1_secondary: 'Explorer les Packs Étudiants',

      hero_tag_2: '🎓 Remise Étudiante Active',
      hero_title_2: 'Kits d’Équipement Étudiants en Médecine 2026',
      hero_desc_2: 'Packs complets de tenues et matériel pour étudiants en Médecine, Pharmacie, Dentaire et Soins. Jusqu’à 25% d’économie.',
      hero_cta_2_primary: 'Voir les Packs Étudiants',
      hero_cta_2_secondary: 'Parcourir le Matériel',

      hero_tag_3: '🩺 Acoustique de Précision',
      hero_title_3: 'Instruments de Diagnostic Titane Master',
      hero_desc_3: 'Stéthoscopes haute sensibilité acoustique usinés en titane brossé. Étalonnage acoustique offert à vie.',
      hero_cta_3_primary: 'Acheter Matériel Diagnostic',
      hero_cta_3_secondary: 'Avis Cliniques',

      // Categories & Specialties
      section_categories_title: 'Acheter par Catégorie & Spécialité',
      section_categories_sub: 'Équipements cliniques conçus sur mesure pour Médecine, Dentaire, Pharmacie et Soins.',
      cat_all: 'Toutes les Spécialités',
      cat_medicine: 'Médecine',
      cat_pharmacy: 'Pharmacie',
      cat_dentistry: 'Médecine Dentaire',
      cat_nursing: 'Sciences Infirmières & Paramédical',
      cat_scrubs: 'Tenues Médicales (Scrubs)',
      cat_lab_coats: 'Blouses Cliniques & Laboratoire',
      cat_stethoscopes: 'Stéthoscopes & Diagnostic',
      cat_kits: 'Kits & Packs Étudiants',
      cat_accessories: 'Accessoires Médicaux',
      cat_footwear: 'Sabots & Chaussures Médicales',

      // Featured & Catalog
      section_featured_title: 'Essentiels Populaires & Meilleures Ventes',
      section_featured_sub: 'Matériel certifié et testé pour la pratique clinique et hospitalière quotidienne.',
      filter_all: 'Tous les Produits',
      filter_category: 'Catégorie',
      filter_specialty: 'Spécialité',
      filter_price: 'Gamme de Prix',
      filter_sort: 'Trier par',
      sort_price_low: 'Prix : Croissant',
      sort_price_high: 'Prix : Décroissant',
      sort_newest: 'Nouveautés',
      sort_popular: 'Les Plus Populaires',
      no_products_found: 'Aucun produit disponible actuellement.',
      out_of_stock: 'Rupture de Stock',
      in_stock: 'En Stock',
      stock_low: 'Stock Limité',
      unit_items: 'articles',
      unit_dzd: 'DZD',

      // Student Bundles & Kits (Specialized)
      section_bundles_title: 'Kits Étudiants & Packs Complets',
      section_bundles_sub: 'Packs d’équipement tout-en-un pour étudiants de 1ère année et stages cliniques avec économies réelles.',
      bundle_best_value: 'MEILLEURE OFFRE PACK',
      bundle_student_pack: 'PACK ÉTUDIANT COMPLET',
      bundle_whats_included: 'Ce qui est inclus dans ce pack clinique',
      bundle_total_value: 'Valeur totale à l’unité :',
      bundle_bundle_price: 'Prix Spécial du Pack :',
      bundle_you_save: 'Vous Économisez :',
      bundle_savings_pct: 'DE RÉDUCTION',
      bundle_order_now: 'Commander le Pack Maintenant',
      bundle_items_count: 'Articles Inclus',
      bundle_qty: 'Qté :',

      // Product Card & Interaction
      add_to_cart: 'Ajouter au panier',
      adding_to_cart: 'Ajout en cours...',
      added_to_cart: 'Ajouté au panier !',
      buy_now: 'Acheter maintenant',
      order_via_whatsapp: 'Commander via WhatsApp',
      product_details: 'Détails du Produit',
      quick_view: 'Aperçu Rapide',
      wishlist_save: 'Ajouter aux Favoris',
      wishlist_remove: 'Retirer des Favoris',
      wishlist_saved_toast: '♥ Produit ajouté aux favoris',
      wishlist_removed_toast: 'Produit retiré des favoris',

      // Product Details Page (PDP)
      pdp_badge_exclusive: 'Qualité Certifiée MEDICARE',
      pdp_tab_desc: 'Description & Atouts',
      pdp_tab_specs: 'Spécifications Techniques',
      pdp_tab_care: 'Entretien & Lavage',
      pdp_tab_delivery: 'Livraison & Garantie',
      pdp_tab_reviews: 'Avis des Praticiens',
      pdp_features_title: 'Caractéristiques Cliniques Clés',
      pdp_specs_title: 'Fiche Technique & Matériaux',
      pdp_care_title: 'Conseils d’Entretien',
      pdp_delivery_title: 'Informations de Livraison — 58 Wilayas',
      pdp_delivery_text: 'Livraison express 24-48h dans les 58 Wilayas d’Algérie. Paiement en espèces à la livraison.',
      pdp_return_title: 'Politique d’Échange & Garantie',
      pdp_return_text: 'Échange de taille 100% gratuit sous 7 jours. Garantie 2 ans sur les appareils électroniques et diagnostics.',
      pdp_size_guide: 'Guide des Tailles',
      pdp_color: 'Couleur',
      pdp_size: 'Taille',
      pdp_quantity: 'Quantité',
      pdp_share: 'Partager le Produit',
      pdp_sku: 'Code Produit (SKU)',
      pdp_tax_exempt: 'Exonéré de Taxe pour Professionnels de Santé',
      pdp_related_title: 'Équipements Complémentaires Recommandés',

      // Reviews & Social Proof
      reviews_title: 'Avis Médicaux Vérifiés',
      reviews_sub: 'Recommandé par des internes, chirurgiens et étudiants en santé à travers toute l’Algérie.',
      reviews_write: 'Donner mon Avis',
      reviews_rating: 'Note',
      reviews_name: 'Nom & Prénom',
      reviews_role: 'Fonction / Année d’Étude ou Hôpital (ex: Interne, Étudiant 3ème Année)',
      reviews_comment: 'Votre avis d’expérience clinique',
      reviews_submit: 'Publier mon Avis',
      reviews_success: 'Merci ! Votre avis a été enregistré avec succès.',
      reviews_verified_buyer: 'Acheteur Clinique Vérifié',

      // Cart Drawer & Page
      cart_title: 'Panier d’Achat',
      cart_empty: 'Votre panier est actuellement vide.',
      cart_empty_sub: 'Découvrez notre catalogue de tenues et d’équipements médicaux pour commencer.',
      cart_items_count: 'articles dans le panier',
      cart_subtotal: 'Sous-total :',
      cart_shipping_estimate: 'Frais de livraison calculés à la commande',
      cart_free_shipping_hint: 'Livraison gratuite pour les commandes de plus de 5 000 DZD !',
      cart_checkout_btn: 'Passer la Commande (Paiement à la Livraison)',
      cart_clear: 'Vider le Panier',
      cart_item_removed: 'Article retiré du panier',

      // Checkout Page
      checkout_title: 'Finalisation de Commande (Paiement à la Livraison)',
      checkout_sub: 'Livraison rapide à domicile ou en cabinet dans les 58 Wilayas avec règlement à la réception.',
      checkout_step_customer: '1. Coordonnées du Destinataire',
      checkout_step_shipping: '2. Adresse de Livraison & Wilaya',
      checkout_step_courier: '3. Transporteur & Mode de Livraison',
      checkout_step_summary: '4. Récapitulatif & Confirmation',
      field_full_name: 'Nom et Prénom',
      field_full_name_ph: 'Dr. / Étudiant : Nom et Prénom complet',
      field_phone: 'Numéro de Téléphone',
      field_phone_ph: '05 / 06 / 07 XX XX XX XX',
      field_phone_alt: 'Numéro de Téléphone Secondaire (Optionnel)',
      field_wilaya: 'Wilaya',
      field_wilaya_select: 'Sélectionnez votre Wilaya (1 à 58)',
      field_commune: 'Commune',
      field_commune_select: 'Sélectionnez votre Commune',
      field_address: 'Adresse Détaillée',
      field_address_ph: 'Rue, quartier, numéro de bâtiment ou de porte',
      field_notes: 'Instructions de Livraison (Optionnel)',
      field_notes_ph: 'ex: Appeler avant livraison, livraison en matinée',
      field_coupon: 'Code Promo / Réduction',
      field_coupon_apply: 'Appliquer',
      coupon_applied: 'Code promo appliqué avec succès !',
      coupon_invalid: 'Code promo invalide ou expiré.',
      shipping_home: 'Livraison à Domicile / Cabinet',
      shipping_desk: 'Retrait en Point Relais (Stop Desk)',
      shipping_free_badge: 'GRATUIT',
      order_summary: 'Récapitulatif de Commande',
      order_products_total: 'Total Produits :',
      order_shipping_fee: 'Frais de Livraison :',
      order_discount: 'Remise :',
      order_grand_total: 'Montant Total à Payer à la Livraison :',
      btn_place_order: 'Confirmer la Commande (Paiement à la Livraison)',
      placing_order: 'Enregistrement de la commande...',
      order_success_title: 'Commande Confirmée avec Succès ! 🎉',
      order_success_msg: 'Merci pour votre confiance en MEDICARE. Notre service client vous appellera très bientôt.',
      order_id_label: 'Référence de Commande :',
      order_track_cta: 'Suivre l’État de la Commande',
      order_continue_shopping: 'Continuer mes Achats',

      // Form Validations
      val_name_required: 'Veuillez saisir votre nom et prénom.',
      val_phone_required: 'Veuillez saisir un numéro de téléphone algérien valide (10 chiffres).',
      val_wilaya_required: 'Veuillez sélectionner votre Wilaya.',
      val_commune_required: 'Veuillez sélectionner votre Commune.',
      val_address_required: 'Veuillez renseigner votre adresse de livraison précise.',
      val_cart_empty: 'Votre panier est vide. Veuillez ajouter des produits avant de commander.',

      // Trust & Guarantees
      trust_fast_shipping: 'Livraison Express 58 Wilayas',
      trust_cod: 'Garantie Paiement à la Livraison',
      trust_exchange: 'Échange de Taille 100% Gratuit',
      trust_quality: 'Qualité Hospitalière Certifiée',

      // Community & Newsletter
      community_title: 'Rejoignez plus de 15 000 Professionnels de Santé',
      community_sub: 'Recevez les offres exclusives étudiants, les lancements de collections et les alertes WhatsApp VIP.',
      community_whatsapp_cta: '💬 Rejoindre le Groupe VIP WhatsApp',
      newsletter_ph: 'Entrez votre email universitaire ou téléphone...',
      newsletter_btn: 'S’inscrire',
      newsletter_success: 'Bienvenue dans la communauté médicale MEDICARE !',

      // Admin Dashboard & Management
      admin_portal_title: 'Portail d’Administration Centrale — MEDICARE',
      admin_dashboard: 'Tableau de Bord',
      admin_products: 'Produits',
      admin_bundles: 'Packs & Kits',
      admin_orders: 'Commandes',
      admin_inventory: 'Stock & Inventaire',
      admin_reviews: 'Avis Clients',
      admin_settings: 'Paramètres',
      admin_analytics: 'Statistiques',
      admin_audit_logs: 'Journal d’Audit',
      admin_logout: 'Déconnexion',
      admin_add_product: '+ Ajouter un Nouveau Produit',
      admin_edit_product: 'Modifier le Produit',
      admin_sync_supabase: '☁️ Synchroniser Supabase',
      admin_search_products: 'Filtrer par nom, SKU ou catégorie...',
      admin_total_sales: 'Chiffre d’Affaires Total',
      admin_pending_orders: 'Commandes en Attente',
      admin_active_products: 'Produits Actifs',
      admin_low_stock_alerts: 'Alertes Stock Faible',

      // Admin Product Form Trilingual Tabs
      admin_tab_en: '🇬🇧 Anglais (Requis)',
      admin_tab_fr: '🇫🇷 Français',
      admin_tab_ar: '🇩🇿 Arabe',
      admin_tab_pricing: '💰 Tarification & Stock',
      admin_tab_specs: '⚙️ Détails & Fiche Technique',
      admin_tab_images: '🖼️ Galerie Photos',
      admin_prod_name: 'Nom du Produit',
      admin_prod_short_desc: 'Description Courte',
      admin_prod_desc: 'Description Clinique Détaillée',
      admin_prod_category: 'Catégorie',
      admin_prod_specialty: 'Spécialité Cible',
      admin_prod_price: 'Prix de Base (DZD)',
      admin_prod_compare_price: 'Prix d’Origine Barré (DZD)',
      admin_prod_stock: 'Quantité en Stock',
      admin_prod_sku: 'Code Produit (SKU)',
      admin_prod_features: 'Caractéristiques Clés (Une par ligne)',
      admin_prod_specs: 'Fiche Technique (Une ligne par Clé : Valeur)',
      admin_prod_care: 'Conseils d’Entretien & Lavage',
      admin_prod_delivery: 'Notice de Livraison Personnalisée',
      admin_prod_return: 'Conditions de Garantie & Retour',
      admin_prod_images_upload: 'Téléverser des Images vers Supabase Storage',
      admin_save_product_btn: 'Enregistrer & Publier le Produit',
      admin_delete_confirm: 'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.',
      admin_product_saved: 'Produit enregistré et synchronisé avec succès !',
      admin_product_deleted: 'Produit supprimé du système.'
    }
  };

  /**
   * Helper to retrieve currently selected language.
   */
  function getCurrentLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) {
        return stored;
      }
    } catch (e) {}
    return DEFAULT_LANG;
  }

  /**
   * Translate key with fallback chain: requested_lang -> en -> ar -> key
   */
  function t(key, langOverride) {
    const lang = langOverride || getCurrentLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    // Fallback to Arabic
    if (TRANSLATIONS.ar && TRANSLATIONS.ar[key] !== undefined) {
      return TRANSLATIONS.ar[key];
    }
    return key;
  }

  /**
   * Format currency consistently based on locale:
   * AR: 15,000 دج
   * EN: 15,000 DZD
   * FR: 15 000 DZD
   */
  function formatCurrency(amount, langOverride) {
    const lang = langOverride || getCurrentLang();
    const num = Number(amount) || 0;
    
    if (lang === 'ar') {
      return `${num.toLocaleString('ar-DZ')} دج`;
    } else if (lang === 'fr') {
      return `${num.toLocaleString('fr-FR')} DZD`;
    } else {
      return `${num.toLocaleString('en-US')} DZD`;
    }
  }

  /**
   * Format date according to current language
   */
  function formatDate(dateInput, langOverride) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    const lang = langOverride || getCurrentLang();
    const localeMap = { ar: 'ar-DZ', en: 'en-US', fr: 'fr-FR' };
    return date.toLocaleDateString(localeMap[lang] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Resolve localized product field with fallback chain (FR -> EN -> AR)
   */
  function getProductField(product, fieldPrefix, langOverride) {
    if (!product) return '';
    const lang = langOverride || getCurrentLang();

    if (fieldPrefix === 'name') {
      if (lang === 'ar' && product.name_ar) return product.name_ar;
      if (lang === 'fr' && product.name_fr) return product.name_fr;
      if (product.name) return product.name;
      return product.name_fr || product.name_ar || '';
    }

    if (fieldPrefix === 'short_description') {
      if (lang === 'ar' && product.short_description_ar) return product.short_description_ar;
      if (lang === 'fr' && product.short_description_fr) return product.short_description_fr;
      if (product.short_description) return product.short_description;
      return product.short_description_fr || product.short_description_ar || product.description || '';
    }

    if (fieldPrefix === 'description') {
      if (lang === 'ar' && product.description_ar) return product.description_ar;
      if (lang === 'fr' && product.description_fr) return product.description_fr;
      if (product.description) return product.description;
      return product.description_fr || product.description_ar || '';
    }

    if (fieldPrefix === 'features') {
      if (lang === 'ar' && (product.features_ar || product.featuresAr)) return product.features_ar || product.featuresAr;
      if (lang === 'fr' && (product.features_fr || product.featuresFr)) return product.features_fr || product.featuresFr;
      return product.features || [];
    }

    if (fieldPrefix === 'specifications') {
      if (lang === 'ar' && (product.specifications_ar || product.specificationsAr)) return product.specifications_ar || product.specificationsAr;
      if (lang === 'fr' && (product.specifications_fr || product.specificationsFr)) return product.specifications_fr || product.specificationsFr;
      return product.specifications || {};
    }

    if (fieldPrefix === 'care_instructions') {
      if (lang === 'ar' && (product.care_instructions_ar || product.careInstructionsAr)) return product.care_instructions_ar || product.careInstructionsAr;
      if (lang === 'fr' && (product.care_instructions_fr || product.careInstructionsFr)) return product.care_instructions_fr || product.careInstructionsFr;
      return product.care_instructions || product.careInstructions || [];
    }

    if (fieldPrefix === 'delivery_info') {
      if (lang === 'ar' && product.delivery_info_ar) return product.delivery_info_ar;
      if (lang === 'fr' && product.delivery_info_fr) return product.delivery_info_fr;
      return product.delivery_info || product.deliveryInfo || '';
    }

    if (fieldPrefix === 'return_info') {
      if (lang === 'ar' && product.return_info_ar) return product.return_info_ar;
      if (lang === 'fr' && product.return_info_fr) return product.return_info_fr;
      return product.return_info || product.returnInfo || '';
    }

    return product[fieldPrefix] || '';
  }

  /**
   * Set and apply language across document & trigger global event
   */
  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    const html = document.documentElement;
    const isRTL = lang === 'ar';
    html.setAttribute('lang', lang);
    html.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Update any standard data-i18n attributes on DOM
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, lang);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', t(key, lang));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key, lang));
      }
    });

    // Update language switcher UI elements if present
    document.querySelectorAll('.mc-lang-btn, .mc-lang-current').forEach(btn => {
      const info = {
        ar: '🇩🇿 العربية',
        en: '🇬🇧 English',
        fr: '🇫🇷 Français'
      };
      if (btn.querySelector('.btn-text')) {
        btn.querySelector('.btn-text').textContent = info[lang];
      } else {
        btn.textContent = info[lang];
      }
    });

    // Fire custom event for any listening scripts (app.js, admin.js, product-detail.js, etc.)
    window.dispatchEvent(new CustomEvent('medicare_language_changed', {
      detail: { lang, isRTL, translations: TRANSLATIONS[lang] }
    }));
  }

  /**
   * Initialize on script load
   */
  function init() {
    const initialLang = getCurrentLang();
    setLang(initialLang);
  }

  // Export globally
  window.MC_I18N = {
    TRANSLATIONS,
    SUPPORTED_LANGS,
    getCurrentLang,
    setLang,
    t,
    formatCurrency,
    formatDate,
    getProductField,
    init
  };

  // Shortcut alias
  window.t = t;
  window.formatDZD = formatCurrency;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
