import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, UserPen } from 'lucide-react'
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
import { Can } from '@/components/permission-guard'
import { type StaffUser } from '../data/staff-schema'
import { useStaff } from './staff-provider'

type DataTableRowActionsProps = {
  row: Row<StaffUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStaff()
  const isOwner = row.original.role === 'OWNER'
  return (
    <Can feature='settings' action='edit'>
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
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original)
              setOpen('edit')
            }}
          >
            Chỉnh sửa
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  disabled={isOwner}
                  onClick={() => {
                    setCurrentRow(row.original)
                    setOpen('delete')
                  }}
                  className='text-red-500!'
                >
                  Xóa
                  <DropdownMenuShortcut>
                    <Trash2 size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {isOwner && (
              <TooltipContent side='left'>
                Không thể xoá tài khoản chủ hệ thống
              </TooltipContent>
            )}
          </Tooltip>
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  )
}
