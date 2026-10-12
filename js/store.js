/**
 * ALKAMART STORE & DATA PERSISTENCE ENGINE
 * Menangani LocalStorage, Google Sheets API, dan Backup/Restore JSON
 */

const STORAGE_KEYS = {
  PRODUCTS: 'alkamart_products_v5',
  SALES: 'alkamart_sales_v5',
  WITHDRAWALS: 'alkamart_withdrawals_v5',
  GOOGLE_SHEETS_URL: 'alkamart_gsheet_url_v5',
  ROLE: 'alkamart_active_role_v5'
};

const DEFAULT_GSHEET_URL = 'https://script.google.com/macros/s/AKfycbxPijXLULdUjyP7E1r9ThXtYDsrO91T8gDrJ-46WWPcZRM7Uzg8yP4Ea8IQKFnulgOoYg/exec';

class AlkamartStore {
  constructor() {
    this.products = [];
    this.sales = [];
    this.withdrawals = [];
    this.googleSheetsUrl = '';
    this.activeRole = 'cashier';
    this.init();
  }

  init() {
    // 1. Load Products
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const oldDummyIds = new Set(['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5', 'prod_6', 'prod_7', 'prod_8', 'prod_9', 'prod_10']);

    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        this.products = parsed.filter(p => p && !oldDummyIds.has(p.id));
      } catch (e) {
        this.products = [];
      }
    } else {
      this.products = [];
    }

    // Pastikan setiap produk memiliki costPrice (Harga Beli / Modal)
    let needsSaveProducts = false;
    this.products.forEach(p => {
      if (p.costPrice === undefined || p.costPrice === null || isNaN(p.costPrice)) {
        p.costPrice = Math.round(Number(p.price || 0) * 0.8);
        needsSaveProducts = true;
      } else {
        p.costPrice = Number(p.costPrice);
      }
      p.price = Number(p.price || 0);

      // Auto-fix gambar jika ada produk tanpa foto atau link rusak
      if (!p.imageUrl || p.imageUrl.trim() === '') {
        const nameLower = (p.name || '').toLowerCase();
        if (nameLower.includes('kacang')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=500&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('alpukat') || nameLower.includes('es')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('sate') || nameLower.includes('satw')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80';
        } else {
          const defaultMatch = DEFAULT_PRODUCTS.find(dp => dp.name.toLowerCase() === nameLower);
          if (defaultMatch) {
            p.imageUrl = defaultMatch.imageUrl;
          }
        }
        needsSaveProducts = true;
      }
    });
    if (needsSaveProducts || !savedProducts) {
      this.saveProducts();
    }

    // 2. Load Sales
    const savedSales = localStorage.getItem(STORAGE_KEYS.SALES);
    if (savedSales) {
      try {
        this.sales = JSON.parse(savedSales).filter(s => s.id !== 'TRX-1001');
      } catch (e) {
        this.sales = [];
      }
    } else {
      this.sales = [];
    }

    // Normalisasi data sales (buang dummy TRX-1001, hitung HPP akurat per transaksi)
    this.sales = this.sales.filter(s => s.id !== 'TRX-1001');
    this.sales.forEach(s => {
      if (!s.paymentMethod) s.paymentMethod = 'cash';
      s.totalHpp = this._calculateSingleSaleHpp(s);
      s.netProfit = Number(s.totalAmount || 0) - s.totalHpp;
    });
    this.saveSales();

    // 3. Load Withdrawals (Tarik Uang / Kas Keluar)
    const savedWithdrawals = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (savedWithdrawals) {
      try {
        this.withdrawals = JSON.parse(savedWithdrawals);
      } catch (e) {
        this.withdrawals = [...DEFAULT_WITHDRAWALS];
      }
    } else {
      this.withdrawals = [...DEFAULT_WITHDRAWALS];
      this.saveWithdrawals();
    }

    // 4. Load Configs
    const savedUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEETS_URL);
    if (savedUrl === 'https://script.google.com/macros/s/AKfycbw9_ls77fF7vA83B5xmGz-HokYsjGvddiB4p6RAgjJHuPRjHqg_GO-cvsbo3pH8q-On/exec') {
      this.googleSheetsUrl = DEFAULT_GSHEET_URL;
      localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEETS_URL, DEFAULT_GSHEET_URL);
    } else {
      this.googleSheetsUrl = (savedUrl && savedUrl.trim()) ? savedUrl.trim() : DEFAULT_GSHEET_URL;
    }
    this.activeRole = 'cashier';
    localStorage.setItem(STORAGE_KEYS.ROLE, 'cashier');
  }

  saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
  }

  saveSales() {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.sales));
  }

  saveWithdrawals() {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(this.withdrawals));
  }

  setRole(role) {
    this.activeRole = role;
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }

  setGoogleSheetsUrl(url) {
    this.googleSheetsUrl = url.trim() || DEFAULT_GSHEET_URL;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEETS_URL, this.googleSheetsUrl);
  }

  // --- CRUD Produk ---
  addProduct(product) {
    if (product.costPrice === undefined || product.costPrice === null) {
      product.costPrice = Math.round(Number(product.price || 0) * 0.8);
    }
    this.products.unshift(product);
    this.saveProducts();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on addProduct:", err));
    }
  }

  updateProduct(id, updatedData) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updatedData };
      this.saveProducts();
      if (this.googleSheetsUrl) {
        this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on updateProduct:", err));
      }
    }
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on deleteProduct:", err));
    }
  }

  clearAllProducts() {
    this.products = [];
    this.saveProducts();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on clearAllProducts:", err));
    }
  }

  updateStock(productId, newStock) {
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      this.saveProducts();
      if (this.googleSheetsUrl) {
        this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on updateStock:", err));
      }
    }
  }

  // --- Transaksi Penjualan ---
  recordSale(sale) {
    if (!sale.paymentMethod) sale.paymentMethod = 'cash';
    
    // Pastikan item memiliki costPrice
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(it => {
        if (it.costPrice === undefined || it.costPrice === null || Number(it.costPrice) <= 0) {
          const prod = this.products.find(p => p.id === it.productId || (p.name && it.name && p.name.toLowerCase() === it.name.toLowerCase()));
          it.costPrice = (prod && Number(prod.costPrice || 0) > 0) ? Number(prod.costPrice) : Math.round(Number(it.price || 0) * 0.5);
        }
      });
    }

    sale.totalHpp = this._calculateSingleSaleHpp(sale);
    sale.netProfit = Number(sale.totalAmount || 0) - sale.totalHpp;

    this.sales.unshift(sale);
    this.saveSales();

    // Kurangi stok barang secara otomatis
    sale.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });
    this.saveProducts();

    // Background sync jika terhubung Google Sheets
    if (this.googleSheetsUrl) {
      this.syncSingleSale(sale);
    }
  }

  deleteSale(saleId) {
    this.sales = this.sales.filter(s => s.id !== saleId);
    this.saveSales();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on deleteSale:", err));
    }
  }

  // --- Tarik Uang / Kas Keluar ---
  recordWithdrawal(withdrawal) {
    if (!withdrawal.id) {
      withdrawal.id = 'WD-' + Date.now();
    }
    if (!withdrawal.date) {
      withdrawal.date = new Date().toISOString();
    }
    this.withdrawals.unshift(withdrawal);
    this.saveWithdrawals();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on withdrawal:", err));
    }
    return withdrawal;
  }

  deleteWithdrawal(id) {
    this.withdrawals = this.withdrawals.filter(w => w.id !== id);
    this.saveWithdrawals();
    if (this.googleSheetsUrl) {
      this.syncAllToGoogleSheets().catch(err => console.warn("Auto-sync error on deleteWithdrawal:", err));
    }
  }

  // --- Helper Unified HPP Calculator ---
  _calculateSingleSaleHpp(s) {
    if (!s) return 0;

    // 1. Hitung dari rincian array items jika tersedia
    if (s.items && Array.isArray(s.items) && s.items.length > 0) {
      let sumHpp = 0;
      let hasValidItemHpp = false;
      for (const it of s.items) {
        let cPrice = Number(it.costPrice || 0);
        if (cPrice <= 0) {
          const prod = this.products.find(p => 
            p.id === it.productId || 
            (p.name && it.name && p.name.trim().toLowerCase() === it.name.trim().toLowerCase())
          );
          if (prod && Number(prod.costPrice || 0) > 0) {
            cPrice = Number(prod.costPrice);
          }
        }
        if (cPrice > 0) {
          hasValidItemHpp = true;
          sumHpp += cPrice * Number(it.quantity || 1);
        } else {
          sumHpp += Math.round(Number(it.price || 0) * 0.5) * Number(it.quantity || 1);
        }
      }
      if (hasValidItemHpp || sumHpp > 0) return sumHpp;
    }

    // 2. Hitung dari string itemsSummary (misal: "RIce Nasi (10x @Rp2000)" atau "Beras (2)")
    if (s.itemsSummary && typeof s.itemsSummary === 'string' && s.itemsSummary !== '-') {
      const parts = s.itemsSummary.split(',').map(str => str.trim());
      let parsedTotalHpp = 0;
      let matchedAny = false;

      for (const part of parts) {
        const m1 = part.match(/^(.+?)\s*\((\d+)\s*x/i);
        const m2 = part.match(/^(.+?)\s*\((\d+)\)/i);
        let pName = '';
        let qty = 1;
        if (m1) {
          pName = m1[1].trim();
          qty = parseInt(m1[2], 10) || 1;
        } else if (m2) {
          pName = m2[1].trim();
          qty = parseInt(m2[2], 10) || 1;
        } else {
          pName = part.replace(/\(.*?\)/g, '').trim();
        }

        const pNameLower = pName.toLowerCase();
        const found = this.products.find(p => {
          if (!p.name) return false;
          const pLower = p.name.trim().toLowerCase();
          return pLower === pNameLower || pLower.includes(pNameLower) || pNameLower.includes(pLower);
        });

        if (found && Number(found.costPrice || 0) > 0) {
          parsedTotalHpp += Number(found.costPrice) * qty;
          matchedAny = true;
        }
      }

      if (matchedAny && parsedTotalHpp > 0) {
        return parsedTotalHpp;
      }
    }

    // 3. Jika s.totalHpp sudah ada dan valid > 0 serta bukan sisa bug 80% (16.000 untuk 20.000)
    if (s.totalHpp !== undefined && s.totalHpp !== null && Number(s.totalHpp) > 0) {
      const existingHpp = Number(s.totalHpp);
      if (!(existingHpp === 16000 && Number(s.totalAmount) === 20000)) {
        return existingHpp;
      }
    }

    // 4. Default fallback: 50% dari totalAmount (sesuai standar warung: Modal 10.000 dari Omzet 20.000)
    return Math.round(Number(s.totalAmount || 0) * 0.5);
  }

  _calculateSalesHpp(salesList) {
    if (!salesList || !Array.isArray(salesList)) return 0;
    let totalHpp = 0;
    for (let i = 0; i < salesList.length; i++) {
      totalHpp += this._calculateSingleSaleHpp(salesList[i]);
    }
    return totalHpp;
  }

  // --- Ringkasan Keuangan & Saldo (Financial Analytics) ---
  getFinancialSummary() {
    let cashSalesAmount = 0;
    let qrisSalesAmount = 0;

    // Single-pass sales aggregation
    for (let i = 0; i < this.sales.length; i++) {
      const s = this.sales[i];
      const amt = Number(s.totalAmount || 0);
      if ((s.paymentMethod || 'cash').toLowerCase() === 'qris') {
        qrisSalesAmount += amt;
      } else {
        cashSalesAmount += amt;
      }
    }
    const totalSalesAmount = cashSalesAmount + qrisSalesAmount;

    // Single-pass withdrawals aggregation
    let cashWithdrawn = 0;
    let qrisWithdrawn = 0;
    for (let i = 0; i < this.withdrawals.length; i++) {
      const w = this.withdrawals[i];
      const amt = Number(w.amount || 0);
      if ((w.source || 'cash').toLowerCase() === 'qris') {
        qrisWithdrawn += amt;
      } else {
        cashWithdrawn += amt;
      }
    }
    const totalWithdrawn = cashWithdrawn + qrisWithdrawn;

    // Saldo Kas Riil
    const saldoCash = cashSalesAmount - cashWithdrawn;
    const saldoQris = qrisSalesAmount - qrisWithdrawn;
    const totalSaldo = totalSalesAmount - totalWithdrawn;

    // Perhitungan Mingguan (7 Hari Terakhir)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklySales = this.sales.filter(s => new Date(s.date) >= sevenDaysAgo);
    const weeklyGrossRevenue = weeklySales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const weeklyHpp = this._calculateSalesHpp(weeklySales);
    const weeklyNetProfit = weeklyGrossRevenue - weeklyHpp;

    // Total HPP & Laba Bersih Keseluruhan
    const totalHpp = this._calculateSalesHpp(this.sales);
    const totalNetProfit = totalSalesAmount - totalHpp;

    // Nilai Total Aset Inventaris (Stok x Harga Beli)
    let totalInventoryValue = 0;
    for (let i = 0; i < this.products.length; i++) {
      const p = this.products[i];
      totalInventoryValue += (Number(p.costPrice || 0) * Number(p.stock || 0));
    }

    return {
      cashSalesAmount,
      qrisSalesAmount,
      totalSalesAmount,
      cashWithdrawn,
      qrisWithdrawn,
      totalWithdrawn,
      saldoCash,
      saldoQris,
      totalSaldo,
      weeklyGrossRevenue,
      weeklyHpp,
      weeklyNetProfit,
      totalHpp,
      totalNetProfit,
      totalInventoryValue,
      weeklySalesCount: weeklySales.length
    };
  }

  // --- Google Sheets Sync Adapter (CORS Safe) ---
  async syncAllToGoogleSheets() {
    if (!this.googleSheetsUrl) throw new Error("URL Google Sheets belum diatur di menu Pengaturan!");

    const payload = {
      action: 'syncAll',
      products: this.products,
      sales: this.sales,
      withdrawals: this.withdrawals,
      financialSummary: this.getFinancialSummary()
    };

    try {
      await fetch(this.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { status: 'success', message: 'Data produk, transaksi, rekap pendapatan, dan kas berhasil dikirim ke Google Sheets!' };
    } catch (err) {
      throw new Error("Gagal mengirim data ke Google Sheets: " + err.message);
    }
  }

  async fetchAllFromGoogleSheets() {
    if (!this.googleSheetsUrl) throw new Error("URL Google Sheets belum diatur di menu Pengaturan!");

    try {
      const res = await fetch(this.googleSheetsUrl + '?action=getAll');
      const data = await res.json();

      if (data.status === 'success') {
        if (data.products && Array.isArray(data.products)) {
          const oldDummyIds = new Set(['prod_1', 'prod_2', 'prod_3', 'prod_4', 'prod_5', 'prod_6', 'prod_7', 'prod_8', 'prod_9', 'prod_10']);
          const realProducts = data.products.filter(p => p && !oldDummyIds.has(p.id));

          if (realProducts.length > 0) {
            this.products = realProducts;
            this.saveProducts();
          } else if (data.products.length === 0 && this.products.length > 0) {
            this.products = [];
            this.saveProducts();
          }
        }

        if (data.sales && Array.isArray(data.sales)) {
          // Buang transaksi dummy bawaan TRX-1001 jika masih ada di cloud
          const realSales = data.sales.filter(s => s.id !== 'TRX-1001');

          // Gabungkan dengan items lokal jika ada agar items tidak hilang, dan hitung ulang totalHpp & netProfit
          this.sales = realSales.map(cloudSale => {
            const local = this.sales.find(s => s.id === cloudSale.id);
            const merged = {
              ...cloudSale,
              items: (local && local.items && local.items.length > 0) ? local.items : (cloudSale.items || []),
              itemsSummary: (local && local.itemsSummary) || cloudSale.itemsSummary
            };
            merged.totalHpp = this._calculateSingleSaleHpp(merged);
            merged.netProfit = Number(merged.totalAmount || 0) - merged.totalHpp;
            return merged;
          });
          this.saveSales();
        }

        if (data.withdrawals && Array.isArray(data.withdrawals)) {
          this.withdrawals = data.withdrawals;
          this.saveWithdrawals();
        }
      }

      return data;
    } catch (err) {
      throw new Error("Gagal menarik data dari Google Sheets: " + err.message);
    }
  }

  async syncSingleSale(sale) {
    try {
      const stockUpdates = sale.items.map(i => {
        const prod = this.products.find(p => p.id === i.productId);
        return { productId: i.productId, newStock: prod ? prod.stock : 0 };
      });

      await fetch(this.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addSale',
          sale: sale,
          stockUpdates: stockUpdates,
          financialSummary: this.getFinancialSummary()
        })
      });
    } catch (err) {
      console.warn("Background sync ke Google Sheets terkendala jaringan:", err);
    }
  }

  // --- Backup & Restore JSON ---
  exportBackupJSON() {
    const backup = {
      app: 'Alkamart',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      products: this.products,
      sales: this.sales,
      withdrawals: this.withdrawals
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alkamart-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackupJSON(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.products && Array.isArray(data.products)) {
      this.products = data.products;
      this.saveProducts();
    }
    if (data.sales && Array.isArray(data.sales)) {
      this.sales = data.sales;
      this.saveSales();
    }
    if (data.withdrawals && Array.isArray(data.withdrawals)) {
      this.withdrawals = data.withdrawals;
      this.saveWithdrawals();
    }
  }

  resetToDefault() {
    this.products = [...DEFAULT_PRODUCTS];
    this.sales = [...DEFAULT_SALES];
    this.withdrawals = [...DEFAULT_WITHDRAWALS];
    this.saveProducts();
    this.saveSales();
    this.saveWithdrawals();
  }
}

const store = new AlkamartStore();
