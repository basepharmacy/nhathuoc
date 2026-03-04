export function buildVietQrUrl(
  bankBin: string,
  accountNumber: string,
  accountHolder: string,
  amount?: number,
  note?: string
) {
  const safeAmount =
    amount != null && Number.isFinite(amount) && amount > 0 ? amount : 0
  const params = new URLSearchParams()
  if (safeAmount > 0) params.set('amount', String(safeAmount))
  if (note) params.set('addInfo', note)
  params.set('accountName', accountHolder)
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?${params.toString()}`
}
