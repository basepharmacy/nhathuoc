import { useEffect, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  searchDebounceMs?: number
  hideViewOptions?: boolean
  filters?: {
    columnId: string
    title: string
    singleSelect?: boolean
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  rightContent?: React.ReactNode
  extraIsFiltered?: boolean
  onReset?: () => void
}

function useDebouncedSearch<TData>(
  table: Table<TData>,
  searchKey: string | undefined,
  debounceMs: number,
) {
  const filterValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')
    : (table.getState().globalFilter ?? '')

  const [localValue, setLocalValue] = useState(filterValue)
  const debouncedValue = useDebouncedValue(localValue, debounceMs)

  // Debounced local → table filter
  useEffect(() => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(debouncedValue)
    } else {
      table.setGlobalFilter(debouncedValue)
    }
  }, [debouncedValue, table, searchKey])

  // Sync external changes (e.g. reset button) → local
  useEffect(() => {
    setLocalValue(filterValue)
  }, [filterValue])

  return { localValue, setLocalValue }
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  searchDebounceMs = 300,
  hideViewOptions = false,
  filters = [],
  rightContent,
  extraIsFiltered = false,
  onReset,
}: DataTableToolbarProps<TData>) {
  const { localValue, setLocalValue } = useDebouncedSearch(
    table,
    searchKey,
    searchDebounceMs,
  )

  const isFiltered =
    localValue.length > 0 ||
    table.getState().columnFilters.length > 0 ||
    table.getState().globalFilter ||
    extraIsFiltered

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder={searchPlaceholder}
          value={localValue}
          onChange={(event) => setLocalValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {filters.length > 0 && (
          <span className='text-sm text-muted-foreground whitespace-nowrap'>Bộ lọc:</span>
        )}
        <div className='flex gap-x-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)
            if (!column) return null
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                singleSelect={filter.singleSelect}
                options={filter.options}
              />
            )
          })}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              setLocalValue('')
              table.resetColumnFilters()
              table.setGlobalFilter('')
              onReset?.()
            }}
            className='h-8 px-2 lg:px-3'
          >
            Xoá bộ lọc
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      {rightContent}
      {!hideViewOptions && <DataTableViewOptions table={table} />}
    </div>
  )
}
