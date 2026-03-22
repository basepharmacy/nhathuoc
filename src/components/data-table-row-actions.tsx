import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  const content = (
    <div className='flex items-center gap-1'>
      {visibleActions.map((action) => {
        const Icon = action.icon
        const tooltipText = action.tooltip ?? action.label

        const button = (
          <Button
            variant='ghost'
            size='icon'
            className={`h-8 w-8 ${action.destructive ? 'text-red-500 hover:text-red-600' : ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <Icon size={16} />
            <span className='sr-only'>{action.label}</span>
          </Button>
        )

        return (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              {action.disabled ? (
                <span className='inline-flex'>{button}</span>
              ) : (
                button
              )}
            </TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )

  return wrapper ? wrapper(content) : content
}
