import { SaleOrderInCreate, SaleOrderItem } from './types'
import { SaleOrderWithItems, ProductWithUnits, InventoryBatch } from '@/services/supabase'

export function mapOrderToSaleOrderInCreate(
  order: SaleOrderWithItems,
  products: ProductWithUnits[],
  inventoryBatches: InventoryBatch[],
  fallbackLocationId: string | null,
): SaleOrderInCreate {
  const productLookup = new Map(products.map((p) => [p.id, p]))
  const batchById = new Map(inventoryBatches.map((b) => [b.id, b]))

  const items = (order.items ?? [])
    .map((item) => {
      const product = productLookup.get(item.product_id)
      if (!product) return null
      const batch = item.batch_id ? batchById.get(item.batch_id) : null
      return {
        id: String(item.id),
        product,
        productUnitId: item.product_unit_id ?? null,
        quantity: item.quantity ?? 0,
        unitPrice: item.unit_price ?? 0,
        discount: item.discount ?? 0,
        batchId: item.batch_id ?? '',
        batchCode: batch?.batch_code ?? '',
        expiryDate: batch?.expiry_date ?? '',
        stock: 0,
      }
    })
    .filter((item): item is SaleOrderItem => Boolean(item))

  const subTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
    0,
  )

  return {
    id: order.id,
    orderCode: order.sale_order_code ?? '',
    customerId: order.customer_id ?? '',
    paymentMethod: 'CASH',
    subTotal,
    orderDiscount: order.discount ?? 0,
    totalAmount: order.total_amount ?? 0,
    paidAmount: order.customer_paid_amount ?? 0,
    bankAccountId: null,
    locationId: order.location_id ?? fallbackLocationId ?? '',
    notes: order.notes ?? null,
    status: order.status,
    items,
  }
}

export function generateOrderCode(): string {
  const timestamp = Date.now()
  const encoded = timestamp.toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${encoded}S${random}`
}