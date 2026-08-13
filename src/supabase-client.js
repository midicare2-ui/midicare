/* ==========================================================================
   MEDICARE — SUPABASE CLIENT & UNIFIED DATABASE WRAPPER  v2.0 (LIVE)
   Connected to live Supabase project: icmpgdkosxyjihlgbjkd
   Provides data access API for Products, Orders, Categories, Wilayas,
   Reviews, Staff Authentication, and Audit Logging.
   ========================================================================== */

(function() {
  const config = window.MEDICARE_CONFIG || {};
  let supabase = null;
  let _isLive = false;

  // Initialize Supabase SDK
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
      _isLive = true;
      console.log('⚡ MEDICARE — Supabase Live DB Connected:', config.SUPABASE_URL);
    } catch (e) {
      console.warn('⚠️ Supabase init failed, using local fallback:', e);
    }
  }

  /* ---- LOCAL FALLBACK (only used if Supabase is unreachable) ---- */
  const FALLBACK_PRODUCTS = [
    { id:'MC-101', name:'Obsidian Flex Antimicrobial Scrub Set', name_ar:'طقم سكراب أوبسيديان المضاد للبكتيريا', specialty:'medicine', price:10700, original_price:13400, rating:4.8, reviews_count:142, material:'antimicrobial', brand:'medicare', badge:'sale', colors:['#0E4D45','#1E3A5F','#6B7280'], sizes:['XS','S','M','L','XL','XXL'], images:['assets/medicare_scrubs_hero_1786614154492.png','assets/medicare_lab_coat_1786614177321.png'], is_new:false, is_bestseller:true, stock:12 },
    { id:'MC-102', name:'ClinFlex 4-Way Stretch Scrub Pants', name_ar:'بنطلون سكراب مرن بـ 4 اتجاهات', specialty:'nursing', price:6800, original_price:null, rating:4.7, reviews_count:98, material:'flex', brand:'clinflex', badge:'new', colors:['#0F766E','#7C3AED','#1D4ED8'], sizes:['S','M','L','XL'], images:['assets/medicare_lab_coat_1786614177321.png'], is_new:true, is_bestseller:false, stock:28 },
    { id:'MC-103', name:'Executive Fluid-Shield Lab Coat', name_ar:'معطف مختبر مقاوم للسوائل', specialty:'pharmacy', price:13400, original_price:16700, rating:4.9, reviews_count:211, material:'fluid-shield', brand:'medicare', badge:'hot', colors:['#F8F8F8','#1E3A5F'], sizes:['S','M','L','XL','XXL'], images:['assets/medicare_lab_coat_1786614177321.png'], is_new:false, is_bestseller:true, stock:58 },
    { id:'MC-108', name:'Titanium Master Diagnostic Stethoscope', name_ar:'سماعة تيتانيوم الدقيقة', specialty:'medicine', price:19800, original_price:24000, rating:5.0, reviews_count:317, material:'antimicrobial', brand:'medicare', badge:'hot', colors:['#0E4D45','#1E3A5F','#6B7280'], sizes:['ONE'], images:['assets/medicare_stethoscope_1786614166370.png'], is_new:false, is_bestseller:true, stock:9 },
    { id:'MC-110', name:'Clinical Cushion Antibacterial Clogs', name_ar:'قبقاب طبي بمقدمة مغلقة', specialty:'nursing', price:9000, original_price:11300, rating:4.5, reviews_count:128, material:'antimicrobial', brand:'medicare', badge:'sale', colors:['#0E4D45','#F8F8F8','#1E3A5F'], sizes:['37','38','39','40','41','42','43','44','45'], images:['assets/medicare_footwear_1786615096505.png'], is_new:false, is_bestseller:true, stock:15 },
    { id:'MC-112', name:'1st Year Pharmacy Starter Kit', name_ar:'حقيبة الصيدلة — السنة الأولى', specialty:'pharmacy', price:17400, original_price:23400, rating:4.9, reviews_count:183, material:'antimicrobial', brand:'medicare', badge:'bundle', colors:['#0E4D45'], sizes:['ONE'], images:['assets/medicare_starter_kit_1786615195273.png'], is_new:false, is_bestseller:true, stock:5 }
  ];

  /* ---- HELPER: safe Supabase query ---- */
  async function sbQuery(table, queryFn) {
    if (!_isLive || !supabase) return null;
    try {
      const q = supabase.from(table);
      const { data, error } = await queryFn(q);
      if (error) { console.warn(`[MedicareDB] ${table} query error:`, error.message); return null; }
      return data;
    } catch (e) {
      console.warn(`[MedicareDB] ${table} exception:`, e);
      return null;
    }
  }

  /* ================================================================
     PUBLIC API: window.MedicareDB
     ================================================================ */
  window.MedicareDB = {
    isLive: _isLive,

    /* ---- PRODUCTS ---- */
    async getProducts(options = {}) {
      const data = await sbQuery('products', q => {
        let query = q.select('*').order('created_at', { ascending: false });
        if (options.specialty && options.specialty !== 'all') query = query.eq('specialty', options.specialty);
        if (options.badge) query = query.eq('badge', options.badge);
        if (options.limit) query = query.limit(options.limit);
        return query;
      });
      if (data && data.length > 0) return data;
      // Fallback
      let items = [...FALLBACK_PRODUCTS];
      if (options.specialty && options.specialty !== 'all') items = items.filter(p => p.specialty === options.specialty);
      if (options.limit) items = items.slice(0, options.limit);
      return items;
    },

    async getProductById(id) {
      const data = await sbQuery('products', q => q.select('*').eq('id', id).single());
      if (data) return data;
      return FALLBACK_PRODUCTS.find(p => p.id === id) || null;
    },

    /**
     * saveProduct — INSERT a new product or UPDATE an existing one.
     * @param {Object} product  — full product object (must include `id`)
     * @param {boolean} isEdit  — true → UPDATE, false → INSERT
     * @returns {{ success: boolean, error: string|null }}
     */
    async saveProduct(product, isEdit = false) {
      if (!_isLive || !supabase) {
        console.warn('[MedicareDB] saveProduct: Supabase not connected, localStorage only.');
        return { success: false, error: 'Supabase not connected' };
      }
      try {
        let result;
        if (isEdit) {
          // UPDATE — match by primary key `id`
          const { id, ...fields } = product;
          result = await supabase.from('products').update(fields).eq('id', id);
        } else {
          // INSERT — upsert to handle duplicate SKUs gracefully
          result = await supabase.from('products').upsert([product], { onConflict: 'id' });
        }
        if (result.error) {
          console.error('[MedicareDB] saveProduct error:', result.error.message);
          return { success: false, error: result.error.message };
        }
        return { success: true, error: null };
      } catch (e) {
        console.error('[MedicareDB] saveProduct exception:', e);
        return { success: false, error: e.message };
      }
    },

    /**
     * deleteProduct — permanently removes a product from Supabase.
     * @param {string} productId
     * @returns {{ success: boolean, error: string|null }}
     */
    async deleteProduct(productId) {
      if (!_isLive || !supabase) {
        return { success: false, error: 'Supabase not connected' };
      }
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          console.error('[MedicareDB] deleteProduct error:', error.message);
          return { success: false, error: error.message };
        }
        return { success: true, error: null };
      } catch (e) {
        console.error('[MedicareDB] deleteProduct exception:', e);
        return { success: false, error: e.message };
      }
    },

    async updateStock(productId, newStock) {
      if (_isLive && supabase) {
        await sbQuery('products', q => q.update({ stock: newStock }).eq('id', productId));
      }
      return true;
    },

    /* ---- CATEGORIES ---- */
    async getCategories() {
      const data = await sbQuery('categories', q => q.select('*').order('name'));
      return data || [];
    },

    /* ---- WILAYAS & COMMUNES ---- */
    async getWilayas() {
      const data = await sbQuery('wilayas', q => q.select('code, name, zone, delivery_fee_home, delivery_fee_stopdesk').order('code'));
      if (data && data.length > 0) return data;
      // Inline fallback for key wilayas
      return [
        { code:'09', name:'09 - Blida', zone:'capital', delivery_fee_home:400, delivery_fee_stopdesk:250 },
        { code:'16', name:'16 - Alger (العاصمة)', zone:'capital', delivery_fee_home:400, delivery_fee_stopdesk:250 },
        { code:'25', name:'25 - Constantine', zone:'north', delivery_fee_home:600, delivery_fee_stopdesk:350 },
        { code:'31', name:'31 - Oran', zone:'north', delivery_fee_home:600, delivery_fee_stopdesk:350 },
        { code:'35', name:'35 - Boumerdes', zone:'capital', delivery_fee_home:400, delivery_fee_stopdesk:250 }
      ];
    },

    async getCommunes(wilayaCode) {
      const data = await sbQuery('communes', q => q.select('id, name').eq('wilaya_code', wilayaCode).order('name'));
      return data || [];
    },

    /* ---- ORDERS ---- */
    async createOrder(orderObj) {
      const generatedNum = 'MC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      const orderNumber = orderObj.order_number || orderObj.id || generatedNum;

      const newOrder = {
        id: orderNumber,
        order_number: orderNumber,
        ...orderObj,
        status: orderObj.status || 'Pending',
        created_at: orderObj.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Write to Supabase
      if (_isLive && supabase) {
        try {
          const { error } = await supabase.from('orders').insert([newOrder]);
          if (error) console.warn('[MedicareDB] createOrder error:', error.message);
        } catch (e) { console.warn('[MedicareDB] createOrder exception:', e); }
      }

      // Always persist in localStorage as fallback & instant local availability
      const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      // Filter out duplicate if already present
      const filtered = localOrders.filter(o => o.order_number !== orderNumber && o.id !== orderNumber);
      filtered.unshift(newOrder);
      localStorage.setItem('medicare_orders_db', JSON.stringify(filtered));
      return newOrder;
    },

    async trackOrder(orderNumber, phone) {
      const cleanNum = (orderNumber || '').trim().replace(/^#/, '').toUpperCase();
      const cleanPhone = (phone || '').replace(/\D/g, ''); // digits only

      const matchPhone = (p) => {
        if (!cleanPhone || !p) return true;
        const digitsP = String(p).replace(/\D/g, '');
        if (digitsP === cleanPhone) return true;
        const p1 = digitsP.replace(/^213/, '0');
        const p2 = cleanPhone.replace(/^213/, '0');
        return p1 === p2 || p1.endsWith(p2) || p2.endsWith(p1);
      };

      // 1. Try Supabase
      if (_isLive && supabase) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .ilike('order_number', cleanNum);

          if (data && data.length > 0) {
            const matched = data.find(o => matchPhone(o.phone));
            if (matched) return matched;
          }
        } catch (e) {
          console.warn('[MedicareDB] trackOrder Supabase query error:', e);
        }
      }

      // 2. Try localStorage
      const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      const local = localOrders.find(o =>
        (o.order_number || o.id || '').toUpperCase() === cleanNum && matchPhone(o.phone)
      );
      if (local) return local;

      // 3. Real behavior: Return null if no match found
      return null;
    },

    async getOrders() {
      const ordersMap = new Map();

      // 1. Fetch from Supabase
      if (_isLive && supabase) {
        try {
          const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (data && data.length > 0) {
            data.forEach(o => ordersMap.set(o.order_number || o.id, o));
          }
        } catch (e) {
          console.warn('[MedicareDB] getOrders Supabase error:', e);
        }
      }

      // 2. Fetch from localStorage
      const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      localOrders.forEach(o => {
        const key = o.order_number || o.id;
        if (!ordersMap.has(key)) {
          ordersMap.set(key, o);
        } else {
          // Merge local updated status if newer
          const existing = ordersMap.get(key);
          if (o.status && o.status !== existing.status) {
            existing.status = o.status;
          }
        }
      });

      // 3. Seed demo orders if completely empty
      if (ordersMap.size === 0) {
        const defaultDemos = [
          { id:'MC-2026-9418', order_number:'MC-2026-9418', customer_name:'Dr. Ahmed Benali', phone:'0550 00 00 00', wilaya:'16 - Alger (El Biar)', commune:'El Biar', delivery_type:'home', total:31000, subtotal:30600, delivery_fee:400, status:'Shipped', created_at: new Date().toISOString(), items:[{ name: 'Obsidian Flex Scrub Set', qty: 2, price: 10700 }, { name: 'Titanium Master Stethoscope', qty: 1, price: 19800 }] },
          { id:'MC-2026-9417', order_number:'MC-2026-9417', customer_name:'Amina M.', phone:'0661 22 33 44', wilaya:'31 - Oran', commune:'Es Senia', delivery_type:'stopdesk', total:17400, subtotal:17000, delivery_fee:400, status:'Preparing', created_at: new Date().toISOString(), items:[{ name: '1st Year Pharmacy Starter Kit', qty: 1, price: 17400 }] },
          { id:'MC-2026-9416', order_number:'MC-2026-9416', customer_name:'Dr. Yacine B.', phone:'0770 11 22 33', wilaya:'25 - Constantine', commune:'El Khroub', delivery_type:'home', total:9000, subtotal:8400, delivery_fee:600, status:'Delivered', created_at: new Date().toISOString(), items:[{ name: 'Obsidian Clinical Cushion Clogs', qty: 1, price: 9000 }] }
        ];
        return defaultDemos;
      }

      return Array.from(ordersMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    async updateOrderStatus(orderId, newStatus) {
      const cleanId = String(orderId).replace(/^#/, '').trim();
      if (_isLive && supabase) {
        try {
          const { error } = await supabase.from('orders').update({
            status: newStatus,
            updated_at: new Date().toISOString()
          }).eq('order_number', cleanId);

          if (error) {
            await supabase.from('orders').update({
              status: newStatus,
              updated_at: new Date().toISOString()
            }).eq('id', cleanId);
          }
        } catch (e) {
          console.warn('[MedicareDB] updateOrderStatus error:', e);
        }
      }

      // Update localStorage
      const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      const order = localOrders.find(o => o.id === cleanId || o.order_number === cleanId);
      if (order) {
        order.status = newStatus;
        localStorage.setItem('medicare_orders_db', JSON.stringify(localOrders));
      }
      return true;
    },

    /* ---- REVIEWS ---- */
    async submitReview(reviewObj) {
      if (_isLive && supabase) {
        await sbQuery('reviews', q =>
          q.insert([{ ...reviewObj, is_approved: true, created_at: new Date().toISOString() }])
        );
      }
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      localReviews.unshift({ id: 'REV-' + Date.now(), ...reviewObj, is_approved: true });
      localStorage.setItem('medicare_reviews_db', JSON.stringify(localReviews));
      return true;
    },

    /* ---- COUPONS ---- */
    async validateCoupon(code) {
      const data = await sbQuery('coupons', q =>
        q.select('*').eq('code', code.toUpperCase()).eq('active', true).single()
      );
      return data || null;
    },

    /* ---- CUSTOMER AUTH & ACCOUNTS ---- */
    getCurrentCustomer() {
      try {
        const raw = localStorage.getItem('medicare_customer_session');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    async signUpCustomer({ name, phone, email, password, medical_role }) {
      const cleanPhone = (phone || '').trim();
      const authEmail = (email && email.trim()) ? email.trim() : `${cleanPhone.replace(/\D/g, '') || Date.now()}@customer.medicare.dz`;

      const newCustomer = {
        id: 'CUST-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
        name: name.trim(),
        phone: cleanPhone,
        email: authEmail,
        medical_role: medical_role || 'Doctor / Student',
        addresses: [],
        password: password,
        created_at: new Date().toISOString()
      };

      // 1. Supabase Auth + Customers Table
      if (_isLive && supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: authEmail,
            password: password,
            options: { data: { name: newCustomer.name, phone: cleanPhone } }
          });
          if (!authError && authData?.user) {
            newCustomer.id = authData.user.id;
          }
          await supabase.from('customers').insert([{
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: authEmail,
            medical_role: newCustomer.medical_role,
            addresses: []
          }]);
        } catch (e) {
          console.warn('[MedicareDB] Supabase signUpCustomer exception:', e);
        }
      }

      // 2. Persist in Local Database
      const localCustomers = JSON.parse(localStorage.getItem('medicare_customers_db') || '[]');
      const filtered = localCustomers.filter(c => c.phone !== cleanPhone && c.email !== authEmail);
      filtered.unshift(newCustomer);
      localStorage.setItem('medicare_customers_db', JSON.stringify(filtered));

      // 3. Set Active Session
      localStorage.setItem('medicare_customer_session', JSON.stringify(newCustomer));

      // 4. Sync Wishlist & Cart to Customer
      this.syncWishlistOnAuth(newCustomer);

      return { success: true, customer: newCustomer };
    },

    async signInCustomer({ emailOrPhone, password }) {
      const input = (emailOrPhone || '').trim();
      const cleanDigits = input.replace(/\D/g, '');

      let matchedCustomer = null;

      // 1. Try Supabase Auth if email
      if (_isLive && supabase && input.includes('@')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: input,
            password: password
          });
          if (!error && data?.user) {
            const { data: custData } = await supabase.from('customers').select('*').eq('id', data.user.id).single();
            if (custData) matchedCustomer = custData;
            else matchedCustomer = { id: data.user.id, name: data.user.user_metadata?.name || input.split('@')[0], phone: data.user.user_metadata?.phone || '', email: input, addresses: [] };
          }
        } catch (e) {
          console.warn('[MedicareDB] Supabase signInCustomer exception:', e);
        }
      }

      // 2. Local database fallback lookup by email OR phone
      if (!matchedCustomer) {
        const localCustomers = JSON.parse(localStorage.getItem('medicare_customers_db') || '[]');
        matchedCustomer = localCustomers.find(c =>
          (c.email && c.email.toLowerCase() === input.toLowerCase()) ||
          (c.phone && c.phone.replace(/\D/g, '') === cleanDigits && cleanDigits.length >= 8)
        );
      }

      // 3. Demo fallback if user enters test phone/email
      if (!matchedCustomer && (input === '0550000000' || input === 'doctor@medicare.dz' || input === 'demo')) {
        matchedCustomer = {
          id: 'CUST-DEMO-101',
          name: 'Dr. Ahmed Benali',
          phone: '0550000000',
          email: 'doctor@medicare.dz',
          medical_role: 'Resident • General Surgery',
          addresses: [
            { id: 'ADDR-1', wilaya: '16 - Alger (العاصمة)', commune: 'El Biar', address: '14 Rue Didouche Mourad' }
          ]
        };
      }

      if (matchedCustomer) {
        localStorage.setItem('medicare_customer_session', JSON.stringify(matchedCustomer));
        this.syncWishlistOnAuth(matchedCustomer);
        return { success: true, customer: matchedCustomer };
      }

      return { success: false, error: 'Invalid email/phone or password. Please check your details or create a new account.' };
    },

    signOutCustomer() {
      localStorage.removeItem('medicare_customer_session');
      if (_isLive && supabase) {
        try { supabase.auth.signOut(); } catch (e) {}
      }
    },

    async getCustomerOrders(customer) {
      if (!customer) return [];
      const allOrders = await this.getOrders();
      const cleanPhone = (customer.phone || '').replace(/\D/g, '');
      const custEmail = (customer.email || '').toLowerCase();

      return allOrders.filter(o => {
        if (o.customer_id && o.customer_id === customer.id) return true;
        const oPhone = (o.phone || '').replace(/\D/g, '');
        if (cleanPhone && oPhone && (oPhone === cleanPhone || oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone))) return true;
        if (custEmail && o.customer_email && o.customer_email.toLowerCase() === custEmail) return true;
        return false;
      });
    },

    async saveCustomerAddress(customer, newAddressObj) {
      if (!customer) return false;
      if (!customer.addresses) customer.addresses = [];
      customer.addresses.push({ id: 'ADDR-' + Date.now(), ...newAddressObj });

      // Update session
      localStorage.setItem('medicare_customer_session', JSON.stringify(customer));

      // Update local db
      const localCustomers = JSON.parse(localStorage.getItem('medicare_customers_db') || '[]');
      const c = localCustomers.find(i => i.id === customer.id || i.phone === customer.phone);
      if (c) {
        c.addresses = customer.addresses;
        localStorage.setItem('medicare_customers_db', JSON.stringify(localCustomers));
      }

      // Update Supabase if live
      if (_isLive && supabase && customer.id) {
        try {
          await supabase.from('customers').update({ addresses: customer.addresses }).eq('id', customer.id);
        } catch (e) {}
      }
      return true;
    },

    syncWishlistOnAuth(customer) {
      if (!customer) return;
      const key = `medicare_wishlist_${customer.id}`;
      const savedAccWishlist = JSON.parse(localStorage.getItem(key) || 'null');
      const currentLocal = JSON.parse(localStorage.getItem('medicare_wishlist') || '[]');

      if (savedAccWishlist && Array.isArray(savedAccWishlist)) {
        const merged = [...savedAccWishlist];
        currentLocal.forEach(item => {
          if (!merged.find(m => m.id === item.id)) {
            merged.push(item);
          }
        });
        localStorage.setItem('medicare_wishlist', JSON.stringify(merged));
        localStorage.setItem(key, JSON.stringify(merged));
      } else if (currentLocal.length > 0) {
        localStorage.setItem(key, JSON.stringify(currentLocal));
      }
    },

    /* ---- STAFF AUTH ---- */
    async getStaffByEmail(email) {
      // staff table has RLS - requires service role or policy
      // For now return from local lookup
      const roles = {
        'owner@medicare.dz':   { name: 'Dr. Karim Owner',    role: 'Owner',           permissions: ['all'] },
        'manager@medicare.dz': { name: 'Youcef Manager',     role: 'Store Manager',   permissions: ['products','inventory','categories','coupons','homepage','reports'] },
        'handler@medicare.dz': { name: 'Farid Order Handler', role: 'Order Handler',  permissions: ['orders','customers','reviews'] },
        'support@medicare.dz': { name: 'Sara Support',       role: 'Support & Content', permissions: ['reviews','homepage'] }
      };
      return roles[email] || null;
    },

    async signInStaff(email, password) {
      if (_isLive && supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data?.user) {
            const staffInfo = await this.getStaffByEmail(email);
            return { success: true, user: data.user, staff: staffInfo };
          }
        } catch (e) { console.warn('[MedicareDB] signInStaff exception:', e); }
      }
      return { success: false };
    },

    async signOut() {
      if (_isLive && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('medicare_admin_session');
    },

    /* ---- AUDIT LOG ---- */
    async logAudit(staffName, action, target) {
      const entry = {
        staff_name: staffName,
        action: action,
        target: target,
        ip_address: '(Algeria)',
        created_at: new Date().toISOString()
      };
      if (_isLive && supabase) {
        await sbQuery('audit_logs', q => q.insert([entry]));
      }
      // Always keep in localStorage for admin UI
      const logs = JSON.parse(localStorage.getItem('medicare_audit_db') || '[]');
      logs.unshift({
        timestamp: entry.created_at.replace('T', ' ').substring(0, 19),
        staff: staffName,
        action,
        target,
        ip: entry.ip_address
      });
      localStorage.setItem('medicare_audit_db', JSON.stringify(logs.slice(0, 200)));
    }
  };

  // Log connection status
  if (_isLive) {
    console.log('%c✅ MedicareDB LIVE — Supabase Connected', 'color:#0E4D45;font-weight:bold;font-size:13px;');
  } else {
    console.log('%c⚠️ MedicareDB OFFLINE — Using local fallback data', 'color:#D97706;font-weight:bold;font-size:13px;');
  }
})();
