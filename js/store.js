/**
 * ALKAMART STORE & DATA PERSISTENCE ENGINE
 * Menangani LocalStorage, Google Sheets API, dan Backup/Restore JSON
 */

const STORAGE_KEYS = {
  PRODUCTS: 'alkamart_products_v5',
  SALES: 'alkamart_sales_v5',
  GOOGLE_SHEETS_URL: 'alkamart_gsheet_url_v5',
  ROLE: 'alkamart_active_role_v5'
};

const DEFAULT_GSHEET_URL = 'https://script.google.com/macros/s/AKfycbw9_ls77fF7vA83B5xmGz-HokYsjGvddiB4p6RAgjJHuPRjHqg_GO-cvsbo3pH8q-On/exec';

class AlkamartStore {
  constructor() {
    this.products = [];
    this.sales = [];
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
      this.saveProducts();
    // Auto-fix gambar jika ada produk tanpa foto atau link rusak
    this.products.forEach(p => {
      if (!p.imageUrl || p.imageUrl.trim() === '') {
        const nameLower = p.name.toLowerCase();
        if (nameLower.includes('kacang')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=500&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('alpukat') || nameLower.includes('es')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80';
        } else if (nameLower.includes('sate') || nameLower.includes('satw')) {
          p.imageUrl = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80';
        } else {
          // Cari foto default berdasarkan nama atau fallback
          const defaultMatch = DEFAULT_PRODUCTS.find(dp => dp.name.toLowerCase() === nameLower);
          if (defaultMatch) {
            p.imageUrl = defaultMatch.imageUrl;
          }
        }
      }
    });
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

    // 3. Load Configs (Default to central Google Sheets URL if not explicitly changed)
    const savedUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEETS_URL);
    this.googleSheetsUrl = (savedUrl && savedUrl.trim()) ? savedUrl.trim() : DEFAULT_GSHEET_URL;
    this.activeRole = localStorage.getItem(STORAGE_KEYS.ROLE) || 'cashier';
  }

  saveProducts() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
  }

  saveSales() {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(this.sales));
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

  // --- Google Sheets Sync Adapter (CORS Safe) ---
  async syncAllToGoogleSheets() {
    if (!this.googleSheetsUrl) throw new Error("URL Google Sheets belum diatur di menu Pengaturan!");

    const payload = {
      action: 'syncAll',
      products: this.products,
      sales: this.sales
    };

    try {
      // Gunakan mode no-cors untuk kompatibilitas penuh dengan redirect Google Apps Script
      await fetch(this.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { status: 'success', message: 'Data produk dan transaksi berhasil dikirim ke Google Sheets!' };
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
          // Jika spreadsheet baru dan masih kosong, isi otomatis dari data lokal
          this.syncAllToGoogleSheets().catch(e => console.warn("Auto-populate error:", e));
        }

        if (data.sales && Array.isArray(data.sales) && data.sales.length > 0) {
          this.sales = data.sales;
          this.saveSales();
        }
      }

      return data;
    } catch (err) {
      throw new Error("Gagal menarik data dari Google Sheets. Pastikan akses deployment diatur ke 'Siapa saja' (Anyone): " + err.message);
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
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      products: this.products,
      sales: this.sales
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
  }

  resetToDefault() {
    this.products = [...DEFAULT_PRODUCTS];
    this.sales = [...DEFAULT_SALES];
    this.saveProducts();
    this.saveSales();
  }
}

const store = new AlkamartStore();
