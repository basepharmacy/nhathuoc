import { Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function StockAdjustmentsPrimaryButtons() {
  return (
    <Button className='space-x-1' asChild>
      <Link to='/inventory/adjustments/new'>
        <span>Thêm điều chỉnh</span> <Plus size={18} />
      </Link>
    </Button>
  )
}
