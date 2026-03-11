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
    <div className='flex shrink-0 items-center gap-1'>
      <TabsList className='shrink-0'>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className='group relative gap-1 pr-6'
          >
            {tab.label}
            {tabs.length > 1 && (
              <button
                type='button'
                className='absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-data-[state=active]:opacity-100'
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
                aria-label={`Đóng ${tab.label}`}
              >
                <X className='size-3' />
              </button>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

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
