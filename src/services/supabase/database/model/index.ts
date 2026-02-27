import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'
import type { Tenant } from '../repo/tenantsRepo'
import type { Location } from '../repo/locationsRepo'
import type { Supplier } from '../repo/suppliersRepo'
import type { Customer } from '../repo/customersRepo'
import type { Product } from '../repo/productsRepo'

export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type { Tenant, Location }
export type { Supplier }
export type { Customer }
export type { Product }
