require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Función para generar UUID simple
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function createTestOrder() {
  console.log('🛍️ Creando orden de prueba en Supabase...')
  
  const orderId = generateUUID()
  const customerEmail = 'aguirrealexis.cba@gmail.com'
  
  try {
    // 1. Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        email: customerEmail,
        status: 'pending',
        subtotal: 8500,
        shipping_cost: 0,
        discount_amount: 0,
        total: 8500,
        shipping_address: {
          street: 'Av. Colón 1234',
          city: 'Córdoba',
          state: 'Córdoba',
          postal_code: '5000',
          country: 'Argentina'
        },
        billing_address: {
          street: 'Av. Colón 1234',
          city: 'Córdoba',
          state: 'Córdoba',
          postal_code: '5000',
          country: 'Argentina'
        },
        notes: 'Orden de prueba para testing de emails'
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Error creando orden:', orderError)
      return null
    }

    console.log('✅ Orden creada:', orderId)

    // 2. Crear los items de la orden
    const orderItems = [
      {
        id: generateUUID(),
        order_id: orderId,
        product_id: generateUUID(),
        product_name: 'Conjunto Sakú Elegance',
        variant_size: '90',
        variant_color: 'Negro',
        sku: 'SK-ELE-90-NEG',
        price: 3500,
        quantity: 2
      },
      {
        id: generateUUID(),
        order_id: orderId,
        product_id: generateUUID(),
        product_name: 'Tanga Sakú Classic',
        variant_size: '90',
        variant_color: 'Rojo',
        sku: 'SK-CLA-90-ROJ',
        price: 1500,
        quantity: 1
      }
    ]

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      console.error('❌ Error creando items:', itemsError)
      return null
    }

    console.log('✅ Items creados:', items.length)

    return {
      orderId,
      customerEmail,
      order,
      items
    }

  } catch (error) {
    console.error('❌ Error general:', error)
    return null
  }
}

async function sendOrderConfirmationEmail(orderId, customerEmail) {
  console.log('📧 Enviando email de confirmación...')
  
  try {
    const response = await fetch('http://localhost:3000/api/emails/order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        customerEmail
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Email de confirmación enviado exitosamente')
      console.log('   Message ID:', result.messageId)
      console.log('   Destinatario:', customerEmail)
    } else {
      console.log('❌ Error enviando email:', result.error)
    }

    return result

  } catch (error) {
    console.error('❌ Error enviando email:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🧪 Iniciando creación de orden de prueba y envío de email')
  console.log('==================================================')
  
  // Crear orden de prueba
  const testOrder = await createTestOrder()
  
  if (!testOrder) {
    console.log('❌ No se pudo crear la orden de prueba')
    return
  }

  // Enviar email de confirmación
  await sendOrderConfirmationEmail(testOrder.orderId, testOrder.customerEmail)

  console.log('==================================================')
  console.log('✅ Proceso completado')
  console.log(`📧 Revisa tu email: ${testOrder.customerEmail}`)
  console.log(`🆔 ID de orden: ${testOrder.orderId}`)
}

main().catch(console.error)