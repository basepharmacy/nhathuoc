import { WifiOff } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useOfflineMutations } from '@/hooks/use-offline-mutations'

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus()
  const { mutations } = useOfflineMutations()
  const navigate = useNavigate()

  if (isOnline && mutations.length === 0) return null

  const handleClick = () => {
    if (mutations.length > 0) {
      navigate({ to: '/sale-orders/history' })
    }
  }

  return (
    <div className='fixed bottom-4 left-1/2 z-[100] -translate-x-1/2'>
      <button
        type='button'
        onClick={handleClick}
        disabled={mutations.length === 0}
        className='flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-lg transition-opacity hover:opacity-90 disabled:cursor-default disabled:hover:opacity-100'
      >
        <WifiOff className='h-4 w-4' />
        <span>
          {!isOnline ? 'Đang offline' : 'Đang đồng bộ'}
          {mutations.length > 0 && ` - ${mutations.length} đơn chờ đồng bộ`}
          {mutations.length === 0 && ' - Dữ liệu sẽ đồng bộ khi có mạng'}
        </span>
      </button>
    </div>
  )
}
