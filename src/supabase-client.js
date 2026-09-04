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

  // Initialize Supabase SDK — singleton, exposed globally to avoid multiple GoTrueClient instances
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    if (!window._medicareSupabaseClient) {
      try {
        supabase = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        window._medicareSupabaseClient = supabase;
        _isLive = true;
        console.log('⚡ MEDICARE — Supabase Live DB Connected:', config.SUPABASE_URL);
      } catch (e) {
        console.warn('⚠️ Supabase init failed, using local fallback:', e);
      }
    } else {
      supabase = window._medicareSupabaseClient;
      _isLive = true;
    }
  }

  /* ---- LOCAL FALLBACK (reads from single source of truth product-catalog.js) ---- */
  function getFallbackProducts() {
    if (typeof window !== 'undefined' && window.PRODUCT_CATALOG) return window.PRODUCT_CATALOG;
    if (typeof require !== 'undefined') {
      try { return require('./product-catalog.js').PRODUCT_CATALOG; } catch (e) {}
    }
    return [];
  }

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
      let remoteData = [];
      try {
        const data = await sbQuery('products', q => {
          let query = q.select('*').order('created_at', { ascending: false });
          if (options.specialty && options.specialty !== 'all') query = query.eq('specialty', options.specialty);
          if (options.badge) query = query.eq('badge', options.badge);
          if (options.limit) query = query.limit(options.limit);
          return query;
        });
        if (data && Array.isArray(data)) remoteData = data;
      } catch (e) {
        console.warn('[MedicareDB] getProducts remote query error:', e);
      }

      // Merge localStorage custom products
      let localData = [];
      try {
        localData = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
      } catch (e) {}

      const prodsMap = new Map();
      remoteData.forEach(p => {
        if (p && (p.id || p.sku)) {
          const key = String(p.id || p.sku);
          prodsMap.set(key, { ...p });
        }
      });

      // localStorage custom products take precedence and enrich remote data
      localData.forEach(p => {
        if (p && (p.id || p.sku)) {
          const key = String(p.id || p.sku);
          const existing = prodsMap.get(key);
          if (existing) {
            prodsMap.set(key, {
              ...existing,
              ...p,
              images: (Array.isArray(p.images) && p.images.length > 0) ? p.images : (existing.images || []),
              img: p.img || (p.images && p.images[0]) || existing.img || ''
            });
          } else {
            prodsMap.set(key, { ...p });
          }
        }
      });

      // Keep newly added custom products at the front of the list
      const finalItems = [];
      const seenKeys = new Set();
      localData.forEach(lp => {
        if (lp && (lp.id || lp.sku)) {
          const key = String(lp.id || lp.sku);
          if (!seenKeys.has(key)) {
            finalItems.push(prodsMap.get(key) || lp);
            seenKeys.add(key);
          }
        }
      });
      remoteData.forEach(rp => {
        if (rp && (rp.id || rp.sku)) {
          const key = String(rp.id || rp.sku);
          if (!seenKeys.has(key)) {
            finalItems.push(prodsMap.get(key) || rp);
            seenKeys.add(key);
          }
        }
      });

      let items = finalItems.length > 0 ? finalItems : Array.from(prodsMap.values());
      if (items.length === 0) {
        items = [...getFallbackProducts()];
      }

      if (options.specialty && options.specialty !== 'all') {
        items = items.filter(p => p.specialty === options.specialty);
      }
      if (options.limit) {
        items = items.slice(0, options.limit);
      }
      return items;
    },

    async getProductById(id) {
      let localProd = null;
      try {
        const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
        localProd = customProds.find(p => String(p.id) === String(id) || (p.sku && String(p.sku) === String(id)));
      } catch (e) {}

      // ── 1. Try Supabase
      let remoteProd = null;
      if (_isLive && supabase) {
        try {
          const { data, error } = await supabase.from('products').select('*').eq('id', id).limit(1);
          if (!error && data && data.length > 0) remoteProd = data[0];
          if (!remoteProd) {
            const { data: data2, error: e2 } = await supabase.from('products').select('*').eq('id', String(id)).limit(1);
            if (!e2 && data2 && data2.length > 0) remoteProd = data2[0];
          }
        } catch (e) {
          console.warn('[MedicareDB] getProductById Supabase error:', e);
        }
      }

      if (localProd && remoteProd) {
        return {
          ...remoteProd,
          ...localProd,
          images: (Array.isArray(localProd.images) && localProd.images.length > 0) ? localProd.images : (remoteProd.images || []),
          img: localProd.img || (localProd.images && localProd.images[0]) || remoteProd.img || ''
        };
      }
      if (localProd) return localProd;
      if (remoteProd) return remoteProd;

      // ── 3. Fall back to static local catalog
      return getFallbackProducts().find(p => String(p.id) === String(id) || (p.sku && String(p.sku) === String(id))) || null;
    },

    /**
     * saveProduct — INSERT a new product or UPDATE an existing one.
     * Includes automatic schema mismatch auto-recovery (strips missing columns and retries).
     * @param {Object} product  — full product object (must include `id`)
     * @param {boolean} isEdit  — true → UPDATE, false → INSERT
     * @returns {{ success: boolean, error: string|null }}
     */
    async saveProduct(product, isEdit = false) {
      // 1. Always ensure persistent local storage backup
      try {
        let localList = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
        const pId = String(product.id || product.sku || '');
        if (pId) {
          const idx = localList.findIndex(p => String(p.id || p.sku) === pId);
          if (idx >= 0) {
            localList[idx] = { ...localList[idx], ...product };
          } else {
            localList.unshift(product);
          }
          localStorage.setItem('medicare_custom_products', JSON.stringify(localList));
        }
      } catch (locErr) {
        console.warn('[MedicareDB] Local save helper error:', locErr);
      }

      if (!_isLive || !supabase) {
        console.warn('[MedicareDB] saveProduct: Supabase not connected, localStorage only.');
        return { success: true, error: 'Saved locally (Supabase offline)' };
      }
      try {
        // Map and sanitize fields for PostgreSQL table compatibility
        const currentFields = { ...product };
        if (!currentFields.id && currentFields.sku) {
          currentFields.id = currentFields.sku;
        }
        // Remove client-only alias fields that aren't database columns
        delete currentFields.sku;

        let attempts = 0;
        while (attempts < 12) {
          attempts++;
          let result;
          if (isEdit) {
            const { id, ...updateFields } = currentFields;
            result = await supabase.from('products').update(updateFields).eq('id', id);
          } else {
            result = await supabase.from('products').upsert([currentFields], { onConflict: 'id' });
          }

          if (!result.error) {
            return { success: true, error: null };
          }

          const errMsg = result.error.message || '';
          // Auto-recovery: if a column doesn't exist in the database table schema cache
          const match = errMsg.match(/Could not find the '([^']+)' column/i);
          if (match && match[1] && currentFields.hasOwnProperty(match[1])) {
            delete currentFields[match[1]];
            continue; // Retry with remaining fields
          }

          // If another error occurred
          console.warn('[MedicareDB] saveProduct remote error (fallback to local):', errMsg);
          return { success: true, error: errMsg, savedLocally: true };
        }

        return { success: true, error: 'Max retry attempts reached, saved locally', savedLocally: true };
      } catch (e) {
        console.warn('[MedicareDB] saveProduct exception (saved locally):', e);
        return { success: true, error: e.message, savedLocally: true };
      }
    },

    /**
     * deleteProduct — permanently removes a product from Supabase & localStorage.
     * @param {string} productId
     * @returns {{ success: boolean, error: string|null }}
     */
    async deleteProduct(productId) {
      // 1. Delete from localStorage
      try {
        let localList = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
        localList = localList.filter(p => String(p.id) !== String(productId) && String(p.sku) !== String(productId));
        localStorage.setItem('medicare_custom_products', JSON.stringify(localList));
      } catch (e) {}

      if (!_isLive || !supabase) {
        return { success: true, error: 'Removed locally' };
      }
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          console.warn('[MedicareDB] deleteProduct remote error:', error.message);
          return { success: true, error: error.message };
        }
        return { success: true, error: null };
      } catch (e) {
        console.warn('[MedicareDB] deleteProduct remote exception:', e);
        return { success: true, error: e.message };
      }
    },

    /**
     * uploadProductImage — uploads an image file to Supabase Storage with automatic compression fallback.
     * @param {File} file  — the image File object from <input type="file">
     * @returns {{ url: string|null, error: string|null }}
     */
    async uploadProductImage(file) {
      const compressFallback = (imgFile) => {
        return new Promise((resolve) => {
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
              resolve({ url: canvas.toDataURL('image/jpeg', 0.8), error: null });
            };
            img.onerror = () => resolve({ url: e.target.result, error: null });
            img.src = e.target.result;
          };
          reader.onerror = () => resolve({ url: null, error: 'FileReader failed' });
          reader.readAsDataURL(imgFile);
        });
      };

      if (!_isLive || !supabase) {
        return compressFallback(file);
      }

      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `product_${Date.now()}_${Math.random().toString(36).substring(2,8)}.${ext}`;
        const { data, error } = await supabase.storage
          .from('products')
          .upload(filename, file, { cacheControl: '3600', upsert: false });

        if (error) {
          console.warn('[MedicareDB] uploadProductImage storage bucket note:', error.message);
          return compressFallback(file);
        }
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
        return { url: urlData.publicUrl, error: null };
      } catch (e) {
        console.warn('[MedicareDB] uploadProductImage exception:', e);
        return compressFallback(file);
      }
    },

    async updateStock(productId, newStock, options = {}) {
      const cleanStock = Math.max(0, parseInt(newStock, 10) || 0);

      // 1. Sync in-memory catalog
      if (typeof window !== 'undefined') {
        if (window.PRODUCT_CATALOG) {
          const p = window.PRODUCT_CATALOG.find(it => it.id === productId);
          if (p) p.stock = cleanStock;
        }
        if (window.PRODUCT_CATALOG_MAP && window.PRODUCT_CATALOG_MAP[productId]) {
          window.PRODUCT_CATALOG_MAP[productId].stock = cleanStock;
        }
      }

      // 2. Persist in localStorage stock overrides
      try {
        const overrides = JSON.parse(localStorage.getItem('medicare_stock_overrides') || '{}');
        overrides[productId] = cleanStock;
        localStorage.setItem('medicare_stock_overrides', JSON.stringify(overrides));
      } catch (e) {
        console.warn('[MedicareDB] Failed to save stock override:', e);
      }

      // 3. Persist in custom products if custom
      try {
        const customProds = JSON.parse(localStorage.getItem('medicare_custom_products') || '[]');
        const cp = customProds.find(p => p.id === productId);
        if (cp) {
          cp.stock = cleanStock;
          localStorage.setItem('medicare_custom_products', JSON.stringify(customProds));
        }
      } catch (e) {}

      // 4. Sync with Supabase
      if (_isLive && supabase) {
        try {
          await supabase.from('products').update({ stock: cleanStock }).eq('id', productId);
        } catch (e) {
          console.warn('[MedicareDB] Supabase stock update error:', e);
        }
      }

      // 5. Log stock movement if requested
      if (options.logMovement && options.type) {
        this.logStockMovement({
          productId: productId,
          productName: options.productName || productId,
          type: options.type, // 'IN', 'OUT', 'RETURN', 'ADJUST'
          qty: options.qty || 0,
          stockBefore: options.stockBefore ?? cleanStock,
          stockAfter: cleanStock,
          reason: options.reason || 'Manual Adjustment',
          staff: options.staff || 'System / Store Admin',
          orderNumber: options.orderNumber || null
        });
      }

      window.dispatchEvent(new CustomEvent('medicare_stock_updated', { detail: { productId, stock: cleanStock } }));
      return cleanStock;
    },

    logStockMovement(entry) {
      try {
        const logs = JSON.parse(localStorage.getItem('medicare_stock_logs') || '[]');
        const newEntry = {
          id: 'STK-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
          timestamp: new Date().toISOString(),
          productId: entry.productId,
          productName: entry.productName || entry.productId,
          type: entry.type || 'ADJUST', // 'IN', 'OUT', 'RETURN', 'ADJUST'
          qty: Math.abs(Number(entry.qty) || 0),
          stockBefore: Number(entry.stockBefore) || 0,
          stockAfter: Number(entry.stockAfter) || 0,
          reason: entry.reason || 'Inventory Adjustment',
          staff: entry.staff || 'Store Staff',
          orderNumber: entry.orderNumber || null
        };
        logs.unshift(newEntry);
        // Keep last 150 operations
        localStorage.setItem('medicare_stock_logs', JSON.stringify(logs.slice(0, 150)));
        window.dispatchEvent(new CustomEvent('medicare_stock_logs_updated'));
      } catch (e) {
        console.warn('[MedicareDB] Failed to log stock movement:', e);
      }
    },

    getStockLogs() {
      try {
        return JSON.parse(localStorage.getItem('medicare_stock_logs') || '[]');
      } catch (e) {
        return [];
      }
    },

    /* ---- CATEGORIES ---- */
    async getCategories() {
      const data = await sbQuery('categories', q => q.select('*').order('name'));
      return data || [];
    },

    /* ---- WILAYAS & COMMUNES ---- */
    async getWilayas() {
      const data = await sbQuery('wilayas', q => q.select('code, name, zone, delivery_fee_home, delivery_fee_stopdesk').order('code'));
      if (data && data.length >= 58) return data;
      if (typeof WILAYAS_DATA !== 'undefined' && Array.isArray(WILAYAS_DATA) && WILAYAS_DATA.length >= 58) {
        return WILAYAS_DATA;
      }
      return data || [];
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

      // Write to Supabase — only columns that exist in the orders table schema
      if (_isLive && supabase) {
        try {
          const SUPABASE_ORDER_COLUMNS = [
            'id', 'order_number', 'customer_name', 'phone', 'wilaya', 'commune',
            'address', 'delivery_type', 'items', 'subtotal', 'delivery_fee',
            'total', 'status', 'coupon_code', 'courier_company', 'courier_name',
            'created_at', 'updated_at'
          ];
          const sbPayload = {};
          SUPABASE_ORDER_COLUMNS.forEach(col => {
            if (newOrder[col] !== undefined) sbPayload[col] = newOrder[col];
          });
          const { error } = await supabase.from('orders').insert([sbPayload]);
          if (error) console.warn('[MedicareDB] createOrder error:', error.message);
        } catch (e) { console.warn('[MedicareDB] createOrder exception:', e); }
      }

      // Always persist in localStorage as fallback & instant local availability
      const MAX_LOCAL_ORDERS = 50;
      try {
        const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
        const filtered = localOrders.filter(o => o.order_number !== orderNumber && o.id !== orderNumber);
        // Strip base64 image data from items to save space
        const leanOrder = { ...newOrder };
        if (leanOrder.items && Array.isArray(leanOrder.items)) {
          leanOrder.items = leanOrder.items.map(item => {
            const lean = { ...item };
            if (lean.image && typeof lean.image === 'string' && lean.image.startsWith('data:')) {
              lean.image = null;
            }
            if (lean.img && typeof lean.img === 'string' && lean.img.startsWith('data:')) {
              lean.img = null;
            }
            return lean;
          });
        }
        filtered.unshift(leanOrder);
        // Cap to most recent N orders
        const trimmed = filtered.slice(0, MAX_LOCAL_ORDERS);
        localStorage.setItem('medicare_orders_db', JSON.stringify(trimmed));
      } catch (e) {
        console.warn('[MedicareDB] localStorage orders save failed:', e);
        if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
          window.showToast('⚠️ Order saved remotely but local history unavailable.');
        }
      }
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

      return Array.from(ordersMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    async updateOrderStatus(orderId, newStatus) {
      const cleanId = String(orderId).replace(/^#/, '').trim();
      const nowIso = new Date().toISOString();
      const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Shipped', 'Delivered', 'Cancelled'];
      const matchedStatus = validStatuses.find(s => s.toLowerCase() === String(newStatus).toLowerCase()) || newStatus;

      if (_isLive && supabase) {
        try {
          const updatePayload = {
            status: matchedStatus,
            updated_at: nowIso
          };

          const { error } = await supabase.from('orders').update(updatePayload).eq('order_number', cleanId);

          if (error) {
            await supabase.from('orders').update(updatePayload).eq('id', cleanId);
          }
        } catch (e) {
          console.warn('[MedicareDB] updateOrderStatus error:', e);
        }
      }

      // Update localStorage
      const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
      const order = localOrders.find(o => String(o.id || '').replace(/^#/, '') === cleanId || String(o.order_number || '').replace(/^#/, '') === cleanId);
      if (order) {
        order.status = matchedStatus;
        order.status_updated_at = nowIso;
        order.updated_at = nowIso;
        localStorage.setItem('medicare_orders_db', JSON.stringify(localOrders));
      }
      return true;
    },

    async deleteOrder(orderId) {
      const cleanId = String(orderId).replace(/^#/, '').trim();
      if (_isLive && supabase) {
        try {
          const { error } = await supabase.from('orders').delete().eq('order_number', cleanId);
          if (error) {
            await supabase.from('orders').delete().eq('id', cleanId);
          }
        } catch (e) {
          console.warn('[MedicareDB] deleteOrder Supabase error:', e);
        }
      }

      // Remove from localStorage
      try {
        const localOrders = JSON.parse(localStorage.getItem('medicare_orders_db') || '[]');
        const filtered = localOrders.filter(o => {
          const oNum = String(o.order_number || o.id || '').replace(/^#/, '').trim();
          return oNum !== cleanId && o.id !== cleanId && o.order_number !== cleanId;
        });
        localStorage.setItem('medicare_orders_db', JSON.stringify(filtered));
      } catch (e) {
        console.warn('[MedicareDB] deleteOrder localStorage error:', e);
      }
      return true;
    },

    async cleanupExpiredOrders(maxAgeHours = 24) {
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      const now = Date.now();
      let cleanedCount = 0;
      try {
        const allOrders = await this.getOrders();
        for (const order of allOrders) {
          const status = (order.status || '').toLowerCase();
          if (status === 'delivered' || status === 'cancelled') {
            const timestamp = order.status_updated_at || order.updated_at || order.created_at;
            const refTime = timestamp ? new Date(timestamp).getTime() : 0;
            if (refTime > 0 && (now - refTime) >= maxAgeMs) {
              const orderId = order.order_number || order.id;
              if (orderId) {
                await this.deleteOrder(orderId);
                cleanedCount++;
              }
            }
          }
        }
      } catch (e) {
        console.warn('[MedicareDB] cleanupExpiredOrders error:', e);
      }
      return cleanedCount;
    },

    /* ---- REVIEWS ---- */
    async submitReview(reviewObj) {
      if (_isLive && supabase) {
        try {
          await sbQuery('reviews', q =>
            q.insert([{ ...reviewObj, is_approved: true, created_at: new Date().toISOString() }])
          );
        } catch (e) {
          console.warn('[MedicareDB] submitReview error:', e);
        }
      }
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      localReviews.unshift({ id: 'REV-' + Date.now(), ...reviewObj, is_approved: true, created_at: new Date().toISOString() });
      localStorage.setItem('medicare_reviews_db', JSON.stringify(localReviews));
      return true;
    },

    async getReviews(productIdOrOptions) {
      // Accept either a raw productId string or an options object { productId, limit }
      let productId = null;
      let limit = null;
      if (productIdOrOptions && typeof productIdOrOptions === 'object') {
        productId = productIdOrOptions.productId || null;
        limit = productIdOrOptions.limit || null;
      } else if (productIdOrOptions) {
        productId = String(productIdOrOptions);
      }

      if (_isLive && supabase) {
        try {
          let q = supabase.from('reviews').select('*').eq('is_approved', true);
          if (productId) q = q.eq('product_id', productId);
          q = q.order('created_at', { ascending: false });
          if (limit) q = q.limit(limit);
          const { data, error } = await q;
          if (!error && Array.isArray(data) && data.length > 0) return data;
        } catch (e) {
          console.warn('[MedicareDB] getReviews error:', e);
        }
      }
      const localReviews = JSON.parse(localStorage.getItem('medicare_reviews_db') || '[]');
      const filtered = productId ? localReviews.filter(r => r.product_id === productId) : localReviews;
      return limit ? filtered.slice(0, limit) : filtered;
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
      if (!matchedCustomer && (input === '0662497253' || input === '0550000000' || input === 'medicare3320@gmail.com' || input === 'doctor@medicare.dz' || input === 'demo')) {
        matchedCustomer = {
          id: 'CUST-DEMO-101',
          name: 'Dr. Ahmed Benali',
          phone: '0662497253',
          email: 'medicare3320@gmail.com',
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

    async subscribeNewsletter(email) {
      if (!email || !email.includes('@')) return { success: false, error: 'Invalid email address' };
      email = email.trim().toLowerCase();

      // Save to localStorage
      const localSubs = JSON.parse(localStorage.getItem('medicare_subscribers') || '[]');
      if (!localSubs.includes(email)) {
        localSubs.push(email);
        localStorage.setItem('medicare_subscribers', JSON.stringify(localSubs));
      }

      // Save to Supabase if live
      if (_isLive && supabase) {
        try {
          const { data, error } = await supabase.from('subscribers').insert([{ email, subscribed_at: new Date().toISOString() }]);
          if (error && error.code !== '23505') { // ignore duplicate key error
            console.warn('[MedicareDB] Supabase newsletter insert error:', error);
          }
        } catch (e) {
          console.warn('[MedicareDB] Supabase newsletter error:', e);
        }
      }
      return { success: true };
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
        try {
          await supabase.from('audit_logs').insert([entry]);
        } catch (e) {
          // Silent catch for RLS restrictions
        }
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
