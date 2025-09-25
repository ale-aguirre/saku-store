#!/usr/bin/env node

/**
 * Script para simular compras en Sakú Lencería
 * 
 * Este script automatiza el proceso de compra para testing:
 * 1. Crea un usuario de prueba
 * 2. Agrega productos al carrito
 * 3. Aplica cupón (opcional)
 * 4. Simula el checkout
 * 5. Crea una orden pendiente
 * 
 * Uso:
 * node scripts/simulate-purchase.js
 * node scripts/simulate-purchase.js --with-coupon
 * node scripts/simulate-purchase.js --multiple-items
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Configuración de la simulación
const SIMULATION_CONFIG = {
  testUser: {
    email: 'test-compra@saku.com',
    password: 'TestCompra123!',
    firstName: 'Usuario',
    lastName: 'Prueba',
    phone: '+54 9 351 123 4567'
  },
  shipping: {
    address: 'Av. Colón 1234',
    city: 'Córdoba',
    province: 'Córdoba',
    postalCode: '5000',
    country: 'Argentina'
  },
  testCoupon: {
    code: 'TEST10',
    discount: 10,
    type: 'percentage'
  }
}

async function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  const prefix = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type]
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

async function getAvailableProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      base_price,
      product_variants (
        id,
        size,
        color,
        price_adjustment,
        stock_quantity,
        sku
      )
    `)
    .eq('is_active', true)
    .limit(5)

  if (error) {
    throw new Error(`Error obteniendo productos: ${error.message}`)
  }

  return products.filter(p => 
    p.product_variants && 
    p.product_variants.some(v => v.stock_quantity > 0)
  )
}

async function createTestUser() {
  await log('Creando usuario de prueba...')
  
  // Verificar si el usuario ya existe
  const { data: existingUser } = await supabase.auth.admin.listUsers()
  const userExists = existingUser.users.find(u => u.email === SIMULATION_CONFIG.testUser.email)
  
  if (userExists) {
    await log('Usuario de prueba ya existe, usando existente', 'warning')
    return userExists
  }

  // Crear nuevo usuario
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: SIMULATION_CONFIG.testUser.email,
    password: SIMULATION_CONFIG.testUser.password,
    email_confirm: true,
    user_metadata: {
      first_name: SIMULATION_CONFIG.testUser.firstName,
      last_name: SIMULATION_CONFIG.testUser.lastName,
      phone: SIMULATION_CONFIG.testUser.phone
    }
  })

  if (error) {
    throw new Error(`Error creando usuario: ${error.message}`)
  }

  await log('Usuario de prueba creado exitosamente', 'success')
  return newUser.user
}

async function createTestCoupon() {
  await log('Verificando cupón de prueba...')
  
  // Verificar si el cupón ya existe
  const { data: existingCoupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', SIMULATION_CONFIG.testCoupon.code)
    .single()

  if (existingCoupon) {
    await log('Cupón de prueba ya existe', 'warning')
    return existingCoupon
  }

  // Crear nuevo cupón
  const { data: newCoupon, error } = await supabase
    .from('coupons')
    .insert({
      code: SIMULATION_CONFIG.testCoupon.code,
      type: SIMULATION_CONFIG.testCoupon.type,
      value: SIMULATION_CONFIG.testCoupon.discount,
      is_active: true,
      usage_limit: 100,
      used_count: 0,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creando cupón: ${error.message}`)
  }

  await log('Cupón de prueba creado exitosamente', 'success')
  return newCoupon
}

async function simulateCartItems(products, multipleItems = false) {
  await log('Seleccionando productos para el carrito...')
  
  const cartItems = []
  const itemCount = multipleItems ? Math.min(3, products.length) : 1

  for (let i = 0; i < itemCount; i++) {
    const product = products[i]
    const availableVariant = product.product_variants.find(v => v.stock_quantity > 0)
    
    if (availableVariant) {
      const finalPrice = product.base_price + (availableVariant.price_adjustment || 0)
      cartItems.push({
        product_id: product.id,
        variant_id: availableVariant.id,
        quantity: Math.min(2, availableVariant.stock_quantity),
        price: finalPrice,
        product_name: product.name,
        variant_size: availableVariant.size,
        variant_color: availableVariant.color
      })
    }
  }

  await log(`${cartItems.length} productos agregados al carrito simulado`, 'success')
  return cartItems
}

async function createSimulatedOrder(user, cartItems, withCoupon = false) {
  await log('Creando orden simulada...')
  
  // Calcular totales
  let subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  let discount = 0
  let couponId = null

  if (withCoupon) {
    const coupon = await createTestCoupon()
    couponId = coupon.id
    discount = coupon.type === 'percentage' 
      ? (subtotal * coupon.value / 100)
      : coupon.value
  }

  const shippingCost = 2500 // Costo fijo de envío
  const total = subtotal - discount + shippingCost

  // Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      email: user.email || SIMULATION_CONFIG.testUser.email,
      status: 'pending',
      subtotal: subtotal,
      discount_amount: discount,
      shipping_cost: shippingCost,
      total: total,
      coupon_code: withCoupon ? SIMULATION_CONFIG.testCoupon.code : null,
      shipping_address: SIMULATION_CONFIG.shipping,
      billing_address: SIMULATION_CONFIG.shipping,
      payment_method: 'mercado_pago',
      notes: 'Orden simulada para testing'
    })
    .select()
    .single()

  if (orderError) {
    throw new Error(`Error creando orden: ${orderError.message}`)
  }

  // Crear los items de la orden
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    variant_size: item.variant_size,
    variant_color: item.variant_color,
    sku: `${item.product_name.substring(0,2).toUpperCase()}-${item.variant_size}-${item.variant_color.substring(0,3).toUpperCase()}`,
    price: item.price,
    quantity: item.quantity
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    throw new Error(`Error creando items de orden: ${itemsError.message}`)
  }

  await log(`Orden #${order.id} creada exitosamente`, 'success')
  return order
}

async function displayOrderSummary(order, cartItems) {
  console.log('\n' + '='.repeat(50))
  console.log('📋 RESUMEN DE LA ORDEN SIMULADA')
  console.log('='.repeat(50))
  console.log(`🆔 ID de Orden: ${order.id}`)
  console.log(`👤 Usuario: ${SIMULATION_CONFIG.testUser.email}`)
  console.log(`📅 Fecha: ${new Date(order.created_at).toLocaleString()}`)
  console.log(`📍 Estado: ${order.status.toUpperCase()}`)
  console.log('\n📦 PRODUCTOS:')
  
  cartItems.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.product_name}`)
    console.log(`     Talle: ${item.variant_size} | Color: ${item.variant_color}`)
    console.log(`     Cantidad: ${item.quantity} | Precio: $${item.price}`)
  })
  
  console.log('\n💰 TOTALES:')
  console.log(`  Subtotal: $${order.subtotal}`)
  if (order.discount_amount > 0) {
    console.log(`  Descuento: -$${order.discount_amount}`)
  }
  console.log(`  Envío: $${order.shipping_cost}`)
  console.log(`  TOTAL: $${order.total}`)
  
  console.log('\n🚚 DIRECCIÓN DE ENVÍO:')
  const addr = order.shipping_address
  console.log(`  ${addr.address}`)
  console.log(`  ${addr.city}, ${addr.province} ${addr.postalCode}`)
  console.log(`  ${addr.country}`)
  
  console.log('\n' + '='.repeat(50))
}

async function main() {
  const args = process.argv.slice(2)
  const withCoupon = args.includes('--with-coupon')
  const multipleItems = args.includes('--multiple-items')

  try {
    await log('🚀 Iniciando simulación de compra...')
    
    // 1. Obtener productos disponibles
    const products = await getAvailableProducts()
    if (products.length === 0) {
      throw new Error('No hay productos disponibles para la simulación')
    }
    await log(`${products.length} productos disponibles encontrados`, 'success')

    // 2. Crear usuario de prueba
    const user = await createTestUser()

    // 3. Simular items del carrito
    const cartItems = await simulateCartItems(products, multipleItems)

    // 4. Crear orden simulada
    const order = await createSimulatedOrder(user, cartItems, withCoupon)

    // 5. Mostrar resumen
    await displayOrderSummary(order, cartItems)

    await log('✨ Simulación completada exitosamente', 'success')
    
    console.log('\n🔗 PRÓXIMOS PASOS:')
    console.log('1. Ir al admin panel: http://localhost:3000/admin')
    console.log('2. Ver la orden en la sección de órdenes')
    console.log('3. Cambiar el estado de la orden para probar el flujo')
    console.log('4. Probar el webhook de Mercado Pago (opcional)')

  } catch (error) {
    await log(`Error en la simulación: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { simulatePurchase: main }