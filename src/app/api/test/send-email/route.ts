import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { to, subject = 'Email de Prueba - Sakú Lencería' } = await request.json()

    if (!to) {
      return NextResponse.json({ success: false, error: 'Email destinatario requerido' }, { status: 400 })
    }

    // Configurar transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Contenido del email de prueba
    const testEmailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prueba de Email - Sakú Lencería</title>
  <style>
    body { 
      font-family: 'Inter', Arial, sans-serif; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #ffffff;
      color: #000000;
    }
    .header { 
      text-align: center; 
      padding: 30px 0; 
      border-bottom: 2px solid #d8ceb5; 
      margin-bottom: 30px;
    }
    .logo { 
      font-family: 'Razed Bold', serif;
      font-size: 36px; 
      color: #000000; 
      font-weight: bold; 
      letter-spacing: 2px;
    }
    .content { 
      margin: 30px 0; 
      line-height: 1.6;
    }
    .highlight-box {
      background: #f9f9f9; 
      padding: 25px; 
      border-radius: 8px; 
      margin: 25px 0;
      border-left: 4px solid #d8ceb5;
    }
    .footer { 
      text-align: center; 
      padding: 30px 0; 
      border-top: 1px solid #eee; 
      color: #666; 
      margin-top: 40px;
    }
    .status-badge {
      display: inline-block;
      background: #d8ceb5;
      color: #000;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    li:before {
      content: "✅ ";
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Sakú</div>
    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Lencería Premium</p>
  </div>
  
  <div class="content">
    <h2 style="color: #000; margin-bottom: 20px;">🧪 Email de Prueba</h2>
    <p>¡Hola Ale!</p>
    
    <p>Este es un email de prueba del sistema de Sakú Lencería. El sistema de emails está funcionando correctamente.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; color: #000;">Detalles de la prueba:</h3>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-AR', { 
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p><strong>Sistema:</strong> Sakú Lencería E-commerce</p>
      <p><strong>Tipo:</strong> Email de confirmación de pedido</p>
      <p><strong>Estado:</strong> <span class="status-badge">Funcionando correctamente</span></p>
    </div>
    
    <p>Los emails del sistema están configurados y funcionando correctamente.</p>
    
    <p><strong>Tipos de email disponibles:</strong></p>
    <ul>
      <li>Confirmación de pedido</li>
      <li>Actualización de estado</li>
      <li>Código de seguimiento</li>
      <li>Pedido entregado</li>
      <li>Emails promocionales</li>
      <li>Recuperación de carrito abandonado</li>
    </ul>

    <div style="margin: 30px 0; padding: 20px; background: #f8f8f8; border-radius: 8px;">
      <h4 style="margin-top: 0; color: #000;">Configuración SMTP:</h4>
      <p style="font-family: monospace; font-size: 12px; color: #666;">
        Host: ${process.env.SMTP_HOST}<br>
        Puerto: ${process.env.SMTP_PORT}<br>
        Usuario: ${process.env.SMTP_USER}<br>
        From: ${process.env.SMTP_FROM}
      </p>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>Sakú Lencería</strong> - Sistema de emails funcionando ✨</p>
    <p style="font-size: 12px; color: #999;">Generado automáticamente por el script de pruebas</p>
  </div>
</body>
</html>
    `

    const textContent = `
SAKÚ LENCERÍA - Email de Prueba

¡Hola Ale!

Este es un email de prueba del sistema de Sakú Lencería.

Detalles de la prueba:
- Fecha: ${new Date().toLocaleString('es-AR')}
- Sistema: Sakú Lencería E-commerce
- Tipo: Email de confirmación de pedido
- Estado: ✅ Funcionando correctamente

Los emails del sistema están configurados y funcionando correctamente.

Tipos de email disponibles:
✅ Confirmación de pedido
✅ Actualización de estado
✅ Código de seguimiento
✅ Pedido entregado
✅ Emails promocionales
✅ Recuperación de carrito abandonado

Configuración SMTP:
Host: ${process.env.SMTP_HOST}
Puerto: ${process.env.SMTP_PORT}
Usuario: ${process.env.SMTP_USER}
From: ${process.env.SMTP_FROM}

Sakú Lencería - Sistema de emails funcionando ✨
    `.trim()

    // Enviar email
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      html: testEmailContent,
      text: textContent,
    })

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error enviando email de prueba:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    )
  }
}