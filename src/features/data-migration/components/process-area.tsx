import { useState } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { ProcessLog } from '../utils/types'

export function ProcessArea({
  isProcessing,
  progress,
  logs,
}: {
  isProcessing: boolean
  progress: number
  logs: ProcessLog[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const latestLog = logs[logs.length - 1]

  if (!isProcessing && logs.length === 0) return null

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            {isProcessing && (
              <Loader2 className='size-4 animate-spin' />
            )}
            {!isProcessing && progress >= 100 && (
              <Check className='size-4 text-green-600' />
            )}
            {isProcessing ? 'Đang xử lý...' : 'Hoàn tất'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Progress bar */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Tiến trình</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress >= 100 ? 'bg-green-500' : 'bg-primary'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Latest log + expandable details */}
          {logs.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className='flex items-center justify-between rounded-md bg-muted/50 px-3 py-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      latestLog.type === 'success' && 'bg-green-500',
                      latestLog.type === 'info' && 'bg-blue-500',
                      latestLog.type === 'error' && 'bg-red-500'
                    )}
                  />
                  <span className='text-muted-foreground'>
                    {latestLog.message}
                  </span>
                </div>
                {logs.length > 1 && (
                  <CollapsibleTrigger asChild>
                    <Button variant='ghost' size='sm' className='h-auto px-2 py-1 text-xs'>
                      {isOpen ? 'Ẩn bớt' : 'Xem chi tiết'}
                      <ChevronDown
                        className={cn(
                          'size-3 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              <CollapsibleContent>
                <div className='mt-1 max-h-48 space-y-0.5 overflow-y-auto rounded-md border bg-muted/30 p-2'>
                  {logs
                    .slice(0, -1)
                    .reverse()
                    .map((log, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-2 px-1 py-0.5 text-xs text-muted-foreground'
                      >
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            log.type === 'success' && 'bg-green-500',
                            log.type === 'info' && 'bg-blue-500',
                            log.type === 'error' && 'bg-red-500'
                          )}
                        />
                        <span>{log.message}</span>
                      </div>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
