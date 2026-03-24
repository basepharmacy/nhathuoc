import {
  categoriesRepo,
  inventoryBatchesRepo,
  productsRepo,
} from '@/client'
import type { CategoryInsert } from '@/services/supabase/database/repo/categoriesRepo'
import type {
  ProductInsert,
  ProductUnitInsert,
} from '@/services/supabase/'
import type { InventoryBatchInsert } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import type { ProcessLog } from '../../utils/types'
import { parseFile } from '../../utils/file-parser'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return String(error)
}

function parseNumber(value: string): number {
  if (!value) return 0
  const num = parseFloat(value.replace(/,/g, ''))
  return Number.isNaN(num) ? 0 : num
}

function parseDate(value: string): string | null {
  if (!value) return null
  // Format: dd/mm/yyyy
  const parts = value.split('/')
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export async function migrateProducts(
  file: File,
  tenantId: string,
  locationId: string | null,
  addLog: (log: Omit<ProcessLog, 'timestamp'>) => void
): Promise<{ success: number; failed: number }> {
  addLog({ message: 'Đang đọc file sản phẩm...', type: 'info' })

  const allRows = await parseFile(file)
  // Dòng thứ 2 trong file (allRows[0]) là header tiếng Anh, bỏ qua
  const rows = allRows.slice(1)

  if (rows.length === 0) {
    addLog({ message: 'File không có dữ liệu', type: 'error' })
    return { success: 0, failed: 0 }
  }

  addLog({
    message: `Đã đọc ${rows.length} dòng từ file`,
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
    const categoryName = row['Nhóm Thuốc']?.trim()
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

  // Step 2: Check existing products by name
  addLog({ message: 'Đang kiểm tra sản phẩm đã tồn tại...', type: 'info' })

  const existingProducts = await productsRepo.getAllProductsByTenantId(tenantId)
  const existingProductNames = new Set(
    existingProducts
      .map((p) => p.product_name?.toLowerCase())
      .filter(Boolean)
  )

  const newRows = rows.filter(
    (row) => {
      const name = row['Tên Thuốc']?.trim()
      return name && !existingProductNames.has(name.toLowerCase())
    }
  )

  const skipped = rows.length - newRows.length
  if (skipped > 0) {
    addLog({
      message: `${skipped} sản phẩm đã tồn tại hoặc không có tên, sẽ bỏ qua`,
      type: 'info',
    })
  }

  if (!locationId) {
    addLog({
      message: 'Cảnh báo: Chưa chọn chi nhánh, lô hàng sẽ không có location',
      type: 'error',
    })
  }

  // Step 3: Prepare all data
  addLog({ message: 'Đang chuẩn bị dữ liệu sản phẩm...', type: 'info' })

  type ProductWithId = ProductInsert & { id: string }
  const allProducts: ProductWithId[] = []
  const allUnits: ProductUnitInsert[] = []
  const allInventoryBatches: InventoryBatchInsert[] = []

  for (const row of newRows) {
    const productId = crypto.randomUUID()
    const productName = row['Tên Thuốc']?.trim()
    if (!productName) continue

    const categoryName = row['Nhóm Thuốc']?.trim()
    const categoryId = categoryName
      ? categoryMap.get(categoryName.toLowerCase()) ?? null
      : null

    allProducts.push({
      id: productId,
      tenant_id: tenantId,
      product_name: productName,
      product_type: '1_OTC',
      status: '2_ACTIVE',
      category_id: categoryId,
      min_stock: parseNumber(row['Số lượng cảnh báo']) > 0 ? parseNumber(row['Số lượng cảnh báo']) : null,
      active_ingredient: row['Hoạt Chất'] || null,
      regis_number: row['Số ĐK'] || null,
      jan_code: row['Mã Thuốc'] || row['Barcode'] || null,
      made_company_name: row['Hãng SX'] || null,
      description: row['Thông Tin'] || null,
    })

    // Base unit (Đơn Vị Lẻ)
    const baseUnitName = row['Đơn Vị Lẻ']?.trim() || 'Đơn vị'
    const costPrice = Math.round(parseNumber(row['Giá Nhập']))
    const sellPrice = Math.round(parseNumber(row['Giá Bán Lẻ']))

    allUnits.push({
      product_id: productId,
      tenant_id: tenantId,
      unit_name: baseUnitName,
      conversion_factor: 1,
      cost_price: costPrice,
      sell_price: sellPrice,
      is_base_unit: true,
    })

    // Secondary unit (Đơn Vị Thứ Nguyên) if exists and different from base
    const secondaryUnitName = row['Đơn Vị Thứ Nguyên']?.trim()
    const conversionFactor = parseNumber(row['Hệ Số'])
    if (secondaryUnitName && conversionFactor > 1 && secondaryUnitName !== baseUnitName) {
      allUnits.push({
        product_id: productId,
        tenant_id: tenantId,
        unit_name: secondaryUnitName,
        conversion_factor: conversionFactor,
        cost_price: Math.round(costPrice * conversionFactor),
        sell_price: Math.round(sellPrice * conversionFactor),
        is_base_unit: false,
      })
    }

    // Stock adjustment from batch info
    const batchCode = row['Số Lô']?.trim()
    const expiryDateStr = row['Hạn Dùng']?.trim()
    const stockQuantity = parseNumber(row['Tồn kho'])

    if (stockQuantity > 0) {
      allInventoryBatches.push({
        tenant_id: tenantId,
        product_id: productId,
        batch_code: batchCode || 'LO00000',
        expiry_date: parseDate(expiryDateStr),
        quantity: Math.round(stockQuantity),
        cumulative_quantity: Math.round(stockQuantity),
        average_cost_price: costPrice,
        location_id: locationId,
      })
    }
  }

  addLog({
    message: `Chuẩn bị xong: ${allProducts.length} sản phẩm, ${allUnits.length} đơn vị, ${allInventoryBatches.length} lô tồn kho`,
    type: 'success',
  })

  // Step 4: Batch insert products
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

  // Step 5: Batch insert product units
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

  // Step 6: Batch insert inventory batches
  const validBatches = allInventoryBatches.filter((b) => successProductIds.has(b.product_id))
  let batchesCreated = 0

  if (validBatches.length > 0) {
    addLog({ message: 'Đang tạo lô tồn kho...', type: 'info' })

    for (let i = 0; i < validBatches.length; i += BATCH_SIZE) {
      const batch = validBatches.slice(i, i + BATCH_SIZE)
      try {
        const created = await inventoryBatchesRepo.createBatchInventoryBatches(batch)
        batchesCreated += created.length
      } catch (error) {
        addLog({
          message: `Lỗi tạo lô tồn kho batch ${i + 1}-${i + batch.length}: ${getErrorMessage(error)}`,
          type: 'error',
        })
      }
    }
  }

  if (failed > 0) {
    addLog({
      message: `Đã nhập ${success} sản phẩm, ${failed} lỗi, ${batchesCreated} lô tồn kho`,
      type: 'error',
    })
  } else {
    addLog({
      message: `Đã nhập ${success} sản phẩm, ${batchesCreated} lô tồn kho thành công`,
      type: 'success',
    })
  }

  return { success, failed }
}
