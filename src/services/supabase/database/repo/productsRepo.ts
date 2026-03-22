import { BasePharmacySupabaseClient } from '../../client'
import { Product, ProductInsert, ProductUnit, ProductUnitInsert, ProductUpdate, ProductWithUnits } from '../model'

export const createProductRepository = (client: BasePharmacySupabaseClient) => {
  const insertProduct = async (params: ProductInsert): Promise<Product> => {
    const { data, error } = await client
      .from('products')
      .insert({
        tenant_id: params.tenant_id,
        product_name: params.product_name,
        product_type: params.product_type,
        status: params.status,
        category_id: params.category_id ?? null,
        min_stock: params.min_stock ?? null,
        active_ingredient: params.active_ingredient ?? null,
        regis_number: params.regis_number ?? null,
        jan_code: params.jan_code ?? null,
        made_company_name: params.made_company_name ?? null,
        sale_company_name: params.sale_company_name ?? null,
        description: params.description ?? null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Product
  }

  const repo = {
    async getAllProductsByTenantId(
      tenantId: string
    ): Promise<ProductWithUnits[]> {
      const { data, error } = await client
        .from('products')
        .select(
          '*, product_units(id, unit_name, conversion_factor, cost_price, sell_price, is_base_unit)'
        )
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return data as ProductWithUnits[]
    },
    async getProductUnitsByProductId(productId: string): Promise<ProductUnit[]> {
      const { data, error } = await client
        .from('product_units')
        .select('*')
        .eq('product_id', productId)
        .order('is_base_unit', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return (data ?? []) as ProductUnit[]
    },
    async createProduct(params: ProductInsert): Promise<Product> {
      return insertProduct(params)
    },
    async createProductWithUnits(params: {
      product: ProductInsert
      units: Array<
        Omit<ProductUnitInsert, 'product_id' | 'tenant_id'> & {
          is_base_unit?: boolean
        }
      >
    }): Promise<Product> {
      const product = await insertProduct(params.product)

      const unitsPayload = params.units.map((unit) => ({
        ...unit,
        product_id: product.id,
        tenant_id: params.product.tenant_id,
        is_base_unit: unit.is_base_unit ?? false,
      }))

      const { error } = await client.from('product_units').insert(unitsPayload)

      if (error) {
        throw error
      }

      return product
    },
    async updateProduct(productId: string, params: ProductUpdate): Promise<Product> {
      const { data, error } = await client
        .from('products')
        .update({
          product_name: params.product_name,
          product_type: params.product_type,
          status: params.status,
          category_id: params.category_id ?? null,
          min_stock: params.min_stock ?? null,
          active_ingredient: params.active_ingredient ?? null,
          regis_number: params.regis_number ?? null,
          jan_code: params.jan_code ?? null,
          made_company_name: params.made_company_name ?? null,
          sale_company_name: params.sale_company_name ?? null,
          description: params.description ?? null,
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as Product
    },
    async updateProductWithUnits(params: {
      productId: string
      product: ProductUpdate
      tenantId: string
      units: Array<Omit<ProductUnitInsert, 'product_id' | 'tenant_id'> & { id?: string }>
    }): Promise<Product> {
      const product = await repo.updateProduct(params.productId, params.product)

      // Fetch existing units
      const existingUnits = await repo.getProductUnitsByProductId(params.productId)
      const existingIds = new Set(existingUnits.map((u) => u.id))
      const incomingIds = new Set(params.units.filter((u) => u.id).map((u) => u.id!))

      // Delete units that were removed
      const toDelete = existingUnits.filter((u) => !incomingIds.has(u.id))
      if (toDelete.length > 0) {
        const { error } = await client
          .from('product_units')
          .delete()
          .in('id', toDelete.map((u) => u.id))
        if (error) throw error
      }

      // Update existing units
      const toUpdate = params.units.filter((u) => u.id && existingIds.has(u.id))
      for (const unit of toUpdate) {
        const { id, ...fields } = unit
        const { error } = await client
          .from('product_units')
          .update(fields)
          .eq('id', id!)
        if (error) throw error
      }

      // Insert new units
      const toInsert = params.units.filter((u) => !u.id)
      if (toInsert.length > 0) {
        const payload = toInsert.map((unit) => ({
          ...unit,
          product_id: params.productId,
          tenant_id: params.tenantId,
        }))
        const { error } = await client.from('product_units').insert(payload)
        if (error) throw error
      }

      return product
    },
    async createBatchProducts(params: (ProductInsert & { id: string })[]): Promise<Product[]> {
      const rows = params.map((p) => ({
        id: p.id,
        tenant_id: p.tenant_id,
        product_name: p.product_name,
        product_type: p.product_type,
        status: p.status,
        category_id: p.category_id ?? null,
        min_stock: p.min_stock ?? null,
        active_ingredient: p.active_ingredient ?? null,
        regis_number: p.regis_number ?? null,
        jan_code: p.jan_code ?? null,
        made_company_name: p.made_company_name ?? null,
        sale_company_name: p.sale_company_name ?? null,
        description: p.description ?? null,
      }))

      const { data, error } = await client
        .from('products')
        .insert(rows)
        .select()

      if (error) {
        throw error
      }

      return (data ?? []) as Product[]
    },
    async createBatchProductUnits(params: ProductUnitInsert[]): Promise<ProductUnit[]> {
      const { data, error } = await client
        .from('product_units')
        .insert(params)
        .select()

      if (error) {
        throw error
      }

      return (data ?? []) as ProductUnit[]
    },
    async deleteProduct(productId: string): Promise<void> {
      const { error } = await client.from('products').delete().eq('id', productId)

      if (error) {
        throw error
      }
    },
    async updateProductUnitCostPrice(unitId: string, costPrice: number): Promise<void> {
      const { error } = await client
        .from('product_units')
        .update({ cost_price: costPrice })
        .eq('id', unitId)

      if (error) {
        throw error
      }
    },

    async updateProductUnitSellPrice(unitId: string, sellPrice: number): Promise<void> {
      const { error } = await client
        .from('product_units')
        .update({ sell_price: sellPrice })
        .eq('id', unitId)

      if (error) {
        throw error
      }
    },
  }

  return repo
}
