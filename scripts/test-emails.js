#!/usr/bin/env node

/**
 * Script para probar los emails del sistema Sakú Lencería
 * Usa la API de emails para enviar emails de prueba
 */

const https = require('https')
const http = require('http')
require('dotenv').config()

// Email de destino para las pruebas
const TEST_EMAIL = 'aguirrealexis.cba@gmail.com'
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Función para generar UUID simple
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Datos de prueba para la orden
const MOCK_ORDER_ID = generateUUID()

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }

    const req = client.request(requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({ status: res.statusCode, data: jsonData })
        } catch (e) {
          resolve({ status: res.statusCode, data: data })
        }
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function testEmailConfiguration() {
  console.log('🔧 Verificando configuración de email...')
  
  const requiredEnvs = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
  const missingEnvs = requiredEnvs.filter(env => !process.env[env])
  
  if (missingEnvs.length > 0) {
    console.error('❌ Faltan variables de entorno:', missingEnvs.join(', '))
    return false
  }
  
  console.log('✅ Configuración de email completa')
  console.log(`   Host: ${process.env.SMTP_HOST}`)
  console.log(`   Puerto: ${process.env.SMTP_PORT}`)
  console.log(`   Usuario: ${process.env.SMTP_USER}`)
  console.log(`   From: ${process.env.SMTP_FROM}`)
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/emails/order-confirmation`)
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ API de emails responde correctamente')
      return true
    } else {
      console.error('❌ Error en API de emails:', response.data)
      return false
    }
  } catch (error) {
    console.error('❌ Error conectando con API:', error.message)
    return false
  }
}

async function createMockOrderInSupabase() {
  console.log('📦 Creando orden de prueba en Supabase...')
  
  const mockOrder = {
    id: MOCK_ORDER_ID,
    order_number: 'SK-TEST-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    user_id: null, // Usuario anónimo para prueba
    status: 'paid',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
    subtotal: 8500,
    discount_amount: 850,
    shipping_amount: 1200,
    tax_amount: 0,
    total_amount: 8850,
    shipping_address: {
      first_name: 'Alexis',
      last_name: 'Aguirre',
      address_line_1: 'Av. Colón 1234',
      address_line_2: 'Piso 2, Depto B',
      city: 'Córdoba',
      state: 'Córdoba',
      postal_code: '5000',
      country: 'Argentina'
    },
    billing_address: null,
    tracking_number: null,
    tracking_url: null,
    notes: 'Orden de prueba para testing de emails'
  }
  
  const mockOrderItems = [
     {
       id: generateUUID(),
       order_id: MOCK_ORDER_ID,
       variant_id: null, // Simplificado para prueba
       quantity: 2,
       unit_price: 3500,
       total_price: 7000,
       product_snapshot: {
         name: 'Conjunto Sakú Elegance',
         variant_name: 'Talle 90 - Negro',
         description: 'Conjunto de lencería elegante con encaje francés',
         sku: 'SK-ELE-90-NEG'
       }
     },
     {
       id: generateUUID(),
       order_id: MOCK_ORDER_ID,
       variant_id: null, // Simplificado para prueba
       quantity: 1,
       unit_price: 1500,
       total_price: 1500,
       product_snapshot: {
         name: 'Tanga Sakú Classic',
         variant_name: 'Talle 90 - Rojo',
         description: 'Tanga clásica de microfibra suave',
         sku: 'SK-CLA-90-ROJ'
       }
     }
   ]
  
  try {
    // Crear orden usando la API interna
    const orderResponse = await makeRequest(`${API_BASE_URL}/api/test/create-order`, {
      method: 'POST',
      body: {
        order: mockOrder,
        items: mockOrderItems
      }
    })
    
    if (orderResponse.status === 200 || orderResponse.status === 201) {
      console.log(`✅ Orden de prueba creada: #${mockOrder.order_number}`)
      console.log(`   ID: ${mockOrder.id}`)
      console.log(`   Total: $${(mockOrder.total_amount / 100).toLocaleString()}`)
      console.log(`   Items: ${mockOrderItems.length}`)
      return mockOrder
    } else {
      console.log('⚠️  No se pudo crear orden en DB, usando datos mock')
      return mockOrder
    }
  } catch (error) {
    console.log('⚠️  Error creando orden en DB, usando datos mock:', error.message)
    return mockOrder
  }
}

async function sendTestEmail(orderId, customerEmail) {
  console.log(`📧 Enviando email de prueba a ${customerEmail}...`)
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/emails/order-confirmation`, {
      method: 'POST',
      body: {
        orderId: orderId,
        customerEmail: customerEmail
      }
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Email enviado exitosamente')
      console.log(`   Message ID: ${response.data.messageId}`)
      return { success: true, messageId: response.data.messageId }
    } else {
      console.error('❌ Error enviando email:', response.data)
      return { success: false, error: response.data.error || 'Error desconocido' }
    }
  } catch (error) {
    console.error('❌ Error enviando email:', error.message)
    return { success: false, error: error.message }
  }
}

async function sendSimpleTestEmail() {
  console.log('📧 Enviando email de prueba simple...')
  
  try {
    // Crear un endpoint de prueba simple
    const response = await makeRequest(`${API_BASE_URL}/api/test/send-email`, {
      method: 'POST',
      body: {
        to: TEST_EMAIL,
        subject: '🧪 Prueba de Email - Sakú Lencería',
        type: 'test'
      }
    })
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Email de prueba enviado exitosamente')
      console.log(`   Message ID: ${response.data.messageId}`)
      console.log(`   Destinatario: ${TEST_EMAIL}`)
      return { success: true, messageId: response.data.messageId }
    } else {
      console.error('❌ Error enviando email de prueba:', response.data)
      return { success: false, error: response.data.error || 'Error desconocido' }
    }
  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error.message)
    return { success: false, error: error.message }
  }
}

async function main() {
  console.log('🚀 Iniciando prueba de emails de Sakú Lencería')
  console.log('=' .repeat(50))
  
  // 1. Verificar configuración
  const configOk = await testEmailConfiguration()
  if (!configOk) {
    console.log('\n❌ Configuración de email no disponible. Abortando.')
    process.exit(1)
  }
  
  // 2. Crear orden de prueba
  const mockOrder = await createMockOrderInSupabase()
  
  // 3. Enviar email de confirmación de orden
  console.log('\n📧 Probando email de confirmación de orden...')
  const orderEmailResult = await sendTestEmail(mockOrder.id, TEST_EMAIL)
  
  // 4. Enviar email de prueba simple
  console.log('\n📧 Probando email de prueba simple...')
  const simpleEmailResult = await sendSimpleTestEmail()
  
  console.log('\n' + '=' .repeat(50))
  console.log('🎉 Prueba de emails completada')
  
  let emailsSent = 0
  let emailsFailed = 0
  
  if (orderEmailResult.success) {
    emailsSent++
    console.log(`✅ Email de confirmación enviado (${orderEmailResult.messageId})`)
  } else {
    emailsFailed++
    console.log(`❌ Email de confirmación falló: ${orderEmailResult.error}`)
  }
  
  if (simpleEmailResult.success) {
    emailsSent++
    console.log(`✅ Email de prueba simple enviado (${simpleEmailResult.messageId})`)
  } else {
    emailsFailed++
    console.log(`❌ Email de prueba simple falló: ${simpleEmailResult.error}`)
  }
  
  console.log('\n📋 Resumen:')
  console.log(`   Emails enviados: ${emailsSent}`)
  console.log(`   Emails fallidos: ${emailsFailed}`)
  console.log(`   Destinatario: ${TEST_EMAIL}`)
  console.log(`   Configuración SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`)
  console.log(`   Usuario SMTP: ${process.env.SMTP_USER}`)
  console.log(`   Email From: ${process.env.SMTP_FROM}`)
  
  if (emailsSent > 0) {
    console.log('\n📬 Revisa tu bandeja de entrada y carpeta de spam')
    console.log('📧 Los emails deberían llegar en unos minutos')
  }
}

// Ejecutar script
main().catch(error => {
  console.error('💥 Error ejecutando script:', error)
  process.exit(1)
})