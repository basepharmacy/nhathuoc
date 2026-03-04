import { useMemo } from 'react'
import { buildVietQrUrl } from '@/lib/viet-qr'
import { cn } from '@/lib/utils'

interface VietQrImageProps {
  bankBin: string
  accountNumber: string
  accountHolder: string
  amount?: number
  note?: string
  size?: number
  className?: string
}

export function VietQrImage({
  bankBin,
  accountNumber,
  accountHolder,
  amount,
  note,
  size = 220,
  className,
}: VietQrImageProps) {
  const qrUrl = useMemo(
    () => buildVietQrUrl(bankBin, accountNumber, accountHolder, amount, note),
    [bankBin, accountNumber, accountHolder, amount, note]
  )

  return (
    <img
      src={qrUrl}
      alt='VietQR thanh toán'
      width={size}
      height={size}
      className={cn('rounded-lg border', className)}
    />
  )
}
