import { type LinkProps } from '@tanstack/react-router'
import type { Location } from '@/services/supabase/database/model'
import type { Feature } from '@/lib/permissions'

type User = {
  name: string
  role: string
  avatar: string
}

type BaseNavItem = {
  title: string
  badge?: string
  icon?: React.ElementType
  feature?: Feature
}

type NavLink = BaseNavItem & {
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  locations: Location[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
