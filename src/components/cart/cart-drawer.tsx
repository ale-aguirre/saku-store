'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingCart, Plus, Minus, X, Tag, AlertCircle } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'

const mockCoupons = [
  { code: 'BIENVENIDA10', discount: 10, type: 'percentage', minAmount: 0 },
  { code: 'ENVIOGRATIS', discount: 2500, type: 'fixed', minAmount: 15000 },
  { code: 'VERANO20', discount: 20, type: 'percentage', minAmount: 20000 }
]

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { items: cartItems, isOpen, openCart, closeCart, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<typeof mockCoupons[0] | null>(null)
  const [couponError, setCouponError] = useState('')

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    
    updateQuantity(id, newQuantity)
  }

  const applyCoupon = () => {
    setCouponError('')
    const coupon = mockCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase())
    
    if (!coupon) {
      setCouponError('Cupón no válido')
      return
    }

    if (subtotal < coupon.minAmount) {
      setCouponError(`Compra mínima de $${coupon.minAmount.toLocaleString()} para este cupón`)
      return
    }

    setAppliedCoupon(coupon)
    setCouponCode('')
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  const subtotal = getTotalPrice()
  const discount = appliedCoupon 
    ? appliedCoupon.type === 'percentage' 
      ? Math.round(subtotal * appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0
  const total = subtotal - discount
  const itemCount = getTotalItems()

  // Envío gratis si supera $25000
  const freeShippingThreshold = 25000
  const shippingCost = total >= freeShippingThreshold ? 0 : 2500
  const finalTotal = total + shippingCost

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {itemCount > 0 && (
            <Badge data-testid="cart-count" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#d8ceb5] text-black text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="font-medium mb-2">Tu carrito está vacío</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega productos para comenzar tu compra
              </p>
              <Button asChild className="bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90">
                <Link href="/productos">Ver Productos</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-safe-y py-safe-y">
              {cartItems.map((item) => (
                <div key={item.id} data-testid="cart-item" className="flex gap-3 p-3 border rounded-lg">
                  <div className="relative w-16 h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Talle {item.size} • {item.color}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-sm">
                          ${(item.price * item.quantity).toLocaleString()}
                        </div>
                        {item.originalPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            ${(item.originalPrice * item.quantity).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="space-y-3 py-4 border-t">
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      data-testid="coupon-input"
                      placeholder="Código de cupón"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      data-testid="apply-coupon"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                      variant="outline"
                      size="sm"
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Aplicar
                    </Button>
                  </div>
                  {couponError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {couponError}
                    </div>
                  )}
                </div>
              ) : (
                <div data-testid="discount-applied" className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {appliedCoupon.code}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-3 py-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-${discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    `$${shippingCost.toLocaleString()}`
                  )}
                </span>
              </div>
              
              {total < freeShippingThreshold && (
                <div className="text-xs text-muted-foreground">
                  Agregá ${(freeShippingThreshold - total).toLocaleString()} más para envío gratis
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span data-testid="cart-total">${finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button 
              size="lg" 
              className="w-full bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90"
              asChild
            >
              <Link href="/checkout">
                Finalizar Compra
              </Link>
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}