'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCheckout, type ShippingData } from '@/hooks/use-checkout'
import { ArrowLeft, MapPin, Truck, CreditCard, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

const checkoutSchema = z.object({
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  postalCode: z.string().min(4, 'Código postal requerido'),
  province: z.string().min(2, 'Provincia requerida'),
  shippingMethod: z.enum(['nacional', 'cadete']),
  notes: z.string().optional()
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const {
    items,
    getTotalPrice,
    getShippingCost,
    getTotalWithShipping,
    getAvailableShippingMethods,
    isCordobaPostalCode,
    isLoading,
    error,
    createMercadoPagoPreference
  } = useCheckout()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'nacional'
    }
  })

  const shippingMethod = watch('shippingMethod')
  const postalCode = watch('postalCode')
  const shippingCost = getShippingCost(shippingMethod)
  const total = getTotalWithShipping(shippingMethod)
  
  // Obtener métodos de envío disponibles según el código postal
  const availableShippingMethods = getAvailableShippingMethods(postalCode)
  
  // Si el método actual no está disponible, cambiar a nacional
  const currentMethodAvailable = availableShippingMethods.some(method => method.id === shippingMethod)
  if (!currentMethodAvailable && shippingMethod === 'cadete') {
    setValue('shippingMethod', 'nacional')
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      await createMercadoPagoPreference(data as ShippingData)
    } catch (error) {
      console.error('Error al procesar el checkout:', error)
    }
  }

  // Redirigir si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Agrega algunos productos antes de proceder al checkout</p>
        <Link href="/productos">
          <Button>Ver Productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="mb-4 sm:mb-6">
        <Link href="/productos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Formulario de envío */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Información de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm sm:text-base">Nombre *</Label>
                    <Input
                      id="firstName"
                      className="h-10 sm:h-11"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm sm:text-base">Apellido *</Label>
                    <Input
                      id="lastName"
                      className="h-10 sm:h-11"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-10 sm:h-11"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">Teléfono *</Label>
                  <Input
                    id="phone"
                    className="h-10 sm:h-11"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm sm:text-base">Dirección *</Label>
                  <Input
                    id="address"
                    className="h-10 sm:h-11"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm sm:text-base">Ciudad *</Label>
                    <Input
                      id="city"
                      className="h-10 sm:h-11"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province" className="text-sm sm:text-base">Provincia *</Label>
                    <Input
                      id="province"
                      className="h-10 sm:h-11"
                      {...register('province')}
                    />
                    {errors.province && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.province.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-sm sm:text-base">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    className="h-10 sm:h-11"
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm sm:text-base">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    {...register('notes')}
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Método de envío */}
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Método de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <RadioGroup
                 {...register('shippingMethod')}
                 value={shippingMethod}
                 onValueChange={(value) => {
                   const event = { target: { value } }
                   register('shippingMethod').onChange(event)
                 }}
               >
                {availableShippingMethods.map((method) => (
                  <div key={method.id} className="flex items-start space-x-3 p-3 sm:p-4 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{method.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <span className="font-medium">{formatPrice(method.cost)}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {postalCode && !isCordobaPostalCode(postalCode) && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Si estás en Córdoba Capital (CP 5000-5999), tendrás disponible el envío por cadete más económico.
                  </p>
                </div>
              )}
              {errors.shippingMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.shippingMethod.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl">Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.size} • {item.color} • Cantidad: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-sm sm:text-base flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Envío</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90 h-10 sm:h-11 text-sm sm:text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar con Mercado Pago
                  </>
                )}
              </Button>

              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}