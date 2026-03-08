import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type SaleOrderWithRelations } from '@/services/supabase/database/repo/saleOrdersRepo'

type SaleOrdersHistoryRowActionsProps = {
  row: Row<SaleOrderWithRelations>
  onEdit: (order: SaleOrderWithRelations) => void
  onDelete: (order: SaleOrderWithRelations) => void
}

export function SaleOrdersHistoryRowActions({
  row,
  onEdit,
  onDelete,
}: SaleOrdersHistoryRowActionsProps) {
  const isDraft = row.original.status === '1_DRAFT'
  const primaryLabel = isDraft ? 'Chỉnh sửa' : 'Xem chi tiết'
  const PrimaryIcon = isDraft ? Pencil : Eye

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={() => onEdit(row.original)}>
          {primaryLabel}
          <DropdownMenuShortcut>
            <PrimaryIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <DropdownMenuItem
                onClick={() => onDelete(row.original)}
                disabled={!isDraft}
                className='text-red-500!'
              >
                Xóa
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </div>
          </TooltipTrigger>
          {!isDraft && (
            <TooltipContent side='left'>
              Chỉ được phép xoá đơn nháp
            </TooltipContent>
          )}
        </Tooltip>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
