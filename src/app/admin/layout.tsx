'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Ticket,
  Mail,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
  Home,
  LogOut
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Productos',
    href: '/admin/productos',
    icon: Package,
  },
  {
    title: 'Órdenes',
    href: '/admin/ordenes',
    icon: ShoppingCart,
  },
  {
    title: 'Cupones',
    href: '/admin/cupones',
    icon: Ticket,
  },
  {
    title: 'Emails',
    href: '/admin/emails',
    icon: Mail,
  },
  {
    title: 'Reportes',
    href: '/admin/reportes',
    icon: BarChart3,
  },
  {
    title: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    // Fetch pending orders count for badge
    const fetchPendingOrders = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      setPendingOrders(count || 0)
    }

    if (user) {
      fetchPendingOrders()
    }
  }, [user, loading, router])



  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [
      { title: 'Inicio', href: '/' },
      { title: 'Admin', href: '/admin' }
    ]

    if (segments.length > 1) {
      const section = segments[1]
      const sectionMap: Record<string, string> = {
        productos: 'Productos',
        ordenes: 'Órdenes',
        cupones: 'Cupones',
        emails: 'Emails',
        reportes: 'Reportes',
        configuracion: 'Configuración'
      }

      if (sectionMap[section]) {
        breadcrumbs.push({
          title: sectionMap[section],
          href: `/admin/${section}`
        })
      }

      // Add specific page if exists
      if (segments.length > 2) {
        const page = segments[2]
        if (page === 'nuevo') {
          breadcrumbs.push({
            title: 'Nuevo',
            href: pathname
          })
        } else if (page !== 'page') {
          breadcrumbs.push({
            title: `#${page}`,
            href: pathname
          })
        }
      }
    }

    return breadcrumbs
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-foreground">Sakú Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2 bg-muted/50">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "text-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  {item.title === 'Órdenes' && pendingOrders > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingOrders}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.email || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 dark:hover:border-red-700"
              onClick={async () => {
                try {
                  await supabase.auth.signOut()
                  router.push('/')
                } catch (error) {
                  console.error('Error al cerrar sesión:', error)
                }
              }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center space-x-2">
                    {index === 0 && <Home className="h-4 w-4 text-muted-foreground" />}
                    <Link
                      href={crumb.href}
                      className={cn(
                        "hover:text-foreground transition-colors",
                        index === breadcrumbs.length - 1
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {crumb.title}
                    </Link>
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/" target="_blank">
                <Button variant="outline" size="sm">
                  Ver Tienda
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}