'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ShoppingCart, Plus, Minus, X, Tag, AlertCircle, Truck, MapPin } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

const mockCoupons = [
  { code: 'BIENVENIDA10', discount: 10, type: 'percentage', minAmount: 0 },
  { code: 'ENVIOGRATIS', discount: 2500, type: 'fixed', minAmount: 15000 },
  { code: 'VERANO20', discount: 20, type: 'percentage', minAmount: 20000 }
]

interface CartDrawerProps {
  children: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { 
    items: cartItems, 
    isOpen, 
    openCart, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    getTotalPrice, 
    getTotalItems,
    shipping,
    coupon,
    setShipping,
    setCoupon,
    getDiscountAmount,
    getShippingCost,
    getFinalTotal
  } = useCart()
  
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  
  // Estado para envío
  const [postalCode, setPostalCode] = useState(shipping?.postalCode || '')
  const [shippingMethod, setShippingMethod] = useState<'national' | 'cordoba' | null>(shipping?.method || null)
  const [isCordobaPostalCode, setIsCordobaPostalCode] = useState(false)
  const [shippingError, setShippingError] = useState('')
  
  // Costos de envío
  const nationalShippingCost = 2500
  const cordobaShippingCost = 1500
  
  // Sincronizar estado local con el estado global del carrito
  useEffect(() => {
    if (shipping) {
      setPostalCode(shipping.postalCode)
      setShippingMethod(shipping.method)
    }
  }, [shipping])
  
  // Verificar si el código postal es de Córdoba (5000-5999)
  useEffect(() => {
    if (postalCode && postalCode.length === 4) {
      const postalCodeNum = parseInt(postalCode, 10)
      setIsCordobaPostalCode(postalCodeNum >= 5000 && postalCodeNum <= 5999)
      setShippingError('')
    } else if (postalCode) {
      setIsCordobaPostalCode(false)
      setShippingError('Código postal inválido')
    }
  }, [postalCode])
  
  // Actualizar el estado global cuando cambia el método de envío
  useEffect(() => {
    if (shippingMethod && postalCode && postalCode.length === 4) {
      setShipping({
        method: shippingMethod,
        postalCode,
        cost: shippingMethod === 'national' ? nationalShippingCost : cordobaShippingCost
      })
    }
  }, [shippingMethod, postalCode, setShipping])

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    
    updateQuantity(id, newQuantity)
  }

  const applyCoupon = () => {
    setCouponError('')
    const foundCoupon = mockCoupons.find(c => c.code.toLowerCase() === couponCode.toLowerCase())
    
    if (!foundCoupon) {
      setCouponError('Cupón no válido')
      return
    }

    if (subtotal < foundCoupon.minAmount) {
      setCouponError(`Compra mínima de $${foundCoupon.minAmount.toLocaleString()} para este cupón`)
      return
    }

    // Actualizar el estado global
    setCoupon({
      code: foundCoupon.code,
      type: foundCoupon.type,
      value: foundCoupon.discount
    })
    
    setCouponCode('')
  }

  const removeCoupon = () => {
    setCoupon(null)
    setCouponError('')
  }

  const subtotal = getTotalPrice()
  const discount = getDiscountAmount()
  const total = subtotal - discount
  const itemCount = getTotalItems()

  // Envío gratis si supera $25000
  const freeShippingThreshold = 25000
  const shippingCost = getShippingCost()
  const finalTotal = getFinalTotal()

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

            {/* Coupon and Shipping Section */}
            <Accordion type="single" collapsible className="py-4 border-t">
              <AccordionItem value="coupon">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>Cupón de descuento</span>
                    {coupon && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                        Aplicado
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {!coupon ? (
                    <div className="space-y-2 pt-2">
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
                    <div data-testid="discount-applied" className="flex items-center justify-between p-2 mt-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {coupon.code}
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
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="shipping">
                <AccordionTrigger className="py-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Calcular envío</span>
                    {shippingMethod && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                        {shippingMethod === 'national' ? 'Nacional' : 'Córdoba'}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Código postal"
                            value={postalCode}
                            onChange={(e) => {
                              // Solo permitir números y limitar a 4 dígitos
                              const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                              setPostalCode(value)
                              // Resetear método de envío si se cambia el código postal
                              if (shippingMethod) setShippingMethod(null)
                            }}
                            className="flex-1"
                          />
                          <Button 
                            variant="outline"
                            size="sm"
                            disabled={!postalCode || postalCode.length !== 4}
                            onClick={() => {
                              if (isCordobaPostalCode) {
                                setShippingMethod('cordoba')
                              } else {
                                setShippingMethod('national')
                              }
                            }}
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Calcular
                          </Button>
                        </div>
                        {shippingError && (
                          <div className="flex items-center gap-2 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {shippingError}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {postalCode && postalCode.length === 4 && !shippingError && (
                      <div className="space-y-2 pt-1">
                        <div className="text-sm font-medium">Opciones de envío:</div>
                        <div className="space-y-2">
                          {isCordobaPostalCode ? (
                            <>
                              <div 
                                className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                                  shippingMethod === 'cordoba' ? 'border-primary bg-primary/5' : ''
                                }`}
                                onClick={() => setShippingMethod('cordoba')}
                              >
                                <div>
                                  <div className="font-medium">Cadete Córdoba</div>
                                  <div className="text-xs text-muted-foreground">Entrega en 24-48hs</div>
                                </div>
                                <div className="font-medium">
                                  {cordobaShippingCost === 0 ? 'Gratis' : `$${cordobaShippingCost.toLocaleString()}`}
                                </div>
                              </div>
                              <div 
                                className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                                  shippingMethod === 'national' ? 'border-primary bg-primary/5' : ''
                                }`}
                                onClick={() => setShippingMethod('national')}
                              >
                                <div>
                                  <div className="font-medium">Envío Nacional</div>
                                  <div className="text-xs text-muted-foreground">Entrega en 3-5 días</div>
                                </div>
                                <div className="font-medium">
                                  {nationalShippingCost === 0 ? 'Gratis' : `$${nationalShippingCost.toLocaleString()}`}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div 
                              className={`p-2 border rounded flex justify-between items-center cursor-pointer ${
                                shippingMethod === 'national' ? 'border-primary bg-primary/5' : ''
                              }`}
                              onClick={() => setShippingMethod('national')}
                            >
                              <div>
                                <div className="font-medium">Envío Nacional</div>
                                <div className="text-xs text-muted-foreground">Entrega en 3-5 días</div>
                              </div>
                              <div className="font-medium">
                                {nationalShippingCost === 0 ? 'Gratis' : `$${nationalShippingCost.toLocaleString()}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
                <span>Envío {shippingMethod ? `(${shippingMethod === 'national' ? 'Nacional' : 'Córdoba'})` : ''}</span>
                <span>
                  {!shippingMethod ? (
                    <span className="text-muted-foreground">No calculado</span>
                  ) : shippingCost === 0 ? (
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
              
              {!shippingMethod && cartItems.length > 0 && (
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Calculá el envío para continuar con la compra</span>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <Button 
              size="lg" 
              className="w-full bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90"
              asChild
              disabled={!shippingMethod}
            >
              <Link href={shippingMethod ? "/checkout" : "#"}>
                Finalizar Compra
              </Link>
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}