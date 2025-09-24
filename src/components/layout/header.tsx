'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, ShoppingBag, User, Search, LogOut, Package } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/productos' },
  { name: 'Guía de Talles', href: '/guia-talles' },
  { name: 'Contacto', href: '/contacto' },
]

// Create singleton instance outside component
const supabase = createClient()

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { getTotalItems } = useCart()
  const { user, loading } = useAuth()
  const router = useRouter()
  const totalItems = getTotalItems()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-safe-x max-w-safe mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Sakú Lencería"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-foreground hover:text-[#d8ceb5] transition-colors">
            Inicio
          </Link>
          <Link href="/productos" className="text-foreground hover:text-[#d8ceb5] transition-colors">
            Productos
          </Link>
          <Link href="/nosotros" className="text-foreground hover:text-[#d8ceb5] transition-colors">
            Nosotros
          </Link>
          <Link href="/contacto" className="text-foreground hover:text-[#d8ceb5] transition-colors">
            Contacto
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          
          {/* User Menu */}
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Menú de usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Mi cuenta
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/cuenta" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Mi Cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cuenta/pedidos" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    Mis Pedidos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          )}

          <CartDrawer>
            <Button variant="ghost" size="icon" className="relative" data-testid="cart-trigger">
              <ShoppingBag className="h-4 w-4" />
              <span className="sr-only">Carrito</span>
              {/* Cart count badge */}
              {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                   {totalItems}
                 </span>
               )}
            </Button>
          </CartDrawer>

          <ThemeToggle />

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  {user ? (
                    <>
                      <Link
                        href="/cuenta"
                        className="text-lg font-medium transition-colors hover:text-primary flex items-center space-x-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mi Cuenta</span>
                      </Link>
                      <Link
                        href="/cuenta/pedidos"
                        className="text-lg font-medium transition-colors hover:text-primary flex items-center space-x-2 mt-4"
                        onClick={() => setIsOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        <span>Mis Pedidos</span>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="text-lg font-medium text-red-600 hover:text-red-700 flex items-center space-x-2 mt-4 w-full justify-start p-0"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" asChild>
                        <Link 
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}
                        >
                          Iniciar Sesión
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link 
                          href="/auth/register"
                          onClick={() => setIsOpen(false)}
                        >
                          Registrarse
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}