import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function Logo({ className }: Props) {
  return (
    <img
      src='/images/favicon.svg'
      alt='Logo'
      className={cn('size-30', className)}
    />
  )
}
