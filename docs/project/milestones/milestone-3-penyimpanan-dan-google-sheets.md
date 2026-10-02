# 🎯 Milestone 3: Integrasi Data LocalStorage & Google Sheets
**Target Waktu**: Minggu 3
**Status**: Selesai (Completed ✅)

---

### Tujuan:
Menghubungkan aplikasi web ke penyimpanan data lokal yang tangguh dan endpoint Google Sheets via Google Apps Script.

---

### Rincian Tugas & Deliverables:
- [x] **LocalStorage Persistence Engine (`store.js`)**:
  - Menyimpan daftar barang, sisa stok, dan riwayat transaksi secara lokal di browser HP/laptop.
  - Data tetap utuh dan tidak hilang saat halaman di-refresh atau browser ditutup.
- [x] **Adapter Google Sheets API (CORS-Safe)**:
  - Menyediakan file `google_apps_script.js` siap pakai untuk dipasang pada Google Spreadsheet pemilik warung.
  - Pengiriman data via POST format `text/plain` untuk mencegah error CORS Preflight.
  - Sinkronisasi data 2 arah (Kirim data ke Google Sheets & Tarik data dari Google Sheets).
- [x] **Cadangan Data Mandiri (JSON)**:
  - Fitur Ekspor Cadangan Data (Unduh file `.json`).
  - Fitur Impor Cadangan Data (Pulihkan data dari file `.json`).
  - Fitur Reset ke Data Awal Toko.
