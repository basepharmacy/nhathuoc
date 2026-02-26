import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSuppliers } from './suppliers-provider'

export function SuppliersPrimaryButtons() {
  const { setOpen } = useSuppliers()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm nhà cung cấp</span> <Building2 size={18} />
    </Button>
  )
}
