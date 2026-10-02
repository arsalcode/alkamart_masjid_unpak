/**
 * Data Master Bawaan Toko Alkamart (Default Warung Catalog)
 */
const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "Mie Instan Goreng",
    category: "Makanan",
    price: 3500,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-restaurant-2-line'></i>"
  },
  {
    id: "prod_2",
    name: "Air Mineral 600ml",
    category: "Minuman",
    price: 5000,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cup-line'></i>"
  },
  {
    id: "prod_3",
    name: "Teh Botol Melati 350ml",
    category: "Minuman",
    price: 6000,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cup-line'></i>"
  },
  {
    id: "prod_4",
    name: "Roti Tawar Gandum",
    category: "Makanan",
    price: 15000,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cake-3-line'></i>"
  },
  {
    id: "prod_5",
    name: "Keripik Kentang Original",
    category: "Snack",
    price: 9500,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cake-3-line'></i>"
  },
  {
    id: "prod_6",
    name: "Cokelat Batang Manis",
    category: "Snack",
    price: 12000,
    stock: 4,
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cake-3-line'></i>"
  },
  {
    id: "prod_7",
    name: "Kopi Hitam Bubuk 150g",
    category: "Minuman",
    price: 8500,
    stock: 3,
    imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-cup-line'></i>"
  },
  {
    id: "prod_8",
    name: "Beras Premium 5kg",
    category: "Makanan",
    price: 72000,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-archive-line'></i>"
  },
  {
    id: "prod_9",
    name: "Minyak Goreng Pouch 1L",
    category: "Makanan",
    price: 17000,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-archive-line'></i>"
  },
  {
    id: "prod_10",
    name: "Telur Ayam 1kg",
    category: "Makanan",
    price: 28000,
    stock: 5,
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=80",
    fallbackIcon: "<i class='ri-archive-line'></i>"
  }
];

const DEFAULT_SALES = [
  {
    id: "TRX-1001",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    cashierName: "Kasir 1",
    totalAmount: 23500,
    paidAmount: 50000,
    changeAmount: 26500,
    items: [
      { productId: "prod_1", name: "Mie Instan Goreng", price: 3500, quantity: 1, subtotal: 3500 },
      { productId: "prod_2", name: "Air Mineral 600ml", price: 5000, quantity: 1, subtotal: 5000 },
      { productId: "prod_4", name: "Roti Tawar Gandum", price: 15000, quantity: 1, subtotal: 15000 }
    ],
    itemsSummary: "Mie Instan Goreng (1), Air Mineral 600ml (1), Roti Tawar Gandum (1)"
  }
];
