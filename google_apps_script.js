/**
 * ===================================================================
 * ALKAMART POS - GOOGLE APPS SCRIPT BACKEND (v1.2.0)
 * ===================================================================
 * Script ini dipasang pada Google Spreadsheet Alkamart Anda:
 * 1. Buka spreadsheet Anda: https://docs.google.com/spreadsheets/d/1voRUDptwvAfmlbfqe_FTRNuDpArT-mukOsUdQ8W7cjU/edit
 * 2. Klik menu "Ekstensi" (Extensions) -> pilih "Apps Script".
 * 3. Hapus semua kode yang ada di editor Apps Script, lalu PASTE semua kode ini.
 * 4. Klik ikon Save (Disket).
 * 5. Klik tombol biru "Terapkan" (Deploy) -> pilih "Penerapan baru" (New deployment).
 * 6. Klik ikon Gerigi di samping "Pilih jenis", pilih "Aplikasi Web" (Web App).
 * 7. Isi Konfigurasi:
 *    - Deskripsi: Alkamart POS API
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone) -> PENTING!
 * 8. Klik "Terapkan" (Deploy) -> Berikan izin akses (Authorize access).
 * 9. Salin URL Aplikasi Web (berakhiran /exec).
 * 10. Buka Web Alkamart -> Menu Pengaturan -> Paste URL tersebut -> Simpan!
 * ===================================================================
 */

function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';
    const ss = getSpreadsheet();

    if (action === 'getAll') {
      const products = getProducts(ss);
      const sales = getSales(ss);
      return createJsonResponse({
        status: 'success',
        products: products,
        sales: sales
      });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}
dddd
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const ss = getSpreadsheet();

    if (action === 'syncAll') {
      if (postData.products && Array.isArray(postData.products)) {
        saveProducts(ss, postData.products);
      }
      if (postData.sales && Array.isArray(postData.sales)) {
        saveSales(ss, postData.sales);
      }
      return createJsonResponse({
        status: 'success',
        message: 'Data produk dan transaksi berhasil disinkronkan ke Google Sheets!'
      });
    }

    if (action === 'addSale') {
      if (postData.sale) {
        appendSingleSale(ss, postData.sale);
      }
      if (postData.stockUpdates && Array.isArray(postData.stockUpdates)) {
        updateProductStocks(ss, postData.stockUpdates);
      }
      return createJsonResponse({
        status: 'success',
        message: 'Transaksi kasir berhasil dicatat di Google Sheets!'
      });
    }

    return createJsonResponse({ status: 'error', message: 'Action tidak dikenali' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// ================= HELPER FUNCTIONS ================= //


function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // Jika script dibuat terpisah (standalone), cari atau buat otomatis di Google Drive Anda
  try {
    const files = DriveApp.getFilesByName("Data Alkamart POS");
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next());
    }
    return SpreadsheetApp.create("Data Alkamart POS");
  } catch (err) {
    return SpreadsheetApp.create("Data Alkamart POS");
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// 1. Sheet "Produk"
function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#02452D").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function saveProducts(ss, products) {
  const sheet = getOrCreateSheet(ss, "Produk", [
    "ID Produk", "Nama Produk", "Kategori", "Harga Modal", "Harga Jual", "Stok", "Barcode", "Foto URL"
  ]);

  sheet.clearContents();
  sheet.appendRow([
    "ID Produk", "Nama Produk", "Kategori", "Harga Modal", "Harga Jual", "Stok", "Barcode", "Foto URL"
  ]);
  sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#02452D").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  if (products.length === 0) return;

  const rows = products.map(p => [
    p.id || '',
    p.name || '',
    p.category || '',
    p.costPrice || 0,
    p.price || 0,
    p.stock || 0,
    p.barcode || '',
    p.imageUrl || ''
  ]);

  sheet.getRange(2, 1, rows.length, 8).setValues(rows);
}

function getProducts(ss) {
  const sheet = ss.getSheetByName("Produk");
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const products = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    products.push({
      id: String(row[0]),
      name: String(row[1] || ''),
      category: String(row[2] || ''),
      costPrice: Number(row[3] || 0),
      price: Number(row[4] || 0),
      stock: Number(row[5] || 0),
      barcode: String(row[6] || ''),
      imageUrl: String(row[7] || '')
    });
  }
  return products;
}

function updateProductStocks(ss, stockUpdates) {
  const sheet = ss.getSheetByName("Produk");
  if (!sheet) return;

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return;

  const updateMap = {};
  stockUpdates.forEach(u => {
    updateMap[String(u.productId)] = u.newStock;
  });

  for (let i = 1; i < values.length; i++) {
    const prodId = String(values[i][0]);
    if (updateMap[prodId] !== undefined) {
      sheet.getRange(i + 1, 6).setValue(updateMap[prodId]);
    }
  }
}

// 2. Sheet "Transaksi"
function appendSingleSale(ss, sale) {
  const sheet = getOrCreateSheet(ss, "Transaksi", [
    "ID Transaksi", "Waktu", "Total Belanja", "Uang Diterima", "Kembalian", "Rincian Item"
  ]);

  const itemsSummary = (sale.items || [])
    .map(it => `${it.productName || it.name} (${it.quantity}x @Rp${it.price})`)
    .join(", ");

  sheet.appendRow([
    sale.id || '',
    sale.date || new Date().toLocaleString("id-ID"),
    sale.total || 0,
    sale.paid || 0,
    sale.change || 0,
    itemsSummary
  ]);
}

function saveSales(ss, sales) {
  const sheet = getOrCreateSheet(ss, "Transaksi", [
    "ID Transaksi", "Waktu", "Total Belanja", "Uang Diterima", "Kembalian", "Rincian Item"
  ]);

  sheet.clearContents();
  sheet.appendRow([
    "ID Transaksi", "Waktu", "Total Belanja", "Uang Diterima", "Kembalian", "Rincian Item"
  ]);
  sheet.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#02452D").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  if (sales.length === 0) return;

  const rows = sales.map(s => {
    const itemsSummary = (s.items || [])
      .map(it => `${it.productName || it.name} (${it.quantity}x @Rp${it.price})`)
      .join(", ");

    return [
      s.id || '',
      s.date || '',
      s.total || 0,
      s.paid || 0,
      s.change || 0,
      itemsSummary
    ];
  });

  sheet.getRange(2, 1, rows.length, 6).setValues(rows);
}

function getSales(ss) {
  const sheet = ss.getSheetByName("Transaksi");
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const sales = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0]) continue;
    sales.push({
      id: String(row[0]),
      date: String(row[1] || ''),
      total: Number(row[2] || 0),
      paid: Number(row[3] || 0),
      change: Number(row[4] || 0),
      itemsSummary: String(row[5] || ''),
      items: []
    });
  }
  return sales;
}
