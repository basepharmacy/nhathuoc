import * as React from 'react'
import { ChevronsUpDown, Building2, Store, Warehouse } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import type { Location } from '@/services/supabase/database/model'

function getLocationIcon(type: Location['type']): React.ElementType {
  switch (type) {
    case '1_WAREHOUSE':
      return Warehouse
    case '2_STORE':
      return Store
    default:
      return Building2
  }
}

type LocationSwitcherProps = {
  locations: Location[]
}

export function LocationSwitcher({ locations }: LocationSwitcherProps) {
  const { isMobile } = useSidebar()
  const [activeLocation, setActiveLocation] = React.useState<Location | null>(
    locations[0] ?? null
  )

  React.useEffect(() => {
    if (locations.length > 0 && !activeLocation) {
      setActiveLocation(locations[0])
    }
  }, [locations])

  if (!activeLocation) {
    return null
  }

  const ActiveIcon = getLocationIcon(activeLocation.type)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                <ActiveIcon className='size-4' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{activeLocation.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {activeLocation.address ?? '—'}
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Chi nhánh
            </DropdownMenuLabel>
            {locations.map((location) => {
              const Icon = getLocationIcon(location.type)
              return (
                <DropdownMenuItem
                  key={location.id}
                  onClick={() => setActiveLocation(location)}
                  className='gap-2 p-2'
                >
                  <div className='flex size-6 items-center justify-center rounded-sm border'>
                    <Icon className='size-4 shrink-0' />
                  </div>
                  <div className='grid flex-1 text-sm leading-tight'>
                    <span className='truncate font-medium'>{location.name}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {location.address ?? '—'}
                    </span>
                  </div>
                </DropdownMenuItem>
              )
            })}
            {locations.length > 1 && <DropdownMenuSeparator />}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
