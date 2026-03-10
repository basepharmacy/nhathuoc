import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Category = Tables<'categories'>
export type CategoryInsert = TablesInsert<'categories'>
export type CategoryUpdate = TablesUpdate<'categories'>
export type CategoryWithActiveProductsCount = Category & {
  active_products_count: number
}

export const createCategoryRepository = (client: BasePharmacySupabaseClient) => ({
  async getCategories(tenantId: string): Promise<Category[]> {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []) as Category[]
  },
  // TODO: Cần tạo rpc để lấy kèm số lượng sản phẩm đang active trong mỗi category để tránh việc phải query 2 lần như hiện tại
  async getCategoriesWithActiveProductsCount(
    tenantId: string
  ): Promise<CategoryWithActiveProductsCount[]> {
    const { data: categories, error: categoriesError } = await client
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (categoriesError) {
      throw categoriesError
    }

    const { data: activeProducts, error: productsError } = await client
      .from('products')
      .select('category_id')
      .eq('tenant_id', tenantId)
      .eq('status', '2_ACTIVE')
      .not('category_id', 'is', null)

    if (productsError) {
      throw productsError
    }

    const activeCountByCategory = (activeProducts ?? []).reduce<Record<string, number>>(
      (acc, product) => {
        const categoryId = product.category_id as string | null
        if (!categoryId) return acc
        acc[categoryId] = (acc[categoryId] ?? 0) + 1
        return acc
      },
      {}
    )

    return (categories ?? []).map((category) => ({
      ...category,
      active_products_count: activeCountByCategory[category.id] ?? 0,
    })) as CategoryWithActiveProductsCount[]
  },
  async createCategory(params: CategoryInsert): Promise<Category> {
    const { data, error } = await client
      .from('categories')
      .insert({
        tenant_id: params.tenant_id,
        name: params.name,
        description: params.description,
      })
      .select()
      .single()

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
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      throw error
    }
  }
})
