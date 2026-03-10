import { type ReactNode } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type LucideIcon } from 'lucide-react'
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

export type RowAction = {
  label: string
  icon: LucideIcon
  onClick: () => void
  disabled?: boolean
  tooltip?: string
  destructive?: boolean
  hidden?: boolean
}

type DataTableRowActionsProps = {
  actions: RowAction[]
  wrapper?: (children: ReactNode) => ReactNode
}

export function DataTableRowActions({
  actions,
  wrapper,
}: DataTableRowActionsProps) {
  const visibleActions = actions.filter((a) => !a.hidden)

  if (visibleActions.length === 0) return null

  const menu = (
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
        {visibleActions.map((action, index) => {
          const Icon = action.icon
          const item = (
            <DropdownMenuItem
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.destructive ? 'text-red-500!' : undefined}
            >
              {action.label}
              <DropdownMenuShortcut>
                <Icon size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )

          const withTooltip =
            action.disabled && action.tooltip ? (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <div>{item}</div>
                </TooltipTrigger>
                <TooltipContent side='left'>{action.tooltip}</TooltipContent>
              </Tooltip>
            ) : (
              item
            )

          return (
            <div key={action.label}>
              {index > 0 && <DropdownMenuSeparator />}
              {withTooltip}
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return wrapper ? wrapper(menu) : menu
}
