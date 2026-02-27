export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(Math.max(0, value))

export const normalizeNumber = (value: string) => {
  if (!value) return 0
  const normalized = value.replace(/[^0-9]/g, '')
  return normalized ? Number(normalized) : 0
}
