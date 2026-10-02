# 🏪 Alkamart Web - Sistem Kasir & Manajemen Warung

Aplikasi kasir (Point of Sale) dan manajemen warung berbasis web modern menggunakan **HTML5, CSS3, dan JavaScript murni**.

---

## 🌟 Keunggulan Utama
1. **Zero-Installation**: Cukup bagikan link website lewat WhatsApp, kasir langsung bisa transaksi tanpa perlu install APK.
2. **100% Bebas Kuota Berbayar**: Tidak menggunakan Firebase Spark yang memiliki limit ketat. Menggunakan arsitektur **LocalStorage + Google Sheets**.
3. **Google Sheets Sync**: Pemilik warung dapat melihat rekap penjualan dan stok barang langsung dari aplikasi Google Sheets di HP!
4. **Cetak Struk Thermal & WhatsApp**: Siap cetak ke printer kasir Bluetooth/USB (58mm/80mm) atau kirim nota digital ke WhatsApp pembeli.
5. **Upload Foto dari HP**: Admin bisa mengambil foto barang dari kamera atau galeri HP (otomatis dikompres sehingga cepat dan hemat memori).

---

## 🚀 Cara Menjalankan di Komputer / Laptop
Cukup buka file `index.html` langsung dengan browser (klik 2x pada `index.html` atau klik kanan > *Open with Google Chrome*).

---

## 🌐 Cara Deploy Gratis ke GitHub Pages (Dapat Link Portofolio Gratis)
1. Buat repositori baru di akun GitHub Anda (misal: `alkamart-pos`).
2. Upload seluruh isi folder `project/` ke repositori tersebut.
3. Masuk ke tab **Settings** di GitHub > pilih menu **Pages** di sebelah kiri.
4. Pada bagian **Build and deployment > Branch**, pilih **main** dan folder **/(root)**, lalu klik **Save**.
5. Tunggu sekitar 1 menit, Anda akan mendapatkan link gratis:
   ```text
   https://username.github.io/alkamart-pos/
   ```
6. Bagikan link tersebut ke kasir atau teman via WhatsApp!

---

## 📊 Cara Menghubungkan ke Google Sheets Pribadi
1. Buka Google Sheets baru di browser, beri nama "Database Alkamart".
2. Klik menu **Extensions** (Ekstensi) > **Apps Script**.
3. Salin seluruh kode dari file `google_apps_script.js` dan paste di editor Apps Script.
4. Klik tombol **Deploy** > **New deployment** > pilih jenis **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Salin Web App URL (akhiran `/exec`).
6. Buka web Alkamart > Mode Admin > tab **Pengaturan & Cloud Sync** > paste URL tersebut lalu klik **Simpan Pengaturan**.
