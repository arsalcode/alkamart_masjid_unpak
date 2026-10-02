# 🛠️ System Design & Specification (SDS)
## Proyek: Alkamart Web Architecture & Technical Design

---

### 1. Arsitektur Sistem

Alkamart Web dirancang dengan pola **Modular Client-Side Architecture (SPA)** dengan opsi integrasi Cloud BaaS (Backend-as-a-Service):

```
+--------------------------------------------------------------+
|                    Browser Klien (HP / Laptop)               |
|                                                              |
|   +------------------------------------------------------+   |
|   |                   UI Presentation                    |   |
|   |     (HTML5 + Vanilla CSS3 + Font Poppins + SVG)       |   |
|   +------------------------------------------------------+   |
|                              |                               |
|   +------------------------------------------------------+   |
|   |                   State & Controller                 |   |
|   |         - AuthController    - ProductController      |   |
|   |         - CartController    - SalesController        |   |
|   +------------------------------------------------------+   |
|                              |                               |
|   +------------------------------------------------------+   |
|   |                   Data Access Layer                  |   |
|   |        (Local Storage Manager / Cloud Sync Hook)     |   |
|   +------------------------------------------------------+   |
+--------------------------------------------------------------+
                               |
              [Opsional: Sinkronisasi Multi-HP]
                               v
               +-------------------------------+
               |   Firebase Firestore / Cloud  |
               |     (Real-time Database)      |
               +-------------------------------+
```

---

### 2. Struktur Direktori Proyek
```
web_alkamart/
├── plans/
│   ├── roadmap_and_milestones.md
│   └── testing_plan.md
├── project/
│   ├── index.html              # Entry point utama aplikasi
│   ├── css/
│   │   ├── style.css           # Styling utama, responsif, & tema Alkamart
│   │   └── print.css           # Styling khusus cetak struk thermal
│   ├── js/
│   │   ├── data.js             # Data master default awal (mockup warung)
│   │   ├── store.js            # Manajemen state lokal & cloud sync
│   │   └── app.js              # Logika UI, event listener, dan interaksi
│   └── assets/
│       ├── icons/              # Ikon kategori dan logo SVG
│       └── images/             # Gambar aset produk
├── Product Requirements Document.md
├── Software Requirements Specification.md
└── System Design & Specification.md
```

---

### 3. Model Data & Skema Entitas

#### 3.1 Produk (`Product`)
```json
{
  "id": "prod_1",
  "name": "Mie Instan Goreng",
  "category": "Makanan",
  "description": "Mie instan lezat siap saji",
  "price": 3000,
  "stock": 50,
  "imageUrl": "assets/images/mie_instan.jpg",
  "createdAt": "2026-10-01T08:00:00Z"
}
```

#### 3.2 Item Keranjang (`CartItem`)
```json
{
  "productId": "prod_1",
  "name": "Mie Instan Goreng",
  "price": 3000,
  "quantity": 2,
  "subtotal": 6000
}
```

#### 3.3 Transaksi Penjualan (`Sale`)
```json
{
  "id": "TRX-1727800000000",
  "cashierName": "Kasir 1",
  "date": "2026-10-01T10:30:00Z",
  "items": [
    {
      "productId": "prod_1",
      "name": "Mie Instan Goreng",
      "price": 3000,
      "quantity": 2,
      "subtotal": 6000
    }
  ],
  "totalAmount": 6000,
  "paidAmount": 10000,
  "changeAmount": 4000
}
```

---

### 4. Desain Antarmuka & Skema Warna
* **Warna Utama (Primary Green)**: `#2E7D32`
* **Warna Aksen (Bright Green)**: `#4CAF50`
* **Background Utama**: `#F8FAF8`
* **Warna Kartu/Elemen**: `#FFFFFF`
* **Teks Utama**: `#1F2937`
* **Status Stok Rendah**: `#E53935` (Merah Peringatan) & `#FB8C00` (Oranye)
* **Tipografi**: Poppins & Inter (Google Fonts)

---

### 5. Strategi Deployment & Distribusi Tautan
1. **GitHub Pages (Rekomendasi)**:
   - Buat repositori baru di GitHub (misal: `alkamart-pos`).
   - Push seluruh isi folder `web_alkamart` (atau folder `project`).
   - Masuk ke menu **Settings > Pages > Deploy from branch (main)**.
   - Dapatkan tautan gratis: `https://username.github.io/alkamart-pos/`.
2. **Vercel**:
   - Hubungkan akun GitHub dengan Vercel.
   - Klik **Import Project**, deploy dalam 15 detik.
   - Tautan instan: `https://alkamart-pos.vercel.app`.
