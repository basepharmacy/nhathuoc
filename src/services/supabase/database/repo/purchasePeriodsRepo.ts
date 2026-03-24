import { BasePharmacySupabaseClient } from '../../client'

export type PurchasePeriod = {
  id: number
  name: string | null
  number: number
  from_date: string
  to_date: string
  tenant_id: string
  created_at: string | null
  updated_at: string | null
}

export const createPurchasePeriodRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getPurchasePeriodsByTenantId(
      tenantId: string
    ): Promise<PurchasePeriod[]> {
      const { data, error } = await client
        .from('purchase_periods')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('number', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as PurchasePeriod[]
    },

    async createPurchasePeriod(params: {
      tenantId: string
      fromDate: string
    }): Promise<PurchasePeriod> {
      // Get the latest period to determine the next number
      const { data: latest, error: latestError } = await client
        .from('purchase_periods')
        .select('number, id')
        .eq('tenant_id', params.tenantId)
        .order('number', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestError) {
        throw latestError
      }

      const nextNumber = (latest?.number ?? 0) + 1

      // Update to_date of the current (latest) period to today
      if (latest) {
        const { error: updateError } = await client
          .from('purchase_periods')
          .update({ to_date: params.fromDate })
          .eq('id', latest.id)

        if (updateError) {
          throw updateError
        }
      }

      // Create the new period
      const { data, error } = await client
        .from('purchase_periods')
        .insert({
          tenant_id: params.tenantId,
          number: nextNumber,
          from_date: params.fromDate,
          to_date: '9999-12-31',
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as PurchasePeriod
    },
  }
}
