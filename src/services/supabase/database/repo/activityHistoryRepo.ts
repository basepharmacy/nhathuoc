import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'

export type ActivityHistory = Tables<'activity_history'>

export type ActivityHistoryWithRelations = ActivityHistory & {
  user?: { id: string; name: string } | null
  location?: { id: string; name: string } | null
}

export type ActivityHistoryQueryInput = {
  tenantId: string
  userId?: string | null
  locationId?: string | null
  pageIndex: number
  pageSize: number
  fromDate?: string | null
  toDate?: string | null
}

export type ActivityHistoryQueryResult = {
  data: ActivityHistoryWithRelations[]
  total: number
}

const activityTypeLabels: Record<ActivityHistory['activity_type'], string> = {
  PURCHASE_ORDER_ORDERED: 'Đặt hàng nhập',
  PURCHASE_ORDER_STORED: 'Nhập kho',
  PURCHASE_ORDER_CANCELLED: 'Hủy đơn nhập',
  SALE_ORDER_COMPLETED: 'Hoàn tất đơn bán',
  SALE_ORDER_CANCELLED: 'Hủy đơn bán',
  STOCK_ADJUSTMENT_CREATED: 'Điều chỉnh tồn kho',
  SUPPLIER_PAYMENT_CREATED: 'Tạo thanh toán nhà cung cấp',
  SUPPLIER_PAYMENT_DELETED: 'Xóa thanh toán nhà cung cấp',
}

export { activityTypeLabels }

export const createActivityHistoryRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async getActivityHistory(
    params: ActivityHistoryQueryInput
  ): Promise<ActivityHistoryQueryResult> {
    const start = params.pageIndex * params.pageSize
    const end = start + params.pageSize - 1

    let query = client
      .from('activity_history')
      .select(`*, user:profiles(id, name), location:locations(id, name)`, { count: 'exact' })
      .eq('tenant_id', params.tenantId)

    if (params.userId) {
      query = query.eq('user_id', params.userId)
    }

    if (params.locationId) {
      query = query.eq('location_id', params.locationId)
    }

    if (params.fromDate) {
      query = query.gte('created_at', params.fromDate)
    }

    if (params.toDate) {
      // include the whole day for toDate
      query = query.lte('created_at', params.toDate + 'T23:59:59.999Z')
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) {
      throw error
    }

    return {
      data: (data ?? []) as ActivityHistoryWithRelations[],
      total: count ?? 0,
    }
  },
})
