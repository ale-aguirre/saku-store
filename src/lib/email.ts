import nodemailer from 'nodemailer'

interface EmailConfig {
  to: string
  subject: string
  html: string
}

interface OrderEmailData {
  orderNumber: string
  customerName: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
    size: string
    color: string
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    province: string
    postalCode: string
  }
  trackingCode?: string
}

// Configurar transporter de nodemailer
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

// Plantilla base para emails
const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sakú Lencería</title>
  <style>
    body {
      font-family: 'Inter', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #d8ceb5;
      margin-bottom: 30px;
    }
    .logo {
      font-family: 'Razed Bold', Arial, sans-serif;
      font-size: 32px;
      color: #000;
      text-decoration: none;
    }
    .content {
      margin: 30px 0;
    }
    .order-summary {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .total {
      font-weight: bold;
      font-size: 18px;
      text-align: right;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid #d8ceb5;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      border-top: 1px solid #eee;
      margin-top: 40px;
      color: #666;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: #000;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Sakú</div>
  </div>
  
  <div class="content">
    ${content}
  </div>
  
  <div class="footer">
    <p>Sakú Lencería - Elegancia y comodidad en cada prenda</p>
    <p>Si tienes alguna consulta, contáctanos respondiendo a este email.</p>
  </div>
</body>
</html>
`

// Email de confirmación de pedido
export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  const content = `
    <h2>¡Gracias por tu compra, ${data.customerName}!</h2>
    
    <p>Hemos recibido tu pedido <strong>#${data.orderNumber}</strong> y lo estamos procesando.</p>
    
    <div class="order-summary">
      <h3>Resumen del pedido:</h3>
      ${data.items.map(item => `
        <div class="item">
          <div>
            <strong>${item.name}</strong><br>
            <small>Talle ${item.size} • ${item.color} • Cantidad: ${item.quantity}</small>
          </div>
          <div>$${(item.price / 100).toLocaleString()}</div>
        </div>
      `).join('')}
      
      <div class="total">
        Total: $${(data.total / 100).toLocaleString()}
      </div>
    </div>
    
    <h3>Dirección de envío:</h3>
    <p>
      ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
      ${data.shippingAddress.address}<br>
      ${data.shippingAddress.city}, ${data.shippingAddress.province}<br>
      CP: ${data.shippingAddress.postalCode}
    </p>
    
    <p><strong>Próximos pasos:</strong></p>
    <ul>
      <li>Prepararemos tu pedido en 1-2 días hábiles</li>
      <li>Te enviaremos el código de seguimiento cuando despachemos tu pedido</li>
      <li>El tiempo de entrega es de 3-7 días hábiles</li>
    </ul>
    
    <p><em>Importante:</em> Por razones de higiene, no se aceptan devoluciones de productos de lencería.</p>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cuenta/pedidos" class="button">Ver mi pedido</a>
  `

  const emailConfig: EmailConfig = {
    to: data.customerName, // Aquí debería ir el email del cliente
    subject: `Confirmación de pedido #${data.orderNumber} - Sakú Lencería`,
    html: getEmailTemplate(content)
  }

  return sendEmail(emailConfig)
}

// Email de actualización de estado
export const sendOrderStatusUpdateEmail = async (data: OrderEmailData & { status: string }) => {
  let statusMessage = ''
  let statusTitle = ''

  switch (data.status) {
    case 'paid':
      statusTitle = 'Pago confirmado'
      statusMessage = 'Hemos confirmado el pago de tu pedido. Comenzaremos a prepararlo en las próximas horas.'
      break
    case 'processing':
      statusTitle = 'Preparando tu pedido'
      statusMessage = 'Estamos preparando tu pedido con mucho cuidado. Pronto estará listo para el envío.'
      break
    case 'shipped':
      statusTitle = 'Pedido enviado'
      statusMessage = `Tu pedido está en camino. ${data.trackingCode ? `Código de seguimiento: <strong>${data.trackingCode}</strong>` : ''}`
      break
    case 'delivered':
      statusTitle = 'Pedido entregado'
      statusMessage = '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus nuevas prendas.'
      break
    default:
      statusTitle = 'Actualización de pedido'
      statusMessage = 'El estado de tu pedido ha sido actualizado.'
  }

  const content = `
    <h2>${statusTitle}</h2>
    
    <p>Hola ${data.customerName},</p>
    
    <p>${statusMessage}</p>
    
    <p><strong>Pedido:</strong> #${data.orderNumber}</p>
    <p><strong>Total:</strong> $${(data.total / 100).toLocaleString()}</p>
    
    ${data.trackingCode ? `
      <p><strong>Código de seguimiento:</strong> ${data.trackingCode}</p>
      <p>Puedes hacer seguimiento de tu envío en: <a href="https://www.correoargentino.com.ar/formularios/e-commerce">Correo Argentino</a></p>
    ` : ''}
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cuenta/pedidos" class="button">Ver mi pedido</a>
  `

  const emailConfig: EmailConfig = {
    to: data.customerName, // Aquí debería ir el email del cliente
    subject: `${statusTitle} - Pedido #${data.orderNumber}`,
    html: getEmailTemplate(content)
  }

  return sendEmail(emailConfig)
}

// Función base para enviar emails
export const sendEmail = async (config: EmailConfig) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Sakú Lencería" <${process.env.SMTP_FROM}>`,
      to: config.to,
      subject: config.subject,
      html: config.html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}