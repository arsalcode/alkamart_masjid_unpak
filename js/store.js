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

const DEFAULT_GSHEET_URL = 'https://script.google.com/macros/s/AKfycbxm0XvmvA0MARv1Ev-1FycEwIfYnu9FmwRQm4-IkQuI3aIpldGxFzxdGWKWwV9LFbY/exec';

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
    if (savedProducts) {
      try {
        this.products = JSON.parse(savedProducts);
      } catch (e) {
        this.products = [...DEFAULT_PRODUCTS];
      }
    } else {
      this.products = [...DEFAULT_PRODUCTS];
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
        this.sales = JSON.parse(savedSales);
      } catch (e) {
        this.sales = [...DEFAULT_SALES];
      }
    } else {
      this.sales = [...DEFAULT_SALES];
      this.saveSales();
    }

    // Normalisasi data sales (paymentMethod & item costPrice)
    this.sales.forEach(s => {
      if (!s.paymentMethod) s.paymentMethod = 'cash';
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach(it => {
          if (it.costPrice === undefined || it.costPrice === null) {
            const prod = this.products.find(p => p.id === it.productId);
            it.costPrice = prod ? prod.costPrice : Math.round(Number(it.price || 0) * 0.8);
          }
        });
      }
    });

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
    this.activeRole = localStorage.getItem(STORAGE_KEYS.ROLE) || 'cashier';
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
        if (it.costPrice === undefined || it.costPrice === null) {
          const prod = this.products.find(p => p.id === it.productId);
          it.costPrice = prod ? prod.costPrice : Math.round(Number(it.price || 0) * 0.8);
        }
      });
    }

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

  // --- Helper O(1) HPP Calculator ---
  _calculateSalesHpp(salesList) {
    const productMap = new Map(this.products.map(p => [p.id, p.costPrice]));
    let totalHpp = 0;
    for (let i = 0; i < salesList.length; i++) {
      const items = salesList[i].items || [];
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        let cPrice = item.costPrice;
        if (cPrice === undefined || cPrice === null) {
          const cachedPrice = productMap.get(item.productId);
          cPrice = cachedPrice !== undefined ? cachedPrice : Math.round(Number(item.price || 0) * 0.8);
        }
        totalHpp += Number(cPrice) * Number(item.quantity || 1);
      }
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
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          this.products = data.products;
          this.saveProducts();
        } else if (this.products && this.products.length > 0) {
          this.syncAllToGoogleSheets().catch(e => console.warn("Auto-populate error:", e));
        }

        if (data.sales && Array.isArray(data.sales) && data.sales.length > 0) {
          this.sales = data.sales;
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
          stockUpdates: stockUpdates
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
