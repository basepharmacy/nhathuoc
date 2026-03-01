import { Skeleton } from '@/components/ui/skeleton'

export type DataTableSkeletonProps = {
  rows?: number
  columns?: number
  showToolbar?: boolean
}

export function DataTableSkeleton({
  rows = 6,
  columns = 4,
  showToolbar = true,
}: DataTableSkeletonProps) {
  const headerColumns = Array.from({ length: columns })
  const bodyRows = Array.from({ length: rows })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {showToolbar && (
        <div className='flex flex-wrap items-center gap-2'>
          <Skeleton className='h-9 w-64' />
          <Skeleton className='h-9 w-28 sm:ms-auto' />
        </div>
      )}
      <div className='overflow-hidden rounded-md border'>
        <div className='space-y-3 p-4'>
          <div className='flex items-center gap-3'>
            {headerColumns.map((_, index) => (
              <Skeleton key={`header-${index}`} className='h-5 flex-1' />
            ))}
          </div>
          {bodyRows.map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className='flex items-center gap-3'>
              {headerColumns.map((_, colIndex) => (
                <Skeleton
                  key={`cell-${rowIndex}-${colIndex}`}
                  className='h-9 flex-1'
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
