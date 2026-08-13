/* ==========================================================================
   MEDICARE — ALGERIAN CASH ON DELIVERY CHECKOUT INTERACTIVE ENGINE
   58 Wilayas Database, Dependent Communes, Yalidine/ZR Delivery Fee Calculator,
   Free Shipping Progress, Form Validation, Coupon Engine, Order Confirmation
   ========================================================================== */

/* ------------------------------------------------------------------
   ALGERIAN 58 WILAYAS & COMMUNES DATA DATABASE
   ------------------------------------------------------------------ */
const WILAYAS_DATA = [
  { code: '01', name: '01 - Adrar', zone: 'south', communes: ['Adrar', 'Reggane', 'Timimoun', 'Zaouiet Kounta', 'Aoulef'] },
  { code: '02', name: '02 - Chlef', zone: 'north', communes: ['Chlef', 'Tenes', 'Boukadir', 'Oued Fodda', 'El Karimia'] },
  { code: '03', name: '03 - Laghouat', zone: 'south', communes: ['Laghouat', 'Aflou', 'Hassi R’Mel', 'Ksar El Hirane'] },
  { code: '04', name: '04 - Oum El Bouaghi', zone: 'north', communes: ['Oum El Bouaghi', 'Ain Beida', 'Ain M’lila'] },
  { code: '05', name: '05 - Batna', zone: 'north', communes: ['Batna', 'Barika', 'Ain Touta', 'N’Gaous', 'Arris'] },
  { code: '06', name: '06 - Béjaïa', zone: 'north', communes: ['Béjaïa', 'Amizour', 'Akbou', 'El Kseur', 'Tichy'] },
  { code: '07', name: '07 - Biskra', zone: 'south', communes: ['Biskra', 'Tolga', 'Sidi Okba', 'Ouled Djellal'] },
  { code: '08', name: '08 - Béchar', zone: 'south', communes: ['Béchar', 'Abadla', 'Kenadsa', 'Béni Abbès'] },
  { code: '09', name: '09 - Blida', zone: 'capital', communes: ['Blida', 'Boufarik', 'Ouled Yaich', 'Mouzaia', 'El Affroun'] },
  { code: '10', name: '10 - Bouira', zone: 'north', communes: ['Bouira', 'Lakhdaria', 'Sour El Ghozlane', 'Ain Bessem'] },
  { code: '11', name: '11 - Tamanrasset', zone: 'south', communes: ['Tamanrasset', 'In Salah', 'In Guezzam'] },
  { code: '12', name: '12 - Tébessa', zone: 'north', communes: ['Tébessa', 'Cheria', 'El Aouinet', 'Bir El Ater'] },
  { code: '13', name: '13 - Tlemcen', zone: 'north', communes: ['Tlemcen', 'Mansourah', 'Maghnia', 'Remchi', 'Ghazaouet'] },
  { code: '14', name: '14 - Tiaret', zone: 'north', communes: ['Tiaret', 'Sougueur', 'Frenda', 'Ksar Chellala'] },
  { code: '15', name: '15 - Tizi Ouzou', zone: 'north', communes: ['Tizi Ouzou', 'Draâ Ben Khedda', 'Azazga', 'Tigzirt', 'Boghni'] },
  { code: '16', name: '16 - Alger (العاصمة)', zone: 'capital', communes: ['El Biar', 'Hydra', 'Bab Ezzouar', 'Kouba', 'Sidi M’Hamed', 'Zeralda', 'Cheraga', 'Dely Ibrahim', 'Ain Taya', 'Bordj El Kiffan', 'Bachedjerrah', 'Draria', 'Saoula'] },
  { code: '17', name: '17 - Djelfa', zone: 'north', communes: ['Djelfa', 'Ain Oussera', 'Hassi Bahbah', 'Messaad'] },
  { code: '18', name: '18 - Jijel', zone: 'north', communes: ['Jijel', 'Tahar', 'El Milia', 'Ziama Mansouriah'] },
  { code: '19', name: '19 - Sétif', zone: 'north', communes: ['Sétif', 'El Eulma', 'Ain Oulmene', 'Ain Arnat', 'Bougaa'] },
  { code: '20', name: '20 - Saïda', zone: 'north', communes: ['Saïda', 'Ain El Hadjar', 'Youb'] },
  { code: '21', name: '21 - Skikda', zone: 'north', communes: ['Skikda', 'El Harrouch', 'Collo', 'Azzaba'] },
  { code: '22', name: '22 - Sidi Bel Abbès', zone: 'north', communes: ['Sidi Bel Abbès', 'Télagh', 'Sfisef', 'Ben Badis'] },
  { code: '23', name: '23 - Annaba', zone: 'north', communes: ['Annaba', 'El Bouni', 'Berrahal', 'El Hadjar'] },
  { code: '24', name: '24 - Guelma', zone: 'north', communes: ['Guelma', 'Oued Zenati', 'Bouchegouf'] },
  { code: '25', name: '25 - Constantine', zone: 'north', communes: ['Constantine', 'El Khroub', 'Hamma Bouziane', 'Didouche Mourad', 'Zighoud Youcef'] },
  { code: '26', name: '26 - Médéa', zone: 'north', communes: ['Médéa', 'Berrouaghia', 'Ksar El Boukhari'] },
  { code: '27', name: '27 - Mostaganem', zone: 'north', communes: ['Mostaganem', 'Ain Tedeles', 'Bouguerat'] },
  { code: '28', name: '28 - M’Sila', zone: 'north', communes: ['M’Sila', 'Bou Saâda', 'Sidi Aissa'] },
  { code: '29', name: '29 - Mascara', zone: 'north', communes: ['Mascara', 'Sigg', 'Tighennif'] },
  { code: '30', name: '30 - Ouargla', zone: 'south', communes: ['Ouargla', 'Hassi Messaoud', 'Touggourt'] },
  { code: '31', name: '31 - Oran (وهران)', zone: 'north', communes: ['Oran', 'Es Senia', 'Bir El Djir', 'Ain El Turk', 'Arzew', 'Betioua'] },
  { code: '32', name: '32 - El Bayadh', zone: 'south', communes: ['El Bayadh', 'Brezina', 'El Abiodh Sidi Cheikh'] },
  { code: '33', name: '33 - Illizi', zone: 'south', communes: ['Illizi', 'Djanet'] },
  { code: '34', name: '34 - Bordj Bou Arréridj', zone: 'north', communes: ['Bordj Bou Arréridj', 'Ras El Oued', 'Bordj Ghedir'] },
  { code: '35', name: '35 - Boumerdès', zone: 'capital', communes: ['Boumerdès', 'Bordj Menaiel', 'Khemis El Khechna', 'Dellys'] },
  { code: '36', name: '36 - El Tarf', zone: 'north', communes: ['El Tarf', 'El Kala', 'Ben M’Hidi'] },
  { code: '37', name: '37 - Tindouf', zone: 'south', communes: ['Tindouf'] },
  { code: '38', name: '38 - Tissemsilt', zone: 'north', communes: ['Tissemsilt', 'Theniet El Had'] },
  { code: '39', name: '39 - El Oued', zone: 'south', communes: ['El Oued', 'Robbah', 'El M’Ghair', 'Djamaa'] },
  { code: '40', name: '40 - Khenchela', zone: 'north', communes: ['Khenchela', 'Kais', 'Chechar'] },
  { code: '41', name: '41 - Souk Ahras', zone: 'north', communes: ['Souk Ahras', 'Sedrata', 'M’daourouch'] },
  { code: '42', name: '42 - Tipaza', zone: 'capital', communes: ['Tipaza', 'Cherchell', 'Kolea', 'Bou Ismail', 'Hadjout'] },
  { code: '43', name: '43 - Mila', zone: 'north', communes: ['Mila', 'Chelghoum Laid', 'Tadjenanet'] },
  { code: '44', name: '44 - Aïn Defla', zone: 'north', communes: ['Aïn Defla', 'Khemis Miliana', 'El Attaf'] },
  { code: '45', name: '45 - Naâma', zone: 'south', communes: ['Naâma', 'Mecheria', 'Ain Sefra'] },
  { code: '46', name: '46 - Aïn Témouchent', zone: 'north', communes: ['Aïn Témouchent', 'Hammam Bou Hadjar', 'Beni Saf'] },
  { code: '47', name: '47 - Ghardaïa', zone: 'south', communes: ['Ghardaïa', 'Metlili', 'El Guerrara', 'Bounoura'] },
  { code: '48', name: '48 - Relizane', zone: 'north', communes: ['Relizane', 'Oued Rhiou', 'Mazouna'] },
  { code: '49', name: '49 - El M’Ghair', zone: 'south', communes: ['El M’Ghair', 'Djamaa'] },
  { code: '50', name: '50 - El Meniaa', zone: 'south', communes: ['El Meniaa'] },
  { code: '51', name: '51 - Ouled Djellal', zone: 'south', communes: ['Ouled Djellal', 'Sidi Khaled'] },
  { code: '52', name: '52 - Bordj Baji Mokhtar', zone: 'south', communes: ['Bordj Baji Mokhtar'] },
  { code: '53', name: '53 - Béni Abbès', zone: 'south', communes: ['Béni Abbès'] },
  { code: '54', name: '54 - Timimoun', zone: 'south', communes: ['Timimoun'] },
  { code: '55', name: '55 - Touggourt', zone: 'south', communes: ['Touggourt', 'Tebesbest'] },
  { code: '56', name: '56 - Djanet', zone: 'south', communes: ['Djanet'] },
  { code: '57', name: '57 - In Salah', zone: 'south', communes: ['In Salah'] },
  { code: '58', name: '58 - In Guezzam', zone: 'south', communes: ['In Guezzam'] }
];

/* ------------------------------------------------------------------
   CHECKOUT ENGINE STATE
   ------------------------------------------------------------------ */
// Cart is now managed by the shared MedicareCart engine (localStorage key: medicare_cart)

const FREE_SHIPPING_THRESHOLD = 35000; // 35,000 DZD free shipping
let selectedDeliveryType = 'home'; // 'home' or 'stopdesk'
let selectedWilayaObj = null;
let appliedDiscount = 0; // in DZD

document.addEventListener('DOMContentLoaded', async () => {

  const wilayaSelect = document.getElementById('chk-wilaya');
  const communeSelect = document.getElementById('chk-commune');
  const toast = document.getElementById('copy-toast');
  const langToggleBtn = document.getElementById('lang-toggle-btn');

  let dbWilayas = [];
  if (window.MedicareDB && typeof window.MedicareDB.getWilayas === 'function') {
    dbWilayas = await window.MedicareDB.getWilayas();
  }
  if (!dbWilayas || !dbWilayas.length) {
    dbWilayas = typeof WILAYAS_DATA !== 'undefined' ? WILAYAS_DATA : [];
  }

  /* ------------------------------------------------------------------
     1. POPULATE WILAYAS DROPDOWN
     ------------------------------------------------------------------ */
  if (wilayaSelect) {
    wilayaSelect.innerHTML = '<option value="">-- Select Wilaya (اختر الولاية) --</option>' +
      dbWilayas.map(w => `<option value="${w.code}">${w.name}</option>`).join('');
  }

  /* ------------------------------------------------------------------
     2b. PRE-FILL FORM FOR LOGGED-IN CUSTOMER
     ------------------------------------------------------------------ */
  const activeCustomer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;
  if (activeCustomer) {
    const fnEl = document.getElementById('chk-fullname');
    const phEl = document.getElementById('chk-phone');
    const adEl = document.getElementById('chk-address');

    if (fnEl && !fnEl.value && activeCustomer.name)  fnEl.value = activeCustomer.name;
    if (phEl && !phEl.value && activeCustomer.phone) phEl.value = activeCustomer.phone;

    // Pre-fill first saved address if available
    const savedAddr = activeCustomer.addresses && activeCustomer.addresses[0];
    if (savedAddr) {
      if (adEl && !adEl.value && savedAddr.address) adEl.value = savedAddr.address;
    }

    // Show a welcome note
    const chkNotice = document.getElementById('chk-customer-notice');
    if (chkNotice) {
      chkNotice.style.display = 'flex';
      chkNotice.querySelector('#chk-notice-name').textContent = activeCustomer.name;
    }
  }

  /* ------------------------------------------------------------------
     2. WILAYA CHANGE & DEPENDENT COMMUNES
     ------------------------------------------------------------------ */
  window.onWilayaChange = async function(selectEl) {
    const code = selectEl.value;
    selectedWilayaObj = dbWilayas.find(w => w.code === code) || WILAYAS_DATA.find(w => w.code === code);

    if (!selectedWilayaObj) {
      if (communeSelect) {
        communeSelect.innerHTML = '<option value="">-- Select Wilaya First --</option>';
        communeSelect.disabled = true;
      }
      recalculateTotals();
      return;
    }

    // Fetch communes from DB or fallback
    let communesList = [];
    if (window.MedicareDB && typeof window.MedicareDB.getCommunes === 'function') {
      const dbCommunes = await window.MedicareDB.getCommunes(code);
      if (dbCommunes && dbCommunes.length) communesList = dbCommunes.map(c => c.name);
    }
    if (!communesList.length && selectedWilayaObj.communes) {
      communesList = selectedWilayaObj.communes;
    }

    // Populate communes
    if (communeSelect) {
      communeSelect.disabled = false;
      const options = communesList.map(c => `<option value="${c}">${c}</option>`).join('');
      communeSelect.innerHTML = `<option value="">-- Select Commune (اختر البلدية) --</option>${options}<option value="Center">Centre Ville / Municipal Center</option>`;
    }

    validateField(selectEl);
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     3. DELIVERY TYPE SELECTOR (Home vs Stop-Desk)
     ------------------------------------------------------------------ */
  window.selectDeliveryType = function(type) {
    selectedDeliveryType = type;
    document.getElementById('delivery-option-home')?.classList.toggle('active', type === 'home');
    document.getElementById('delivery-option-stopdesk')?.classList.toggle('active', type === 'stopdesk');
    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     4. DELIVERY FEE CALCULATOR
     ------------------------------------------------------------------ */
  function getDeliveryFee() {
    const subtotal = getSubtotal();

    // Free shipping threshold check
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    if (!selectedWilayaObj) return 500; // default estimate

    const zone = selectedWilayaObj.zone;

    if (selectedDeliveryType === 'stopdesk') {
      if (zone === 'capital') return 250;
      if (zone === 'north') return 350;
      return 500; // south
    } else {
      // Home delivery
      if (zone === 'capital') return 400;
      if (zone === 'north') return 600;
      return 900; // south
    }
  }

  /* ------------------------------------------------------------------
     5. RECALCULATE TOTALS & FREE SHIPPING PROGRESS
     ------------------------------------------------------------------ */
  function getSubtotal() {
    return window.MedicareCart ? window.MedicareCart.getSubtotal() : 0;
  }

  function recalculateTotals() {
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const grandTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

    // Free shipping progress bar
    const progressFill = document.getElementById('shipping-progress-fill');
    const progressText = document.getElementById('shipping-progress-text');
    const progressPct  = document.getElementById('shipping-progress-pct');

    if (progressFill && progressText && progressPct) {
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${pct}%`;
      progressPct.textContent = `${pct}%`;

      if (subtotal >= FREE_SHIPPING_THRESHOLD) {
        progressText.textContent = '🎉 Congratulations! You have earned FREE Express Shipping!';
        progressFill.style.background = 'linear-gradient(90deg, #10B981, #059669)';
      } else {
        const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString();
        progressText.textContent = `🚚 Add ${remaining} DZD more for FREE Express Shipping!`;
        progressFill.style.background = 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-700))';
      }
    }

    // Dynamic fee labels on delivery cards
    const homeFeeLabel = document.getElementById('home-fee-label');
    const stopdeskFeeLabel = document.getElementById('stopdesk-fee-label');
    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'north';

    const homeFeeVal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (zone === 'capital' ? 400 : zone === 'north' ? 600 : 900);
    const stopdeskFeeVal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (zone === 'capital' ? 250 : zone === 'north' ? 350 : 500);

    if (homeFeeLabel) homeFeeLabel.textContent = homeFeeVal === 0 ? 'FREE' : `${homeFeeVal.toLocaleString()} DZD`;
    if (stopdeskFeeLabel) stopdeskFeeLabel.textContent = stopdeskFeeVal === 0 ? 'FREE' : `${stopdeskFeeVal.toLocaleString()} DZD`;

    // Totals table
    const subtotalEl = document.getElementById('chk-subtotal-val');
    const shippingEl = document.getElementById('chk-shipping-val');
    const typeLabelEl = document.getElementById('chk-delivery-type-label');
    const grandTotalEl = document.getElementById('chk-grand-total-val');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} DZD`;
    if (shippingEl) shippingEl.textContent = deliveryFee === 0 ? 'FREE (مجاني)' : `${deliveryFee.toLocaleString()} DZD`;
    if (typeLabelEl) typeLabelEl.textContent = selectedDeliveryType === 'home' ? 'Home' : 'Stop-Desk';
    if (grandTotalEl) grandTotalEl.textContent = `${grandTotal.toLocaleString()} DZD`;
  }

  /* ------------------------------------------------------------------
     6. RENDER SUMMARY CART ITEMS
     ------------------------------------------------------------------ */
  function renderCartItems() {
    const listEl = document.getElementById('chk-items-list');
    const countEl = document.getElementById('chk-summary-count');
    const cart = window.MedicareCart ? window.MedicareCart.getCart() : [];
    const totalQty = window.MedicareCart ? window.MedicareCart.getTotalCount() : 0;

    if (countEl) countEl.textContent = `${totalQty} Item${totalQty !== 1 ? 's' : ''}`;

    if (!listEl) return;

    if (cart.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--color-neutral-500);font-size:13px">Your cart is empty. <a href="index.html">Shop now</a></div>';
      recalculateTotals();
      return;
    }

    listEl.innerHTML = cart.map((item, idx) => {
      const displayName = item.nameAr || item.name;
      const imgSrc = item.image || item.img;
      return `
      <div class="chk-item">
        <img src="${imgSrc}" class="chk-item-img" alt="${displayName}">
        <div class="chk-item-info">
          <div class="chk-item-name">${displayName}</div>
          <div class="chk-item-meta">Size: ${item.size || 'M'} • Color: ${item.color || 'Teal'}</div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.25rem;">
            <div class="mc-cart-qty-ctrl" style="transform:scale(0.85); transform-origin:left center;">
              <button class="mc-qty-btn" type="button" onclick="chkUpdateQty(${idx},-1)">−</button>
              <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${item.qty}</span>
              <button class="mc-qty-btn" type="button" onclick="chkUpdateQty(${idx},1)">+</button>
            </div>
            <button type="button" onclick="chkUpdateQty(${idx},-999)" style="background:none;border:none;color:var(--color-neutral-400);cursor:pointer;font-size:14px;">✕</button>
          </div>
        </div>
        <div class="chk-item-price">${(item.price * item.qty).toLocaleString()} DZD</div>
      </div>`;
    }).join('');

    recalculateTotals();
  }

  window.chkUpdateQty = function(idx, delta) {
    if (window.MedicareCart) {
      window.MedicareCart.updateQty(idx, delta);
    }
    renderCartItems();
  };

  window.addEventListener('medicare_cart_updated', renderCartItems);

  /* ------------------------------------------------------------------
     7. COUPON ENGINE
     ------------------------------------------------------------------ */
  window.applyCoupon = function() {
    const input = document.getElementById('chk-coupon-input');
    const code = input?.value.trim().toUpperCase();

    if (!code) {
      showToast('Please enter a coupon code');
      return;
    }

    const subtotal = getSubtotal();

    if (code === 'STUDENT10' || code === 'MEDICARE10') {
      appliedDiscount = Math.round(subtotal * 0.1);
      document.getElementById('coupon-discount-row').style.display = 'flex';
      document.getElementById('chk-discount-val').textContent = `−${appliedDiscount.toLocaleString()} DZD`;
      showToast('✓ Coupon STUDENT10 applied (10% OFF)!');
    } else if (code === 'MEDICARE2026') {
      appliedDiscount = 2000;
      document.getElementById('coupon-discount-row').style.display = 'flex';
      document.getElementById('chk-discount-val').textContent = '−2,000 DZD';
      showToast('✓ Coupon MEDICARE2026 applied (2,000 DZD OFF)!');
    } else {
      showToast('❌ Invalid or expired coupon code');
      return;
    }

    recalculateTotals();
  };

  /* ------------------------------------------------------------------
     8. FORM VALIDATION
     ------------------------------------------------------------------ */
  window.validateField = function(inputEl) {
    const group = inputEl.closest('.chk-form-group');
    if (!group) return true;

    let valid = true;
    const val = inputEl.value.trim();

    if (inputEl.id === 'chk-fullname') {
      valid = val.length >= 3;
    } else if (inputEl.id === 'chk-phone') {
      // Algerian phone regex: starts with 05, 06, 07 followed by 8 digits (10 digits total)
      const phoneClean = val.replace(/[\s\-\.]/g, '');
      valid = /^0[567]\d{8}$/.test(phoneClean);
    } else if (inputEl.id === 'chk-wilaya') {
      valid = val !== '';
    } else if (inputEl.id === 'chk-commune') {
      valid = val !== '';
    } else if (inputEl.id === 'chk-address') {
      valid = val.length >= 5;
    }

    if (valid) {
      group.classList.remove('error');
      group.classList.add('valid');
    } else {
      group.classList.remove('valid');
      group.classList.add('error');
    }

    return valid;
  };

  /* ------------------------------------------------------------------
     9. ORDER SUBMISSION & CONFIRMATION VIEW
     ------------------------------------------------------------------ */
  window.handleOrderSubmit = async function(e) {
    e.preventDefault();

    const fnEl = document.getElementById('chk-fullname');
    const phEl = document.getElementById('chk-phone');
    const wiEl = document.getElementById('chk-wilaya');
    const coEl = document.getElementById('chk-commune');
    const adEl = document.getElementById('chk-address');

    const v1 = validateField(fnEl);
    const v2 = validateField(phEl);
    const v3 = validateField(wiEl);
    const v4 = validateField(coEl);
    const v5 = validateField(adEl);

    if (!v1 || !v2 || !v3 || !v4 || !v5) {
      showToast('❌ Please fill out all required fields correctly');
      const firstErr = document.querySelector('.chk-form-group.error');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const currentCartItems = window.MedicareCart ? window.MedicareCart.getCart() : [];
    if (currentCartItems.length === 0) {
      showToast('❌ Your cart is empty');
      return;
    }

    // Generate Order Object
    const orderNum = `MC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullName = fnEl.value.trim();
    const phone = phEl.value.trim();
    const commune = coEl.value;
    const wilayaName = selectedWilayaObj ? selectedWilayaObj.name : '16 - Alger';
    const subtotal = getSubtotal();
    const deliveryFee = getDeliveryFee();
    const grandTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

    const activeCustomer = window.MedicareDB ? window.MedicareDB.getCurrentCustomer() : null;

    const orderPayload = {
      id: orderNum,
      order_number: orderNum,
      customer_id: activeCustomer ? activeCustomer.id : null,
      customer_email: activeCustomer ? activeCustomer.email : null,
      customer_name: fullName,
      phone: phone,
      wilaya: wilayaName,
      commune: commune,
      address: adEl.value.trim(),
      delivery_type: selectedDeliveryType,
      items: currentCartItems,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: grandTotal,
      status: 'Pending'
    };

    // Save Order via Supabase Client API
    let createdOrder = null;
    if (window.MedicareDB && typeof window.MedicareDB.createOrder === 'function') {
      createdOrder = await window.MedicareDB.createOrder(orderPayload);
    }

    // Clear shared cart after successful submission
    if (window.MedicareCart) {
      window.MedicareCart.clearCart();
    }

    // Delivery Window Estimate
    const zone = selectedWilayaObj ? selectedWilayaObj.zone : 'capital';
    const windowText = zone === 'capital' ? '24–48 Hours' : zone === 'north' ? '48–72 Hours' : '3–5 Business Days';

    // Populate Confirmation View
    document.getElementById('conf-order-num').textContent = `Order #${orderNum}`;
    document.getElementById('conf-customer-name').textContent = fullName;
    document.getElementById('conf-customer-phone').textContent = phone;
    document.getElementById('conf-destination').textContent = `${wilayaName} (Commune: ${commune})`;
    document.getElementById('conf-delivery-type').textContent = selectedDeliveryType === 'home' ? 'Home Delivery (ZR Express / Yalidine)' : 'Stop-Desk Agency Pickup (Yalidine Desk)';
    document.getElementById('conf-delivery-window').textContent = windowText;
    document.getElementById('conf-total-due').textContent = `${grandTotal.toLocaleString()} DZD (Cash on Delivery)`;

    // WhatsApp Tracking Link
    const waMsg = `Hello MEDICARE! 👋\nI placed an order on your site.\n\n📌 Order Number: ${orderNum}\n👤 Name: ${fullName}\n📞 Phone: ${phone}\n📍 Destination: ${wilayaName} - ${commune}\n💵 Total Due (COD): ${grandTotal.toLocaleString()} DZD\n\nPlease confirm dispatch and tracking details. Thank you!`;
    const waLink = document.getElementById('conf-whatsapp-track-link');
    if (waLink) waLink.href = `https://wa.me/213550000000?text=${encodeURIComponent(waMsg)}`;

    // Update Wizard Steps
    document.getElementById('wizard-step-1').classList.remove('active');
    document.getElementById('wizard-step-1').classList.add('completed');
    document.getElementById('wizard-step-2').classList.remove('active');
    document.getElementById('wizard-step-2').classList.add('completed');
    document.getElementById('wizard-step-3').classList.add('active');

    // Switch Views
    document.getElementById('checkout-active-view').style.display = 'none';
    document.getElementById('checkout-confirmation-view').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('🎉 Order placed successfully!');
  };

  /* ------------------------------------------------------------------
     10. TOAST & UTILITIES
     ------------------------------------------------------------------ */
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      document.documentElement.setAttribute('dir', isRTL ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', isRTL ? 'en' : 'ar');
      langToggleBtn.querySelector('.btn-text').textContent = isRTL ? 'العربية' : 'English';
      showToast(isRTL ? '🌐 Switched to English' : '🌐 تم التبديل إلى العربية');
    });
  }

  // Initial render
  renderCartItems();

});
