import { type Table as ReactTable } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'

type DataTableSkeletonRowsProps<TData> = {
  table: ReactTable<TData>
  rows?: number
}

export function DataTableSkeletonRows<TData>({
  table,
  rows = 10,
}: DataTableSkeletonRowsProps<TData>) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={`skeleton-${i}`}>
      {table.getAllLeafColumns().map((col) => (
        <TableCell key={col.id} className={cn(col.columnDef.meta?.className)}>
          <Skeleton className='h-5 w-full' />
        </TableCell>
      ))}
    </TableRow>
  ))
}
