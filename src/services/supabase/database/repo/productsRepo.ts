import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Product = Tables<'products'>
export type ProductInsert = TablesInsert<'products'>
export type ProductUpdate = TablesUpdate<'products'>

export const createProductRepository = (client: BasePharmacySupabaseClient) => ({
  async getAllProductsByTenantId(tenantId: string): Promise<Product[]> {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return data as Product[]
  },
  async createProduct(params: ProductInsert): Promise<Product> {
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
  async deleteProduct(productId: string): Promise<void> {
    const { error } = await client.from('products').delete().eq('id', productId)

    if (error) {
      throw error
    }
  },
})
