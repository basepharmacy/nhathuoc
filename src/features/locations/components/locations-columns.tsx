import { type ColumnDef } from '@tanstack/react-table'
import { cn, includesSearchValue } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { locationStatusLabels, locationTypeLabels } from '../data/schema'
import { type Location } from '@/services/supabase'
import { DataTableRowActions } from './data-table-row-actions'

const locationStatusColors: Record<Location['status'], string> = {
  '1_ACTIVE': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '2_INACTIVE': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
}

export const getLocationsColumns = (): ColumnDef<Location>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên cửa hàng' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-56'>
        {row.getValue('name')}
      </LongText>
    ),
    meta: { label: 'Tên cửa hàng' },
    filterFn: (row, id, value) =>
      includesSearchValue(String(row.getValue(id) ?? ''), String(value ?? '')),
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loại' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as Location['type']
      return <span className='text-sm'>{locationTypeLabels[type]}</span>
    },
    meta: { label: 'Loại' },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Địa chỉ' />
    ),
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null
      return (
        <LongText className='max-w-48'>
          {address ?? '—'}
        </LongText>
      )
    },
    meta: { label: 'Địa chỉ' },
    enableSorting: false,
    filterFn: (row, id, value) =>
      includesSearchValue(String(row.getValue(id) ?? ''), String(value ?? '')),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Điện thoại' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      return <span className='text-sm'>{phone ?? '—'}</span>
    },
    meta: { label: 'Điện thoại' },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Location['status']
      return (
        <div className='flex space-x-2'>
          <Badge
            variant='outline'
            className={cn('text-sm font-medium', locationStatusColors[status])}
          >
            {locationStatusLabels[status]}
          </Badge>
        </div>
      )
    },
    meta: { label: 'Trạng thái' },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
