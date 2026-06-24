import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export type Tab = { id: string; label: string }

type SaleOrderTabControlsProps = {
  tabs: Tab[]
  orderId?: string
  onCloseTab: (tabId: string) => void
  onAddTab: () => void
}

export function SaleOrderTabControls({
  tabs,
  orderId,
  onCloseTab,
  onAddTab,
}: SaleOrderTabControlsProps) {
  return (
    <div className='flex min-w-0 items-center gap-1'>
      <div className='min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        <TabsList className='w-max'>
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className='group relative flex-none gap-1 pr-6'
            >
              {`Đơn ${index + 1}`}
              {tabs.length > 1 && (
                <button
                  type='button'
                  className='absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-data-[state=active]:opacity-100'
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab(tab.id)
                  }}
                  aria-label={`Đóng đơn ${index + 1}`}
                >
                  <X className='size-3' />
                </button>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {!orderId && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 shrink-0'
          onClick={onAddTab}
          aria-label='Thêm đơn mới'
        >
          <Plus className='size-4' />
        </Button>
      )}
    </div>
  )
}
