import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus()
  console.log('Online status:', isOnline) // Debug log

  if (isOnline) return null

  return (
    <div className='fixed bottom-4 left-1/2 z-[100] -translate-x-1/2'>
      <div className='flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-lg'>
        <WifiOff className='h-4 w-4' />
        <span>Đang offline - Dữ liệu sẽ đồng bộ khi có mạng</span>
      </div>
    </div>
  )
}
