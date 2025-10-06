'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SearchDialog } from '@/components/search/search-dialog'
import { useCart } from '@/hooks/use-cart'
import { UserButton } from '@/components/auth/user-button'
import { Menu, ShoppingBag, Search } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/productos' },
  { name: 'Guía de Talles', href: '/guia-talles' },
  { name: 'Contacto', href: '/contacto' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Buscar</span>
          </Button>
          
          {/* User Menu */}
          <UserButton />

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
                {/* Búsqueda móvil */}
                <Button 
                  variant="outline" 
                  className="justify-start gap-2"
                  onClick={() => {
                    setSearchOpen(true)
                    setIsOpen(false)
                  }}
                >
                  <Search className="h-4 w-4" />
                  Buscar productos
                </Button>
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
                <div className="pt-4 border-t flex justify-center">
                  <UserButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Search Dialog */}
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />
    </header>
  )
}