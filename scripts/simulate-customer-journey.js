const https = require('https')
const http = require('http')
require('dotenv').config()

// Configuración
const BASE_URL = 'http://localhost:3000'
const CUSTOMER_EMAIL = 'aguirrealexis.cba@gmail.com'
const CUSTOMER_NAME = 'Alexis Aguirre'

// Función para hacer requests HTTP
const makeRequest = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    const req = protocol.request(url, requestOptions, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          resolve({ status: res.statusCode, data: response })
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

// Función para esperar entre requests
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Función principal que simula el flujo completo
const simulateCustomerJourney = async () => {
  console.log('� Iniciando simulación del flujo completo del cliente')
  console.log('� Cliente:', CUSTOMER_NAME, '(' + CUSTOMER_EMAIL + ')')
  console.log('============================================================')
  
  const results = {
    welcome: null,
    orderConfirmation: null,
    shipping: null,
    newsletter: null
  }
  
  try {
    // 1. Email de bienvenida (registro)
    console.log('\n1️⃣ PASO 1: Registro del cliente')
    console.log('� Enviando email de bienvenida...')
    
    const welcomeResponse = await makeRequest(`${BASE_URL}/api/test/send-email`, {
      body: {
        to: CUSTOMER_EMAIL,
        subject: '¡Bienvenida a Sakú Lencería! ��',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d8ceb5 0%, #f5f1e8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold;">Sakú Lencería</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Elegancia y comodidad en cada detalle</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #000000; font-size: 24px; margin: 0 0 20px 0;">¡Hola ${CUSTOMER_NAME}! �</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ¡Bienvenida a la familia Sakú! Estamos emocionados de tenerte con nosotros.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Como regalo de bienvenida, tienes un <strong>15% de descuento</strong> en tu primera compra con el código:
              </p>
              
              <div style="background: #f8f8f8; border: 2px dashed #d8ceb5; padding: 20px; text-align: center; margin: 0 0 30px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #000000; letter-spacing: 2px;">BIENVENIDA15</span>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://saku-lenceria.com/productos" style="background: #d8ceb5; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Explorar Colección
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                © 2024 Sakú Lencería. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      }
    })
    
    if (welcomeResponse.status === 200) {
      console.log('✅ Email de bienvenida enviado:', welcomeResponse.data.messageId)
      results.welcome = welcomeResponse.data
    }
    
    await wait(3000)
    
    // 2. Email de confirmación de pedido
    console.log('\n2️⃣ PASO 2: Compra simulada')
    console.log('� Enviando email de confirmación de pedido...')
    
    const orderNumber = 'SKU-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    const orderResponse = await makeRequest(`${BASE_URL}/api/test/send-email`, {
      body: {
        to: CUSTOMER_EMAIL,
        subject: `Confirmación de pedido ${orderNumber} - Sakú Lencería`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d8ceb5 0%, #f5f1e8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold;">Sakú Lencería</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Confirmación de pedido</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #000000; font-size: 24px; margin: 0 0 20px 0;">¡Gracias por tu compra! �</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${CUSTOMER_NAME}, hemos recibido tu pedido y está siendo procesado.
              </p>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
                <h3 style="color: #000000; margin: 0 0 15px 0;">Detalles del pedido</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Número de pedido:</strong> ${orderNumber}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Estado:</strong> Confirmado</p>
              </div>
              
              <!-- Items -->
              <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; margin: 0 0 30px 0;">
                <div style="background: #f8f8f8; padding: 15px; border-bottom: 1px solid #eee;">
                  <h3 style="margin: 0; color: #000000;">Productos</h3>
                </div>
                <div style="padding: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                    <div>
                      <strong>Conjunto Elegance</strong><br>
                      <span style="color: #666; font-size: 14px;">Talle 90 - Negro</span>
                    </div>
                    <div style="text-align: right;">
                      <div>1x $4.500</div>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                    <div>
                      <strong>Brasier Comfort</strong><br>
                      <span style="color: #666; font-size: 14px;">Talle 90 - Rojo</span>
                    </div>
                    <div style="text-align: right;">
                      <div>1x $4.000</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Total -->
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span>Subtotal:</span>
                  <span>$8.500</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #d8ceb5;">
                  <span>Descuento (BIENVENIDA15):</span>
                  <span>-$1.275</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span>Envío:</span>
                  <span>$1.200</span>
                </div>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
                  <span>Total:</span>
                  <span>$8.425</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://saku-lenceria.com/mi-cuenta/pedidos" style="background: #d8ceb5; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Ver estado del pedido
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                © 2024 Sakú Lencería. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      }
    })
    
    if (orderResponse.status === 200) {
      console.log('✅ Email de confirmación enviado:', orderResponse.data.messageId)
      results.orderConfirmation = { ...orderResponse.data, orderNumber }
    }
    
    await wait(3000)
    
    // 3. Email de seguimiento de envío
    console.log('\n3️⃣ PASO 3: Envío del pedido')
    console.log('� Enviando email de seguimiento...')
    
    const trackingNumber = 'CA' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')
    
    const shippingResponse = await makeRequest(`${BASE_URL}/api/test/send-email`, {
      body: {
        to: CUSTOMER_EMAIL,
        subject: `Tu pedido ${orderNumber} está en camino �`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d8ceb5 0%, #f5f1e8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold;">Sakú Lencería</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Tu pedido está en camino</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #000000; font-size: 24px; margin: 0 0 20px 0;">¡Tu pedido ya salió! �</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${CUSTOMER_NAME}, tu pedido <strong>${orderNumber}</strong> ha sido enviado y está en camino.
              </p>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
                <h3 style="color: #000000; margin: 0 0 15px 0;">Información de envío</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Código de seguimiento:</strong> ${trackingNumber}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Fecha de envío:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Entrega estimada:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Dirección:</strong> Av. Colón 1234, Córdoba</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.correoargentino.com.ar/formularios/ondnc?codigo=${trackingNumber}" style="background: #d8ceb5; color: #000000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Rastrear envío
                </a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>Importante:</strong> Por razones de higiene, no se aceptan devoluciones de productos de lencería.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                © 2024 Sakú Lencería. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      }
    })
    
    if (shippingResponse.status === 200) {
      console.log('✅ Email de seguimiento enviado:', shippingResponse.data.messageId)
      console.log('� Código de seguimiento:', trackingNumber)
      results.shipping = shippingResponse.data
    }
    
    await wait(3000)
    
    // 4. Newsletter
    console.log('\n4️⃣ PASO 4: Newsletter y seguimiento postventa')
    console.log('� Enviando newsletter...')
    
    const newsletterResponse = await makeRequest(`${BASE_URL}/api/test/send-email`, {
      body: {
        to: CUSTOMER_EMAIL,
        subject: 'Nuevas colecciones y ofertas especiales �',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d8ceb5 0%, #f5f1e8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #000000; font-size: 28px; margin: 0; font-weight: bold;">Sakú Lencería</h1>
              <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">Newsletter exclusiva</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #000000; font-size: 24px; margin: 0 0 20px 0;">¡Hola ${CUSTOMER_NAME}! ✨</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Tenemos nuevas colecciones y ofertas especiales que no te puedes perder.
              </p>
              
              <!-- Productos destacados -->
              <h3 style="color: #000000; margin: 0 0 20px 0;">Productos destacados</h3>
              
              <div style="display: flex; gap: 20px; margin: 0 0 30px 0;">
                <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                  <div style="background: #f8f8f8; height: 150px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #999;">Imagen del producto</span>
                  </div>
                  <div style="padding: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #000000;">Conjunto Seduction</h4>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Elegancia y sensualidad</p>
                    <p style="margin: 0; font-weight: bold; color: #d8ceb5; font-size: 18px;">$5.200</p>
                  </div>
                </div>
                
                <div style="flex: 1; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                  <div style="background: #f8f8f8; height: 150px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #999;">Imagen del producto</span>
                  </div>
                  <div style="padding: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #000000;">Brasier Push-Up Deluxe</h4>
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Máximo realce y comodidad</p>
                    <p style="margin: 0; font-weight: bold; color: #d8ceb5; font-size: 18px;">$3.800</p>
                  </div>
                </div>
              </div>
              
              <!-- Oferta especial -->
              <div style="background: linear-gradient(135deg, #d8ceb5 0%, #f5f1e8 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 0 0 30px 0;">
                <h3 style="color: #000000; margin: 0 0 15px 0;">¡Oferta especial para ti!</h3>
                <p style="color: #333; margin: 0 0 20px 0;">20% de descuento en toda la tienda</p>
                <div style="background: #ffffff; padding: 15px; border-radius: 5px; margin: 0 0 20px 0;">
                  <span style="font-size: 24px; font-weight: bold; color: #000000; letter-spacing: 2px;">NEWSLETTER20</span>
                </div>
                <a href="https://saku-lenceria.com/productos" style="background: #000000; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Comprar ahora
                </a>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                  ¿No quieres recibir más emails? 
                  <a href="#" style="color: #d8ceb5;">Darse de baja</a>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                © 2024 Sakú Lencería. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      }
    })
    
    if (newsletterResponse.status === 200) {
      console.log('✅ Newsletter enviado:', newsletterResponse.data.messageId)
      results.newsletter = newsletterResponse.data
    }
    
    // Resumen final
    console.log('\n============================================================')
    console.log('� RESUMEN DE LA SIMULACIÓN')
    console.log('============================================================')
    
    const successCount = Object.values(results).filter(r => r !== null).length
    const totalSteps = Object.keys(results).length
    
    console.log(`✅ Emails enviados exitosamente: ${successCount}/${totalSteps}`)
    console.log('')
    
    Object.entries(results).forEach(([type, result]) => {
      const status = result ? '✅' : '❌'
      const messageId = result ? ` (${result.messageId})` : ''
      console.log(`${status} ${type.charAt(0).toUpperCase() + type.slice(1)}${messageId}`)
    })
    
    console.log('\n� VERIFICACIÓN RESPONSIVE:')
    console.log('• Abre los emails en tu móvil para verificar el diseño responsive')
    console.log('• Verifica que los botones sean fáciles de tocar en móvil')
    console.log('• Confirma que el texto sea legible en pantallas pequeñas')
    console.log('• Revisa que las imágenes se adapten correctamente')
    
    console.log('\n� PRÓXIMOS PASOS:')
    console.log('• Crear endpoints API para cada tipo de email')
    console.log('• Integrar con el sistema de autenticación')
    console.log('• Configurar triggers automáticos en el flujo de compra')
    console.log('• Implementar sistema de templates dinámicos desde DB')
    
  } catch (error) {
    console.error('� Error en la simulación:', error.message)
  }
}

// Ejecutar la simulación
if (require.main === module) {
  simulateCustomerJourney()
    .then(() => {
      console.log('\n� Simulación completada')
      process.exit(0)
    })
    .catch(error => {
      console.error('� Error fatal:', error)
      process.exit(1)
    })
}

module.exports = { simulateCustomerJourney }
