import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type SaleOrder = Tables<'sale_orders'>
export type SaleOrderInsert = TablesInsert<'sale_orders'>
export type SaleOrderUpdate = TablesUpdate<'sale_orders'>
export type SaleOrderItem = Tables<'sale_order_items'>
export type SaleOrderItemInsert = TablesInsert<'sale_order_items'>
export type SaleOrderWithRelations = SaleOrder & {
  customer?: { id: string; name: string } | null
  location?: { id: string; name: string } | null
  user?: { id: string; name: string } | null
}
export type SaleOrderWithItems = SaleOrder & {
  items?: SaleOrderItem[]
}

export type SaleOrdersHistoryQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  customerIds?: string[]
  statuses?: Array<SaleOrder['status']>
  sorting?: Array<{ id: string; desc: boolean }>
}

export type SaleOrdersHistoryQueryResult = {
  data: SaleOrderWithRelations[]
  total: number
}

export const createSaleOrderRepository = (client: BasePharmacySupabaseClient) => {
  return {
    async getSaleOrdersHistory(
      params: SaleOrdersHistoryQueryInput
    ): Promise<SaleOrdersHistoryQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('sale_orders')
        .select(
          '*, customer:customers(id, name), location:locations(id, name), user:profiles(id, name)',
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (searchValue) {
        query = query.ilike('sale_order_code', `%${searchValue}%`)
      }

      if (params.customerIds?.length) {
        query = query.in('customer_id', params.customerIds)
      }

      if (params.statuses?.length) {
        query = query.in('status', params.statuses)
      }

      const sort = params.sorting?.[0]
      const sortColumnMap: Record<string, string> = {
        sale_order_code: 'sale_order_code',
        issued_at: 'issued_at',
        customer_paid_amount: 'customer_paid_amount',
        paid_amount: 'customer_paid_amount',
        amount_due: 'total_amount',
        status: 'status',
        created_at: 'created_at',
        total_amount: 'total_amount',
      }

      const sortColumn = sort ? sortColumnMap[sort.id] : undefined

      if (sortColumn) {
        query = query.order(sortColumn, { ascending: !sort?.desc })
      } else {
        query = query.order('issued_at', { ascending: false }).order('created_at', {
          ascending: false,
        })
      }

      const { data, error, count } = await query.range(start, end)

      if (error) {
        throw error
      }

      return {
        data: (data ?? []) as SaleOrderWithRelations[],
        total: count ?? 0,
      }
    },
    async createSaleOrderWithItems(params: {
      order: SaleOrderInsert
      items: Array<Omit<SaleOrderItemInsert, 'sale_order_id'>>
    }): Promise<SaleOrder> {
      const orderPayload: SaleOrderInsert = {
        tenant_id: params.order.tenant_id,
        customer_id: params.order.customer_id ?? null,
        user_id: params.order.user_id,
        sale_order_code: params.order.sale_order_code,
        location_id: params.order.location_id ?? null,
        issued_at: params.order.issued_at ?? null,
        status: params.order.status,
        customer_paid_amount: params.order.customer_paid_amount ?? 0,
        discount: params.order.discount ?? 0,
        total_amount: params.order.total_amount ?? 0,
        notes: params.order.notes ?? null,
      }

      const { data: order, error: orderError } = await client
        .from('sale_orders')
        .insert(orderPayload)
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          sale_order_id: order.id,
          batch_id: item.batch_id ?? null,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          product_unit_id: item.product_unit_id ?? null,
        }))

        const { error: itemsError } = await client
          .from('sale_order_items')
          .insert(itemsPayload)

        if (itemsError) {
          throw itemsError
        }
      }

      return order as SaleOrder
    },
    async getSaleOrderByIdWithItems(params: {
      tenantId: string
      orderId: string
    }): Promise<SaleOrderWithItems | null> {
      const { data, error } = await client
        .from('sale_orders')
        .select('*, items:sale_order_items(*)')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (error) {
        throw error
      }

      return (data ?? null) as SaleOrderWithItems | null
    },
    async updateSaleOrderWithItems(params: {
      orderId: string
      tenantId: string
      order: SaleOrderUpdate
      items: Array<Omit<SaleOrderItemInsert, 'sale_order_id'>>
    }): Promise<SaleOrder> {
      const { data: existingOrder, error: existingOrderError } = await client
        .from('sale_orders')
        .select('id, status')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (existingOrderError) {
        throw existingOrderError
      }

      if (!existingOrder) {
        throw new Error('Không tìm thấy đơn bán hàng.')
      }

      const orderPayload: SaleOrderUpdate = {
        customer_id: params.order.customer_id ?? null,
        status: params.order.status,
        customer_paid_amount: params.order.customer_paid_amount,
        discount: params.order.discount,
        total_amount: params.order.total_amount,
        notes: params.order.notes ?? null,
        location_id: params.order.location_id ?? null,
      }

      const { data: order, error: orderError } = await client
        .from('sale_orders')
        .update(orderPayload)
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .eq('status', existingOrder.status)
        .select()
        .single()

      if (orderError) {
        throw orderError
      }

      const { error: deleteItemsError } = await client
        .from('sale_order_items')
        .delete()
        .eq('tenant_id', params.tenantId)
        .eq('sale_order_id', params.orderId)

      if (deleteItemsError) {
        throw deleteItemsError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          sale_order_id: params.orderId,
          batch_id: item.batch_id ?? null,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 0,
          unit_price: item.unit_price ?? 0,
          product_unit_id: item.product_unit_id ?? null,
        }))

        const { error: itemsError } = await client
          .from('sale_order_items')
          .insert(itemsPayload)

        if (itemsError) {
          throw itemsError
        }
      }

      return order as SaleOrder
    },
    async deleteSaleOrder(params: { orderId: string }): Promise<void> {
      const { error: deleteOrderError } = await client
        .from('sale_orders')
        .delete()
        .eq('id', params.orderId)

      if (deleteOrderError) {
        throw deleteOrderError
      }
      // Không cần xóa thủ công items vì đã thiết lập ON DELETE CASCADE ở database
    },
  }
}
