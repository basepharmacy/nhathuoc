import { PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Can } from '@/components/permission-guard'
import { useProducts } from './products-provider'

export function ProductsPrimaryButtons() {
  const { setOpen } = useProducts()
  return (
    <Can feature='products' action='edit'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Thêm sản phẩm</span> <PackagePlus size={18} />
      </Button>
    </Can>
  )
}
