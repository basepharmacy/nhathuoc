import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { roles } from '../data/staff-data'
import { type StaffUser } from '../data/staff-schema'
import { DataTableRowActions } from './data-table-row-actions'

export const staffColumns: ColumnDef<StaffUser>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên nhân viên' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40'>{row.getValue('name')}</LongText>
    ),
    enableHiding: false,
    meta: { label: 'Tên nhân viên' },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số điện thoại' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40'>{row.getValue('phone') ?? '—'}</LongText>
    ),
    meta: { label: 'Số điện thoại' },
  },
  {
    id: 'role',
    accessorFn: (row) => row.role ?? 'STAFF',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Vai trò' />
    ),
    cell: ({ row }) => {
      const value = row.original.role ?? 'STAFF'
      const role = roles.find((item) => item.value === value)

      if (!role) return null

      return (
        <div className='flex items-center gap-2'>
          <role.icon className='h-4 w-4 text-muted-foreground' />
          <span>{role.label}</span>
        </div>
      )
    },
    meta: { label: 'Vai trò' },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'location',
    accessorFn: (row) => row.location?.id ?? 'ALL',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Chi nhánh' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40'>
        {row.original.location?.name ?? 'Toàn hệ thống'}
      </LongText>
    ),
    meta: { label: 'Chi nhánh' },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Địa chỉ' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-56'>{row.getValue('address') ?? '—'}</LongText>
    ),
    meta: { label: 'Địa chỉ' },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày tạo' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('created_at')
      return <div>{value ? new Date(String(value)).toLocaleDateString() : '—'}</div>
    },
    meta: { label: 'Ngày tạo' },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
