/**
 * Data Master Bawaan Toko Alkamart (Default Warung Catalog)
 */
const DEFAULT_PRODUCTS = [];

const DEFAULT_SALES = [
  {
    id: "TRX-1001",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    cashierName: "Kasir 1",
    paymentMethod: "cash",
    totalAmount: 23500,
    paidAmount: 50000,
    changeAmount: 26500,
    items: [
      { productId: "prod_1", name: "Mie Instan Goreng", costPrice: 2800, price: 3500, quantity: 1, subtotal: 3500 },
      { productId: "prod_2", name: "Air Mineral 600ml", costPrice: 3500, price: 5000, quantity: 1, subtotal: 5000 },
      { productId: "prod_4", name: "Roti Tawar Gandum", costPrice: 12000, price: 15000, quantity: 1, subtotal: 15000 }
    ],
    itemsSummary: "Mie Instan Goreng (1), Air Mineral 600ml (1), Roti Tawar Gandum (1)"
  }
];

const DEFAULT_WITHDRAWALS = [];
