import type { BasePharmacySupabaseClient } from '../../client'
import type { Enums } from '../../database.types'

export type CreateUserRequest = {
  email: string
  password: string
  name: string
  phone?: string
  address?: string
  location_id?: string
  description?: string
  role: Enums<'staff_role'>
  login_id?: string
}

export const createUserAccountsRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async createUser(payload: CreateUserRequest): Promise<unknown> {
    const { data, error } = await client.functions.invoke('create-user', {
      body: payload,
    })

    if (error) {
      throw error
    }

    return data ?? null
  },
  async deleteUser(userId: string): Promise<unknown> {
    const { data, error } = await client.functions.invoke('delete-user', {
      body: { user_id: userId },
    })

    if (error) {
      throw error
    }

    return data ?? null
  },
})
