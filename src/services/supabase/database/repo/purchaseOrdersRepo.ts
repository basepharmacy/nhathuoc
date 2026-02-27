import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert } from '../../database.types'

export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderInsert = TablesInsert<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>
export type PurchaseOrderItemInsert = TablesInsert<'purchase_order_items'>

export const createPurchaseOrderRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async createPurchaseOrderWithItems(params: {
      order: PurchaseOrderInsert
      items: Array<Omit<PurchaseOrderItemInsert, 'purchase_order_id'>>
    }): Promise<PurchaseOrder> {
      console.log('Creating purchase order with params:', params.order)
      const { data: order, error: orderError } = await client
        .from('purchase_orders')
        .insert(params.order)
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          purchase_order_id: order.id,
          batch_code: item.batch_code ?? undefined,
          expiry_date: item.expiry_date ?? undefined,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          product_unit_id: item.product_unit_id ?? null,
        }))

        const { error: itemsError } = await client
          .from('purchase_order_items')
          .insert(itemsPayload)

        if (itemsError) {
          throw itemsError
        }
      }

      return order as PurchaseOrder
    },
  }
}