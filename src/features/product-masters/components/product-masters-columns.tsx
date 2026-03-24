import { type ColumnDef } from '@tanstack/react-table'
import { CheckCircle2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/ui/long-text'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductMasterWithUnits, ProductMasterUnit } from '@/services/supabase/database/repo/productMastersRepo'

const getBaseUnit = (master: ProductMasterWithUnits) =>
  master.product_master_units?.find((u) => u.is_base_unit) ??
  master.product_master_units?.[0]

function getUnitLabel(unit: ProductMasterUnit, baseUnitName: string) {
  if (unit.is_base_unit) return unit.unit_name
  return `${unit.unit_name} (${unit.conversion_factor} ${baseUnitName})`
}

export const productMastersColumns: ColumnDef<ProductMasterWithUnits>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Chon tat ca'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        disabled={!row.getCanSelect()}
        aria-label='Chon hang'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { className: 'w-[40px]' },
  },
  {
    accessorKey: 'product_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên thuốc' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-72'>
        {row.getValue('product_name')}
      </LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'regis_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số đăng ký' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('regis_number') as string | null
      return <span className='text-sm'>{value ?? '—'}</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'active_ingredient',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hoạt chất' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('active_ingredient') as string | null
      return (
        <LongText className='max-w-56'>
          {value ?? '—'}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    id: 'base_unit_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đơn vị' />
    ),
    cell: ({ row }) => {
      const units = row.original.product_master_units ?? []
      const baseUnit = getBaseUnit(row.original)
      const baseUnitName = baseUnit?.unit_name ?? ''

      if (units.length === 0) return <span className='text-sm'>—</span>

      return (
        <Select defaultValue={baseUnit?.id}>
          <SelectTrigger size='sm' className='h-7 text-xs border-none shadow-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:border-none'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {getUnitLabel(unit, baseUnitName)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'made_company_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Hãng sản xuất' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('made_company_name') as string | null
      return (
        <LongText className='max-w-48'>
          {value ?? '—'}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tình trạng' />
    ),
    cell: ({ row, table }) => {
      const addedRegisNumbers = (table.options.meta as { addedRegisNumbers?: Set<string> })?.addedRegisNumbers
      const regis = row.original.regis_number
      const isAdded = !!regis && !!addedRegisNumbers?.has(regis)
      return isAdded ? (
        <span className='inline-flex items-center gap-1 text-sm text-green-700'>
          <CheckCircle2 className='h-4 w-4' />
          Đã thêm
        </span>
      ) : (
        <span className='inline-flex items-center gap-1 text-sm text-muted-foreground'>
          Chưa thêm
        </span>
      )
    },
    enableSorting: false,
  },
]
