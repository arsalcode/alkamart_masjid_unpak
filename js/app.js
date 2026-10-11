

// ===================================================================
// CORPORATE EXCEL REPORT ENGINE (Desain Rapi & Elegan Standar Perusahaan)
// ===================================================================

function downloadCorporateExcel(filename, sheetName, htmlContent) {
  const fullHtml = `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:x="urn:schemas-microsoft-com:office:excel" 
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>${sheetName}</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #1E293B; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      .header-title { background-color: #02452D; color: #FFFFFF; font-size: 16pt; font-weight: bold; text-align: center; height: 42px; vertical-align: middle; }
      .header-sub { background-color: #035C3C; color: #EAF4F0; font-size: 10pt; text-align: center; height: 26px; vertical-align: middle; }
      .kpi-title { background-color: #EAF4F0; color: #02452D; font-size: 10pt; font-weight: bold; text-align: center; border: 1px solid #C1DFD2; height: 24px; vertical-align: middle; }
      .kpi-number { background-color: #FFFFFF; color: #02452D; font-size: 14pt; font-weight: bold; text-align: center; border: 1px solid #C1DFD2; height: 38px; vertical-align: middle; }
      .tbl-header th { background-color: #02452D; color: #FFFFFF; font-weight: bold; border: 1px solid #012E1E; padding: 10px; font-size: 11pt; text-align: center; vertical-align: middle; }
      .tbl-data td { border: 1px solid #CBD5E1; padding: 8px 10px; vertical-align: middle; font-size: 10.5pt; }
      .tbl-even { background-color: #F8FAF9; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      .text-bold { font-weight: bold; }
      .money { text-align: right; font-weight: 600; }
      .total-row td { background-color: #EAF4F0; font-weight: bold; border-top: 2px solid #02452D; border-bottom: 3px double #02452D; color: #02452D; height: 36px; font-size: 11.5pt; }
      .status-tersedia { color: #056B47; font-weight: bold; text-align: center; }
      .status-menipis { color: #D97706; font-weight: bold; text-align: center; }
      .status-habis { color: #DC2626; font-weight: bold; text-align: center; }
      .sign-title { font-weight: bold; text-align: center; height: 30px; }
      .sign-space { height: 70px; }
      .sign-name { font-weight: bold; text-decoration: underline; text-align: center; }
    </style>
  </head>
  <body>
    ${htmlContent}
  </body>
  </html>
  `;

  const blob = new Blob([fullHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Ekspor Laporan Rekap Penjualan Kasir (Executive Sales Report)
function exportSalesToExcel() {
  if (!store.sales || store.sales.length === 0) {
    showToast("Belum ada riwayat transaksi penjualan untuk diekspor!", "error");
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('id-ID');
  const fileDate = now.toISOString().slice(0, 10);

  const totalRev = store.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalTrx = store.sales.length;
  const avgTrx = Math.round(totalRev / (totalTrx || 1));

  let html = `
    <table>
      <tr>
        <th colspan="7" class="header-title">ALKAMART WARUNG - LAPORAN REKAP PENJUALAN HARIAN</th>
      </tr>
      <tr>
        <td colspan="7" class="header-sub">Jl. Raya Alkamart No. 12 | Dicetak: ${dateStr} pk. ${timeStr} WIB</td>
      </tr>
    </table>

    <!-- Ringkasan Eksekutif (KPI) -->
    <table>
      <tr>
        <td colspan="2" class="kpi-title">TOTAL OMZET PENJUALAN</td>
        <td colspan="3" class="kpi-title">TOTAL TRANSAKSI KASIR</td>
        <td colspan="2" class="kpi-title">RATA-RATA BELANJA PER TRANSAKSI</td>
      </tr>
      <tr>
        <td colspan="2" class="kpi-number">${formatRp(totalRev)}</td>
        <td colspan="3" class="kpi-number">${totalTrx} Transaksi</td>
        <td colspan="2" class="kpi-number">${formatRp(avgTrx)}</td>
      </tr>
    </table>

    <!-- Tabel Rincian Transaksi -->
    <table>
      <thead>
        <tr class="tbl-header">
          <th style="width: 45px;">No.</th>
          <th style="width: 130px;">No. Transaksi</th>
          <th style="width: 170px;">Tanggal & Waktu</th>
          <th style="width: 140px;">Kasir</th>
          <th style="width: 320px;">Rincian Barang yang Terjual</th>
          <th style="width: 140px;">Total Belanja</th>
          <th style="width: 130px;">Nominal Bayar</th>
        </tr>
      </thead>
      <tbody>
  `;

  store.sales.forEach((s, idx) => {
    const isEven = idx % 2 === 1;
    const trxTime = new Date(s.date).toLocaleString('id-ID');
    const items = s.itemsSummary || (s.items || []).map(i => `${i.name} (${i.quantity}x)`).join(', ');

    html += `
      <tr class="tbl-data ${isEven ? 'tbl-even' : ''}">
        <td class="text-center">${idx + 1}</td>
        <td class="text-center text-bold">${s.id}</td>
        <td class="text-center">${trxTime}</td>
        <td class="text-center">${s.cashierName || 'Kasir Alkamart'}</td>
        <td class="text-left">${items}</td>
        <td class="money text-bold" style="color: #02452D;">${formatRp(s.totalAmount || 0)}</td>
        <td class="money">${formatRp(s.paidAmount || 0)}</td>
      </tr>
    `;
  });

  html += `
        <tr class="total-row">
          <td colspan="5" class="text-right text-bold">TOTAL KESELURUHAN OMZET PENJUALAN:</td>
          <td class="text-right text-bold">${formatRp(totalRev)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <br><br>
    <!-- Kolom Tanda Tangan Perusahaan -->
    <table>
      <tr>
        <td colspan="3" class="sign-title">Dibuat Oleh (Kasir Bertugas):</td>
        <td></td>
        <td colspan="3" class="sign-title">Diketahui Oleh (Pemilik / Manager):</td>
      </tr>
      <tr class="sign-space"><td colspan="7"></td></tr>
      <tr>
        <td colspan="3" class="sign-name">( Kasir Alkamart )</td>
        <td></td>
        <td colspan="3" class="sign-name">( Pemilik Toko Alkamart )</td>
      </tr>
    </table>
  `;

  downloadCorporateExcel(`Laporan-Penjualan-Alkamart-${fileDate}.xls`, "Rekap Penjualan", html);
  showToast("Laporan Penjualan (Excel Formal) berhasil diunduh!", "success");
}

// 2. Ekspor Laporan Stok & Valuasi Aset Barang (Inventory Valuation Report)
function exportProductsToExcel() {
  if (!store.products || store.products.length === 0) {
    showToast("Belum ada data barang untuk diekspor!", "error");
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const fileDate = now.toISOString().slice(0, 10);

  let totalAssetModal = 0;
  let totalAssetJual = 0;
  let totalQty = 0;

  store.products.forEach(p => {
    const cost = p.costPrice || 0;
    const price = p.price || 0;
    const stock = p.stock || 0;
    totalQty += stock;
    totalAssetModal += (cost * stock);
    totalAssetJual += (price * stock);
  });

  const totalPotensiUntung = Math.max(0, totalAssetJual - totalAssetModal);

  let html = `
    <table>
      <tr>
        <th colspan="9" class="header-title">ALKAMART WARUNG - LAPORAN STOK & VALUASI ASET BARANG</th>
      </tr>
      <tr>
        <td colspan="9" class="header-sub">Status Inventaris Gudang & Toko | Dicetak: ${dateStr}</td>
      </tr>
    </table>

    <!-- Ringkasan Eksekutif Valuasi Aset -->
    <table>
      <tr>
        <td colspan="2" class="kpi-title">TOTAL JENIS PRODUK</td>
        <td colspan="2" class="kpi-title">TOTAL UNIT STOK</td>
        <td colspan="2" class="kpi-title">TOTAL NILAI ASET MODAL</td>
        <td colspan="3" class="kpi-title">POTENSI LABA KOTOR KESELURUHAN</td>
      </tr>
      <tr>
        <td colspan="2" class="kpi-number">${store.products.length} Jenis</td>
        <td colspan="2" class="kpi-number">${totalQty} Unit</td>
        <td colspan="2" class="kpi-number">${formatRp(totalAssetModal)}</td>
        <td colspan="3" class="kpi-number" style="color: #056B47;">${formatRp(totalPotensiUntung)}</td>
      </tr>
    </table>

    <!-- Tabel Rincian Stok -->
    <table>
      <thead>
        <tr class="tbl-header">
          <th style="width: 45px;">No.</th>
          <th style="width: 100px;">ID Barang</th>
          <th style="width: 260px;">Nama Produk</th>
          <th style="width: 120px;">Kategori</th>
          <th style="width: 120px;">Harga Modal</th>
          <th style="width: 120px;">Harga Jual</th>
          <th style="width: 100px;">Sisa Stok</th>
          <th style="width: 150px;">Total Nilai Modal</th>
          <th style="width: 120px;">Status Stok</th>
        </tr>
      </thead>
      <tbody>
  `;

  store.products.forEach((p, idx) => {
    const isEven = idx % 2 === 1;
    const cost = p.costPrice || 0;
    const price = p.price || 0;
    const stock = p.stock || 0;
    const assetVal = cost * stock;

    let statusHtml = '<span class="status-tersedia">Tersedia</span>';
    if (stock <= 0) {
      statusHtml = '<span class="status-habis">HABIS</span>';
    } else if (stock <= 5) {
      statusHtml = `<span class="status-menipis">MENIPIS (${stock})</span>`;
    }

    html += `
      <tr class="tbl-data ${isEven ? 'tbl-even' : ''}">
        <td class="text-center">${idx + 1}</td>
        <td class="text-center text-bold">${p.id}</td>
        <td class="text-left text-bold">${p.name}</td>
        <td class="text-center">${p.category || 'Umum'}</td>
        <td class="money">${formatRp(cost)}</td>
        <td class="money" style="color: #02452D;">${formatRp(price)}</td>
        <td class="text-center text-bold">${stock}</td>
        <td class="money text-bold">${formatRp(assetVal)}</td>
        <td class="text-center">${statusHtml}</td>
      </tr>
    `;
  });

  html += `
        <tr class="total-row">
          <td colspan="6" class="text-right text-bold">TOTAL KESELURUHAN NILAI ASET MODAL TOKO:</td>
          <td class="text-center text-bold">${totalQty} Unit</td>
          <td class="money text-bold">${formatRp(totalAssetModal)}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <br><br>
    <!-- Kolom Tanda Tangan Perusahaan -->
    <table>
      <tr>
        <td colspan="4" class="sign-title">Petugas Inventaris Gudang:</td>
        <td></td>
        <td colspan="4" class="sign-title">Kepala Toko / Manager Alkamart:</td>
      </tr>
      <tr class="sign-space"><td colspan="9"></td></tr>
      <tr>
        <td colspan="4" class="sign-name">( Admin Inventaris )</td>
        <td></td>
        <td colspan="4" class="sign-name">( Pemilik Toko Alkamart )</td>
      </tr>
    </table>
  `;

  downloadCorporateExcel(`Laporan-Stok-Barang-Alkamart-${fileDate}.xls`, "Valuasi Stok", html);
  showToast("Laporan Stok & Valuasi Aset (Excel Formal) berhasil diunduh!", "success");
}


/**
 * ALKAMART POS & MANAGEMENT CONTROLLER (v1.2.0)
 * Logika interaksi kasir, admin, kalkulasi uang, audio feedback, dan modal
 */

let cart = [];
let currentCategoryFilter = 'Semua';
let activeRestockProductId = null;
let lastCompletedSale = null;

// Audio Beep Effect (Web Audio API - Ringan & Tanpa File Eksternal)
function playBeepSound(type = 'add') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'add') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Browser tidak mengizinkan autoplay audio sebelum interaksi
  }
}

// Format Rupiah Helper
function formatRp(num) {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}

// Format Tanggal Waktu
function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + 
         ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// Toast Notifikasi
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icon = type === 'success' ? '<i class="ri-checkbox-circle-fill"></i>' : type === 'error' ? '<i class="ri-close-circle-fill"></i>' : '<i class="ri-information-fill"></i>';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Custom Confirmation Dialog Modern (Pengganti confirm() browser)
function showCustomConfirm({
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "danger",
  icon = "ri-delete-bin-line"
} = {}) {
  return new Promise((resolve) => {
    const modal = document.getElementById('customConfirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('btnOkConfirm');
    const cancelBtn = document.getElementById('btnCancelConfirm');
    const okTextEl = document.getElementById('confirmOkText');
    const iconBox = document.getElementById('confirmIconBox');
    const iconEl = document.getElementById('confirmIcon');

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    okTextEl.textContent = confirmText;
    cancelBtn.textContent = cancelText;

    iconBox.className = `confirm-icon-box ${type}`;
    iconEl.className = icon;

    if (type === 'danger') {
      okBtn.className = 'btn btn-danger';
    } else if (type === 'warning') {
      okBtn.className = 'btn btn-warning';
    } else {
      okBtn.className = 'btn btn-primary';
    }

    modal.classList.add('active');

    function cleanUp(result) {
      modal.classList.remove('active');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      resolve(result);
    }

    function onOk() { cleanUp(true); }
    function onCancel() { cleanUp(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
  });
}

// Inisialisasi Aplikasi Saat Halaman Selesai Dimuat
document.addEventListener('DOMContentLoaded', () => {
  initRoleView();
  renderCashierCatalog();
  renderCart();
  renderAdminView();
  setupEventListeners();
  checkSyncStatus();

  // Otomatis tarik data terbaru dari Google Sheets saat dibuka di HP
  autoSyncFromCloud(false);
});

// Periodic Cloud Sync (setiap 45 detik saat tab aktif)
setInterval(() => {
  if (document.visibilityState === 'visible') {
    autoSyncFromCloud(false);
  }
}, 45000);

// Auto-sync saat kasir/admin kembali ke tab web Alkamart
window.addEventListener('focus', () => {
  autoSyncFromCloud(false);
});

// Auto-Sync Function dari Cloud Google Sheets
let isSyncingCloud = false;
async function autoSyncFromCloud(showNotifications = false) {
  if (!store.googleSheetsUrl || isSyncingCloud) return;

  const dot = document.querySelector('.status-dot');
  const badge = document.getElementById('syncStatusBadge');

  isSyncingCloud = true;
  if (dot) dot.className = 'status-dot syncing';
  if (badge) badge.title = 'Sedang menyinkronkan data ke Cloud...';

  try {
    const data = await store.fetchAllFromGoogleSheets();
    renderCashierCatalog();
    renderAdminView();
    if (dot) dot.className = 'status-dot online';
    if (badge) badge.title = 'Cloud Terhubung (Klik untuk segarkan data)';
    if (showNotifications) {
      showToast('Data terbaru berhasil diperbarui dari Cloud!', 'success');
    }
  } catch (err) {
    console.warn('Auto sync cloud warning:', err);
    if (dot) dot.className = 'status-dot offline';
    if (badge) badge.title = 'Cloud Terputus / Offline (Klik untuk mencoba lagi)';
    if (showNotifications) {
      showToast('Gagal menarik data cloud: ' + err.message, 'error');
    }
  } finally {
    isSyncingCloud = false;
  }
}

// Switch Role (Kasir <-> Admin)
function initRoleView() {
  const isKasir = store.activeRole === 'cashier';
  document.getElementById('cashierView').classList.toggle('active', isKasir);
  document.getElementById('adminView').classList.toggle('active', !isKasir);
  
  document.body.classList.toggle('role-admin', !isKasir);
  document.body.classList.toggle('role-cashier', isKasir);

  const badge = document.getElementById('currentRoleBadge');
  if (badge) {
    badge.textContent = isKasir ? 'Mode Kasir' : 'Mode Admin';
    badge.classList.toggle('admin', !isKasir);
  }

  document.getElementById('switchRoleText').textContent = isKasir ? 'Ganti ke Admin' : 'Ganti ke Kasir';

  // Sembunyikan tombol keranjang belanja mobile jika sedang di Mode Admin
  const cartToggleBtn = document.getElementById('btnToggleCartMobile');
  if (cartToggleBtn) {
    cartToggleBtn.style.setProperty('display', isKasir ? 'inline-flex' : 'none', 'important');
  }

  // Pastikan drawer keranjang kasir tertutup saat membuka admin
  const cartSidebar = document.getElementById('cartSidebar');
  if (cartSidebar && !isKasir) {
    cartSidebar.classList.remove('open');
  }
}

function openAdminAuthModal() {
  const modal = document.getElementById('adminAuthModal');
  const input = document.getElementById('inputAdminPassword');
  const err = document.getElementById('adminAuthError');
  if (modal) {
    if (input) input.value = '';
    if (err) err.style.display = 'none';
    modal.classList.add('active');
    modal.classList.add('open');
    setTimeout(() => { if (input) input.focus(); }, 150);
  }
}

function closeAdminAuthModal() {
  const modal = document.getElementById('adminAuthModal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.remove('open');
  }
}

function verifyAdminPassword() {
  const input = document.getElementById('inputAdminPassword');
  const err = document.getElementById('adminAuthError');
  const password = input ? input.value : '';

  if (password === 'Update') {
    closeAdminAuthModal();
    store.setRole('admin');
    initRoleView();
    renderAdminView();
    showToast("Login Admin Berhasil! Selamat datang di Mode Admin.", "success");
  } else {
    if (err) err.style.display = 'block';
    showToast("Password Admin Salah! Akses ditolak.", "error");
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

let isSwitchingRole = false;
function switchRole() {
  if (isSwitchingRole) return;
  isSwitchingRole = true;
  setTimeout(() => { isSwitchingRole = false; }, 350);

  if (store.activeRole === 'cashier') {
    openAdminAuthModal();
  } else {
    store.setRole('cashier');
    initRoleView();
    renderCashierCatalog();
    showToast("Berhasil beralih ke Mode Kasir.", "info");
  }
}

// Check Sync Status
function checkSyncStatus() {
  const dot = document.querySelector('.status-dot');
  const badge = document.getElementById('syncStatusBadge');
  if (!dot) return;
  if (store.googleSheetsUrl) {
    dot.className = 'status-dot online';
    if (badge) badge.title = 'Cloud Terhubung (Klik untuk segarkan data)';
  } else {
    dot.className = 'status-dot offline';
    if (badge) badge.title = 'Cloud Tidak Aktif (Lokal)';
  }
}

// ==========================================
// KASIR (POS) LOGIC
// ==========================================
function renderCashierCatalog() {
  const grid = document.getElementById('cashierProductGrid');
  const query = document.getElementById('cashierSearchInput').value.toLowerCase().trim();

  let filtered = store.products.filter(p => {
    const matchCat = currentCategoryFilter === 'Semua' || p.category === currentCategoryFilter;
    const matchQuery = p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query));
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    if (store.products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-muted);">
          <p style="font-size: 42px; color: var(--primary); margin-bottom: 10px;"><i class="ri-store-2-line"></i></p>
          <p style="font-size: 16px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">Katalog Produk Masih Kosong</p>
          <small>Silakan tambahkan barang baru dengan foto di menu <strong>Admin &rarr; Kelola Barang</strong>.</small>
        </div>`;
      return;
    }

    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        <p style="font-size: 38px; color: var(--primary); margin-bottom: 8px;"><i class="ri-search-eye-line"></i></p>
        <p style="font-weight: 500;">Barang tidak ditemukan.</p>
        <small>Coba gunakan kata kunci pencarian yang lain.</small>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= 5;
    
    let stockBadge = `<span class="badge-stock">Stok: ${p.stock}</span>`;
    if (isOut) stockBadge = `<span class="badge-stock out">Habis</span>`;
    else if (isLow) stockBadge = `<span class="badge-stock low">Sisa ${p.stock}!</span>`;

        const fallbackHtml = `<div class="card-img-fallback">${p.fallbackIcon || '<i class="ri-archive-line"></i>'}</div>`;
    const imgHtml = p.imageUrl ? 
      `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';">` : '';

    return `
      <div class="product-pos-card ${isOut ? 'disabled' : ''}" onclick="addToCart('${p.id}')">
        <div class="card-img-wrapper">
          ${fallbackHtml}
          ${imgHtml}
          ${stockBadge}
        </div>
        <div class="card-body">
          <div class="card-title">${p.name}</div>
          <div class="card-price">${formatRp(p.price)}</div>
          <button class="btn-add-cart" ${isOut ? 'disabled' : ''}>
            ${isOut ? 'Stok Habis' : '+ Tambah'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Keranjang Belanja Kasir
function addToCart(productId) {
  const prod = store.products.find(p => p.id === productId);
  if (!prod || prod.stock <= 0) return;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    if (existing.quantity < prod.stock) {
      existing.quantity++;
      existing.subtotal = existing.quantity * existing.price;
      playBeepSound('add');
    } else {
      showToast(`Stok ${prod.name} hanya tersisa ${prod.stock} item!`, 'error');
      return;
    }
  } else {
    cart.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: 1,
      subtotal: prod.price,
      imageUrl: prod.imageUrl,
      fallbackIcon: prod.fallbackIcon || '📦',
      maxStock: prod.stock
    });
    playBeepSound('add');
  }

  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;

  const prod = store.products.find(p => p.id === productId);
  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    cart = cart.filter(i => i.productId !== productId);
  } else if (prod && newQty > prod.stock) {
    showToast(`Stok tidak mencukupi (Maksimal ${prod.stock})!`, 'error');
  } else {
    item.quantity = newQty;
    item.subtotal = item.quantity * item.price;
  }

  renderCart();
}

function promptDirectQuantity(productId) {
  const item = cart.find(i => i.productId === productId);
  const prod = store.products.find(p => p.id === productId);
  if (!item || !prod) return;

  const modal = document.getElementById('customQuantityModal');
  const titleEl = document.getElementById('customQtyTitle');
  const subEl = document.getElementById('customQtySub');
  const inputEl = document.getElementById('inputCustomQty');
  const stockEl = document.getElementById('customQtyStockInfo');
  const btnPlus = document.getElementById('btnQtyPlus');
  const btnMinus = document.getElementById('btnQtyMinus');
  const btnApply = document.getElementById('btnApplyQtyModal');
  const btnCancel = document.getElementById('btnCancelQtyModal');
  const btnClose = document.getElementById('btnCloseQtyModal');

  titleEl.textContent = item.name;
  subEl.textContent = `Harga: ${formatRp(item.price)} / item`;
  stockEl.textContent = `Stok tersedia: ${prod.stock} item`;
  inputEl.value = item.quantity;
  inputEl.max = prod.stock;

  modal.classList.add('active');
  inputEl.focus();
  inputEl.select();

  function step(delta) {
    let val = parseInt(inputEl.value || 0, 10) + delta;
    if (val < 0) val = 0;
    if (val > prod.stock) val = prod.stock;
    inputEl.value = val;
  }

  const onPlus = () => step(1);
  const onMinus = () => step(-1);

  btnPlus.onclick = onPlus;
  btnMinus.onclick = onMinus;

  function closeModal() {
    modal.classList.remove('active');
    btnApply.onclick = null;
    btnCancel.onclick = null;
    btnClose.onclick = null;
  }

  btnCancel.onclick = closeModal;
  btnClose.onclick = closeModal;

  btnApply.onclick = () => {
    const qty = parseInt(inputEl.value, 10);
    if (!isNaN(qty) && qty > 0) {
      if (qty <= prod.stock) {
        item.quantity = qty;
        item.subtotal = item.quantity * item.price;
        renderCart();
        closeModal();
      } else {
        showToast(`Stok hanya tersedia ${prod.stock} item!`, 'error');
      }
    } else if (qty === 0) {
      cart = cart.filter(i => i.productId !== productId);
      renderCart();
      closeModal();
    }
  };
}

function renderCart() {
  const listEl = document.getElementById('cartItemsList');
  const countEl = document.getElementById('cartTotalItemsCount');
  const mobileCountEl = document.getElementById('cartCountMobile');
  const subtotalEl = document.getElementById('cartSubtotalText');
  const totalEl = document.getElementById('cartTotalText');

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.subtotal, 0);

  countEl.textContent = `${totalItems} Item`;
  mobileCountEl.textContent = totalItems;
  subtotalEl.textContent = formatRp(totalPrice);
  totalEl.textContent = formatRp(totalPrice);

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="cart-empty-state">
        <span class="cart-empty-icon"><i class="ri-shopping-cart-line"></i></span>
        <p>Keranjang masih kosong.<br>Klik produk untuk menambahkan.</p>
      </div>`;
    calculateChange();
    return;
  }

  listEl.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <div class="cart-item-img">
        ${item.imageUrl ? `<img src="${item.imageUrl}">` : item.fallbackIcon}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatRp(item.subtotal)} <small>(${formatRp(item.price)}/item)</small></div>
      </div>
      <div class="cart-qty-ctrls">
        <button class="btn-qty" onclick="updateCartQuantity('${item.productId}', -1)">-</button>
        <span class="cart-item-qty" onclick="promptDirectQuantity('${item.productId}')" title="Klik untuk ketik kuantitas">${item.quantity}</span>
        <button class="btn-qty" onclick="updateCartQuantity('${item.productId}', 1)">+</button>
      </div>
    </div>
  `).join('');

  calculateChange();
}

let activePaymentMethod = 'cash'; // 'cash' atau 'qris'

function calculateChange() {
  const totalPrice = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const inputPaid = document.getElementById('inputCashPaid');
  const changeEl = document.getElementById('cartChangeText');
  const btnCheckout = document.getElementById('btnCheckout');

  if (cart.length === 0) {
    if (changeEl) {
      changeEl.textContent = 'Rp 0';
      changeEl.style.color = 'var(--text-muted)';
    }
    if (btnCheckout) btnCheckout.disabled = true;
    return;
  }

  // Jika metode pembayaran QRIS aktif
  if (activePaymentMethod === 'qris') {
    if (changeEl) {
      changeEl.textContent = 'Rp 0 (Pas QRIS)';
      changeEl.style.color = 'var(--primary)';
    }
    if (btnCheckout) btnCheckout.disabled = false;
    return;
  }

  // Jika metode pembayaran Tunai (Cash)
  const rawVal = inputPaid.value.replace(/[^0-9]/g, '');
  const paid = Number(rawVal || 0);

  // Wajib masukkan nominal uang tunai terlebih dahulu
  if (!rawVal || paid === 0) {
    changeEl.textContent = 'Rp 0 (Masukkan uang tunai)';
    changeEl.style.color = 'var(--text-muted)';
    btnCheckout.disabled = true;
    return;
  }

  const change = paid - totalPrice;

  if (paid >= totalPrice) {
    changeEl.textContent = formatRp(change);
    changeEl.style.color = 'var(--primary)';
    btnCheckout.disabled = false;
  } else {
    changeEl.textContent = `Kurang ${formatRp(Math.abs(change))}`;
    changeEl.style.color = 'var(--danger)';
    btnCheckout.disabled = true;
  }
}

// Proses Transaksi Checkout
function processCheckout() {
  if (cart.length === 0) {
    showToast("Keranjang belanja masih kosong!", "error");
    return;
  }

  const totalPrice = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const inputPaid = document.getElementById('inputCashPaid');
  let paid = totalPrice;
  let change = 0;

  if (activePaymentMethod === 'qris') {
    paid = totalPrice;
    change = 0;
  } else {
    const rawDigits = inputPaid.value.replace(/[^0-9]/g, '');
    paid = Number(rawDigits || 0);

    if (!rawDigits || paid <= 0) {
      showToast("Silakan masukkan nominal uang tunai terlebih dahulu!", "warning");
      inputPaid.focus();
      return;
    }

    if (paid < totalPrice) {
      showToast(`Uang pembayaran kurang ${formatRp(totalPrice - paid)}!`, "error");
      inputPaid.focus();
      return;
    }
    change = paid - totalPrice;
  }

  const trxId = 'TRX-' + Date.now().toString().slice(-6);
  const now = new Date().toISOString();

  // Rekam costPrice pada setiap item untuk keakuratan laba historis
  const saleItems = cart.map(item => {
    const prod = store.products.find(p => p.id === item.productId || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase()));
    let itemCost = 0;
    if (item.costPrice !== undefined && item.costPrice !== null && Number(item.costPrice) > 0) {
      itemCost = Number(item.costPrice);
    } else if (prod && prod.costPrice !== undefined && Number(prod.costPrice) > 0) {
      itemCost = Number(prod.costPrice);
    } else {
      itemCost = Math.round(Number(item.price || 0) * 0.8);
    }

    return {
      ...item,
      costPrice: itemCost
    };
  });

  const totalCostHpp = saleItems.reduce((sum, it) => sum + (Number(it.costPrice || 0) * Number(it.quantity || 1)), 0);
  const netProfit = totalPrice - totalCostHpp;

  const sale = {
    id: trxId,
    date: now,
    cashierName: "Kasir Alkamart",
    paymentMethod: activePaymentMethod,
    totalAmount: totalPrice,
    paidAmount: paid,
    changeAmount: change,
    total: totalPrice,
    paid: paid,
    change: change,
    items: saleItems,
    itemsSummary: saleItems.map(i => `${i.name} (${i.quantity}x @Rp${Number(i.price).toLocaleString('id-ID')})`).join(', '),
    totalHpp: totalCostHpp,
    netProfit: netProfit
  };

  // Simpan transaksi & kurangi stok
  store.recordSale(sale);
  lastCompletedSale = sale;

  playBeepSound('success');

  // Reset Keranjang
  cart = [];
  inputPaid.value = '';
  renderCart();
  renderCashierCatalog();
  renderAdminView();

  // Tampilkan Modal Struk Nota
  openReceiptModal(sale);
  showToast(`Transaksi berhasil dicatat (${activePaymentMethod === 'qris' ? 'QRIS' : 'Tunai'})!`, "success");
}

// Modal Struk Nota
function openReceiptModal(sale) {
  document.getElementById('recTrxId').textContent = sale.id;
  document.getElementById('recCashierName').textContent = sale.cashierName;
  document.getElementById('recDateTime').textContent = formatDateTime(sale.date);

  const recMethodEl = document.getElementById('recPaymentMethod');
  if (recMethodEl) {
    recMethodEl.textContent = (sale.paymentMethod || 'cash').toLowerCase() === 'qris' ? 'QRIS (NON-TUNAI)' : 'TUNAI (CASH)';
  }

  document.getElementById('recTotalAmount').textContent = formatRp(sale.totalAmount);
  document.getElementById('recPaidAmount').textContent = formatRp(sale.paidAmount);
  document.getElementById('recChangeAmount').textContent = formatRp(sale.changeAmount);

  const itemsListEl = document.getElementById('recItemsList');
  if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
    itemsListEl.innerHTML = sale.items.map(item => `
      <div class="receipt-item-line">
        <span>${item.name || 'Barang'}</span>
        <span>${formatRp(item.subtotal || (item.quantity * item.price))}</span>
      </div>
      <div class="receipt-item-calc">
        ${item.quantity} x ${formatRp(item.price)}
      </div>
    `).join('');
  } else {
    itemsListEl.innerHTML = `<div class="receipt-item-line"><span style="color: #666; font-style: italic;">${sale.itemsSummary || 'Rincian item tidak tersedia'}</span></div>`;
  }

  document.getElementById('receiptModal').classList.add('active');
}

// Lihat Struk Berdasarkan ID (Aman dari Bug Kutip JSON)
window.viewReceiptById = function(saleId) {
  const sale = store.sales.find(s => s.id === saleId);
  if (sale) {
    lastCompletedSale = sale;
    openReceiptModal(sale);
  }
};

// Hapus Riwayat Transaksi (Fitur Batal / Koreksi Admin)
window.deleteSaleById = async function(saleId) {
  const confirmed = await showCustomConfirm({
    title: "Batalkan Transaksi?",
    message: `Batalkan riwayat transaksi <strong>${saleId}</strong>?<br><small style="color: var(--danger); display: inline-block; margin-top: 6px;">Catatan: Stok barang tidak akan otomatis dikembalikan.</small>`,
    confirmText: "Ya, Batalkan",
    cancelText: "Kembali",
    type: "danger",
    icon: "ri-error-warning-line"
  });

  if (confirmed) {
    store.deleteSale(saleId);
    renderReportsTab();
    showToast("Transaksi berhasil dibatalkan dari riwayat!", "info");
  }
};

// Kirim Struk ke WhatsApp
function shareReceiptToWhatsApp(sale) {
  if (!sale) return;
  let text = `*STRUK BELANJA ALKAMART*%0A`;
  text += `No: ${sale.id}%0A`;
  text += `Waktu: ${formatDateTime(sale.date)}%0A`;
  text += `Kasir: ${sale.cashierName}%0A`;
  text += `-------------------------%0A`;
  if (sale.items && Array.isArray(sale.items) && sale.items.length > 0) {
    sale.items.forEach(i => {
      text += `${i.name || 'Barang'} (${i.quantity}x) = ${formatRp(i.subtotal || (i.quantity * i.price))}%0A`;
    });
  } else {
    text += `${sale.itemsSummary || 'Rincian item tidak tersedia'}%0A`;
  }
  text += `-------------------------%0A`;
  text += `*Total: ${formatRp(sale.totalAmount)}*%0A`;
  text += `Bayar: ${formatRp(sale.paidAmount)}%0A`;
  text += `Kembali: ${formatRp(sale.changeAmount)}%0A`;
  text += `-------------------------%0A`;
  text += `_Terima kasih telah berbelanja di Alkamart!_`;

  window.open(`https://wa.me/?text=${text}`, '_blank');
}

// ==========================================
// ADMIN LOGIC (CRUD, RESTOCK, REPORTS)
// ==========================================
function renderAdminView() {
  const _adminView = document.getElementById('adminView');
  if (_adminView) _adminView.scrollTop = 0;
  renderAdminProductsTable();
  renderRestockTab();
  renderReportsTab();
}

function renderAdminProductsTable() {
  const tbody = document.getElementById('adminProductTableBody');
  const query = (document.getElementById('adminProductSearch')?.value || '').toLowerCase().trim();

  // Total nilai aset warung berdasarkan harga modal barang
  const totalAsset = store.products.reduce((sum, p) => sum + (Number(p.costPrice || 0) * Number(p.stock || 0)), 0);
  document.getElementById('adminTotalProductCount').textContent = store.products.length;
  document.getElementById('adminTotalAssetValue').textContent = formatRp(totalAsset);

  const filtered = store.products.filter(p => p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query)));

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
          <i class="ri-inbox-line" style="font-size: 38px; display: block; margin-bottom: 10px; color: var(--primary);"></i>
          <strong style="display: block; font-size: 15px; color: var(--text-main); margin-bottom: 4px;">
            ${store.products.length === 0 ? 'Inventaris Barang Masih Kosong (0 Produk)' : 'Tidak ada produk yang cocok dengan pencarian'}
          </strong>
          <small>${store.products.length === 0 ? 'Klik tombol <strong>+ Tambah Barang</strong> di atas untuk mulai memasukkan foto & data produk.' : 'Periksa kembali kata kunci pencarian Anda.'}</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    let statusClass = 'in-stock';
    let statusLabel = 'Tersedia';
    if (p.stock <= 0) {
      statusClass = 'out-stock';
      statusLabel = 'Habis';
    } else if (p.stock <= 5) {
      statusClass = 'low-stock';
      statusLabel = `Menipis (${p.stock})`;
    }

    const cost = Number(p.costPrice || 0);
    const price = Number(p.price || 0);
    const profitPerPcs = price - cost;

    return `
      <tr>
        <td>
          <div class="table-product-thumb">
            ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}">` : (p.fallbackIcon || '📦')}
          </div>
        </td>
        <td><strong>${p.name}</strong></td>
        <td><span class="badge-cat">${p.category || 'Umum'}</span></td>
        <td><span class="text-muted">${formatRp(cost)}</span></td>
        <td><strong>${formatRp(price)}</strong></td>
        <td><span class="profit-tag">+${formatRp(profitPerPcs)}</span></td>
        <td><strong>${p.stock}</strong> item</td>
        <td><span class="status-tag ${statusClass}">${statusLabel}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${p.id}')"><i class="ri-edit-line"></i> Edit</button>
            <button class="btn btn-danger-outline btn-sm" style="padding: 0 10px;" onclick="confirmDeleteProduct('${p.id}')" title="Hapus"><i class="ri-delete-bin-line"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Live Update Preview Margin Keuntungan Produk
function updateProductMarginPreview() {
  const costEl = document.getElementById('formProductCostPrice');
  const priceEl = document.getElementById('formProductPrice');
  const marginValEl = document.getElementById('productMarginValue');
  if (!costEl || !priceEl || !marginValEl) return;

  const cost = Number(costEl.value.replace(/[^0-9]/g, '') || 0);
  const price = Number(priceEl.value.replace(/[^0-9]/g, '') || 0);
  const profit = price - cost;
  const percent = cost > 0 ? Math.round((profit / cost) * 100) : 0;

  if (price > 0) {
    marginValEl.textContent = `${formatRp(profit)} (${profit >= 0 ? '+' : ''}${percent}%)`;
    marginValEl.style.color = profit >= 0 ? 'var(--primary)' : 'var(--danger)';
  } else {
    marginValEl.textContent = 'Rp 0 (0%)';
    marginValEl.style.color = 'var(--text-muted)';
  }
}

// Modal Tambah / Edit Produk
function openAddProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('formProductCategory').value = 'Makanan';
  updateCustomSelectUI('Makanan');
  document.getElementById('formProductId').value = '';
  document.getElementById('formProductCostPrice').value = '';
  document.getElementById('formProductPrice').value = '';
  document.getElementById('productModalTitle').textContent = 'Tambah Barang Baru';
  document.getElementById('productPhotoPreview').innerHTML = '<span class="preview-placeholder">Foto Produk</span>';
  updateProductMarginPreview();
  document.getElementById('productFormModal').classList.add('active');
}

function openEditProductModal(productId) {
  const prod = store.products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('formProductId').value = prod.id;
  document.getElementById('formProductName').value = prod.name;
  const categoryVal = prod.category || 'Makanan';
  document.getElementById('formProductCategory').value = categoryVal;
  updateCustomSelectUI(categoryVal);
  document.getElementById('formProductCostPrice').value = prod.costPrice ? Number(prod.costPrice).toLocaleString('id-ID') : '';
  document.getElementById('formProductPrice').value = prod.price ? Number(prod.price).toLocaleString('id-ID') : '';
  document.getElementById('formProductStock').value = prod.stock;
  document.getElementById('formProductImageUrl').value = prod.imageUrl || '';

  const preview = document.getElementById('productPhotoPreview');
  if (prod.imageUrl) {
    preview.innerHTML = `<img src="${prod.imageUrl}" alt="${prod.name}">`;
  } else {
    preview.innerHTML = `<span class="card-img-fallback">${prod.fallbackIcon || '📦'}</span>`;
  }

  updateProductMarginPreview();
  document.getElementById('productModalTitle').textContent = 'Edit Data Barang';
  document.getElementById('productFormModal').classList.add('active');
}

async function confirmDeleteProduct(productId) {
  const prod = store.products.find(p => p.id === productId);
  if (!prod) return;

  const confirmed = await showCustomConfirm({
    title: "Hapus Produk?",
    message: `Yakin ingin menghapus produk <strong>"${prod.name}"</strong> dari katalog warung?<br><small class="text-muted" style="display:inline-block; margin-top: 6px;">Data barang akan dihapus dan disinkronkan ke Google Sheets.</small>`,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    type: "danger",
    icon: "ri-delete-bin-line"
  });

  if (confirmed) {
    store.deleteProduct(productId);
    renderAdminProductsTable();
    renderCashierCatalog();
    showToast(`Produk "${prod.name}" berhasil dihapus!`, "success");
  }
}

// Restok Cepat
function renderRestockTab() {
  const grid = document.getElementById('restockGrid');
  const badgeCount = document.getElementById('lowStockBadgeCount');

  const lowStockProducts = store.products.filter(p => p.stock <= 5);
  badgeCount.textContent = lowStockProducts.length;
  badgeCount.style.display = lowStockProducts.length > 0 ? 'inline-block' : 'none';

  if (lowStockProducts.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); background: white; border-radius: 12px;">
        <p style="font-size: 40px; margin-bottom: 8px;">🎉</p>
        <p style="font-weight: 600; color: var(--primary);">Semua stok aman!</p>
        <small>Tidak ada barang yang perlu direstok saat ini.</small>
      </div>`;
    return;
  }

  grid.innerHTML = lowStockProducts.map(p => `
    <div class="restock-card">
      <div class="restock-card-left">
        <div class="table-product-thumb">
          ${p.imageUrl ? `<img src="${p.imageUrl}">` : (p.fallbackIcon || '📦')}
        </div>
        <div>
          <strong style="font-size: 14px; display: block;">${p.name}</strong>
          <div style="font-size: 12px; color: var(--danger); font-weight: 600;">
            Sisa Stok: ${p.stock} item
          </div>
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openQuickRestockModal('${p.id}')">
        + Tambah Stok
      </button>
    </div>
  `).join('');
}

function openQuickRestockModal(productId) {
  const prod = store.products.find(p => p.id === productId);
  if (!prod) return;

  activeRestockProductId = productId;
  document.getElementById('restockProductName').textContent = prod.name;
  document.getElementById('restockCurrentStock').textContent = `${prod.stock} item`;
  document.getElementById('inputAddStockQty').value = '10';
  document.getElementById('quickRestockModal').classList.add('active');
}

// Rekap Pendapatan & Finansial
function renderReportsTab() {
  const fin = store.getFinancialSummary();

  // Kartu Ringkasan Finansial
  const reportTotalSaldoEl = document.getElementById('reportTotalSaldo');
  if (reportTotalSaldoEl) reportTotalSaldoEl.textContent = formatRp(fin.totalSaldo);

  const reportSaldoCashEl = document.getElementById('reportSaldoCash');
  if (reportSaldoCashEl) reportSaldoCashEl.textContent = formatRp(fin.saldoCash);

  const reportSaldoQrisEl = document.getElementById('reportSaldoQris');
  if (reportSaldoQrisEl) reportSaldoQrisEl.textContent = formatRp(fin.saldoQris);

  const reportWeeklyGrossEl = document.getElementById('reportWeeklyGross');
  if (reportWeeklyGrossEl) reportWeeklyGrossEl.textContent = formatRp(fin.weeklyGrossRevenue);

  const reportWeeklyCountEl = document.getElementById('reportWeeklyCount');
  if (reportWeeklyCountEl) reportWeeklyCountEl.textContent = `${fin.weeklySalesCount} transaksi (7 hari terakhir)`;

  const reportWeeklyNetEl = document.getElementById('reportWeeklyNet');
  if (reportWeeklyNetEl) {
    reportWeeklyNetEl.textContent = formatRp(fin.weeklyNetProfit);
    reportWeeklyNetEl.style.color = fin.weeklyNetProfit >= 0 ? '#059669' : 'var(--danger)';
  }

  const reportTotalWithdrawnEl = document.getElementById('reportTotalWithdrawn');
  if (reportTotalWithdrawnEl) reportTotalWithdrawnEl.textContent = formatRp(fin.totalWithdrawn);

  const reportWithdrawnCountEl = document.getElementById('reportWithdrawnCount');
  if (reportWithdrawnCountEl) reportWithdrawnCountEl.textContent = `${store.withdrawals.length} kali penarikan kas`;

  // Fallback kartu lama jika ada
  const totalRevEl = document.getElementById('reportTotalRevenue');
  if (totalRevEl) totalRevEl.textContent = formatRp(fin.totalSalesAmount);
  const totalTrxEl = document.getElementById('reportTotalTransactions');
  if (totalTrxEl) totalTrxEl.textContent = store.sales.length;

  // 1. Render Tabel Riwayat Transaksi Penjualan
  const historyTbody = document.getElementById('salesHistoryTableBody');
  if (historyTbody) {
    if (store.sales.length === 0) {
      historyTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px;">Belum ada riwayat transaksi penjualan.</td></tr>';
    } else {
      historyTbody.innerHTML = store.sales.map(s => {
        const isQris = (s.paymentMethod || '').toLowerCase() === 'qris';
        const methodBadge = `<span class="badge-pay-method ${isQris ? 'badge-pay-qris' : 'badge-pay-cash'}">
          <i class="${isQris ? 'ri-qr-code-fill' : 'ri-money-dollar-circle-fill'}"></i> ${isQris ? 'QRIS' : 'Tunai'}
        </span>`;

        return `
          <tr>
            <td><strong>${s.id}</strong></td>
            <td>${formatDateTime(s.date)}</td>
            <td>${s.cashierName || 'Kasir'}</td>
            <td>${methodBadge}</td>
            <td style="max-width: 250px;">${s.itemsSummary || '-'}</td>
            <td><strong style="color: var(--primary);">${formatRp(s.totalAmount)}</strong></td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-outline btn-sm" onclick="viewReceiptById('${s.id}')">
                  Lihat Nota
                </button>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteSaleById('${s.id}')" title="Batalkan transaksi">
                  ✕
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Render Tabel Riwayat Tarik Uang / Pengeluaran
  renderWithdrawalsTable();
}

function renderWithdrawalsTable() {
  const tbody = document.getElementById('withdrawalsHistoryTableBody');
  if (!tbody) return;

  if (!store.withdrawals || store.withdrawals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">Belum ada catatan penarikan kas / pengeluaran uang.</td></tr>';
    return;
  }

  tbody.innerHTML = store.withdrawals.map(w => {
    const isQris = (w.source || '').toLowerCase() === 'qris';
    const sourceBadge = `<span class="badge-pay-method ${isQris ? 'badge-pay-qris' : 'badge-pay-cash'}">
      <i class="${isQris ? 'ri-qr-code-fill' : 'ri-money-dollar-circle-fill'}"></i> ${isQris ? 'QRIS' : 'Tunai'}
    </span>`;

    return `
      <tr>
        <td>${formatDateTime(w.date)}</td>
        <td><strong style="color: #d97706; font-size: 14px;">${formatRp(w.amount)}</strong></td>
        <td>${sourceBadge}</td>
        <td style="max-width: 320px;">${w.notes || '-'}</td>
        <td>
          <button class="btn btn-danger-outline btn-sm" style="padding: 0 10px;" onclick="deleteWithdrawalById('${w.id}')" title="Hapus catatan">
            <i class="ri-delete-bin-line"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteWithdrawalById = async function(id) {
  const w = store.withdrawals.find(item => item.id === id);
  if (!w) return;

  const confirmed = await showCustomConfirm({
    title: "Hapus Catatan Tarik Uang?",
    message: `Hapus catatan penarikan <strong>${formatRp(w.amount)}</strong>${w.notes ? ` (${w.notes})` : ''}?<br><small style="color: var(--text-muted); display:inline-block; margin-top:6px;">Saldo kas akan otomatis disesuaikan kembali.</small>`,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    type: "danger",
    icon: "ri-delete-bin-line"
  });

  if (confirmed) {
    store.deleteWithdrawal(id);
    renderReportsTab();
    showToast("Catatan penarikan kas berhasil dihapus!", "info");
  }
};

// ==========================================
// FITUR: CATAT PENJUALAN MANUAL (WARUNG TUTUP)
// ==========================================
let manualSaleItems = [];

function selectManualSalePayMethod(method) {
  const hiddenInput = document.getElementById('manualSalePayMethod');
  if (hiddenInput) hiddenInput.value = method;

  const selector = document.getElementById('manualSalePayMethodSelector');
  if (selector) {
    const btnCash = selector.querySelector('.source-cash');
    const btnQris = selector.querySelector('.source-qris');
    if (btnCash && btnQris) {
      if (method === 'cash') {
        btnCash.classList.add('active');
        btnQris.classList.remove('active');
      } else {
        btnQris.classList.add('active');
        btnCash.classList.remove('active');
      }
    }
  }
}
window.selectManualSalePayMethod = selectManualSalePayMethod;

function openManualSaleModal() {
  const optionsList = document.getElementById('manualProductSelectOptions');
  const valSpan = document.getElementById('manualProductSelectValue');
  const hiddenInput = document.getElementById('manualSaleProductSelect');

  if (hiddenInput) hiddenInput.value = '';
  if (valSpan) valSpan.textContent = '-- Pilih Barang --';

  if (optionsList) {
    optionsList.innerHTML = '<li data-value="" style="color: var(--text-muted);">-- Pilih Barang --</li>' +
      store.products.map(p => `
        <li data-value="${p.id}" ${p.stock <= 0 ? 'class="disabled-option"' : ''}>
          <span><strong>${p.name}</strong> - ${formatRp(p.price)} <small style="opacity: 0.75;">(Sisa: ${p.stock})</small></span>
        </li>
      `).join('');
  }

  selectManualSalePayMethod('cash');

  manualSaleItems = [];
  renderManualSaleItemsTable();

  const dtEl = document.getElementById('manualSaleDateTime');
  if (dtEl) {
    const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    dtEl.value = localNow;
  }

  const notesEl = document.getElementById('manualSaleNotes');
  if (notesEl) notesEl.value = '';

  const qtyInput = document.getElementById('manualSaleQtyInput');
  if (qtyInput) qtyInput.value = '1';

  document.getElementById('manualSaleModal').classList.add('active');
}

function renderManualSaleItemsTable() {
  const tbody = document.getElementById('manualSaleItemsTableBody');
  const totalText = document.getElementById('manualSaleTotalText');
  const saveBtn = document.getElementById('btnSaveManualSale');
  if (!tbody) return;

  if (manualSaleItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 18px;">Belum ada barang yang dipilih.</td></tr>';
    if (totalText) totalText.textContent = 'Rp 0';
    if (saveBtn) {
      saveBtn.setAttribute('disabled', 'true');
      saveBtn.classList.add('btn-disabled');
    }
    return;
  }

  const total = manualSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
  if (totalText) totalText.textContent = formatRp(total);
  if (saveBtn) {
    saveBtn.removeAttribute('disabled');
    saveBtn.classList.remove('btn-disabled');
  }

  tbody.innerHTML = manualSaleItems.map((item, idx) => `
    <tr>
      <td><strong>${item.name}</strong><br><small class="text-muted">${formatRp(item.price)}/pcs</small></td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;"><strong>${formatRp(item.subtotal)}</strong></td>
      <td style="text-align: center;">
        <button type="button" class="btn btn-danger-outline btn-sm" onclick="removeManualSaleItem(${idx})">✕</button>
      </td>
    </tr>
  `).join('');
}

window.removeManualSaleItem = function(index) {
  manualSaleItems.splice(index, 1);
  renderManualSaleItemsTable();
};

function addProductToManualSale() {
  const selectEl = document.getElementById('manualSaleProductSelect');
  const qtyEl = document.getElementById('manualSaleQtyInput');
  const prodId = selectEl?.value;
  const qty = parseInt(qtyEl?.value || '1', 10);

  if (!prodId) {
    showToast("Silakan pilih barang terlebih dahulu!", "warning");
    return;
  }
  if (isNaN(qty) || qty <= 0) {
    showToast("Jumlah barang minimal 1!", "warning");
    return;
  }

  const prod = store.products.find(p => p.id === prodId);
  if (!prod) return;

  if (qty > prod.stock) {
    showToast(`Stok "${prod.name}" tidak mencukupi (Tersisa: ${prod.stock})`, "error");
    return;
  }

  const existing = manualSaleItems.find(i => i.productId === prodId);
  if (existing) {
    if (existing.quantity + qty > prod.stock) {
      showToast(`Total jumlah (${existing.quantity + qty}) melebihi sisa stok (${prod.stock})`, "error");
      return;
    }
    existing.quantity += qty;
    existing.subtotal = existing.quantity * existing.price;
  } else {
    manualSaleItems.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      costPrice: prod.costPrice !== undefined ? prod.costPrice : Math.round(prod.price * 0.8),
      quantity: qty,
      subtotal: prod.price * qty
    });
  }

  renderManualSaleItemsTable();
  if (selectEl) selectEl.value = '';
  const valSpan = document.getElementById('manualProductSelectValue');
  if (valSpan) valSpan.textContent = '-- Pilih Barang --';
  qtyEl.value = '1';
  showToast(`"${prod.name}" (${qty} pcs) ditambahkan ke daftar manual.`, "info");
}

function saveManualSale() {
  if (manualSaleItems.length === 0) {
    showToast("Tambahkan minimal 1 barang ke daftar penjualan manual!", "warning");
    return;
  }

  const totalPrice = manualSaleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const payMethod = document.getElementById('manualSalePayMethod')?.value || 'cash';
  const dtInput = document.getElementById('manualSaleDateTime')?.value;
  const saleDate = dtInput ? new Date(dtInput).toISOString() : new Date().toISOString();
  const notes = document.getElementById('manualSaleNotes')?.value.trim() || 'Penjualan Manual (Warung Tutup)';

  const trxId = 'TRX-M-' + Date.now().toString().slice(-6);

  const saleItems = manualSaleItems.map(item => {
    const prod = store.products.find(p => p.id === item.productId || (p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase()));
    let itemCost = 0;
    if (item.costPrice !== undefined && item.costPrice !== null && Number(item.costPrice) > 0) {
      itemCost = Number(item.costPrice);
    } else if (prod && prod.costPrice !== undefined && Number(prod.costPrice) > 0) {
      itemCost = Number(prod.costPrice);
    } else {
      itemCost = Math.round(Number(item.price || 0) * 0.8);
    }

    return {
      ...item,
      costPrice: itemCost
    };
  });

  const totalCostHpp = saleItems.reduce((sum, it) => sum + (Number(it.costPrice || 0) * Number(it.quantity || 1)), 0);
  const netProfit = totalPrice - totalCostHpp;

  const sale = {
    id: trxId,
    date: saleDate,
    cashierName: "Admin (Manual)",
    paymentMethod: payMethod,
    totalAmount: totalPrice,
    paidAmount: totalPrice,
    changeAmount: 0,
    total: totalPrice,
    paid: totalPrice,
    change: 0,
    items: saleItems,
    itemsSummary: saleItems.map(i => `${i.name} (${i.quantity}x @Rp${Number(i.price).toLocaleString('id-ID')})`).join(', ') + (notes ? ` [${notes}]` : ''),
    totalHpp: totalCostHpp,
    netProfit: netProfit
  };

  store.recordSale(sale);
  lastCompletedSale = sale;

  document.getElementById('manualSaleModal').classList.remove('active');
  renderAdminProductsTable();
  renderCashierCatalog();
  renderReportsTab();

  // Buka Pop-up Struk Transaksi Otomatis agar kasir/admin bisa langsung Cetak Struk / Kirim WhatsApp
  openReceiptModal(sale);

  showToast(`Penjualan manual senilai ${formatRp(totalPrice)} berhasil dicatat!`, "success");
}

// ==========================================
// FITUR: TARIK UANG / KAS KELUAR
// ==========================================
function selectWithdrawalSource(source) {
  const hiddenInput = document.getElementById('formWithdrawalSource');
  if (hiddenInput) hiddenInput.value = source;

  const selector = document.getElementById('withdrawalSourceSelector');
  if (selector) {
    const btnCash = selector.querySelector('.source-cash');
    const btnQris = selector.querySelector('.source-qris');

    if (btnCash && btnQris) {
      if (source === 'cash') {
        btnCash.classList.add('active');
        btnQris.classList.remove('active');
      } else {
        btnQris.classList.add('active');
        btnCash.classList.remove('active');
      }
    }
  }
}
window.selectWithdrawalSource = selectWithdrawalSource;

function checkWithdrawalFormValidity() {
  const amountInput = document.getElementById('formWithdrawalAmount');
  const notesInput = document.getElementById('formWithdrawalNotes');
  const submitBtn = document.getElementById('btnSubmitWithdrawal');
  if (!submitBtn) return;

  const amountVal = amountInput ? Number(amountInput.value.replace(/[^0-9]/g, '') || 0) : 0;
  const notesVal = notesInput ? notesInput.value.trim() : '';

  const isValid = amountVal > 0 && notesVal.length > 0;
  if (isValid) {
    submitBtn.removeAttribute('disabled');
    submitBtn.classList.remove('btn-disabled');
  } else {
    submitBtn.setAttribute('disabled', 'true');
    submitBtn.classList.add('btn-disabled');
  }
}

function openWithdrawalModal() {
  const fin = store.getFinancialSummary();

  const infoCash = document.getElementById('withdrawInfoSaldoCash');
  if (infoCash) infoCash.textContent = formatRp(fin.saldoCash);

  const infoQris = document.getElementById('withdrawInfoSaldoQris');
  if (infoQris) infoQris.textContent = formatRp(fin.saldoQris);

  document.getElementById('withdrawalForm').reset();
  selectWithdrawalSource('cash');
  checkWithdrawalFormValidity();

  const dtEl = document.getElementById('formWithdrawalDate');
  if (dtEl) {
    const localNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    dtEl.value = localNow;
  }

  document.getElementById('withdrawalModal').classList.add('active');
}

async function handleWithdrawalSubmit(e) {
  e.preventDefault();

  const amountRaw = document.getElementById('formWithdrawalAmount')?.value.replace(/[^0-9]/g, '');
  const amount = Number(amountRaw || 0);
  const source = document.getElementById('formWithdrawalSource')?.value || 'cash';
  const category = document.getElementById('formWithdrawalCategory')?.value || 'Lainnya';
  const notes = document.getElementById('formWithdrawalNotes')?.value.trim();
  const dtInput = document.getElementById('formWithdrawalDate')?.value;
  const date = dtInput ? new Date(dtInput).toISOString() : new Date().toISOString();

  if (amount <= 0) {
    showToast("Nominal penarikan uang harus lebih dari Rp 0!", "error");
    return;
  }

  if (!notes) {
    showToast("Harap isi keterangan untuk apa uang tersebut digunakan!", "warning");
    return;
  }

  const fin = store.getFinancialSummary();
  const currentSaldo = source === 'qris' ? fin.saldoQris : fin.saldoCash;

  if (amount > currentSaldo) {
    const proceed = await showCustomConfirm({
      title: "Saldo Tidak Mencukupi",
      message: `Nominal penarikan <strong>${formatRp(amount)}</strong> melebihi saldo ${source === 'qris' ? 'QRIS' : 'Tunai'} saat ini (<strong>${formatRp(currentSaldo)}</strong>). Tetap catat pengeluaran kas ini?`,
      confirmText: "Tetap Catat",
      cancelText: "Batal",
      type: "warning",
      icon: "ri-error-warning-line"
    });
    if (!proceed) return;
  }

  store.recordWithdrawal({
    amount,
    source,
    category,
    notes,
    date
  });

  document.getElementById('withdrawalModal').classList.remove('active');
  renderReportsTab();
  showToast(`Penarikan kas ${formatRp(amount)} berhasil dicatat!`, "success");
}

// ==========================================
// EVENT LISTENERS & WIRING
// ==========================================
function setupEventListeners() {
  // Switch Role
  const btnSwitchRole = document.getElementById('btnSwitchRole');
  if (btnSwitchRole) {
    btnSwitchRole.onclick = switchRole;
  }

  // Status Badge Click (Manual Cloud Refresh)
  const syncBadge = document.getElementById('syncStatusBadge');
  if (syncBadge) {
    syncBadge.addEventListener('click', () => {
      autoSyncFromCloud(true);
    });
  }

  // Mobile Cart Drawer
  const mobileCartToggle = document.getElementById('btnToggleCartMobile');
  const mobileCartClose = document.getElementById('btnCloseCartMobile');
  const cartSidebar = document.getElementById('cartSidebar');

  if (mobileCartToggle) {
    mobileCartToggle.addEventListener('click', () => cartSidebar.classList.add('open'));
  }
  if (mobileCartClose) {
    mobileCartClose.addEventListener('click', () => cartSidebar.classList.remove('open'));
  }

  // Barcode / Scanner & Keyboard Enter Support
  const cashierSearch = document.getElementById('cashierSearchInput');
  const clearBtn = document.getElementById('cashierClearSearch');
  
  cashierSearch.addEventListener('input', () => {
    clearBtn.style.display = cashierSearch.value ? 'block' : 'none';
    renderCashierCatalog();
  });
  
  clearBtn.addEventListener('click', () => {
    cashierSearch.value = '';
    clearBtn.style.display = 'none';
    renderCashierCatalog();
    cashierSearch.focus();
  });

  // Jika kasir scan barcode atau tekan Enter, otomatis tambahkan barang pertama yang cocok
  cashierSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = cashierSearch.value.toLowerCase().trim();
      if (!query) return;

      const matched = store.products.filter(p => 
        p.name.toLowerCase().includes(query) || (p.category && p.category.toLowerCase().includes(query))
      );

      if (matched.length > 0 && matched[0].stock > 0) {
        addToCart(matched[0].id);
        cashierSearch.value = '';
        clearBtn.style.display = 'none';
        renderCashierCatalog();
        showToast(`${matched[0].name} masuk keranjang!`, 'success');
      }
    }
  });

  // Kategori Filter Pills
  document.getElementById('categoryPills').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.category-pills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentCategoryFilter = pill.dataset.category;
    renderCashierCatalog();
  });

  // Clear Cart
  document.getElementById('btnClearCart').addEventListener('click', async () => {
    if (cart.length === 0) return;
    const confirmed = await showCustomConfirm({
      title: "Kosongkan Keranjang?",
      message: "Seluruh daftar barang yang dipilih kasir saat ini akan dibersihkan.",
      confirmText: "Ya, Kosongkan",
      cancelText: "Batal",
      type: "warning",
      icon: "ri-delete-bin-2-line"
    });
    if (confirmed) {
      cart = [];
      renderCart();
      showToast("Keranjang belanja telah dikosongkan.", "info");
    }
  });

  // Metode Pembayaran Kasir (Tunai vs QRIS)
  const payMethodCash = document.getElementById('payMethodCash');
  const payMethodQris = document.getElementById('payMethodQris');
  const paymentCashBox = document.getElementById('paymentCashBox');
  const qrisNoticeBox = document.getElementById('qrisNoticeBox');

  if (payMethodCash && payMethodQris) {
    payMethodCash.addEventListener('click', () => {
      activePaymentMethod = 'cash';
      payMethodCash.classList.add('active');
      payMethodQris.classList.remove('active');
      if (paymentCashBox) paymentCashBox.style.display = 'block';
      if (qrisNoticeBox) qrisNoticeBox.style.display = 'none';
      calculateChange();
    });

    payMethodQris.addEventListener('click', () => {
      activePaymentMethod = 'qris';
      payMethodQris.classList.add('active');
      payMethodCash.classList.remove('active');
      if (paymentCashBox) paymentCashBox.style.display = 'none';
      if (qrisNoticeBox) qrisNoticeBox.style.display = 'block';
      calculateChange();
    });
  }

  // Pill Selector Sumber Kas Tarik Uang
  const withdrawSelector = document.getElementById('withdrawalSourceSelector');
  if (withdrawSelector) {
    withdrawSelector.querySelectorAll('.btn-source-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const src = btn.getAttribute('data-source') || (btn.classList.contains('source-qris') ? 'qris' : 'cash');
        selectWithdrawalSource(src);
      });
    });
  }

  // Pill Selector Metode Bayar Penjualan Manual
  const manualPaySelector = document.getElementById('manualSalePayMethodSelector');
  if (manualPaySelector) {
    manualPaySelector.querySelectorAll('.btn-source-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const mth = btn.getAttribute('data-method') || (btn.classList.contains('source-qris') ? 'qris' : 'cash');
        selectManualSalePayMethod(mth);
      });
    });
  }

  // Input Uang Bayar Kasir dengan Pemisah Ribuan (Titik) Otomatis
  const inputCashEl = document.getElementById('inputCashPaid');
  if (inputCashEl) {
    inputCashEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw) {
        const num = parseInt(raw, 10);
        e.target.value = num.toLocaleString('id-ID');
      } else {
        e.target.value = '';
      }
      calculateChange();
    });
  }

  // Input Harga Modal Produk Admin dengan Pemisah Ribuan (Titik) & Margin Realtime
  const formCostPriceEl = document.getElementById('formProductCostPrice');
  if (formCostPriceEl) {
    formCostPriceEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw) {
        const num = parseInt(raw, 10);
        e.target.value = num.toLocaleString('id-ID');
      } else {
        e.target.value = '';
      }
      updateProductMarginPreview();
    });
  }

  // Input Harga Jual Produk Admin dengan Pemisah Ribuan (Titik) & Margin Realtime
  const formPriceEl = document.getElementById('formProductPrice');
  if (formPriceEl) {
    formPriceEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw) {
        const num = parseInt(raw, 10);
        e.target.value = num.toLocaleString('id-ID');
      } else {
        e.target.value = '';
      }
      updateProductMarginPreview();
    });
  }

  // Input Nominal Tarik Uang dengan Pemisah Ribuan (Titik)
  const formWithdrawalAmountEl = document.getElementById('formWithdrawalAmount');
  if (formWithdrawalAmountEl) {
    formWithdrawalAmountEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      if (raw) {
        const num = parseInt(raw, 10);
        e.target.value = num.toLocaleString('id-ID');
      } else {
        e.target.value = '';
      }
      checkWithdrawalFormValidity();
    });
  }

  // Input Keterangan Tarik Uang
  const formWithdrawalNotesEl = document.getElementById('formWithdrawalNotes');
  if (formWithdrawalNotesEl) {
    formWithdrawalNotesEl.addEventListener('input', checkWithdrawalFormValidity);
  }

  // Tombol Cepat Nominal Berformat Ribuan (Titik)
  document.querySelectorAll('.btn-quick-cash').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input = document.getElementById('inputCashPaid');
      const totalPrice = cart.reduce((sum, i) => sum + i.subtotal, 0);

      let val = 0;
      if (amount === 'pas') {
        val = totalPrice;
      } else {
        val = parseInt(amount, 10);
      }
      input.value = val > 0 ? val.toLocaleString('id-ID') : (val === 0 ? '0' : '');
      calculateChange();
    });
  });

  // Checkout Button
  document.getElementById('btnCheckout').addEventListener('click', processCheckout);

  // Admin Tab Navigation
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Admin Product Search dengan Clear Button & Auto Scroll ke Atas saat Keyboard Terbuka di HP
  const adminSearchInput = document.getElementById('adminProductSearch');
  const adminClearBtn = document.getElementById('adminClearSearch');
  const adminSearchWrapper = document.getElementById('adminSearchWrapper');

  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', () => {
      if (adminClearBtn) {
        adminClearBtn.style.display = adminSearchInput.value ? 'block' : 'none';
      }
      renderAdminProductsTable();
    });

    if (adminClearBtn) {
      adminClearBtn.addEventListener('click', () => {
        adminSearchInput.value = '';
        adminClearBtn.style.display = 'none';
        renderAdminProductsTable();
        adminSearchInput.focus();
      });
    }

    // Auto-scroll ke posisi pencarian saat keyboard HP muncul agar tabel produk langsung terlihat
    adminSearchInput.addEventListener('focus', () => {
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          adminSearchWrapper?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 280);
      }
    });
  }

  // Clear All Products Button (Kosongkan Semua Produk agar siap diisi baru)
  const btnClearProducts = document.getElementById('btnClearAllProducts');
  if (btnClearProducts) {
    btnClearProducts.addEventListener('click', async () => {
      if (store.products.length === 0) {
        showToast("Katalog produk sudah kosong (0 barang).", "info");
        return;
      }

      const confirmed = await showCustomConfirm({
        title: "Kosongkan Semua Produk?",
        message: `Apakah Anda yakin ingin menghapus <strong>semua (${store.products.length}) produk</strong>?<br><small style="color: var(--danger); display: inline-block; margin-top: 6px;">Katalog akan di-reset menjadi 0 barang agar Anda dapat memasukkan foto dan data produk asli dari awal.</small>`,
        confirmText: "Ya, Kosongkan Semua",
        cancelText: "Batal",
        type: "danger",
        icon: "ri-delete-bin-line"
      });

      if (confirmed) {
        store.clearAllProducts();
        renderAdminProductsTable();
        renderCashierCatalog();
        showToast("Semua produk berhasil dikosongkan (0 barang)! Silakan tambahkan barang baru.", "success");
      }
    });
  }

  // Add Product Modal
  document.getElementById('btnOpenAddProductModal').addEventListener('click', openAddProductModal);
  document.getElementById('btnCloseProductModal').addEventListener('click', () => {
    document.getElementById('productFormModal').classList.remove('active');
  });
  document.getElementById('btnCancelProductModal').addEventListener('click', () => {
    document.getElementById('productFormModal').classList.remove('active');
  });

  // Photo Upload Trigger & Reader (Auto Compress to Max 300px Base64)
  const fileInput = document.getElementById('formProductFileInput');
  document.getElementById('btnTriggerPhotoUpload').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSide = 350;

        if (width > height && width > maxSide) {
          height = Math.round((height * maxSide) / width);
          width = maxSide;
        } else if (height > maxSide) {
          width = Math.round((width * maxSide) / height);
          height = maxSide;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL('image/jpeg', 0.8);
        document.getElementById('formProductImageUrl').value = base64Data;
        document.getElementById('productPhotoPreview').innerHTML = `<img src="${base64Data}">`;
        showToast("Foto produk berhasil dipilih!", "info");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Form Simpan Produk
  document.getElementById('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('formProductId').value || ('prod_' + Date.now());
    const name = document.getElementById('formProductName').value.trim();
    const category = document.getElementById('formProductCategory').value;
    const rawPrice = document.getElementById('formProductPrice').value.replace(/[^0-9]/g, '');
    const price = Number(rawPrice || 0);
    const rawCost = document.getElementById('formProductCostPrice').value.replace(/[^0-9]/g, '');
    const costPrice = (rawCost && Number(rawCost) > 0) ? Number(rawCost) : Math.round(price * 0.8);
    const stock = Number(document.getElementById('formProductStock').value);
    const imageUrl = document.getElementById('formProductImageUrl').value.trim();

    const fallbackIcons = {
      Makanan: '<i class="ri-restaurant-2-line"></i>',
      Minuman: '<i class="ri-cup-line"></i>',
      Snack: '<i class="ri-cake-3-line"></i>',
      Lainnya: '<i class="ri-archive-line"></i>'
    };

    const isEdit = document.getElementById('formProductId').value !== '';

    if (isEdit) {
      store.updateProduct(id, { name, category, costPrice, price, stock, imageUrl });
      showToast("Data barang berhasil diperbarui!", "success");
    } else {
      store.addProduct({
        id,
        name,
        category,
        costPrice,
        price,
        stock,
        imageUrl,
        fallbackIcon: fallbackIcons[category] || '📦'
      });
      showToast("Barang baru berhasil ditambahkan!", "success");
    }

    document.getElementById('productFormModal').classList.remove('active');
    renderAdminProductsTable();
    renderCashierCatalog();
  });

  // Tombol Modal Penjualan Manual (Warung Tutup)
  document.getElementById('btnOpenManualSaleModal')?.addEventListener('click', openManualSaleModal);
  document.getElementById('btnReportManualSale')?.addEventListener('click', openManualSaleModal);
  document.getElementById('btnCloseManualSaleModal')?.addEventListener('click', () => {
    document.getElementById('manualSaleModal')?.classList.remove('active');
  });
  document.getElementById('btnCancelManualSaleModal')?.addEventListener('click', () => {
    document.getElementById('manualSaleModal')?.classList.remove('active');
  });
  document.getElementById('btnManualAddProductToList')?.addEventListener('click', addProductToManualSale);
  document.getElementById('btnSaveManualSale')?.addEventListener('click', saveManualSale);

  // Tombol Modal Tarik Uang / Kas Keluar
  document.getElementById('btnOpenWithdrawalModal')?.addEventListener('click', openWithdrawalModal);
  document.getElementById('btnReportWithdrawal')?.addEventListener('click', openWithdrawalModal);
  document.getElementById('btnAddNewWithdrawal')?.addEventListener('click', openWithdrawalModal);
  document.getElementById('btnCloseWithdrawalModal')?.addEventListener('click', () => {
    document.getElementById('withdrawalModal')?.classList.remove('active');
  });
  document.getElementById('btnCancelWithdrawalModal')?.addEventListener('click', () => {
    document.getElementById('withdrawalModal')?.classList.remove('active');
  });
  document.getElementById('withdrawalForm')?.addEventListener('submit', handleWithdrawalSubmit);

  // Restock Modal Buttons
  document.getElementById('btnCloseRestockModal').addEventListener('click', () => {
    document.getElementById('quickRestockModal').classList.remove('active');
  });
  document.getElementById('btnCancelRestockModal').addEventListener('click', () => {
    document.getElementById('quickRestockModal').classList.remove('active');
  });

  document.getElementById('btnConfirmAddStock').addEventListener('click', () => {
    const qty = Number(document.getElementById('inputAddStockQty').value || 0);
    if (activeRestockProductId && qty > 0) {
      const prod = store.products.find(p => p.id === activeRestockProductId);
      if (prod) {
        store.updateStock(activeRestockProductId, prod.stock + qty);
        showToast(`Stok ${prod.name} berhasil ditambah +${qty}!`, "success");
        document.getElementById('quickRestockModal').classList.remove('active');
        renderRestockTab();
        renderAdminProductsTable();
        renderCashierCatalog();
      }
    }
  });

  // WhatsApp Rekap Harian
  
  // Excel Export Listeners
  document.getElementById('btnExportSalesExcel')?.addEventListener('click', exportSalesToExcel);
  document.getElementById('btnExportProductsExcel')?.addEventListener('click', exportProductsToExcel);
  document.getElementById('btnExportAllExcel')?.addEventListener('click', () => {
    exportSalesToExcel();
    setTimeout(exportProductsToExcel, 600);
  });
  
  document.getElementById('btnShareReportWhatsApp')?.addEventListener('click', () => {
    const totalRev = store.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTrx = store.sales.length;
    let msg = `*REKAP PENJUALAN ALKAMART*%0A`;
    msg += `Tanggal: ${new Date().toLocaleDateString('id-ID')}%0A`;
    msg += `Total Transaksi: ${totalTrx}%0A`;
    msg += `*Total Omzet: ${formatRp(totalRev)}*%0A%0A`;
    msg += `_Laporan otomatis dari Sistem Kasir Web Alkamart_`;

    window.open(`https://wa.me/?text=${msg}`, '_blank');
  });

  // Receipt Modal Buttons
  document.getElementById('btnCloseReceiptModal').addEventListener('click', () => {
    document.getElementById('receiptModal').classList.remove('active');
  });
  document.getElementById('btnPrintReceipt').addEventListener('click', () => {
    window.print();
  });
  document.getElementById('btnShareReceiptWA').addEventListener('click', () => {
    shareReceiptToWhatsApp(lastCompletedSale);
  });

  // Google Sheets Settings
  const gsheetInput = document.getElementById('inputGoogleAppsScriptUrl');
  if (gsheetInput) {
    gsheetInput.value = store.googleSheetsUrl;

    document.getElementById('btnSaveGoogleSheetsUrl').addEventListener('click', () => {
      store.setGoogleSheetsUrl(gsheetInput.value);
      checkSyncStatus();
      showToast("URL Google Sheets berhasil disimpan!", "success");
    });

    document.getElementById('btnSyncToGoogleSheets').addEventListener('click', async () => {
      try {
        showToast("Sedang mengirim data ke Google Sheets...", "info");
        await store.syncAllToGoogleSheets();
        showToast("Berhasil disinkronkan ke Google Sheets!", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });

    document.getElementById('btnFetchFromGoogleSheets').addEventListener('click', async () => {
      try {
        showToast("Sedang menarik data dari Google Sheets...", "info");
        await store.fetchAllFromGoogleSheets();
        renderAdminView();
        renderCashierCatalog();
        showToast("Data terbaru dari Google Sheets berhasil dimuat!", "success");
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  // Backup & Restore
  document.getElementById('btnExportDataJSON').addEventListener('click', () => store.exportBackupJSON());

  const fileInputImport = document.getElementById('fileInputImportJSON');
  document.getElementById('btnImportDataJSON').addEventListener('click', () => fileInputImport.click());
  fileInputImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        store.importBackupJSON(event.target.result);
        renderAdminView();
        renderCashierCatalog();
        showToast("Data cadangan berhasil dipulihkan!", "success");
      } catch (err) {
        showToast("Format file cadangan tidak valid!", "error");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btnResetToDefault').addEventListener('click', async () => {
    const confirmed = await showCustomConfirm({
      title: "Reset Seluruh Data Warung?",
      message: "Seluruh data produk dan transaksi akan dikembalikan ke kondisi awal Alkamart. <strong>Tindakan ini tidak dapat dibatalkan!</strong>",
      confirmText: "Ya, Reset Total",
      cancelText: "Batal",
      type: "danger",
      icon: "ri-refresh-line"
    });
    if (confirmed) {
      store.resetToDefault();
      renderAdminView();
      renderCashierCatalog();
      showToast("Data berhasil direset ke kondisi awal!", "info");
    }
  });

  // Custom Select Dropdown Logic is moved to its own block below
}

// Global function to update custom select UI
window.updateCustomSelectUI = function(val) {
  const triggerSpan = document.querySelector('.custom-select-value');
  if (!triggerSpan) return;
  const options = {
    Makanan: '<i class="ri-restaurant-2-line"></i> Makanan',
    Minuman: '<i class="ri-cup-line"></i> Minuman',
    Snack: '<i class="ri-cake-3-line"></i> Snack',
    Lainnya: '<i class="ri-archive-line"></i> Lainnya'
  };
  triggerSpan.innerHTML = options[val] || options['Makanan'];
};

// Initialize Custom Select robustly
document.addEventListener('DOMContentLoaded', () => {
  const categorySelectWrapper = document.querySelector('.custom-select-wrapper');
  const categorySelectTrigger = document.getElementById('categorySelectTrigger');
  const categorySelectOptions = document.getElementById('categorySelectOptions');
  const hiddenCategoryInput = document.getElementById('formProductCategory');

  if (categorySelectTrigger && categorySelectOptions) {
    categorySelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      categorySelectWrapper.classList.toggle('open');
    });

    categorySelectOptions.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (li) {
        const val = li.getAttribute('data-value');
        hiddenCategoryInput.value = val;
        updateCustomSelectUI(val);
        categorySelectWrapper.classList.remove('open');
      }
    });

    document.addEventListener('click', (e) => {
      if (categorySelectWrapper && !categorySelectWrapper.contains(e.target)) {
        categorySelectWrapper.classList.remove('open');
      }
    });
  }

  // Custom Select untuk Barang Penjualan Manual
  const manualWrapper = document.getElementById('manualProductSelectWrapper');
  const manualTrigger = document.getElementById('manualProductSelectTrigger');
  const manualOptions = document.getElementById('manualProductSelectOptions');
  const manualHidden = document.getElementById('manualSaleProductSelect');
  const manualVal = document.getElementById('manualProductSelectValue');

  if (manualTrigger && manualOptions) {
    manualTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      manualWrapper.classList.toggle('open');
    });

    manualOptions.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (!li || li.classList.contains('disabled-option')) return;
      const val = li.getAttribute('data-value') || '';
      if (manualHidden) manualHidden.value = val;
      if (manualVal) manualVal.innerHTML = li.innerHTML;
      if (manualWrapper) manualWrapper.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
      if (manualWrapper && !manualWrapper.contains(e.target)) {
        manualWrapper.classList.remove('open');
      }
    });
  }
});
