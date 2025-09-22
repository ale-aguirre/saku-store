import nodemailer from 'nodemailer'

interface EmailConfig {
  to: string
  subject: string
  html: string
  text?: string
}

export interface OrderEmailData {
  customerName?: string
  orderNumber?: string
  total?: number
  trackingCode?: string
  order: {
    id: string
    order_number: string
    user_id: string
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
    created_at: string
    subtotal: number
    discount_amount: number
    shipping_amount: number
    tax_amount: number
    total_amount: number
    shipping_address: any
    billing_address: any
    tracking_number?: string | null
    tracking_url?: string | null
  }
  customerEmail: string
  items: Array<{
    id: string
    order_id: string
    variant_id: string
    quantity: number
    unit_price: number
    total_price: number
    product_snapshot: any
  }>
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
  const { order, customerEmail, items } = data
  const formatPrice = (price: number) => `$${price.toLocaleString('es-AR')}`
  
  const content = `
    <h2>¡Gracias por tu compra!</h2>
    <p>Hemos recibido tu pedido <strong>#${order.order_number}</strong> y lo estamos procesando.</p>
    
    <div class="order-summary">
      <h3>Resumen del pedido</h3>
      <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-AR')}</p>
      <p><strong>Estado:</strong> ${order.status === 'pending' ? 'Pendiente de pago' : 'Confirmado'}</p>
      
      ${items.map(item => `
        <div class="item">
          <div>
            <strong>${item.product_snapshot?.name || 'Producto'}</strong><br>
            ${item.product_snapshot?.variant_name ? `<small>Variante: ${item.product_snapshot.variant_name}</small>` : ''}
          </div>
          <div>
            ${item.quantity} × ${formatPrice(item.unit_price)} = ${formatPrice(item.total_price)}
          </div>
        </div>
      `).join('')}
      
      <div style="margin-top: 15px;">
        <p><strong>Subtotal:</strong> ${formatPrice(order.subtotal)}</p>
        ${order.discount_amount > 0 ? `<p><strong>Descuento:</strong> -${formatPrice(order.discount_amount)}</p>` : ''}
        <p><strong>Envío:</strong> ${formatPrice(order.shipping_amount)}</p>
        ${order.tax_amount > 0 ? `<p><strong>Impuestos:</strong> ${formatPrice(order.tax_amount)}</p>` : ''}
      </div>
      
      <div class="total">
        Total: ${formatPrice(order.total_amount)}
      </div>
    </div>
    
    ${order.shipping_address ? `
    <div class="order-summary">
      <h3>Dirección de envío</h3>
      <p>
        ${order.shipping_address.first_name} ${order.shipping_address.last_name}<br>
        ${order.shipping_address.address_line_1}<br>
        ${order.shipping_address.address_line_2 ? `${order.shipping_address.address_line_2}<br>` : ''}
        ${order.shipping_address.city}, ${order.shipping_address.state}<br>
        ${order.shipping_address.postal_code}
      </p>
    </div>
    ` : ''}
    
    <p>Te enviaremos un email con el código de seguimiento una vez que tu pedido sea despachado.</p>
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" class="button">Ver estado del pedido</a>
  `

  const textContent = `
SAKÚ LENCERÍA - Confirmación de Pedido

¡Gracias por tu compra!

Pedido: #${order.order_number}
Fecha: ${new Date(order.created_at).toLocaleDateString('es-AR')}
Estado: ${order.status === 'pending' ? 'Pendiente de pago' : 'Confirmado'}

PRODUCTOS:
${items.map(item => `- ${item.product_snapshot?.name || 'Producto'}${item.product_snapshot?.variant_name ? ` (${item.product_snapshot.variant_name})` : ''}
  ${item.quantity} × ${formatPrice(item.unit_price)} = ${formatPrice(item.total_price)}`).join('\n')}

Subtotal: ${formatPrice(order.subtotal)}
${order.discount_amount > 0 ? `Descuento: -${formatPrice(order.discount_amount)}\n` : ''}Envío: ${formatPrice(order.shipping_amount)}
Total: ${formatPrice(order.total_amount)}

${order.shipping_address ? `DIRECCIÓN DE ENVÍO:
${order.shipping_address.name}
${order.shipping_address.address_line_1}
${order.shipping_address.address_line_2 ? `${order.shipping_address.address_line_2}\n` : ''}${order.shipping_address.city}, ${order.shipping_address.state}
${order.shipping_address.postal_code}` : ''}

Te enviaremos un email con el código de seguimiento una vez que tu pedido sea despachado.

Ver estado del pedido: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}
  `.trim()

  const emailConfig: EmailConfig = {
    to: customerEmail,
    subject: `Confirmación de pedido #${order.order_number} - Sakú Lencería`,
    html: getEmailTemplate(content),
    text: textContent
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
    <p><strong>Total:</strong> $${((data.total || 0) / 100).toLocaleString()}</p>
    
    ${data.trackingCode ? `
      <p><strong>Código de seguimiento:</strong> ${data.trackingCode}</p>
      <p>Puedes hacer seguimiento de tu envío en: <a href="https://www.correoargentino.com.ar/formularios/e-commerce">Correo Argentino</a></p>
    ` : ''}
    
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/cuenta/pedidos" class="button">Ver mi pedido</a>
  `

  const emailConfig: EmailConfig = {
    to: data.customerEmail,
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
      from: process.env.SMTP_FROM || 'noreply@sakulenceria.com',
      to: config.to,
      subject: config.subject,
      html: config.html,
      ...(config.text && { text: config.text }),
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email enviado exitosamente:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}