import { customersRepo } from '@/client'
import type { CustomerInsert } from '@/services/supabase/database/model'
import type { ProcessLog } from '../../utils/types'
import { parseFile } from '../../utils/file-parser'

function mapKiotVietCustomer(
  row: Record<string, string>,
  tenantId: string
): CustomerInsert {
  const address = [row['Địa chỉ'], row['Phường/Xã'], row['Khu vực giao hàng']]
    .filter(Boolean)
    .join(', ')

  return {
    tenant_id: tenantId,
    name: row['Tên khách hàng'] || row['Mã khách hàng'] || 'Không tên',
    phone: row['Điện thoại'] || null,
    address: address || null,
    description: row['Ghi chú'] || null,
  }
}

export async function migrateCustomers(
  file: File,
  tenantId: string,
  addLog: (log: Omit<ProcessLog, 'timestamp'>) => void
): Promise<{ success: number; failed: number }> {
  addLog({ message: 'Đang đọc file CSV khách hàng...', type: 'info' })

  const rows = await parseFile(file)

  if (rows.length === 0) {
    addLog({ message: 'File CSV không có dữ liệu', type: 'error' })
    return { success: 0, failed: 0 }
  }

  addLog({
    message: `Đã đọc ${rows.length} khách hàng từ file CSV`,
    type: 'success',
  })

  addLog({ message: 'Đang nhập khách hàng vào hệ thống...', type: 'info' })

  const BATCH_SIZE = 50
  let success = 0
  let failed = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const batchData = batch.map((row) => mapKiotVietCustomer(row, tenantId))

    try {
      const created = await customersRepo.createBatchCustomers(batchData)
      success += created.length
    } catch (error) {
      failed += batch.length
      console.error(`Failed to import batch ${i}-${i + batch.length}:`, error)
    }

    addLog({
      message: `Đã xử lý ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} khách hàng...`,
      type: 'info',
    })
  }

  if (failed > 0) {
    addLog({
      message: `Đã nhập ${success} khách hàng, ${failed} lỗi`,
      type: 'error',
    })
  } else {
    addLog({
      message: `Đã nhập ${success} khách hàng thành công`,
      type: 'success',
    })
  }

  return { success, failed }
}
