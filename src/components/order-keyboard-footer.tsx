import { cn } from '@/lib/utils'

type ShortcutItem = {
  key: string
  label: string
  icon?: React.ReactNode
}

type OrderKeyboardFooterProps = {
  shortcuts: ShortcutItem[]
  className?: string
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className='inline-flex h-5 min-w-5 items-center justify-center rounded bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground'>
      {children}
    </kbd>
  )
}

export function OrderKeyboardFooter({
  shortcuts,
  className,
}: OrderKeyboardFooterProps) {
  return (
    <footer
      className={cn(
        'sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        className
      )}
    >
      <div className='flex h-10 items-center gap-4 overflow-x-auto px-4 text-xs text-muted-foreground sm:gap-6'>
        {shortcuts.map((shortcut, index) => (
          <div key={index} className='flex shrink-0 items-center gap-1.5'>
            {shortcut.icon ? (
              <span className='flex items-center'>{shortcut.icon}</span>
            ) : (
              <Kbd>{shortcut.key}</Kbd>
            )}
            <span>{shortcut.label}</span>
          </div>
        ))}
      </div>
    </footer>
  )
}
