import { type ProductWithUnits, SaleOrderStatus } from '@/services/supabase/'
import { generateOrderCode } from '../data/sale-order-helper'
export type PaymentMethod = '1_CASH' | '2_BANK_TRANSFER'

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

export type SaleOrderInCreate = {
  id?: string // trường hợp edit draft sẽ có id, trường hợp tạo mới sẽ không có
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

export function createNewSaleOrder(locationId: string): SaleOrderInCreate {
  return {
    orderCode: generateOrderCode(),
    customerId: '',
    paymentMethod: '1_CASH',
    subTotal: 0,
    orderDiscount: 0,
    totalAmount: 0,
    paidAmount: 0,
    bankAccountId: null,
    locationId,
    notes: null,
    status: '1_DRAFT',
    items: [],
  }
}
