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
import { useLocationContext } from '@/context/location-provider'
import { usePermissions } from '@/hooks/use-permissions'
import type { Location } from '@/services/supabase/database/model'

const statusColorMap: Record<Location['status'], string> = {
  '1_ACTIVE': 'bg-green-500',
  '2_INACTIVE': 'bg-red-500',
  '3_CLOSED': 'bg-gray-400',
}

function StatusDot({ status }: { status: Location['status'] }) {
  return (
    <span
      className={`inline-block size-2 shrink-0 rounded-full ${statusColorMap[status]}`}
    />
  )
}

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
  const { selectedLocation, setSelectedLocationId, setLocations } = useLocationContext()
  const { locationScope } = usePermissions()

  // Sync locations from sidebar data into the context
  React.useEffect(() => {
    if (locations.length > 0) {
      setLocations(locations)
    }
  }, [locations, setLocations])

  const ActiveIcon = selectedLocation
    ? getLocationIcon(selectedLocation.type)
    : Building2

  // STAFF: chỉ hiển thị location của mình, không cho chuyển
  if (locationScope === 'own') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' className='cursor-default'>
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <ActiveIcon className='size-4' />
            </div>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {selectedLocation?.name ?? 'Chưa gán chi nhánh'}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {selectedLocation?.address ?? '—'}
              </span>
            </div>
            {selectedLocation && <StatusDot status={selectedLocation.status} />}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

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
                <span className='truncate font-semibold'>
                  {selectedLocation?.name ?? 'Toàn hệ thống'}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {selectedLocation?.address ?? 'Tất cả chi nhánh'}
                </span>
              </div>
              {selectedLocation && <StatusDot status={selectedLocation.status} />}
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
              Toàn hệ thống
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setSelectedLocationId(null)}
              className='gap-2 p-2'
            >
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Building2 className='size-4 shrink-0' />
              </div>
              <div className='grid flex-1 text-sm leading-tight'>
                <span className='truncate font-medium'>Toàn hệ thống</span>
                <span className='truncate text-xs text-muted-foreground'>
                  Tất cả chi nhánh
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Chi nhánh
            </DropdownMenuLabel>
            {locations.map((location) => {
              const Icon = getLocationIcon(location.type)
              return (
                <DropdownMenuItem
                  key={location.id}
                  onClick={() => setSelectedLocationId(location.id)}
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
                  <StatusDot status={location.status} />
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
