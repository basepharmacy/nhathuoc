import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStockAdjustments } from './stock-adjustments-provider'

export function StockAdjustmentsPrimaryButtons() {
  const { setOpen } = useStockAdjustments()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm điều chỉnh</span> <Plus size={18} />
    </Button>
  )
}
