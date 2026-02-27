import type { BasePharmacySupabaseClient } from '../../client'
import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../database.types'

export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

export type ProductUnit = Tables<'product_units'>
export type ProductUnitInsert = TablesInsert<'product_units'>
export type ProductUnitUpdate = TablesUpdate<'product_units'>

export type ProductWithMeta = Product & {
  product_units: ProductUnit[]
  categories: { name: string } | null
}

export type CreateProductUnitInput = {
  unit_name: string
  sell_price: number
  conversion_factor: number
  cost_price: number
}

export type CreateProductWithUnitsInput = {
  tenant_id: string
  product: {
    product_name: string
    jan_code?: string | null
    description?: string | null
    category_id?: string | null
    min_stock?: number | null
    status?: Enums<'product_status'>
  }
  units: CreateProductUnitInput[]
}

export type CreateProductWithUnitsResult = {
  product: Product
  units: ProductUnit[]
}

export type UpdateProductWithUnitsInput = {
  tenant_id: string
  product_id: string
  product: {
    product_name: string
    jan_code?: string | null
    description?: string | null
    category_id?: string | null
    min_stock?: number | null
    status?: Enums<'product_status'>
  }
  units: CreateProductUnitInput[]
}

export type ProductDeleteDependencyTable =
  | 'inventory_batches'
  | 'purchase_order_items'
  | 'stock_adjustments'

export type ProductDeleteDependencySummary = {
  table: ProductDeleteDependencyTable
  count: number
}

export type ProductDeleteBlockedError = Error & {
  code: 'PRODUCT_DELETE_BLOCKED'
  dependencies: ProductDeleteDependencySummary[]
}

export type ProductDeleteNotFoundError = Error & {
  code: 'PRODUCT_NOT_FOUND'
}

const getProductDeleteDependencies = async (
  client: BasePharmacySupabaseClient,
  tenantId: string,
  productId: string
): Promise<ProductDeleteDependencySummary[]> => {
  const dependencyChecks = [
    client
      .from('inventory_batches')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .then(({ count, error }) => {
        if (error) {
          throw error
        }

        return {
          table: 'inventory_batches',
          count: count ?? 0,
        } as ProductDeleteDependencySummary
      }),
    client
      .from('purchase_order_items')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .then(({ count, error }) => {
        if (error) {
          throw error
        }

        return {
          table: 'purchase_order_items',
          count: count ?? 0,
        } as ProductDeleteDependencySummary
      }),
    client
      .from('stock_adjustments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)
      .then(({ count, error }) => {
        if (error) {
          throw error
        }

        return {
          table: 'stock_adjustments',
          count: count ?? 0,
        } as ProductDeleteDependencySummary
      }),
  ]

  return Promise.all(dependencyChecks)
}

const createProductDeleteBlockedError = (
  dependencies: ProductDeleteDependencySummary[]
): ProductDeleteBlockedError => {
  const dependencyLabelMap: Record<ProductDeleteDependencyTable, string> = {
    inventory_batches: 'lô tồn kho',
    purchase_order_items: 'dòng phiếu nhập',
    stock_adjustments: 'phiếu điều chỉnh tồn kho',
  }

  const dependencyDescription = dependencies
    .filter((dependency) => dependency.count > 0)
    .map(
      (dependency) =>
        `${dependencyLabelMap[dependency.table]} (${dependency.count})`
    )
    .join(', ')

  const error = new Error(
    `Không thể xóa sản phẩm vì đang có dữ liệu liên quan: ${dependencyDescription}.`
  ) as ProductDeleteBlockedError

  error.code = 'PRODUCT_DELETE_BLOCKED'
  error.dependencies = dependencies

  return error
}

const createProductDeleteNotFoundError = (): ProductDeleteNotFoundError => {
  const error = new Error(
    'Không tìm thấy sản phẩm để xóa.'
  ) as ProductDeleteNotFoundError
  error.code = 'PRODUCT_NOT_FOUND'
  return error
}

export const createProductsRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async getProductsByTenantId(tenantId: string): Promise<ProductWithMeta[]> {
    const { data, error } = await client
      .from('products')
      .select('*, product_units(*), categories(name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []) as ProductWithMeta[]
  },
  async createProductWithUnits(
    input: CreateProductWithUnitsInput
  ): Promise<CreateProductWithUnitsResult> {
    if (input.units.length === 0) {
      throw new Error('At least one product unit is required')
    }

    const { data: createdProduct, error: productError } = await client
      .from('products')
      .insert({
        tenant_id: input.tenant_id,
        product_name: input.product.product_name,
        jan_code: input.product.jan_code,
        description: input.product.description,
        category_id: input.product.category_id,
        min_stock: input.product.min_stock,
        status: input.product.status,
      })
      .select()
      .single()

    if (productError) {
      throw productError
    }

    const productUnits: ProductUnitInsert[] = input.units.map((unit) => ({
      tenant_id: input.tenant_id,
      product_id: createdProduct.id,
      unit_name: unit.unit_name,
      sell_price: unit.sell_price,
      cost_price: unit.cost_price,
      conversion_factor: unit.conversion_factor,
    }))

    const { data: createdUnits, error: unitsError } = await client
      .from('product_units')
      .insert(productUnits)
      .select()

    if (unitsError) {
      throw unitsError
    }

    return {
      product: createdProduct as Product,
      units: (createdUnits ?? []) as ProductUnit[],
    }
  },
  async updateProductWithUnits(
    input: UpdateProductWithUnitsInput
  ): Promise<CreateProductWithUnitsResult> {
    if (input.units.length === 0) {
      throw new Error('At least one product unit is required')
    }

    const { data: updatedProduct, error: productError } = await client
      .from('products')
      .update({
        product_name: input.product.product_name,
        jan_code: input.product.jan_code,
        description: input.product.description,
        category_id: input.product.category_id,
        min_stock: input.product.min_stock,
        status: input.product.status,
      })
      .eq('tenant_id', input.tenant_id)
      .eq('id', input.product_id)
      .select()
      .single()

    if (productError) {
      throw productError
    }

    const { error: deleteUnitsError } = await client
      .from('product_units')
      .delete()
      .eq('tenant_id', input.tenant_id)
      .eq('product_id', input.product_id)

    if (deleteUnitsError) {
      throw deleteUnitsError
    }

    const productUnits: ProductUnitInsert[] = input.units.map((unit) => ({
      tenant_id: input.tenant_id,
      product_id: input.product_id,
      unit_name: unit.unit_name,
      sell_price: unit.sell_price,
      cost_price: unit.cost_price,
      conversion_factor: unit.conversion_factor,
    }))

    const { data: updatedUnits, error: insertUnitsError } = await client
      .from('product_units')
      .insert(productUnits)
      .select()

    if (insertUnitsError) {
      throw insertUnitsError
    }

    return {
      product: updatedProduct as Product,
      units: (updatedUnits ?? []) as ProductUnit[],
    }
  },
  async searchByName(
    tenantId: string,
    keyword: string,
    limit = 10
  ): Promise<ProductWithMeta[]> {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword.length === 0) {
      return []
    }

    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10

    const { data, error } = await client
      .from('products')
      .select('*, product_units(*), categories(name)')
      .eq('tenant_id', tenantId)
      .ilike('product_name', `%${trimmedKeyword}%`)
      .order('product_name', { ascending: true })
      .limit(safeLimit)

    if (error) {
      throw error
    }

    return (data ?? []) as ProductWithMeta[]
  },
  async deleteProductById(tenantId: string, productId: string): Promise<void> {
    const dependencies = await getProductDeleteDependencies(
      client,
      tenantId,
      productId
    )
    const blockedDependencies = dependencies.filter(
      (dependency) => dependency.count > 0
    )

    if (blockedDependencies.length > 0) {
      throw createProductDeleteBlockedError(blockedDependencies)
    }

    const { data: existingUnits, error: unitsSnapshotError } = await client
      .from('product_units')
      .select(
        'tenant_id, product_id, unit_name, sell_price, cost_price, conversion_factor'
      )
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)

    if (unitsSnapshotError) {
      throw unitsSnapshotError
    }

    const unitsSnapshot: ProductUnitInsert[] = (existingUnits ?? []).map(
      (unit) => ({
        tenant_id: unit.tenant_id,
        product_id: unit.product_id,
        unit_name: unit.unit_name,
        sell_price: unit.sell_price,
        cost_price: unit.cost_price,
        conversion_factor: unit.conversion_factor,
      })
    )

    const { error: deleteUnitsError } = await client
      .from('product_units')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('product_id', productId)

    if (deleteUnitsError) {
      throw deleteUnitsError
    }

    const { data: deletedProducts, error: deleteProductError } = await client
      .from('products')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', productId)
      .select('id')

    if (deleteProductError) {
      if (unitsSnapshot.length > 0) {
        const { error: rollbackUnitsError } = await client
          .from('product_units')
          .insert(unitsSnapshot)

        if (rollbackUnitsError) {
          throw rollbackUnitsError
        }
      }

      if (deleteProductError.code === '23503') {
        const dependenciesAfterDeleteAttempt =
          await getProductDeleteDependencies(client, tenantId, productId)

        const blockedAfterDeleteAttempt = dependenciesAfterDeleteAttempt.filter(
          (dependency) => dependency.count > 0
        )

        if (blockedAfterDeleteAttempt.length > 0) {
          throw createProductDeleteBlockedError(blockedAfterDeleteAttempt)
        }
      }

      throw deleteProductError
    }

    if (!deletedProducts || deletedProducts.length === 0) {
      throw createProductDeleteNotFoundError()
    }
  },
})
