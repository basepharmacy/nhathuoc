import { queryOptions } from "@tanstack/react-query"
import { profilesRepo } from '..'

export const getProfilesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      const profiles = await profilesRepo.getProfileByUserId(userId)
      return profiles
    },
    staleTime: 10 * 60 * 1000, // 10 min — rarely changes, critical for app bootstrap
  })

export const getStaffUsersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['staff-users', tenantId],
    queryFn: async () => {
      const profiles = await profilesRepo.getProfilesByTenantId(tenantId)
      return profiles
    },
  })
