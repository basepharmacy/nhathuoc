import { type ColumnDef, type CellContext } from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { bankByBin } from '@/components/bank-combobox'
import { Switch } from '@/components/ui/switch'
import { bankAccountsRepo } from '@/client'
import { useUser } from '@/client/provider'
import { type BankAccount } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

function DefaultToggleCell({ row }: CellContext<BankAccount, unknown>) {
  const isDefault = !!row.original.is_default
  const queryClient = useQueryClient()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      bankAccountsRepo.setDefaultBankAccount(row.original.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', tenantId] })
      toast.success('Đã cập nhật tài khoản mặc định')
    },
    onError: () => {
      toast.error('Không thể cập nhật tài khoản mặc định')
    },
  })

  return (
    <Switch
      checked={isDefault}
      onCheckedChange={() => {
        if (!isDefault) mutate()
      }}
      disabled={isPending || isDefault}
      aria-label='Đặt làm mặc định'
    />
  )
}

export const bankAccountsColumns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: 'bank_bin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngân hàng' />
    ),
    cell: ({ row }) => {
      const bin = row.getValue('bank_bin') as string
      const bank = bankByBin.get(bin)
      return (
        <span className='max-w-48 ps-3 font-medium'>
          {bank?.shortName || bank?.name || bin}
        </span>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    filterFn: (row, _id, value) => {
      if (Array.isArray(value)) {
        return value.includes(row.original.bank_bin)
      }
      return true
    },
    enableHiding: false,
  },
  {
    accessorKey: 'account_number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số tài khoản' />
    ),
    cell: ({ row }) => (
      <span className='text-sm font-mono'>
        {row.getValue('account_number')}
      </span>
    ),
    meta: { label: 'Số tài khoản' },
  },
  {
    accessorKey: 'account_holder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Chủ tài khoản' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{row.getValue('account_holder')}</span>
    ),
    meta: { label: 'Chủ tài khoản' },
  },
  {
    accessorKey: 'is_default',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mặc định' />
    ),
    cell: DefaultToggleCell,
    meta: { label: 'Mặc định' },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
