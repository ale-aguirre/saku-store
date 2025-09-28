#!/usr/bin/env node

/**
 * Script para enviar emails de prueba usando las plantillas MJML compiladas
 * Uso: node scripts/send-test-emails.js <email-destino> [template]
 * 
 * Ejemplos:
 * node scripts/send-test-emails.js ale@example.com all
 * node scripts/send-test-emails.js ale@example.com verify_email
 * node scripts/send-test-emails.js ale@example.com welcome_account
 * node scripts/send-test-emails.js ale@example.com order_confirmation_paid
 */

const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Configuración del transportador de email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// Función para leer archivo HTML
const readHTMLTemplate = (templateName) => {
  const filePath = path.join(__dirname, '..', 'email', 'templates', `${templateName}.html`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template ${templateName}.html no encontrado en ${filePath}`)
  }
  return fs.readFileSync(filePath, 'utf8')
}

// Función para leer subjects.json
const getEmailSubjects = () => {
  const subjectsPath = path.join(__dirname, '..', 'email', 'subjects.json')
  if (!fs.existsSync(subjectsPath)) {
    throw new Error('subjects.json no encontrado')
  }
  return JSON.parse(fs.readFileSync(subjectsPath, 'utf8'))
}

// Función para reemplazar variables en el HTML
const replaceVariables = (html, variables) => {
  let result = html
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    result = result.replace(regex, value)
  })
  return result
}

// Datos de prueba para cada template
const getTestData = (templateName, userEmail) => {
  const baseData = {
    customerName: 'Alejandra',
    customerEmail: userEmail,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    supportEmail: process.env.SMTP_FROM || 'noreply@sakulenceria.com',
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(userEmail)}`
  }

  switch (templateName) {
    case 'verify_email':
      return {
        ...baseData,
        confirmationUrl: `${baseData.siteUrl}/auth/verify?token=test-token-123&email=${encodeURIComponent(userEmail)}`,
        expirationHours: '24'
      }

    case 'welcome_account':
      return {
        ...baseData,
        shopUrl: `${baseData.siteUrl}/productos`
      }

    case 'order_confirmation_paid':
      return {
        ...baseData,
        orderNumber: 'SKU-2024-001',
        orderDate: new Date().toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        orderStatus: 'Pagado',
        orderUrl: `${baseData.siteUrl}/mi-cuenta/pedidos/SKU-2024-001`,
        
        // Items del pedido
        orderItems: [
          {
            name: 'Conjunto Clásico',
            variant: 'Talle 90 - Negro',
            quantity: 1,
            price: '$15.500'
          },
          {
            name: 'Bralette Encaje',
            variant: 'Talle 85 - Rojo',
            quantity: 2,
            price: '$12.800'
          }
        ],
        
        // Totales
        subtotal: '$41.100',
        discount: '$4.110',
        shipping: '$2.500',
        total: '$39.590',
        
        // Información de envío
        shippingAddress: 'Av. Córdoba 1234, Córdoba Capital, Córdoba',
        estimatedDelivery: '3-5 días hábiles'
      }

    default:
      return baseData
  }
}

// Función para enviar un email
const sendTestEmail = async (templateName, userEmail) => {
  try {
    console.log(`📧 Enviando email de prueba: ${templateName} a ${userEmail}`)
    
    // Leer template HTML
    const htmlTemplate = readHTMLTemplate(templateName)
    
    // Obtener subjects
    const subjects = getEmailSubjects()
    const subject = subjects[templateName] || `Prueba - ${templateName}`
    
    // Obtener datos de prueba
    const testData = getTestData(templateName, userEmail)
    
    // Reemplazar variables en el HTML
    const html = replaceVariables(htmlTemplate, testData)
    
    // Crear transportador
    const transporter = createTransporter()
    
    // Configurar email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: userEmail,
      subject: `[PRUEBA] ${subject}`,
      html: html,
      text: `Este es un email de prueba para la plantilla: ${templateName}`
    }
    
    // Enviar email
    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Email enviado exitosamente: ${templateName}`)
    console.log(`   Message ID: ${result.messageId}`)
    console.log(`   Response: ${result.response}`)
    
    return { success: true, messageId: result.messageId }
    
  } catch (error) {
    console.error(`❌ Error enviando email ${templateName}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Función principal
const main = async () => {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.error('❌ Uso: node scripts/send-test-emails.js <email-destino> [template]')
    console.error('   Templates disponibles: verify_email, welcome_account, order_confirmation_paid, all')
    process.exit(1)
  }
  
  const userEmail = args[0]
  const templateName = args[1] || 'all'
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userEmail)) {
    console.error('❌ Email inválido:', userEmail)
    process.exit(1)
  }
  
  // Verificar variables de entorno
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingVars.join(', '))
    process.exit(1)
  }
  
  console.log('🚀 Iniciando envío de emails de prueba...')
  console.log(`📧 Destino: ${userEmail}`)
  console.log(`📋 Template(s): ${templateName}`)
  console.log('')
  
  const templates = templateName === 'all' 
    ? ['verify_email', 'welcome_account', 'order_confirmation_paid']
    : [templateName]
  
  const results = []
  
  for (const template of templates) {
    const result = await sendTestEmail(template, userEmail)
    results.push({ template, ...result })
    
    // Pausa entre emails para evitar rate limiting
    if (templates.length > 1) {
      console.log('⏳ Esperando 2 segundos antes del siguiente email...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('')
  console.log('📊 Resumen de envíos:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`   ${status} ${result.template}: ${result.success ? 'Enviado' : result.error}`)
  })
  
  const successCount = results.filter(r => r.success).length
  console.log('')
  console.log(`🎯 Total: ${successCount}/${results.length} emails enviados exitosamente`)
  
  if (successCount === results.length) {
    console.log('🎉 ¡Todos los emails fueron enviados correctamente!')
  } else {
    console.log('⚠️  Algunos emails fallaron. Revisa los errores arriba.')
    process.exit(1)
  }
}

// Ejecutar script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}

module.exports = { sendTestEmail, getTestData, replaceVariables }