import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>

export const createCategoryRepository = (client: BasePharmacySupabaseClient) => ({
  async getAllCategoriesByTenantId(tenantId: string): Promise<Category[]> {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })
    if (error) {
      throw error
    }

    return data as Category[]
  },
  async createCategory(params: CategoryInsert): Promise<Category> {
    console.log("Creating category with params:", params)
    const { data, error } = await client
      .from('categories')
      .insert({
        tenant_id: params.tenant_id,
        name: params.name,
        description: params.description,
      })
      .select()
      .single()

    console.log("Created category with data:", data)
    if (error) {
      throw error
    }

    return data as Category
  },
  async updateCategory(categoryId: string, params: CategoryUpdate): Promise<Category> {
    const { data, error } = await client
      .from('categories')
      .update({
        name: params.name,
        description: params.description,
      })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Category
  },
  async deleteCategory(categoryId: string): Promise<void> {
    console.log("Deleting category with id:", categoryId)
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      throw error
    }
  }
})
