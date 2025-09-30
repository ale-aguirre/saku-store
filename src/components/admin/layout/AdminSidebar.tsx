'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  BarChart3,
  Zap,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: 'Productos',
    href: '/admin/productos',
    icon: Package
  },
  {
    name: 'Pedidos',
    href: '/admin/pedidos',
    icon: ShoppingCart
  },
  {
    name: 'Clientes',
    href: '/admin/clientes',
    icon: Users
  },
  {
    name: 'Cupones',
    href: '/admin/cupones',
    icon: Ticket
  },
  {
    name: 'Reportes',
    href: '/admin/reportes',
    icon: BarChart3
  },
  {
    name: 'Automatizaciones',
    href: '/admin/automatizaciones',
    icon: Zap,
    highlight: true // Destacado como nuevo
  },
  {
    name: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-center border-b border-slate-700 px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Razed Bold, sans-serif' }}>
            Sakú
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[#d8ceb5] text-[#2c3e50] shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
                item.highlight && !active && 'ring-1 ring-[#d8ceb5]/30'
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  active ? 'text-[#2c3e50]' : 'text-white/70 group-hover:text-white'
                )}
              />
              {item.name}
              {item.highlight && !active && (
                <span className="ml-auto rounded-full bg-[#d8ceb5] px-2 py-0.5 text-xs font-medium text-[#2c3e50]">
                  Nuevo
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Area */}
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-[#d8ceb5] flex items-center justify-center">
            <span className="text-sm font-medium text-[#2c3e50]">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-white/70 truncate">admin@saku.com</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white shadow-md hover:bg-gray-50"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-[#2c3e50]">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn(
        'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-70 lg:bg-[#2c3e50]',
        className
      )}>
        <SidebarContent />
      </div>
    </>
  )
}