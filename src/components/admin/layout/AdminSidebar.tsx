'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  X,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

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
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Razed Bold, sans-serif' }}>
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
                  ? 'bg-saku-base text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                item.highlight && !active && 'ring-1 ring-saku-base/30'
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  active ? 'text-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />
              {item.name}
              {item.highlight && !active && (
                <span className="ml-auto rounded-full bg-saku-base px-2 py-0.5 text-xs font-medium text-foreground">
                  Nuevo
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Area */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-saku-base flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">
              {profile?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {profile?.first_name && profile?.last_name 
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.first_name || 'Admin'
              }
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.role === 'admin' ? 'Administrador' : profile?.role || 'admin'}
            </p>
          </div>
        </div>
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
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
          className="fixed top-4 left-4 z-50 bg-background shadow-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border">
            <div className="absolute right-4 top-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileOpen(false)}
                className="text-foreground hover:bg-accent"
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
        'hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-70 bg-background border-r border-border',
        className
      )}>
        <SidebarContent />
      </div>
    </>
  )
}