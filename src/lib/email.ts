import nodemailer from 'nodemailer'
import { formatPrice } from '@/lib/utils'

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
    user_id: string | null
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | null
    created_at: string | null
    subtotal: number
    discount_amount: number | null
    shipping_cost: number
    total: number
    shipping_address: any
    billing_address: any | null
    tracking_number?: string | null
    email: string
    coupon_code?: string | null
    payment_id?: string | null
    payment_method?: string | null
    notes?: string | null
    updated_at?: string | null
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

export interface WelcomeEmailData {
  customerName: string
  customerEmail: string
}

export interface ShippingEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  trackingNumber: string
  trackingUrl?: string
  estimatedDelivery?: string
}

export interface NewsletterEmailData {
  customerName?: string
  customerEmail: string
  featuredProducts?: Array<{
    name: string
    price: number
    image?: string
    url: string
  }>
  promotionCode?: string
  promotionDiscount?: number
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

// Plantilla base responsive para emails
const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sakú Lencería</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset y base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      width: 100% !important;
      min-width: 100%;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    /* Container principal */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
    }
    
    /* Header */
    .header {
      background-color: #ffffff;
      padding: 24px 20px;
      text-align: center;
      border-bottom: 2px solid #d8ceb5;
    }
    
    .logo {
      font-family: 'Razed Bold', Georgia, serif;
      font-size: 36px;
      font-weight: bold;
      color: #000000;
      text-decoration: none;
      display: inline-block;
      letter-spacing: 1px;
    }
    
    /* Content */
    .content {
      padding: 32px 20px;
    }
    
    .content h1 {
      font-size: 28px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    
    .content h2 {
      font-size: 22px;
      font-weight: 600;
      color: #000000;
      margin: 24px 0 12px 0;
      line-height: 1.3;
    }
    
    .content h3 {
      font-size: 18px;
      font-weight: 600;
      color: #000000;
      margin: 20px 0 8px 0;
      line-height: 1.3;
    }
    
    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      margin-bottom: 16px;
    }
    
    /* Botones */
    .button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: background-color 0.3s ease;
    }
    
    .button:hover {
      background-color: #333333;
    }
    
    .button-secondary {
      background-color: #d8ceb5;
      color: #000000 !important;
    }
    
    .button-secondary:hover {
      background-color: #c9bfa0;
    }
    
    /* Order summary */
    .order-summary {
      background-color: #f9f9f9;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .order-summary h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #000000;
    }
    
    .order-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 14px;
      color: #666666;
    }
    
    .order-info strong {
      color: #000000;
    }
    
    /* Items */
    .item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .item:last-child {
      border-bottom: none;
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-name {
      font-weight: 600;
      color: #000000;
      margin-bottom: 4px;
    }
    
    .item-variant {
      font-size: 14px;
      color: #666666;
      margin-bottom: 4px;
    }
    
    .item-quantity {
      font-size: 14px;
      color: #666666;
    }
    
    .item-price {
      font-weight: 600;
      color: #000000;
      text-align: right;
      white-space: nowrap;
      margin-left: 16px;
    }
    
    /* Totales */
    .totals {
      border-top: 2px solid #d8ceb5;
      padding-top: 16px;
      margin-top: 16px;
    }
    
    .total-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 16px;
    }
    
    .total-line.final {
      font-weight: bold;
      font-size: 18px;
      color: #000000;
      border-top: 1px solid #e5e5e5;
      padding-top: 12px;
      margin-top: 8px;
    }
    
    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-paid {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status-shipped {
      background-color: #cce5ff;
      color: #004085;
    }
    
    .status-delivered {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    
    /* Tracking */
    .tracking-info {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    
    .tracking-number {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #000000;
      background-color: #ffffff;
      padding: 8px 16px;
      border-radius: 4px;
      display: inline-block;
      margin: 8px 0;
    }
    
    /* Products grid */
    .products-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 24px 0;
    }
    
    .product-card {
      flex: 1;
      min-width: 250px;
      background-color: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .product-image {
      width: 100%;
      height: 200px;
      background-color: #e5e5e5;
      border-radius: 4px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666666;
    }
    
    .product-name {
      font-weight: 600;
      color: #000000;
      margin-bottom: 8px;
    }
    
    .product-price {
      font-size: 18px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 12px;
    }
    
    /* Footer */
    .footer {
      background-color: #f8f9fa;
      padding: 32px 20px;
      text-align: center;
      border-top: 1px solid #e5e5e5;
    }
    
    .footer p {
      font-size: 14px;
      color: #666666;
      margin-bottom: 8px;
    }
    
    .footer .brand {
      font-weight: 600;
      color: #000000;
    }
    
    .footer .contact {
      font-size: 12px;
      color: #999999;
    }
    
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        border: none !important;
      }
      
      .header {
        padding: 20px 16px !important;
      }
      
      .logo {
        font-size: 28px !important;
      }
      
      .content {
        padding: 24px 16px !important;
      }
      
      .content h1 {
        font-size: 24px !important;
      }
      
      .content h2 {
        font-size: 20px !important;
      }
      
      .order-summary {
        padding: 16px !important;
        margin: 16px 0 !important;
      }
      
      .item {
        flex-direction: column !important;
        align-items: flex-start !important;
        padding: 12px 0 !important;
      }
      
      .item-price {
        margin-left: 0 !important;
        margin-top: 8px !important;
        text-align: left !important;
      }
      
      .button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
        padding: 16px 20px !important;
      }
      
      .footer {
        padding: 24px 16px !important;
      }
      
      .tracking-number {
        font-size: 16px !important;
        word-break: break-all !important;
      }
      
      .products-grid {
        flex-direction: column !important;
      }
      
      .product-card {
        min-width: auto !important;
      }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container {
        background-color: #ffffff !important;
      }
      
      body {
        background-color: #ffffff !important;
      }
    }
    
    /* Outlook specific */
    <!--[if mso]>
    .content h1, .content h2, .content h3 {
      font-family: Arial, sans-serif !important;
    }
    <![endif]-->
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">Sakú</div>
    </div>
    
    <div class="content">
      ${content}
    </div>
    
    <div class="footer">
      <p class="brand">Sakú Lencería</p>
      <p>Elegancia y comodidad en cada prenda</p>
      <p class="contact">Si tienes alguna consulta, contáctanos respondiendo a este email.</p>
    </div>
  </div>
</body>
</html>
`

// Email de bienvenida/registro
export const sendWelcomeEmail = async (data: WelcomeEmailData) => {
  const { customerName, customerEmail } = data
  
  const content = `
    <h1>¡Bienvenida a Sakú Lencería, ${customerName}!</h1>
    
    <p>Nos emociona tenerte como parte de nuestra comunidad. En Sakú creemos que cada mujer merece sentirse hermosa y cómoda en su propia piel.</p>
    
    <div class="info-box">
      <h3>¿Qué puedes esperar de nosotras?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 12px;">Lencería de alta calidad diseñada para realzar tu belleza natural</li>
        <li style="margin-bottom: 12px;">Atención personalizada y asesoramiento en tallas</li>
        <li style="margin-bottom: 12px;">Envíos discretos y seguros a todo el país</li>
        <li style="margin-bottom: 12px;">Ofertas exclusivas y novedades antes que nadie</li>
      </ul>
    </div>
    
    <p><div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}" class="button">Descubrir Colección</a>
    </div>
    
    <p style="text-align: center; color: #666666; font-style: italic;">
      "La elegancia es la única belleza que nunca se desvanece" - Audrey Hepburn
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}" class="button">
        Explorar Colección
      </a>
    </div>
    
    <p>Si tienes alguna pregunta sobre talles, cuidado de las prendas o cualquier consulta, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
  `
  
  const emailConfig: EmailConfig = {
    to: customerEmail,
    subject: '¡Bienvenida a Sakú Lencería! ���',
    html: getEmailTemplate(content),
    text: `¡Bienvenida a Sakú Lencería, ${customerName}! Nos alegra tenerte como parte de nuestra comunidad. Como bienvenida, usa el código BIENVENIDA15 para obtener 15% de descuento en tu primera compra.`
  }
  
  return await sendEmail(emailConfig)
}

// Email de confirmación de pedido mejorado
export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  const { order, customerEmail, items } = data
  
  const statusMessages = {
    pending: 'Tu pedido ha sido recibido y está siendo procesado',
    paid: 'Tu pedido ha sido confirmado y está siendo preparado',
    processing: 'Tu pedido está siendo preparado con mucho cuidado',
    shipped: 'Tu pedido está en camino',
    delivered: 'Tu pedido ha sido entregado',
    cancelled: 'Tu pedido ha sido cancelado',
    refunded: 'Tu pedido ha sido reembolsado'
  }
  
  const statusClass = {
    pending: 'status-pending',
    paid: 'status-paid',
    processing: 'status-paid',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-pending',
    refunded: 'status-pending'
  }

  const currentStatus = order.status || 'pending'
  
  const content = `
    <h1>¡Gracias por tu compra!</h1>
    <p>${statusMessages[currentStatus]}. Te enviaremos actualizaciones sobre el estado de tu pedido.</p>
    
    <div class="order-summary">
      <h3>Resumen del pedido</h3>
      <div class="order-info">
        <span><strong>Número de pedido:</strong></span>
        <span>#${order.id}</span>
      </div>
      <div class="order-info">
        <span><strong>Fecha:</strong></span>
        <span>${new Date(order.created_at || new Date()).toLocaleDateString('es-AR')}</span>
      </div>
      <div class="order-info">
        <span><strong>Estado:</strong></span>
        <span class="status-badge ${statusClass[currentStatus]}">${statusMessages[currentStatus]}</span>
      </div>
      
      <div style="margin-top: 20px;">
        ${items.map(item => `
          <div class="item">
            <div class="item-details">
              <div class="item-name">${item.product_snapshot?.name || 'Producto'}</div>
              ${item.product_snapshot?.variant_name ? `<div class="item-variant">Variante: ${item.product_snapshot.variant_name}</div>` : ''}
              <div class="item-quantity">Cantidad: ${item.quantity}</div>
            </div>
            <div class="item-price">
              ${formatPrice(item.total_price)}
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>${formatPrice(order.subtotal)}</span>
        </div>
        ${(order.discount_amount || 0) > 0 ? `
          <div class="total-line">
            <span>Descuento:</span>
            <span>-${formatPrice(order.discount_amount || 0)}</span>
          </div>
        ` : ''}
        <div class="total-line">
          <span>Envío:</span>
          <span>${formatPrice(order.shipping_cost)}</span>
        </div>
        <div class="total-line final">
          <span>Total:</span>
          <span>${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
    
    ${currentStatus === 'paid' ? `
      <p><strong>¿Qué sigue?</strong></p>
      <p>Tu pedido será preparado en las próximas 24-48 horas. Te enviaremos un email con el código de seguimiento una vez que sea despachado.</p>
    ` : `
      <p><strong>Información de pago:</strong></p>
      <p>Una vez que se confirme el pago, comenzaremos a preparar tu pedido inmediatamente.</p>
    `}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}/orders/${order.id}" class="button">
        Ver Detalles del Pedido
      </a>
    </div>
  `
  
  const emailConfig: EmailConfig = {
    to: customerEmail,
    subject: `Confirmación de pedido #${order.id} - Sakú Lencería`,
    html: getEmailTemplate(content),
    text: `Gracias por tu compra. Tu pedido #${order.id} ha sido recibido y está ${statusMessages[currentStatus].toLowerCase()}.`
  }
  
  return await sendEmail(emailConfig)
}

// Email de seguimiento de envío
export const sendShippingEmail = async (data: ShippingEmailData) => {
  const { customerName, customerEmail, orderNumber, trackingNumber, trackingUrl, estimatedDelivery } = data
  
  const content = `
    <h1>¡Tu pedido está en camino!</h1>
    <p>Hola ${customerName}, tu pedido #${orderNumber} ha sido despachado y está en camino hacia ti.</p>
    
    <div class="tracking-info">
      <h3 style="margin-top: 0;">Código de seguimiento</h3>
      <div class="tracking-number">${trackingNumber}</div>
      ${trackingUrl ? `
        <div style="margin-top: 16px;">
          <a href="${trackingUrl}" class="button-secondary" style="text-decoration: none;">
            Rastrear Envío
          </a>
        </div>
      ` : ''}
      ${estimatedDelivery ? `
        <p style="margin: 16px 0 0 0; font-size: 14px; color: #666;">
          <strong>Entrega estimada:</strong> ${estimatedDelivery}
        </p>
      ` : ''}
    </div>
    
    <div class="order-summary">
      <h3>Información del envío</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">El paquete está protegido y embalado discretamente</li>
        <li style="margin-bottom: 8px;">Recibirás notificaciones del estado del envío</li>
        <li style="margin-bottom: 8px;">Si no estás en casa, el transportista dejará un aviso</li>
        <li style="margin-bottom: 8px;">Conserva el código de seguimiento para cualquier consulta</li>
      </ul>
    </div>
    
    <p><strong>¿Tienes alguna pregunta?</strong></p>
    <p>Si necesitas modificar la dirección de entrega o tienes alguna consulta sobre tu envío, contáctanos lo antes posible.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}/orders/${orderNumber}" class="button">
        Ver Estado del Pedido
      </a>
    </div>
  `
  
  const emailConfig: EmailConfig = {
    to: customerEmail,
    subject: `Tu pedido #${orderNumber} está en camino ���`,
    html: getEmailTemplate(content),
    text: `Tu pedido #${orderNumber} ha sido despachado. Código de seguimiento: ${trackingNumber}. ${trackingUrl ? `Rastrea tu envío en: ${trackingUrl}` : ''}`
  }
  
  return await sendEmail(emailConfig)
}

// Email de newsletter
export const sendNewsletterEmail = async (data: NewsletterEmailData) => {
  const { customerName, customerEmail, featuredProducts, promotionCode, promotionDiscount } = data
  
  const content = `
    <h1>Nuevas llegadas que te van a encantar</h1>
    <p>${customerName ? `Hola ${customerName}, ` : ''}descubre nuestra nueva colección de lencería diseñada especialmente para realzar tu belleza natural.</p>
    
    ${promotionCode ? `
      <div class="tracking-info">
        <h3 style="margin-top: 0;">Oferta especial para ti</h3>
        <p style="margin: 0 0 8px 0;">Obtén <strong>${promotionDiscount}% de descuento</strong> en toda la tienda</p>
        <div class="tracking-number">${promotionCode}</div>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">Válido por tiempo limitado</p>
      </div>
    ` : ''}
    
    ${featuredProducts && featuredProducts.length > 0 ? `
      <h2>Productos destacados</h2>
      <div class="products-grid">
        ${featuredProducts.map(product => `
          <div class="product-card">
            <div class="product-image">
              ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : 'Imagen del producto'}
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatPrice(product.price)}</div>
            <a href="${product.url}" class="button-secondary" style="text-decoration: none; display: inline-block; padding: 8px 16px; font-size: 14px;">
              Ver Producto
            </a>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="order-summary">
      <h3>¿Por qué elegir Sakú?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Materiales de primera calidad y diseños únicos</li>
        <li style="margin-bottom: 8px;">Talles desde 85 hasta 100 para todas las siluetas</li>
        <li style="margin-bottom: 8px;">Envíos discretos y seguros a todo el país</li>
        <li style="margin-bottom: 8px;">Atención personalizada y asesoramiento experto</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://saku-lenceria.com'}" class="button">
        Explorar Colección
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; text-align: center;">
      Si no deseas recibir más newsletters, puedes <a href="#" style="color: #666;">darte de baja aquí</a>.
    </p>
  `
  
  const emailConfig: EmailConfig = {
    to: customerEmail,
    subject: 'Nuevas llegadas y ofertas especiales - Sakú Lencería ✨',
    html: getEmailTemplate(content),
    text: `Descubre nuestra nueva colección de lencería. ${promotionCode ? `Usa el código ${promotionCode} para obtener ${promotionDiscount}% de descuento.` : ''} Visita nuestra tienda en línea.`
  }
  
  return await sendEmail(emailConfig)
}

// Función base para enviar emails
const sendEmail = async (config: EmailConfig) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: config.to,
      subject: config.subject,
      html: config.html,
      text: config.text,
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('Email enviado exitosamente:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export { sendEmail }