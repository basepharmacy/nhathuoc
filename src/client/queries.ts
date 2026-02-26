import { queryOptions } from "@tanstack/react-query"
import {
  profilesRepo,
  tenantsRepo,
  locationsRepo,
  categoriesRepo,
  productsRepo,
} from '.'

export const getProfilesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      const profiles = await profilesRepo.getProfileByUserId(userId)
      return profiles
    },
  })

export const getTenantQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["tenants", tenantId],
    queryFn: async () => {
      const tenant = await tenantsRepo.getTenantById(tenantId)
      return tenant
    },
  })

export const getLocationsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["locations", tenantId],
    queryFn: async () => {
      const locations = await locationsRepo.getLocationsByTenantId(tenantId)
      return locations
    },
  })

export const getLocationQueryOptions = (locationId: string) =>
  queryOptions({
    queryKey: ["locations", locationId],
    queryFn: async () => {
      const location = await locationsRepo.getLocationById(locationId)
      return location
    },
  })

export const getCategoriesQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["categories", tenantId],
    queryFn: async () => {
      const categories = await categoriesRepo.getAllCategoriesByTenantId(tenantId)
      return categories
    },
  })

export const getProductsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["products", tenantId],
    queryFn: async () => {
      const products = await productsRepo.getProductsByTenantId(tenantId)
      return products
    },
  })
