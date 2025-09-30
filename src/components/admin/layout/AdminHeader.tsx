'use client'

import { ChevronRight, Calendar, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AdminHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showDateSelector?: boolean
}

export function AdminHeader({ 
  title, 
  breadcrumbs = [], 
  actions,
  showDateSelector = true 
}: AdminHeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left side: Breadcrumbs and Title */}
      <div className="flex items-center space-x-4">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="h-4 w-4" />}
                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground/70'}>
                  {item.label}
                </span>
              </div>
            ))}
          </nav>
        )}
        
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Marcellus, serif' }}>
          {title}
        </h1>
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        {showDateSelector && (
          <Select defaultValue="today">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="yesterday">Ayer</SelectItem>
              <SelectItem value="last7days">Últimos 7 días</SelectItem>
              <SelectItem value="last30days">Últimos 30 días</SelectItem>
              <SelectItem value="thismonth">Este mes</SelectItem>
              <SelectItem value="lastmonth">Mes anterior</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Custom Actions */}
        {actions}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Stock bajo detectado</p>
                <p className="text-xs text-muted-foreground">3 productos necesitan restock</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Nuevo pedido recibido</p>
                <p className="text-xs text-muted-foreground">Pedido #1234 - $25.000</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Automatización completada</p>
                <p className="text-xs text-muted-foreground">Email de carrito abandonado enviado</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-saku-base flex items-center justify-center">
                <User className="h-4 w-4 text-foreground" />
              </div>
              <span className="text-sm font-medium">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}