import type { BasePharmacySupabaseClient } from '../../client'
import type { Enums, Tables, TablesInsert, TablesUpdate } from '../../database.types'

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

export const createProductsRepository = (client: BasePharmacySupabaseClient) => ({
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
  async searchByName(
    tenantId: string,
    keyword: string,
    limit = 10
  ): Promise<ProductWithMeta[]> {
    const trimmedKeyword = keyword.trim()
    if (trimmedKeyword.length === 0) {
      return []
    }

    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10

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
})
