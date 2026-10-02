# 📑 Software Requirements Specification (SRS)
## Proyek: Alkamart Web Application

---

### 1. Pendahuluan
#### 1.1 Tujuan Dokumen
Dokumen ini merinci kebutuhan fungsional, non-fungsional, arsitektur data, dan antarmuka untuk pengembangan sistem kasir dan manajemen warung **Alkamart Web**.

#### 1.2 Cakupan Sistem
Sistem ini mencakup aplikasi web sisi klien (Single Page Web Application) yang mengintegrasikan fungsi Point of Sale (POS), manajemen inventaris produk, peringatan restok, pencatatan transaksi, dan analitik pendapatan.

---

### 2. Deskripsi Keseluruhan
#### 2.1 Perspektif Produk
Alkamart Web dirancang sebagai alternatif ringan dan universal dari aplikasi mobile Flutter Alkamart yang sudah ada, mempertahankan skema warna (Hijau Alkamart #2E7D32 dan Putih), tata letak ramah pengguna, dan logika bisnis inti.

#### 2.2 Karakteristik Pengguna
* **User Level 1 - Kasir**: Memiliki hak akses transaksi penjualan, input kuantitas barang, checkout, dan cetak struk.
* **User Level 2 - Admin**: Memiliki hak penuh untuk mengelola master barang, melakukan restok, melihat seluruh riwayat transaksi, dan laporan pendapatan.

---

### 3. Kebutuhan Fungsional (Functional Requirements)

* **FR-01 (Role Switching & Auth)**: Sistem harus menyediakan mekanisme login/pemilihan peran antara Admin dan Kasir dengan kredensial bawaan maupun kustom.
* **FR-02 (Katalog Produk)**: Sistem harus menampilkan daftar barang dalam bentuk kartu interaktif berisi gambar, nama barang, harga (Rp), dan status stok.
* **FR-03 (Pencarian Produk)**: Pengguna dapat mencari barang secara instan berdasarkan nama produk tanpa perlu reload halaman.
* **FR-04 (Keranjang Belanja)**: Kasir dapat menambahkan barang ke keranjang, mengubah kuantitas (+ / -), atau membatalkan item dari keranjang.
* **FR-05 (Validasi Stok Keranjang)**: Jumlah item di keranjang tidak boleh melebihi stok yang tersedia di toko.
* **FR-06 (Kalkulasi Pembayaran)**: Sistem secara otomatis menghitung total harga, menerima input nominal bayar tunai, dan menghitung uang kembalian.
* **FR-07 (Proses Checkout)**: Sistem harus memotong stok barang secara otomatis saat checkout dan menerbitkan ID transaksi unik.
* **FR-08 (Cetak Struk)**: Sistem menyediakan tampilan dialog struk nota yang diformat khusus untuk printer thermal (58mm/80mm) atau print browser standard.
* **FR-09 (Manajemen Produk - Create)**: Admin dapat menambahkan produk baru dengan form: Nama, Kategori, Harga, Stok Awal, dan Foto.
* **FR-10 (Upload Foto Produk)**: Sistem mendukung upload gambar dari file/kamera lokal (dikonversi ke Base64 berukuran optimal) atau link URL eksternal.
* **FR-11 (Manajemen Produk - Update & Delete)**: Admin dapat memperbarui detail barang atau menghapus barang dari katalog.
* **FR-12 (Restok Cepat)**: Sistem menyaring barang yang memiliki stok <= 5 dan menyediakan tombol dialog tambah stok instan.
* **FR-13 (Rekap Pendapatan)**: Sistem menghitung total pendapatan secara dinamis dari tabel transaksi dan menyajikan rekapitulasi per bulan.
* **FR-14 (Sinkronisasi Multi-Perangkat)**: Sistem mendukung penyimpanan cloud (Firebase Firestore) dan fallback penyimpanan lokal (LocalStorage).

---

### 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **NFR-01 (Kinerja & Kecepatan)**: Waktu pemuatan awal website di bawah 2 detik pada jaringan 4G mobile.
* **NFR-02 (Responsivitas)**: Antarmuka harus menyesuaikan diri secara sempurna pada layar smartphone (360px - 480px), tablet (768px), maupun layar desktop/laptop kasir (> 1024px).
* **NFR-03 (Kompatibilitas)**: Berjalan lancar di semua browser modern: Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge.
* **NFR-04 (Portabilitas)**: Berkas kode murni berupa HTML, CSS, dan JS statis sehingga dapat langsung di-deploy di GitHub Pages, Vercel, maupun Netlify tanpa konfigurasi server khusus.
