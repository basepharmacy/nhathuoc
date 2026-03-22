import { BasePharmacySupabaseClient } from '../../client'
import {
  PurchaseOrder,
  PurchaseOrderDetailWithRelations,
  PurchaseOrderInsert,
  PurchaseOrderItem,
  PurchaseOrderItemInsert,
  PurchaseOrderUpdate,
} from '../model'

export type PurchaseOrderWithRelations = PurchaseOrder & {
  supplier?: { id: string; name: string } | null
  location?: { id: string; name: string } | null
  user?: { id: string; name: string } | null
}
export type PurchaseOrderWithItems = PurchaseOrder & {
  items?: PurchaseOrderItem[]
}

export type PurchaseOrdersHistoryQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  supplierId?: string
  locationId?: string
  statuses?: Array<PurchaseOrder['status']>
  paymentStatuses?: Array<PurchaseOrder['payment_status']>
  fromDate?: string
  toDate?: string
  sorting?: Array<{ id: string; desc: boolean }>
}

export type PurchaseOrdersHistoryQueryResult = {
  data: PurchaseOrderWithRelations[]
  total: number
}

export const createPurchaseOrderRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getPurchaseOrdersByTenantId(
      tenantId: string
    ): Promise<PurchaseOrderWithRelations[]> {
      const { data, error } = await client
        .from('purchase_orders')
        .select(
          '*, supplier:suppliers(id, name), location:locations(id, name), user:profiles(id, name)'
        )
        .eq('tenant_id', tenantId)
        .order('issued_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as PurchaseOrderWithRelations[]
    },
    async getPurchaseOrdersBySupplierId(params: {
      tenantId: string
      supplierId: string
    }): Promise<PurchaseOrderWithRelations[]> {
      const { data, error } = await client
        .from('purchase_orders')
        .select(
          '*, supplier:suppliers(id, name), location:locations(id, name), user:profiles(id, name)'
        )
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)
        .order('issued_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as PurchaseOrderWithRelations[]
    },
    async getPurchaseOrdersHistory(
      params: PurchaseOrdersHistoryQueryInput
    ): Promise<PurchaseOrdersHistoryQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('purchase_orders')
        .select(
          '*, supplier:suppliers(id, name), location:locations(id, name), user:profiles(id, name)',
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (searchValue) {
        query = query.ilike('purchase_order_code', `%${searchValue}%`)
      }

      if (params.supplierId) {
        query = query.eq('supplier_id', params.supplierId)
      }

      if (params.locationId) {
        query = query.eq('location_id', params.locationId)
      }

      if (params.statuses?.length) {
        query = query.in('status', params.statuses)
      }

      if (params.paymentStatuses?.length) {
        query = query.in('payment_status', params.paymentStatuses)
      }

      if (params.fromDate) {
        query = query.gte('issued_at', params.fromDate)
      }

      if (params.toDate) {
        query = query.lte('issued_at', params.toDate)
      }

      const sort = params.sorting?.[0]
      const sortColumnMap: Record<string, string> = {
        purchase_order_code: 'purchase_order_code',
        issued_at: 'issued_at',
        paid_amount: 'paid_amount',
        amount_due: 'total_amount',
        status: 'status',
        payment_status: 'payment_status',
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
        data: (data ?? []) as PurchaseOrderWithRelations[],
        total: count ?? 0,
      }
    },
    async createPurchaseOrderWithItems(params: {
      order: PurchaseOrderInsert
      items: Array<Omit<PurchaseOrderItemInsert, 'purchase_order_id'>>
    }): Promise<PurchaseOrder> {
      const orderPayload: PurchaseOrderInsert = {
        tenant_id: params.order.tenant_id,
        supplier_id: params.order.supplier_id,
        user_id: params.order.user_id,
        purchase_order_code: params.order.purchase_order_code,
        location_id: params.order.location_id ?? null,
        issued_at: params.order.issued_at ?? null,
        status: params.order.status,
        payment_status: params.order.payment_status,
        paid_amount: params.order.paid_amount ?? 0,
        discount: params.order.discount ?? 0,
        total_amount: params.order.total_amount ?? 0,
        notes: params.order.notes ?? null,
      }

      const { data: order, error: orderError } = await client
        .from('purchase_orders')
        .insert(orderPayload)
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
    async getPurchaseOrderByCodeWithItems(params: {
      tenantId: string
      orderCode: string
    }): Promise<PurchaseOrderWithItems | null> {
      const { data, error } = await client
        .from('purchase_orders')
        .select('*, items:purchase_order_items(*)')
        .eq('tenant_id', params.tenantId)
        .eq('purchase_order_code', params.orderCode)
        .maybeSingle()

      if (error) {
        throw error
      }

      return (data ?? null) as PurchaseOrderWithItems | null
    },
    async updatePurchaseOrderWithItems(params: {
      orderId: string
      tenantId: string
      order: PurchaseOrderUpdate
      items: Array<Omit<PurchaseOrderItemInsert, 'purchase_order_id'>>
    }): Promise<PurchaseOrder> {
      const { data: existingOrder, error: existingOrderError } = await client
        .from('purchase_orders')
        .select('id, status, payment_status')
        .eq('tenant_id', params.tenantId)
        .eq('id', params.orderId)
        .maybeSingle()

      if (existingOrderError) {
        throw existingOrderError
      }

      if (!existingOrder) {
        throw new Error('Không tìm thấy đơn nhập hàng.')
      }

      const orderPayload: PurchaseOrderUpdate = {
        supplier_id: params.order.supplier_id,
        status: params.order.status,
        payment_status: params.order.payment_status,
        paid_amount: params.order.paid_amount,
        discount: params.order.discount,
        total_amount: params.order.total_amount,
        notes: params.order.notes ?? null,
        location_id: params.order.location_id ?? null,
      }

      const { data: order, error: orderError } = await client
        .from('purchase_orders')
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
        .from('purchase_order_items')
        .delete()
        .eq('tenant_id', params.tenantId)
        .eq('purchase_order_id', params.orderId)

      if (deleteItemsError) {
        throw deleteItemsError
      }

      if (params.items.length > 0) {
        const itemsPayload = params.items.map((item) => ({
          ...item,
          purchase_order_id: params.orderId,
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
    async getPurchaseOrderByCodeWithRelations(params: {
      tenantId: string
      orderCode: string
    }): Promise<PurchaseOrderDetailWithRelations | null> {
      const { data, error } = await client
        .from('purchase_orders')
        .select(`
          *,
          items:purchase_order_items(
            *,
            product:products(id, product_name),
            product_unit:product_units(id, unit_name)
          ),
          supplier:suppliers(id, name),
          location:locations(id, name, address, phone),
          user:profiles(id, name)`)
        .eq('tenant_id', params.tenantId)
        .eq('purchase_order_code', params.orderCode)
        .maybeSingle()

      if (error) {
        throw error
      }

      return (data ?? null) as PurchaseOrderDetailWithRelations | null
    },
    async updatePurchaseOrder(params: {
      orderId: string
      order: PurchaseOrderUpdate
    }): Promise<PurchaseOrder> {
      const { data, error } = await client
        .from('purchase_orders')
        .update(params.order)
        .eq('id', params.orderId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as PurchaseOrder
    },
    async deletePurchaseOrder(params: {
      orderId: string
    }): Promise<void> {
      const { error: deleteOrderError } = await client
        .from('purchase_orders')
        .delete()
        .eq('id', params.orderId)

      if (deleteOrderError) {
        throw deleteOrderError
      }
      // Không cần xóa thủ công items vì đã thiết lập ON DELETE CASCADE ở database
    },
  }
}