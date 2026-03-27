export const DUMMY_STATISTICS = {
  returningCustomers: 42,
  returningCustomersChange: 12.5,
  profitMargin: 18.3,
  profitMarginChange: 2.1,
  returnRate: 3.2,
  returnRateChange: -0.8,
  avgSaleSpeed: 45,
  avgSaleSpeedChange: -5.2,
}

export const DUMMY_TOP_PRODUCTS = [
  { name: 'Panadol Extra', revenue: 15200000, quantity: 320, profit: 3800000 },
  { name: 'Efferalgan 500mg', revenue: 12800000, quantity: 280, profit: 3200000 },
  { name: 'Vitamin C DHG', revenue: 9500000, quantity: 450, profit: 2850000 },
  { name: 'Amoxicillin 500mg', revenue: 8200000, quantity: 190, profit: 2460000 },
  { name: 'Omeprazol 20mg', revenue: 6800000, quantity: 150, profit: 1700000 },
]

export const DUMMY_SLOW_PRODUCTS = [
  { name: 'Kem chống nắng SPF50', revenue: 320000, quantity: 4, profit: 80000 },
  { name: 'Nước súc miệng Listerine', revenue: 450000, quantity: 6, profit: 112000 },
  { name: 'Bông tẩy trang', revenue: 180000, quantity: 3, profit: 45000 },
  { name: 'Dầu gội dược liệu', revenue: 250000, quantity: 2, profit: 62000 },
  { name: 'Sữa rửa mặt Cetaphil', revenue: 380000, quantity: 5, profit: 95000 },
]

export const DUMMY_CATEGORIES = [
  { id: '1', name: 'Thuốc kê đơn', revenue: 45000000, quantity: 1200, profit: 11250000 },
  { id: '2', name: 'Thuốc không kê đơn', revenue: 32000000, quantity: 980, profit: 8000000 },
  { id: '3', name: 'Thực phẩm chức năng', revenue: 18000000, quantity: 520, profit: 5400000 },
  { id: '4', name: 'Dụng cụ y tế', revenue: 8500000, quantity: 210, profit: 2550000 },
  { id: '5', name: 'Mỹ phẩm', revenue: 5200000, quantity: 150, profit: 1560000 },
]

export const DUMMY_CUSTOMERS = [
  { id: 'c1', name: 'Nguyễn Văn An', phone: '0901234567', revenue: 8500000, quantity: 45, profit: 2125000 },
  { id: 'c2', name: 'Trần Thị Bình', phone: '0912345678', revenue: 6200000, quantity: 38, profit: 1550000 },
  { id: 'c3', name: 'Lê Hoàng Cường', phone: '0923456789', revenue: 5100000, quantity: 32, profit: 1275000 },
  { id: 'c4', name: 'Phạm Minh Đức', phone: '0934567890', revenue: 4300000, quantity: 28, profit: 1075000 },
  { id: 'c5', name: 'Võ Thị Em', phone: '0945678901', revenue: 3800000, quantity: 22, profit: 950000 },
]

export const DUMMY_TIME_SERIES: Record<string, { timeKey: number; revenue: number; quantity: number; profit: number }[]> = {
  // Theo giờ: 0:00 ~ 23:00
  hour: [
    { timeKey: 0, revenue: 200000, quantity: 2, profit: 50000 },
    { timeKey: 1, revenue: 100000, quantity: 1, profit: 25000 },
    { timeKey: 2, revenue: 80000, quantity: 1, profit: 20000 },
    { timeKey: 3, revenue: 50000, quantity: 1, profit: 12000 },
    { timeKey: 4, revenue: 60000, quantity: 1, profit: 15000 },
    { timeKey: 5, revenue: 150000, quantity: 2, profit: 37000 },
    { timeKey: 6, revenue: 800000, quantity: 5, profit: 200000 },
    { timeKey: 7, revenue: 1200000, quantity: 8, profit: 300000 },
    { timeKey: 8, revenue: 3500000, quantity: 22, profit: 875000 },
    { timeKey: 9, revenue: 5800000, quantity: 35, profit: 1450000 },
    { timeKey: 10, revenue: 7200000, quantity: 42, profit: 1800000 },
    { timeKey: 11, revenue: 6500000, quantity: 38, profit: 1625000 },
    { timeKey: 12, revenue: 4200000, quantity: 25, profit: 1050000 },
    { timeKey: 13, revenue: 5500000, quantity: 32, profit: 1375000 },
    { timeKey: 14, revenue: 6800000, quantity: 40, profit: 1700000 },
    { timeKey: 15, revenue: 5200000, quantity: 30, profit: 1300000 },
    { timeKey: 16, revenue: 4800000, quantity: 28, profit: 1200000 },
    { timeKey: 17, revenue: 6200000, quantity: 36, profit: 1550000 },
    { timeKey: 18, revenue: 3800000, quantity: 20, profit: 950000 },
    { timeKey: 19, revenue: 2100000, quantity: 12, profit: 525000 },
    { timeKey: 20, revenue: 1500000, quantity: 8, profit: 375000 },
    { timeKey: 21, revenue: 900000, quantity: 5, profit: 225000 },
    { timeKey: 22, revenue: 500000, quantity: 3, profit: 125000 },
    { timeKey: 23, revenue: 300000, quantity: 2, profit: 75000 },
  ],
  // Theo thứ: Thứ 2 (1) ~ Chủ nhật (7)
  day_of_week: [
    { timeKey: 1, revenue: 8500000, quantity: 52, profit: 2125000 },
    { timeKey: 2, revenue: 7800000, quantity: 48, profit: 1950000 },
    { timeKey: 3, revenue: 9200000, quantity: 55, profit: 2300000 },
    { timeKey: 4, revenue: 8100000, quantity: 50, profit: 2025000 },
    { timeKey: 5, revenue: 10500000, quantity: 62, profit: 2625000 },
    { timeKey: 6, revenue: 12800000, quantity: 75, profit: 3200000 },
    { timeKey: 7, revenue: 6500000, quantity: 38, profit: 1625000 },
  ],
  // Theo ngày: 1 ~ 31
  day: [
    { timeKey: 1, revenue: 3200000, quantity: 18, profit: 800000 },
    { timeKey: 2, revenue: 2800000, quantity: 15, profit: 700000 },
    { timeKey: 3, revenue: 3500000, quantity: 20, profit: 875000 },
    { timeKey: 4, revenue: 2600000, quantity: 14, profit: 650000 },
    { timeKey: 5, revenue: 4100000, quantity: 24, profit: 1025000 },
    { timeKey: 6, revenue: 3800000, quantity: 22, profit: 950000 },
    { timeKey: 7, revenue: 2900000, quantity: 16, profit: 725000 },
    { timeKey: 8, revenue: 3300000, quantity: 19, profit: 825000 },
    { timeKey: 9, revenue: 3700000, quantity: 21, profit: 925000 },
    { timeKey: 10, revenue: 4500000, quantity: 26, profit: 1125000 },
    { timeKey: 11, revenue: 3100000, quantity: 17, profit: 775000 },
    { timeKey: 12, revenue: 2700000, quantity: 15, profit: 675000 },
    { timeKey: 13, revenue: 3400000, quantity: 20, profit: 850000 },
    { timeKey: 14, revenue: 3900000, quantity: 23, profit: 975000 },
    { timeKey: 15, revenue: 5200000, quantity: 30, profit: 1300000 },
    { timeKey: 16, revenue: 4800000, quantity: 28, profit: 1200000 },
    { timeKey: 17, revenue: 3600000, quantity: 21, profit: 900000 },
    { timeKey: 18, revenue: 3000000, quantity: 17, profit: 750000 },
    { timeKey: 19, revenue: 2500000, quantity: 13, profit: 625000 },
    { timeKey: 20, revenue: 4200000, quantity: 25, profit: 1050000 },
    { timeKey: 21, revenue: 3800000, quantity: 22, profit: 950000 },
    { timeKey: 22, revenue: 3300000, quantity: 19, profit: 825000 },
    { timeKey: 23, revenue: 2900000, quantity: 16, profit: 725000 },
    { timeKey: 24, revenue: 3100000, quantity: 18, profit: 775000 },
    { timeKey: 25, revenue: 4600000, quantity: 27, profit: 1150000 },
    { timeKey: 26, revenue: 3500000, quantity: 20, profit: 875000 },
    { timeKey: 27, revenue: 3200000, quantity: 18, profit: 800000 },
    { timeKey: 28, revenue: 2800000, quantity: 15, profit: 700000 },
    { timeKey: 29, revenue: 3700000, quantity: 21, profit: 925000 },
    { timeKey: 30, revenue: 5500000, quantity: 32, profit: 1375000 },
    { timeKey: 31, revenue: 4000000, quantity: 23, profit: 1000000 },
  ],
}
