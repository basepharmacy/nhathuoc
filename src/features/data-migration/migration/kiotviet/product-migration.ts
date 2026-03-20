import {
  categoriesRepo,
  productsRepo,
  stockAdjustmentsRepo,
} from '@/client'
import type { CategoryInsert } from '@/services/supabase/database/repo/categoriesRepo'
import type {
  ProductInsert,
  ProductUnitInsert,
} from '@/services/supabase/database/repo/productsRepo'
import type { StockAdjustmentInsert } from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import type { ProcessLog } from '../../utils/types'
import { parseFile } from '../../utils/file-parser'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return String(error)
}

function parseKiotVietNumber(value: string): number {
  if (!value) return 0
  const num = parseFloat(value.replace(/,/g, ''))
  return Number.isNaN(num) ? 0 : num
}

function parseKiotVietDate(value: string): string | null {
  if (!value) return null
  // Format: dd/mm/yyyy
  const parts = value.split('/')
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

interface GroupedProduct {
  baseRow: Record<string, string>
  allRows: Record<string, string>[]
  hasBaseUnit: boolean
}

export async function migrateProducts(
  file: File,
  tenantId: string,
  locationId: string | null,
  addLog: (log: Omit<ProcessLog, 'timestamp'>) => void
): Promise<{ success: number; failed: number }> {
  addLog({ message: 'Đang đọc file CSV sản phẩm...', type: 'info' })

  const rows = await parseFile(file)

  if (rows.length === 0) {
    addLog({ message: 'File CSV không có dữ liệu', type: 'error' })
    return { success: 0, failed: 0 }
  }

  addLog({
    message: `Đã đọc ${rows.length} dòng từ file CSV`,
    type: 'success',
  })

  // Step 1: Sync categories
  addLog({ message: 'Đang đồng bộ danh mục sản phẩm...', type: 'info' })

  const existingCategories = await categoriesRepo.getCategories(tenantId)
  const categoryMap = new Map<string, string>() // name -> id
  for (const cat of existingCategories) {
    if (cat.name) {
      categoryMap.set(cat.name.toLowerCase(), cat.id)
    }
  }

  const csvCategories = new Set<string>()
  for (const row of rows) {
    const categoryName = row['Nhóm hàng(3 Cấp)']?.trim()
    if (categoryName) {
      csvCategories.add(categoryName)
    }
  }

  let createdCategories = 0
  for (const catName of csvCategories) {
    if (!categoryMap.has(catName.toLowerCase())) {
      try {
        const newCat = await categoriesRepo.createCategory({
          tenant_id: tenantId,
          name: catName,
        } as CategoryInsert)
        categoryMap.set(catName.toLowerCase(), newCat.id)
        createdCategories++
      } catch (error) {
        addLog({
          message: `Lỗi tạo danh mục "${catName}": ${getErrorMessage(error)}`,
          type: 'error',
        })
      }
    }
  }

  addLog({
    message: `Danh mục: ${existingCategories.length} đã có, ${createdCategories} tạo mới`,
    type: 'success',
  })

  // Step 2: Group rows by product name (Tên hàng)
  addLog({ message: 'Đang nhóm sản phẩm theo tên...', type: 'info' })

  const productGroups = new Map<string, GroupedProduct>()

  for (const row of rows) {
    const productName = row['Tên hàng']?.trim()
    if (!productName) continue

    const conversionFactor = parseKiotVietNumber(row['Quy đổi'])
    const existing = productGroups.get(productName)

    if (!existing) {
      productGroups.set(productName, {
        baseRow: row,
        allRows: [row],
        hasBaseUnit: conversionFactor === 1.0,
      })
    } else {
      existing.allRows.push(row)
      // Prefer the row with conversion factor = 1.0 as base
      if (conversionFactor === 1.0 && !existing.hasBaseUnit) {
        existing.baseRow = row
        existing.hasBaseUnit = true
      }
    }
  }

  addLog({
    message: `Đã nhóm thành ${productGroups.size} sản phẩm`,
    type: 'success',
  })

  // Step 3: Check existing products by name
  addLog({ message: 'Đang kiểm tra sản phẩm đã tồn tại...', type: 'info' })

  const existingProducts = await productsRepo.getAllProductsByTenantId(tenantId)
  const existingProductNames = new Set(
    existingProducts
      .map((p) => p.product_name?.toLowerCase())
      .filter(Boolean)
  )

  let skipped = 0
  for (const productName of productGroups.keys()) {
    if (existingProductNames.has(productName.toLowerCase())) {
      skipped++
    }
  }

  if (skipped > 0) {
    addLog({
      message: `${skipped} sản phẩm đã tồn tại trong hệ thống, sẽ bỏ qua`,
      type: 'info',
    })
  }

  if (!locationId) {
    addLog({
      message: 'Cảnh báo: Chưa chọn chi nhánh, lô hàng sẽ không có location',
      type: 'error',
    })
  }

  // Step 4: Prepare all data with pre-generated UUIDs
  addLog({ message: 'Đang chuẩn bị dữ liệu sản phẩm...', type: 'info' })

  const newEntries = Array.from(productGroups.entries()).filter(
    ([name]) => !existingProductNames.has(name.toLowerCase())
  )

  type ProductWithId = ProductInsert & { id: string }
  const allProducts: ProductWithId[] = []
  const allUnits: ProductUnitInsert[] = []
  const allAdjustments: StockAdjustmentInsert[] = []

  for (const [productName, group] of newEntries) {
    const productId = crypto.randomUUID()
    const baseRow = group.baseRow
    const categoryName = baseRow['Nhóm hàng(3 Cấp)']?.trim()
    const categoryId = categoryName
      ? categoryMap.get(categoryName.toLowerCase()) ?? null
      : null

    const isActive = baseRow['Đang kinh doanh'] === '1'

    allProducts.push({
      id: productId,
      tenant_id: tenantId,
      product_name: productName,
      product_type: '1_OTC',
      status: isActive ? '2_ACTIVE' : '3_INACTIVE',
      category_id: categoryId,
      min_stock: parseKiotVietNumber(baseRow['Tồn nhỏ nhất']) > 0 ? parseKiotVietNumber(baseRow['Tồn nhỏ nhất']) : null,
      active_ingredient: baseRow['Hoạt chất'] || null,
      regis_number: baseRow['Số đăng ký'] || null,
      jan_code: baseRow['Mã hàng'] || null,
      made_company_name: baseRow['Hãng sản xuất'] || null,
      description: baseRow['Mô tả'] || null,
    })

    for (const row of group.allRows) {
      const conversionFactor = parseKiotVietNumber(row['Quy đổi'])
      allUnits.push({
        product_id: productId,
        tenant_id: tenantId,
        unit_name: row['ĐVT']?.trim() || 'Đơn vị',
        conversion_factor: conversionFactor || 1,
        cost_price: Math.round(parseKiotVietNumber(row['Giá vốn'])),
        sell_price: Math.round(parseKiotVietNumber(row['Giá bán'])),
        is_base_unit: conversionFactor === 1.0,
      })
    }

    // Tạo stock adjustments từ baseRow (dù baseRow có conversion != 1, vẫn đọc batch data)
    {
      let hasBatch = false
      for (let batchIdx = 1; batchIdx <= 30; batchIdx++) {
        const batchCode = baseRow[`Lô ${batchIdx}`]?.trim()
        const expiryDateStr = baseRow[`Hạn sử dụng ${batchIdx}`]?.trim()
        const quantity = parseKiotVietNumber(baseRow[`Tồn ${batchIdx}`])

        if (!batchCode && !expiryDateStr) continue
        if (!batchCode) continue
        if (quantity <= 0) continue

        hasBatch = true
        allAdjustments.push({
          tenant_id: tenantId,
          product_id: productId,
          batch_code: batchCode,
          expiry_date: parseKiotVietDate(expiryDateStr),
          quantity: Math.round(quantity),
          cost_price: Math.round(parseKiotVietNumber(baseRow['Giá vốn'])),
          location_id: locationId,
          reason_code: '1_FIRST_STOCK',
          reason: 'Nhập tồn đầu kỳ từ KiotViet',
        })
      }

      // Sản phẩm không có thông tin lô -> tạo lô mặc định từ tồn kho
      if (!hasBatch) {
        const stockQuantity = parseKiotVietNumber(baseRow['Tồn kho'])
        if (stockQuantity > 0) {
          allAdjustments.push({
            tenant_id: tenantId,
            product_id: productId,
            batch_code: 'LO0000',
            expiry_date: null,
            quantity: Math.round(stockQuantity),
            cost_price: Math.round(parseKiotVietNumber(baseRow['Giá vốn'])),
            location_id: locationId,
            reason_code: '1_FIRST_STOCK',
            reason: 'Nhập tồn đầu kỳ từ KiotViet',
          })
        }
      }
    }
  }

  addLog({
    message: `Chuẩn bị xong: ${allProducts.length} sản phẩm, ${allUnits.length} đơn vị, ${allAdjustments.length} phiếu điều chỉnh`,
    type: 'success',
  })

  // Step 5: Batch insert products
  addLog({ message: 'Đang nhập sản phẩm...', type: 'info' })

  let success = 0
  let failed = 0
  const BATCH_SIZE = 50
  const successProductIds = new Set<string>()

  for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
    const batch = allProducts.slice(i, i + BATCH_SIZE)
    try {
      const created = await productsRepo.createBatchProducts(batch)
      success += created.length
      for (const p of created) {
        successProductIds.add(p.id)
      }
    } catch (error) {
      failed += batch.length
      addLog({
        message: `Lỗi nhập sản phẩm batch ${i + 1}-${i + batch.length}: ${getErrorMessage(error)}`,
        type: 'error',
      })
    }
    addLog({
      message: `Đã nhập ${Math.min(i + BATCH_SIZE, allProducts.length)}/${allProducts.length} sản phẩm...`,
      type: 'info',
    })
  }

  // Step 6: Batch insert product units (only for successfully created products)
  const validUnits = allUnits.filter((u) => successProductIds.has(u.product_id))
  addLog({ message: `Đang nhập ${validUnits.length} đơn vị tính...`, type: 'info' })

  for (let i = 0; i < validUnits.length; i += BATCH_SIZE) {
    const batch = validUnits.slice(i, i + BATCH_SIZE)
    try {
      await productsRepo.createBatchProductUnits(batch)
    } catch (error) {
      addLog({
        message: `Lỗi nhập đơn vị batch ${i + 1}-${i + batch.length}: ${getErrorMessage(error)}`,
        type: 'error',
      })
    }
  }

  addLog({
    message: `Đã nhập ${validUnits.length} đơn vị tính`,
    type: 'success',
  })

  // Step 7: Batch insert stock adjustments (only for successfully created products)
  const validAdjustments = allAdjustments.filter((a) => successProductIds.has(a.product_id))
  let adjustmentsCreated = 0

  if (validAdjustments.length > 0) {
    addLog({ message: 'Đang tạo phiếu điều chỉnh tồn kho...', type: 'info' })

    for (let i = 0; i < validAdjustments.length; i += BATCH_SIZE) {
      const batch = validAdjustments.slice(i, i + BATCH_SIZE)
      try {
        const created = await stockAdjustmentsRepo.createBatchStockAdjustments(batch)
        adjustmentsCreated += created.length
      } catch (error) {
        addLog({
          message: `Lỗi tạo phiếu điều chỉnh batch ${i + 1}-${i + batch.length}: ${getErrorMessage(error)}`,
          type: 'error',
        })
      }
    }
  }

  if (failed > 0) {
    addLog({
      message: `Đã nhập ${success} sản phẩm, ${failed} lỗi, ${adjustmentsCreated} phiếu điều chỉnh`,
      type: 'error',
    })
  } else {
    addLog({
      message: `Đã nhập ${success} sản phẩm, ${adjustmentsCreated} phiếu điều chỉnh thành công`,
      type: 'success',
    })
  }

  return { success, failed }
}
