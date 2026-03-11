import { suppliersRepo } from '@/client'
import type { SupplierInsert } from '@/services/supabase/database/repo/suppliersRepo'
import type { ProcessLog } from '../../utils/types'
import { parseFile } from '../../utils/file-parser'

function mapKiotVietSupplier(
  row: Record<string, string>,
  tenantId: string
): SupplierInsert {
  const address = [row['Địa chỉ'], row['Phường/Xã'], row['Khu vực']]
    .filter(Boolean)
    .join(', ')

  return {
    tenant_id: tenantId,
    name: row['Tên nhà cung cấp'] || row['Mã nhà cung cấp'] || 'Không tên',
    phone: row['Điện thoại'] || null,
    address: address || null,
    description: row['Ghi chú'] || null,
    is_active: row['Trạng thái'] === '1',
  }
}

export async function migrateSuppliers(
  file: File,
  tenantId: string,
  addLog: (log: Omit<ProcessLog, 'timestamp'>) => void
): Promise<{ success: number; failed: number }> {
  addLog({ message: 'Đang đọc file CSV nhà cung cấp...', type: 'info' })

  const rows = await parseFile(file)

  if (rows.length === 0) {
    addLog({ message: 'File CSV không có dữ liệu', type: 'error' })
    return { success: 0, failed: 0 }
  }

  addLog({
    message: `Đã đọc ${rows.length} nhà cung cấp từ file CSV`,
    type: 'success',
  })

  addLog({ message: 'Đang nhập nhà cung cấp vào hệ thống...', type: 'info' })

  const BATCH_SIZE = 50
  let success = 0
  let failed = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const batchData = batch.map((row) => mapKiotVietSupplier(row, tenantId))

    try {
      const created = await suppliersRepo.createBatchSuppliers(batchData)
      success += created.length
    } catch (error) {
      failed += batch.length
      console.error(`Failed to import batch ${i}-${i + batch.length}:`, error)
    }

    addLog({
      message: `Đã xử lý ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} nhà cung cấp...`,
      type: 'info',
    })
  }

  if (failed > 0) {
    addLog({
      message: `Đã nhập ${success} nhà cung cấp, ${failed} lỗi`,
      type: 'error',
    })
  } else {
    addLog({
      message: `Đã nhập ${success} nhà cung cấp thành công`,
      type: 'success',
    })
  }

  return { success, failed }
}
