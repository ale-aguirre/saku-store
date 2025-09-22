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
    isLoading,
    error,
    createMercadoPagoPreference
  } = useCheckout()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'nacional'
    }
  })

  const shippingMethod = watch('shippingMethod')
  const shippingCost = getShippingCost(shippingMethod)
  const total = getTotalWithShipping(shippingMethod)

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
    <div className="py-8">
      <div className="mb-6">
        <Link href="/productos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a productos
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de envío */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Información de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      {...register('province')}
                    />
                    {errors.province && (
                      <p className="text-red-500 text-sm mt-1">{errors.province.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode">Código Postal *</Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Instrucciones especiales para la entrega..."
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Método de envío */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="mr-2 h-5 w-5" />
                Método de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                 {...register('shippingMethod')}
                 value={shippingMethod}
                 onValueChange={(value) => {
                   const event = { target: { value } }
                   register('shippingMethod').onChange(event)
                 }}
               >
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="nacional" id="nacional" />
                  <Label htmlFor="nacional" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Envío Nacional</p>
                        <p className="text-sm text-muted-foreground">Correo Argentino - 5-7 días hábiles</p>
                      </div>
                      <span className="font-medium">${(3500 / 100).toLocaleString()}</span>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <RadioGroupItem value="cadete" id="cadete" />
                  <Label htmlFor="cadete" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Cadete Córdoba</p>
                        <p className="text-sm text-muted-foreground">Solo Córdoba Capital - 1-2 días hábiles</p>
                      </div>
                      <span className="font-medium">${(2500 / 100).toLocaleString()}</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              {errors.shippingMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.shippingMethod.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.size} • {item.color} • Cantidad: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    ${((item.price * item.quantity) / 100).toLocaleString()}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${(getTotalPrice() / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>${(shippingCost / 100).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(total / 100).toLocaleString()}</span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-[#d8ceb5] text-black hover:bg-[#d8ceb5]/90"
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

              <p className="text-xs text-muted-foreground text-center">
                Al continuar, aceptas nuestros términos y condiciones
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}