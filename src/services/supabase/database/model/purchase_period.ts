// ─── Purchase Period ─────────────────────────────────────────────────
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
