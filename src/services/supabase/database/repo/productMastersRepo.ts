import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'

export type ProductMaster = Tables<'product_masters'>
export type ProductMasterUnit = Tables<'product_master_units'>
export type ProductMasterWithUnits = ProductMaster & {
  product_master_units: ProductMasterUnit[]
}

export const createProductMasterRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async searchByName(
    query: string,
    limit = 10
  ): Promise<ProductMasterWithUnits[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const { data, error } = await client
      .from('product_masters')
      .select('*, product_master_units(*)')
      .ilike('product_name', `%${trimmed}%`)
      .limit(limit)

    if (error) {
      throw error
    }

    return (data ?? []) as ProductMasterWithUnits[]
  },
})
