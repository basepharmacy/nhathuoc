import { BasePharmacySupabaseClient } from '../../client'
import { ProductMasterWithUnits } from '../model'

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

  async getBySource(params: {
    source: string
    search?: string
    pageIndex: number
    pageSize: number
  }): Promise<{ data: ProductMasterWithUnits[]; total: number }> {
    let query = client
      .from('product_masters')
      .select('*, product_master_units(*)', { count: 'exact' })
    //.eq('source', params.source)

    if (params.search?.trim()) {
      const s = params.search.trim()
      query = query.or(`product_name.ilike.%${s}%,regis_number.ilike.%${s}%,active_ingredient.ilike.%${s}%`)
    }

    query = query
      .order('product_name', { ascending: true })
      .range(
        params.pageIndex * params.pageSize,
        (params.pageIndex + 1) * params.pageSize - 1
      )

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return {
      data: (data ?? []) as ProductMasterWithUnits[],
      total: count ?? 0,
    }
  },
})
