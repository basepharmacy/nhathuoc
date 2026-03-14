import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategories } from './categories-provider'
import { Can } from '@/components/permission-guard'

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()
  return (
    <Can feature='products' action='edit'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Thêm danh mục</span> <FolderPlus size={18} />
      </Button>
    </Can>
  )
}
