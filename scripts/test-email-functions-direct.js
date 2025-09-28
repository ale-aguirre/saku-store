#!/usr/bin/env node

/**
 * Script para probar directamente las funciones de email mejoradas
 * No depende del servidor local, usa las funciones directamente
 */

require('dotenv').config()

// Importar las funciones de email directamente
const path = require('path')
const { sendWelcomeEmail, sendOrderConfirmationEmail, sendShippingEmail } = require('../src/lib/email.ts')

const TEST_EMAIL = 'aguirrealexis.cba@gmail.com'

// Datos de prueba para usuario
const mockUser = {
  id: 'test-user-123',
  email: TEST_EMAIL,
  first_name: 'María',
  last_name: 'González'
}

// Datos de prueba para orden
const mockOrder = {
  id: 'order-test-456',
  order_number: 'SK-2024-001',
  status: 'paid',
  total: 8500,
  created_at: new Date().toISOString(),
  customer_email: TEST_EMAIL,
  customer_name: 'María González',
  shipping_address: {
    street: 'Av. Córdoba 1234',
    city: 'Córdoba',
    state: 'Córdoba',
    postal_code: '5000',
    country: 'Argentina'
  },
  items: [
    {
      id: 'item-1',
      product_name: 'Conjunto Encaje Delicado',
      variant_name: 'Talle 90 - Negro',
      quantity: 1,
      price: 4500
    },
    {
      id: 'item-2', 
      product_name: 'Bralette Comfort',
      variant_name: 'Talle 85 - Blanco',
      quantity: 1,
      price: 3200
    }
  ],
  shipping_cost: 800
}

// Datos de prueba para envío
const mockShipping = {
  tracking_code: 'AR123456789',
  carrier: 'Correo Argentino',
  estimated_delivery: '2024-01-25'
}

async function testWelcomeEmail() {
  console.log('\n📧 Probando Email de Bienvenida...')
  console.log('=====================================')
  
  try {
    const result = await sendWelcomeEmail(mockUser.email, mockUser.first_name)
    
    if (result.success) {
      console.log('✅ Email de bienvenida enviado exitosamente')
      console.log(`   Message ID: ${result.messageId}`)
      console.log(`   Destinatario: ${mockUser.email}`)
      console.log(`   Nombre: ${mockUser.first_name}`)
      return { success: true, messageId: result.messageId }
    } else {
      console.log('❌ Error enviando email de bienvenida:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('❌ Error en testWelcomeEmail:', error.message)
    return { success: false, error: error.message }
  }
}

async function testOrderConfirmationEmail() {
  console.log('\n📧 Probando Email de Confirmación de Pedido...')
  console.log('===============================================')
  
  try {
    const result = await sendOrderConfirmationEmail(mockOrder)
    
    if (result.success) {
      console.log('✅ Email de confirmación enviado exitosamente')
      console.log(`   Message ID: ${result.messageId}`)
      console.log(`   Destinatario: ${mockOrder.customer_email}`)
      console.log(`   Número de orden: ${mockOrder.order_number}`)
      console.log(`   Estado: ${mockOrder.status}`)
      console.log(`   Total: $${mockOrder.total}`)
      return { success: true, messageId: result.messageId }
    } else {
      console.log('❌ Error enviando email de confirmación:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('❌ Error en testOrderConfirmationEmail:', error.message)
    return { success: false, error: error.message }
  }
}

async function testShippingEmail() {
  console.log('\n📧 Probando Email de Envío...')
  console.log('==============================')
  
  try {
    const result = await sendShippingEmail(mockOrder, mockShipping)
    
    if (result.success) {
      console.log('✅ Email de envío enviado exitosamente')
      console.log(`   Message ID: ${result.messageId}`)
      console.log(`   Destinatario: ${mockOrder.customer_email}`)
      console.log(`   Código de seguimiento: ${mockShipping.tracking_code}`)
      console.log(`   Transportista: ${mockShipping.carrier}`)
      return { success: true, messageId: result.messageId }
    } else {
      console.log('❌ Error enviando email de envío:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('❌ Error en testShippingEmail:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('📧 Prueba Directa de Funciones de Email - Sakú Lencería')
  console.log('========================================================')
  console.log(`📬 Destinatario de prueba: ${TEST_EMAIL}`)
  console.log(`🕐 Fecha: ${new Date().toLocaleString('es-AR')}`)
  
  // Verificar configuración SMTP
  console.log('\n🔧 Verificando configuración SMTP...')
  const requiredEnvs = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
  const missingEnvs = requiredEnvs.filter(env => !process.env[env])
  
  if (missingEnvs.length > 0) {
    console.error('❌ Faltan variables de entorno:', missingEnvs.join(', '))
    process.exit(1)
  }
  
  console.log('✅ Configuración SMTP completa')
  console.log(`   Host: ${process.env.SMTP_HOST}`)
  console.log(`   Puerto: ${process.env.SMTP_PORT}`)
  console.log(`   Usuario: ${process.env.SMTP_USER}`)
  console.log(`   From: ${process.env.SMTP_FROM}`)

  const results = []

  // Test 1: Email de Bienvenida
  const welcomeResult = await testWelcomeEmail()
  results.push({ type: 'Bienvenida', ...welcomeResult })
  
  // Esperar 3 segundos entre emails
  console.log('\n⏳ Esperando 3 segundos...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Test 2: Email de Confirmación de Pedido
  const orderResult = await testOrderConfirmationEmail()
  results.push({ type: 'Confirmación de Pedido', ...orderResult })
  
  // Esperar 3 segundos entre emails
  console.log('\n⏳ Esperando 3 segundos...')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Test 3: Email de Envío
  const shippingResult = await testShippingEmail()
  results.push({ type: 'Envío', ...shippingResult })

  // Resumen final
  console.log('\n========================================================')
  console.log('📊 RESUMEN DE PRUEBAS')
  console.log('========================================================')

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Emails enviados exitosamente: ${successful.length}/${results.length}`)
  successful.forEach((result, index) => {
    console.log(`   ${index + 1}. ${result.type}`)
    console.log(`      Message ID: ${result.messageId}`)
  })

  if (failed.length > 0) {
    console.log(`\n❌ Emails fallidos: ${failed.length}/${results.length}`)
    failed.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.type}`)
      console.log(`      Error: ${result.error}`)
    })
  }

  console.log('\n========================================================')
  console.log('📧 INSTRUCCIONES POST-PRUEBA')
  console.log('========================================================')
  console.log('1. Revisa tu bandeja de entrada en:', TEST_EMAIL)
  console.log('2. Verifica también la carpeta de spam/correo no deseado')
  console.log('3. Los emails pueden tardar 1-5 minutos en llegar')
  console.log('4. Verifica que las plantillas se vean correctamente')
  console.log('5. Confirma que no hay información técnica visible')

  if (successful.length === results.length) {
    console.log('\n🎉 ¡Todas las pruebas de email fueron exitosas!')
    console.log('✨ Las plantillas mejoradas están funcionando correctamente')
  } else if (successful.length > 0) {
    console.log('\n⚠️  Algunas pruebas fallaron, revisa los errores arriba')
  } else {
    console.log('\n💥 Todas las pruebas fallaron, revisa la configuración SMTP')
  }
}

main().catch(error => {
  console.error('\n💥 Error fatal en el script:', error.message)
  console.error(error.stack)
  process.exit(1)
})