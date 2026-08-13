/* ==========================================================================
   MEDICARE — COURIER DELIVERY PRICING DASHBOARD LOGIC (58 WILAYAS + COMMUNES)
   Multi-Company Rate Sheets, Accordion Tree, Bulk-Fill, Search & CSV Import/Export
   ========================================================================== */

(function() {
  'use strict';

  /* --------------------------------------------------------------------------
     1. COMPLETE 58 WILAYAS & COMMUNES DATA DICTIONARY
     -------------------------------------------------------------------------- */
  const WILAYAS_DATA = [
    { code: "01", name: "01 - Adrar", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-4 Days", communes: ["Adrar", "Tamest", "Charouine", "Reggane", "In Zghmir", "Titmime", "Ksar Kaddour", "Tsabit"] },
    { code: "02", name: "02 - Chlef", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Chlef", "Ténès", "Benairia", "El Karimia", "Taougrite", "Beni Haoua", "Sobha", "Harchoun", "Ouled Fares"] },
    { code: "03", name: "03 - Laghouat", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Laghouat", "Ksar El Hirane", "Bennasser Benchohra", "Sidi Makhlouf", "Hassi Delaa", "Hassi R'Mel", "Aflou"] },
    { code: "04", name: "04 - Oum El Bouaghi", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Oum El Bouaghi", "Ain Beida", "Ain M'lila", "Ain Babouche", "Berriche", "Fkirina", "Souk Naamane"] },
    { code: "05", name: "05 - Batna", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Batna", "Ghisset", "Maafa", "Merouana", "Seriana", "M'doukel", "N'Gaous", "Tazoult", "Barika", "Arris"] },
    { code: "06", name: "06 - Béjaïa", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Béjaïa", "Amizour", "El Kseur", "Seddouk", "Tichy", "Aokas", "Souk El Tenine", "Tazmalt", "Akbou", "Ighram"] },
    { code: "07", name: "07 - Biskra", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Biskra", "Oumache", "Branis", "Chetma", "Ouled Djellal", "Tolga", "Sidi Okba", "Zeribet El Oued", "El Kantara"] },
    { code: "08", name: "08 - Béchar", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-4 Days", communes: ["Béchar", "Erg Ferradj", "Ouled Khodeir", "Meridja", "Timoudi", "Lahmar", "Beni Abbes", "Kenadsa", "Taghit"] },
    { code: "09", name: "09 - Blida", zone: "capital", defaultHome: 400, defaultStop: 250, defaultEta: "24 Hours", communes: ["Blida", "Boufarik", "Guerrouaou", "Chiffa", "Hammam Melouane", "Ben Khellil", "Soumaa", "Mouzaia", "El Affroun", "Oued Alleug"] },
    { code: "10", name: "10 - Bouira", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Bouira", "El Asnam", "Haizer", "Taghzout", "Sur El Ghozlane", "Ain Bessem", "Lakhdaria", "Kadiria", "Bechloul", "M'Chedallah"] },
    { code: "11", name: "11 - Tamanrasset", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["Tamanrasset", "Abalessa", "In Ghar", "In Guezzam", "In Salah"] },
    { code: "12", name: "12 - Tébessa", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Tébessa", "Bir El Ater", "Cheria", "Stah Guentis", "El Aouinet", "El Kouif", "Morsott", "Ouenza"] },
    { code: "13", name: "13 - Tlemcen", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Tlemcen", "Mansourah", "Chetouane", "Remchi", "El Fehoul", "Hennaya", "Ghazaouet", "Maghnia", "Sebdou"] },
    { code: "14", name: "14 - Tiaret", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Tiaret", "Medroussa", "Ain Bouchekif", "Ain Deheb", "Sougueur", "Frenda", "Mahdia", "Rahouia"] },
    { code: "15", name: "15 - Tizi Ouzou", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Tizi Ouzou", "Ain El Hammam", "Akbil", "Azazga", "Boghni", "Draa Ben Khedda", "Draa El Mizan", "Larbaa Nath Irathen", "Tigzirt", "Azeffoun"] },
    { code: "16", name: "16 - Alger (العاصمة)", zone: "capital", defaultHome: 400, defaultStop: 250, defaultEta: "24 Hours", communes: ["El Biar", "Hydra", "Bab Ezzouar", "Kouba", "Sidi M'Hamed", "Zeralda", "Cheraga", "Dely Ibrahim", "Bir Mourad Rais", "Alger Centre", "Casbah", "Hussein Dey", "Bordj El Kiffan", "Bordj El Bahri", "Ain Taya", "Reghaia", "Rouiba", "Birtouta", "Saoula", "Draria", "El Achour", "Ouled Fayet", "Ain Benian"] },
    { code: "17", name: "17 - Djelfa", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Djelfa", "Moudjebara", "Tadmit", "Ain El Ibel", "Hassi Bahbah", "Ain Oussera", "Messaad", "Dar Chioukh"] },
    { code: "18", name: "18 - Jijel", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Jijel", "Erakene", "Seddara", "Ziama Mansouriah", "Taher", "Chekfa", "El Milia", "El Ancer"] },
    { code: "19", name: "19 - Sétif", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Sétif", "Ain El Kebira", "Ain Oulmene", "El Eulma", "Bouandas", "Ain Azel", "Babor", "Guidjel"] },
    { code: "20", name: "20 - Saïda", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Saïda", "Ain El Hadjar", "Youb", "Sidi Boubekeur", "El Hassasna", "Ouled Brahim"] },
    { code: "21", name: "21 - Skikda", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Skikda", "Ain Zouit", "El Hadaiek", "Azzaba", "El Arrouch", "Collo", "Tamalous", "Ben Ziad"] },
    { code: "22", name: "22 - Sidi Bel Abbès", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Sidi Bel Abbès", "Tessala", "Sidi Brahim", "Mostefa Ben Brahim", "Telagh", "Ben Badis", "Ras El Ma", "Sfisef"] },
    { code: "23", name: "23 - Annaba", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Annaba", "Berrahal", "El Hadjar", "Eulma", "El Bouni", "Seraidi", "Chetaibi"] },
    { code: "24", name: "24 - Guelma", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Guelma", "Nechmaya", "Bouati Mahmoud", "Heliopolis", "Guelaat Bou Sbaa", "Hammam Debagh", "Oued Zenati"] },
    { code: "25", name: "25 - Constantine", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Constantine", "Hamma Bouziane", "Didouche Mourad", "Zighoud Youcef", "El Khroub", "Ain Smara", "Ouled Rahmoune", "Ain Abid"] },
    { code: "26", name: "26 - Médéa", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Médéa", "Ouzera", "Ain Boucif", "Berrouaghia", "Seghouane", "Ksar El Boukhari", "Tablat", "Beni Slimane"] },
    { code: "27", name: "27 - Mostaganem", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Mostaganem", "Sayada", "Fornaka", "Stidia", "Ain Nouissy", "Hassi Mameche", "Ain Tedles", "Mesra", "Bouguerat"] },
    { code: "28", name: "28 - M'Sila", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["M'Sila", "Hammam Dalaâ", "Ouled Derradj", "Sidi Aissa", "Ain El Hadjel", "Bousaada", "Ben Srour"] },
    { code: "29", name: "29 - Mascara", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Mascara", "Bou Hanifia", "Tizi", "Tighennif", "Ghriss", "Oued El Taria", "Mohammadia", "Sig"] },
    { code: "30", name: "30 - Ouargla", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Ouargla", "Ain Beida", "N'Goussa", "Hassi Messaoud", "El Borma", "Touggourt"] },
    { code: "31", name: "31 - Oran (وهران)", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Oran", "Gdyel", "Bir El Djir", "Es Senia", "Arzew", "Bethioua", "Marsat El Hadjadj", "Ain El Turk", "Bousfer", "El Ancor", "Boutlelis", "Miserghin"] },
    { code: "32", name: "32 - El Bayadh", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["El Bayadh", "Rogassa", "Stitten", "Brezina", "Ghassoul", "Labiodh Sidi Cheikh"] },
    { code: "33", name: "33 - Illizi", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["Illizi", "Djanet", "Debdeb", "Bordj Omar Driss"] },
    { code: "34", name: "34 - Bordj Bou Arréridj", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Bordj Bou Arréridj", "Ras El Ma", "Bordj Zemoura", "Mansoura", "El M'hir", "Ain Taghrout", "Bir Kasdali", "Bordj Ghedir"] },
    { code: "35", name: "35 - Boumerdès", zone: "capital", defaultHome: 400, defaultStop: 250, defaultEta: "24 Hours", communes: ["Boumerdès", "Boudouaou", "Afir", "Bordj Menaiel", "Baghlia", "Dellys", "Naciria", "Isser", "Thenia", "Khemis El Khechna", "Hammedi"] },
    { code: "36", name: "36 - El Tarf", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["El Tarf", "Bougous", "Ben M'Hidi", "Besbes", "El Kala", "Zitouna"] },
    { code: "37", name: "37 - Tindouf", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["Tindouf", "Oum El Assel"] },
    { code: "38", name: "38 - Tissemsilt", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Tissemsilt", "Bordj Bou Naama", "Theniet El Had", "Lardjem", "Bordj El Emir Abdelkader"] },
    { code: "39", name: "39 - El Oued", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["El Oued", "Robbah", "Oued El Alenda", "Bayadha", "Guemar", "Reguiba", "Magrane", "Hassi Khalifa"] },
    { code: "40", name: "40 - Khenchela", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Khenchela", "Mtoussa", "Kais", "El Hamma", "Ain Touila", "Babar", "Chechar"] },
    { code: "41", name: "41 - Souk Ahras", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Souk Ahras", "Sedrata", "Hanancha", "Machroha", "Taoura", "Merahna"] },
    { code: "42", name: "42 - Tipaza", zone: "capital", defaultHome: 400, defaultStop: 250, defaultEta: "24 Hours", communes: ["Tipaza", "Menaceur", "Larhat", "Douaouda", "Bourkika", "Khemisti", "Ahmer El Ain", "Bourdj El Kiffan", "Cherchell", "Gouraya", "Hadjout", "Fouka", "Bouchegouf", "Bérard", "Sidi Amar"] },
    { code: "43", name: "43 - Mila", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Mila", "Ferdjioua", "Chelghoum Laid", "Oued Athmania", "Teleghma", "Grarem Gouga", "Telerghma"] },
    { code: "44", name: "44 - Aïn Defla", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Aïn Defla", "Khemis Miliana", "Miliana", "Hammouche", "El Attaf", "El Abadia", "Djendel", "Bordj Emir Khaled"] },
    { code: "45", name: "45 - Naâma", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Naâma", "Mecheria", "Ain Sefra", "Tiout", "Sfissifa", "Moghrar"] },
    { code: "46", name: "46 - Aïn Témouchent", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Aïn Témouchent", "Hammam Bou Hadjar", "El Amria", "Hammam Chat", "Beni Saf", "El Malah"] },
    { code: "47", name: "47 - Ghardaïa", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Ghardaïa", "El Atteuf", "Bounoura", "Melika", "Ddaya", "Guerrara", "Berriane", "Metlili"] },
    { code: "48", name: "48 - Relizane", zone: "north", defaultHome: 600, defaultStop: 350, defaultEta: "24-48 Hours", communes: ["Relizane", "Oued Rhiou", "Bendaoud", "Sidi M'Hamed Ben Ali", "Mazouna", "Ammi Moussa"] },
    { code: "49", name: "49 - El M'Ghair", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["El M'Ghair", "Djamaa", "Ourlana", "Sidi Khellil"] },
    { code: "50", name: "50 - El Meniaa", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["El Meniaa", "Hassi Gara", "Hassi Fehal"] },
    { code: "51", name: "51 - Ouled Djellal", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Ouled Djellal", "Sidi Khaled", "Besbes"] },
    { code: "52", name: "52 - Bordj Baji Mokhtar", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["Bordj Baji Mokhtar", "Timiaouine"] },
    { code: "53", name: "53 - Béni Abbès", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-4 Days", communes: ["Béni Abbès", "Igli", "El Ouata", "Tababelt", "Ksabi"] },
    { code: "54", name: "54 - Timimoun", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-4 Days", communes: ["Timimoun", "Aoulef", "Tinerkouk", "Ksar Kaddour"] },
    { code: "55", name: "55 - Touggourt", zone: "south", defaultHome: 900, defaultStop: 500, defaultEta: "2-3 Days", communes: ["Touggourt", "Nezla", "Tebesbest", "Zaouia El Abidia", "Megarine", "Temacine"] },
    { code: "56", name: "56 - Djanet", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["Djanet", "Bordj El Haouas"] },
    { code: "57", name: "57 - In Salah", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["In Salah", "In Ghar", "Foggaret Azzaouia"] },
    { code: "58", name: "58 - In Guezzam", zone: "south", defaultHome: 1200, defaultStop: 700, defaultEta: "3-5 Days", communes: ["In Guezzam", "Tin Zaouatine"] }
  ];

  /* --------------------------------------------------------------------------
     2. DEFAULT INITIAL COMPANIES MATRIX
     -------------------------------------------------------------------------- */
  const DEFAULT_COMPANIES = [
    {
      id: "zr-express",
      name: "ZR Express",
      badge: "Default",
      rates: generateCompanyDefaultRates("zr-express")
    },
    {
      id: "yalidine-express",
      name: "Yalidine Express",
      badge: "Partner",
      rates: generateCompanyDefaultRates("yalidine-express")
    },
    {
      id: "mayestro-delivery",
      name: "Mayestro Delivery",
      badge: "Express",
      rates: generateCompanyDefaultRates("mayestro-delivery")
    }
  ];

  function generateCompanyDefaultRates(companyId) {
    const matrix = {};
    WILAYAS_DATA.forEach(w => {
      matrix[w.code] = {
        code: w.code,
        name: w.name,
        zone: w.zone,
        communes: w.communes.map(cName => ({
          name: cName,
          home_fee: w.defaultHome,
          stopdesk_fee: w.defaultStop,
          eta: w.defaultEta
        }))
      };
    });
    return matrix;
  }

  /* --------------------------------------------------------------------------
     3. APP STATE MANAGEMENT
     -------------------------------------------------------------------------- */
  let companiesState = loadCompaniesFromStorage();
  let activeCompanyId = companiesState[0]?.id || "zr-express";
  let searchFilterQuery = "";

  function loadCompaniesFromStorage() {
    try {
      const raw = localStorage.getItem('medicare_courier_companies_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Storage parse error, fallback to defaults:", e);
    }
    return DEFAULT_COMPANIES;
  }

  function saveCompaniesToStorage() {
    localStorage.setItem('medicare_courier_companies_v2', JSON.stringify(companiesState));
    if (window.MedicareDB && typeof window.MedicareDB.saveCourierRates === 'function') {
      window.MedicareDB.saveCourierRates(companiesState);
    }
    showToast("💾 All Delivery Pricing Rates Saved Successfully!");
  }

  function getActiveCompany() {
    return companiesState.find(c => c.id === activeCompanyId) || companiesState[0];
  }

  /* --------------------------------------------------------------------------
     4. RENDER ENGINE & DOM MANIPULATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    renderCompanyTabs();
    renderWilayasAccordionList();
    setupEventListeners();
  }

  function renderCompanyTabs() {
    const tabsList = document.getElementById('company-tabs-list');
    if (!tabsList) return;

    tabsList.innerHTML = companiesState.map(comp => `
      <button class="dp-tab-btn ${comp.id === activeCompanyId ? 'active' : ''}" data-company-id="${comp.id}">
        <span>🚚 ${comp.name}</span>
        ${comp.badge ? `<span style="font-size:10px; background:rgba(255,255,255,0.25); padding:1px 5px; border-radius:4px;">${comp.badge}</span>` : ''}
      </button>
    `).join('') + `
      <button class="dp-tab-btn dp-tab-btn-add" onclick="openAddCompanyModal()">
        <span>➕ Add Courier Company</span>
      </button>
    `;

    tabsList.querySelectorAll('.dp-tab-btn[data-company-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCompanyId = btn.dataset.companyId;
        renderCompanyTabs();
        renderWilayasAccordionList();
      });
    });
  }

  function renderWilayasAccordionList() {
    const container = document.getElementById('wilayas-accordion-container');
    if (!container) return;

    const company = getActiveCompany();
    const ratesMatrix = company.rates;

    const filteredWilayas = WILAYAS_DATA.filter(w => {
      if (!searchFilterQuery) return true;
      const q = searchFilterQuery.toLowerCase();
      const matchWilaya = w.name.toLowerCase().includes(q) || w.code.includes(q);
      const matchCommune = w.communes.some(c => c.toLowerCase().includes(q));
      return matchWilaya || matchCommune;
    });

    if (filteredWilayas.length === 0) {
      container.innerHTML = `<div style="padding:2rem; text-align:center; color:#64748B;">🔍 No Wilaya or Commune found matching "${searchFilterQuery}".</div>`;
      return;
    }

    container.innerHTML = filteredWilayas.map(w => {
      const wRates = ratesMatrix[w.code] || { communes: [] };
      const communesList = wRates.communes || [];
      const isAutoExpand = Boolean(searchFilterQuery);

      const communeRows = communesList.map((comm, idx) => `
        <tr>
          <td><strong>${comm.name}</strong></td>
          <td>
            <input type="number" class="dp-input-num" value="${comm.home_fee}" step="50" min="0" data-wilaya="${w.code}" data-commune-idx="${idx}" data-field="home_fee"> DZD
          </td>
          <td>
            <input type="number" class="dp-input-num" value="${comm.stopdesk_fee}" step="50" min="0" data-wilaya="${w.code}" data-commune-idx="${idx}" data-field="stopdesk_fee"> DZD
          </td>
          <td>
            <input type="text" class="dp-input-text" value="${comm.eta || '24-48 Hours'}" data-wilaya="${w.code}" data-commune-idx="${idx}" data-field="eta">
          </td>
        </tr>
      `).join('');

      return `
        <div class="dp-wilaya-accordion ${isAutoExpand ? 'expanded' : ''}" id="accordion-${w.code}">
          <div class="dp-wilaya-header" onclick="toggleAccordion('${w.code}')">
            <div class="dp-wilaya-info">
              <span class="dp-chevron">▶</span>
              <div class="dp-wilaya-title">
                <span>📍 ${w.name}</span>
                <span class="dp-badge-zone ${w.zone}">${w.zone}</span>
              </div>
            </div>
            <div class="dp-wilaya-summary">
              <span><strong>${communesList.length}</strong> Communes</span>
              <button class="dp-btn-bulk" onclick="event.stopPropagation(); openBulkFillModal('${w.code}')">⚡ Bulk Fill Wilaya</button>
            </div>
          </div>
          <div class="dp-communes-body">
            <table class="dp-table">
              <thead>
                <tr>
                  <th>Commune Name (البلدية)</th>
                  <th>🏠 Home Delivery Fee (DZD)</th>
                  <th>🏬 Stop-Desk Agency Fee (DZD)</th>
                  <th>⏱️ Estimated Delivery ETA</th>
                </tr>
              </thead>
              <tbody>
                ${communeRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');

    // Attach Live Input Change Handlers
    container.querySelectorAll('input[data-wilaya]').forEach(input => {
      input.addEventListener('change', (e) => {
        const wCode = e.target.dataset.wilaya;
        const cIdx = parseInt(e.target.dataset.communeIdx, 10);
        const field = e.target.dataset.field;
        let val = e.target.value;

        if (field === 'home_fee' || field === 'stopdesk_fee') {
          val = parseInt(val, 10) || 0;
        }

        const comp = getActiveCompany();
        if (comp.rates[wCode] && comp.rates[wCode].communes[cIdx]) {
          comp.rates[wCode].communes[cIdx][field] = val;
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. EVENT LISTENERS & MODALS
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    const searchInput = document.getElementById('search-pricing-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchFilterQuery = e.target.value.trim();
        renderWilayasAccordionList();
      });
    }

    const saveBtn = document.getElementById('save-all-rates-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveCompaniesToStorage);
    }
  }

  window.toggleAccordion = function(wCode) {
    const el = document.getElementById(`accordion-${wCode}`);
    if (el) el.classList.toggle('expanded');
  };

  /* --------------------------------------------------------------------------
     6. BULK FILL TOOL
     -------------------------------------------------------------------------- */
  let activeBulkWilayaCode = null;

  window.openBulkFillModal = function(wCode) {
    activeBulkWilayaCode = wCode;
    const wData = WILAYAS_DATA.find(w => w.code === wCode);
    const modal = document.getElementById('modal-bulk-fill');
    const title = document.getElementById('bulk-modal-title');
    if (title && wData) title.textContent = `⚡ Bulk Fill Rates for ${wData.name}`;
    if (modal) modal.classList.add('open');
  };

  window.closeBulkFillModal = function() {
    const modal = document.getElementById('modal-bulk-fill');
    if (modal) modal.classList.remove('open');
  };

  window.applyBulkFill = function() {
    const homeVal = parseInt(document.getElementById('bulk-home-input')?.value, 10) || 0;
    const stopVal = parseInt(document.getElementById('bulk-stop-input')?.value, 10) || 0;
    const etaVal  = document.getElementById('bulk-eta-input')?.value || "24-48 Hours";

    const comp = getActiveCompany();
    if (activeBulkWilayaCode && comp.rates[activeBulkWilayaCode]) {
      comp.rates[activeBulkWilayaCode].communes.forEach(c => {
        c.home_fee = homeVal;
        c.stopdesk_fee = stopVal;
        c.eta = etaVal;
      });
    }

    closeBulkFillModal();
    renderWilayasAccordionList();
    showToast(`⚡ Bulk rates applied to Wilaya ${activeBulkWilayaCode}!`);
  };

  /* --------------------------------------------------------------------------
     7. ADD NEW COURIER COMPANY MODAL
     -------------------------------------------------------------------------- */
  window.openAddCompanyModal = function() {
    document.getElementById('modal-add-company')?.classList.add('open');
  };

  window.closeAddCompanyModal = function() {
    document.getElementById('modal-add-company')?.classList.remove('open');
  };

  window.submitAddCompany = function(e) {
    e.preventDefault();
    const name = document.getElementById('new-company-name')?.value.trim();
    if (!name) return;

    const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const newCompany = {
      id: newId,
      name: name,
      badge: "Custom",
      rates: generateCompanyDefaultRates(newId)
    };

    companiesState.push(newCompany);
    activeCompanyId = newId;
    closeAddCompanyModal();
    renderCompanyTabs();
    renderWilayasAccordionList();
    showToast(`🎉 Company "${name}" added with full 58 Wilaya matrix!`);
  };

  /* --------------------------------------------------------------------------
     8. EXPORT & IMPORT CSV
     -------------------------------------------------------------------------- */
  window.exportCompanyRatesCSV = function() {
    const company = getActiveCompany();
    let csvStr = "company,wilaya_code,wilaya_name,commune_name,home_fee_dzd,stopdesk_fee_dzd,eta\n";

    Object.values(company.rates).forEach(w => {
      w.communes.forEach(c => {
        csvStr += `"${company.name}","${w.code}","${w.name}","${c.name}",${c.home_fee},${c.stopdesk_fee},"${c.eta}"\n`;
      });
    });

    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${company.id}-delivery-rates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📤 Exported ${company.name} rates to CSV!`);
  };

  /* --------------------------------------------------------------------------
     9. TOAST NOTIFIER
     -------------------------------------------------------------------------- */
  function showToast(msg) {
    let toast = document.getElementById('dp-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dp-toast';
      toast.className = 'dp-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
  }
  window.showToast = showToast;

})();
