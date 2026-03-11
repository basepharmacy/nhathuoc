import { type ProductWithUnits, SaleOrderStatus } from '@/services/supabase/'

export type PaymentMethod = 'CASH' | 'TRANSFER'

export type SaleOrderItem = {
  id: string
  product: ProductWithUnits
  productUnitId: string | null
  quantity: number
  unitPrice: number
  discount: number
  batchId: string
  batchCode: string
  expiryDate: string
  stock: number
}

export type SaleOrder = {
  id: string
  orderCode: string
  customerId: string
  paymentMethod: PaymentMethod
  subTotal: number // Tổng tiền trước khi trừ chiết khấu
  orderDiscount: number
  totalAmount: number // Tổng tiền sau khi đã trừ chiết khấu (cần thanh toán)
  paidAmount: number
  bankAccountId: string | null
  locationId: string
  notes: string | null
  status: SaleOrderStatus
  items: SaleOrderItem[]
}
