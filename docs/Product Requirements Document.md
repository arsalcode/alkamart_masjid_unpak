# 📋 Product Requirements Document (PRD)
## Proyek: Alkamart Web (Point of Sale & Warung Management System)

---

### 1. Ringkasan Eksekutif
* **Nama Produk**: Alkamart Web Application
* **Versi**: 1.0.0
* **Status**: Siap Implementasi
* **Platform**: Web (Desktop, Tablet, Mobile Android & iOS)
* **Karakteristik Utama**: Ringan, responsif, tanpa perlu install APK, dapat dibagikan tautannya lewat WhatsApp, dan siap di-deploy gratis di GitHub Pages / Vercel.

---

### 2. Latar Belakang & Masalah
* **Kendala Distribusi APK**: Mengirimkan file APK (~30-40 MB) lewat WhatsApp sering terkendala kuota, peringatan keamanan Play Protect, serta keterbatasan tidak bisa dijalankan di perangkat iOS (iPhone) atau laptop kasir tanpa emulator.
* **Kebutuhan Multi-Kasir**: Warung Alkamart membutuhkan sistem di mana beberapa kasir di handphone berbeda dapat bertransaksi bersamaan, dan data stok serta rekapitulasi penjualan otomatis terpusat ke handphone pemilik (Admin).
* **Solusi**: Membangun aplikasi berbasis web (HTML5, CSS3, JavaScript) dengan antarmuka kasir modern yang dapat langsung diakses cukup dengan membuka link browser.

---

### 3. Visi & Tujuan Produk
1. **Zero-Installation**: Kasir dan admin cukup membuka tautan web tanpa perlu instalasi aplikasi manual.
2. **Multi-Device & Real-time**: Mendukung penggunaan bersamaan di banyak HP dengan data yang saling tersinkronisasi.
3. **Penyimpanan Gambar Fleksibel**: Mendukung foto produk bawaan lokal, upload langsung dari kamera/galeri HP (auto-compress), maupun link URL.
4. **Gratis Biaya Operasional**: Didesain agar dapat di-hosting 100% gratis melalui GitHub Pages atau Vercel.

---

### 4. Persona Pengguna
* **Kasir (Karyawan Warung)**:
  - Menginginkan tampilan kasir yang cepat, tombol sentuh besar, dan proses checkout yang tidak berbelit-belit.
  - Membutuhkan fitur keranjang belanja, kalkulasi otomatis uang kembalian, dan cetak/bagikan nota struk.
* **Admin (Pemilik Warung)**:
  - Mengontrol ketersediaan barang dan menerima peringatan jika stok menipis (restok).
  - Menambah produk baru lengkap dengan foto dari HP, memperbarui harga jual, dan menghapus barang yang tidak lagi dijual.
  - Memantau omzet penjualan harian, bulanan, dan total keuntungan warung secara real-time.

---

### 5. Ruang Lingkup Fitur (Features & Scope)
| Modul | Fitur Utama | Keterangan |
| :--- | :--- | :--- |
| **Autentikasi** | Switch Role / Login Kasir & Admin | Akses cepat ke dashboard sesuai kewenangan |
| **POS Kasir** | Grid Produk & Pencarian Cepat | Filter berdasarkan nama atau kategori barang |
| **POS Kasir** | Keranjang Belanja & Kuantitas (+/-) | Hitung subtotal dan total belanja instan |
| **POS Kasir** | Checkout & Pengurangan Stok | Otomatis memotong stok barang saat transaksi berhasil |
| **POS Kasir** | Cetak Struk / Nota Transaksi | Format struk rapi siap cetak ke printer kasir / thermal |
| **Manajemen Barang** | Tambah Barang Baru + Foto | Upload foto dari galeri/kamera atau paste URL |
| **Manajemen Barang** | Edit & Hapus Produk | Perubahan nama, harga, dan kuantitas stok |
| **Restok & Alert** | Peringatan Stok Rendah (<= 5) | Badge notifikasi dan tombol tambah stok instan |
| **Laporan Omzet** | Rekap Pendapatan & Grafik | Ringkasan harian, bulanan, dan histori transaksi lengkap |
| **Sinkronisasi** | Cloud Database Sync | Dukungan Firebase Firestore / LocalStorage cadangan |

---

### 6. Kriteria Penerimaan (Acceptance Criteria)
* Aplikasi dapat dibuka dengan mulus di Google Chrome / Safari baik di HP layar sentuh maupun laptop.
* Transaksi yang dilakukan kasir langsung mengurangi stok barang yang terlihat oleh kasir lain dan admin.
* Halaman admin menampilkan kalkulasi total pendapatan yang akurat berdasarkan transaksi riil.
* Link website dapat dibagikan melalui WhatsApp dan langsung bisa diakses tanpa error 404.
