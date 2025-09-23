#!/usr/bin/env node

/**
 * Script de notificación por email para reportar el estado de las tareas
 * Envía un email a aguirrealexis.cba@gmail.com con el resumen de tareas completadas
 */

const path = require('path');

// Cargar variables de entorno del proyecto principal
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const nodemailer = require('nodemailer');
const fs = require('fs');

// Configuración del email
const EMAIL_CONFIG = {
  recipient: 'aguirrealexis.cba@gmail.com',
  sender: process.env.SMTP_FROM || 'noreply@sakulenceria.com',
  subject: '[Sakú Store] Reporte de Tareas Completadas'
};

// Estado de las tareas
const TASK_STATUS = {
  COMPLETED: 'completada',
  ERROR: 'error',
  PENDING: 'pendiente',
  IN_PROGRESS: 'en_progreso'
};

class TaskNotifier {
  constructor() {
    this.tasks = [];
    this.errors = [];
    this.startTime = new Date();
  }

  /**
   * Configura el transportador de email
   */
  setupEmailTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Agrega una tarea al reporte
   */
  addTask(name, status, details = '', error = null) {
    const task = {
      name,
      status,
      details,
      error,
      timestamp: new Date().toISOString()
    };
    
    this.tasks.push(task);
    
    if (error) {
      this.errors.push({ task: name, error: error.message || error });
    }
    
    console.log(`[TASK] ${name}: ${status}${details ? ` - ${details}` : ''}`);
  }

  /**
   * Genera el contenido HTML del email
   */
  generateEmailContent() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    const completedTasks = this.tasks.filter(t => t.status === TASK_STATUS.COMPLETED);
    const errorTasks = this.tasks.filter(t => t.status === TASK_STATUS.ERROR);
    const pendingTasks = this.tasks.filter(t => t.status === TASK_STATUS.PENDING);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: #d8ceb5; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .status-success { color: #28a745; }
    .status-error { color: #dc3545; }
    .status-pending { color: #ffc107; }
    .task-list { margin: 15px 0; }
    .task-item { padding: 10px; margin: 5px 0; border-left: 4px solid #ddd; background: #f8f9fa; }
    .task-completed { border-left-color: #28a745; }
    .task-error { border-left-color: #dc3545; }
    .task-pending { border-left-color: #ffc107; }
    .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 Sakú Store - Reporte de Tareas</h1>
    <p>Resumen de actividades completadas</p>
  </div>
  
  <div class="content">
    <div class="summary">
      <h2>📊 Resumen Ejecutivo</h2>
      <ul>
        <li><strong>Inicio:</strong> ${this.startTime.toLocaleString('es-AR')}</li>
        <li><strong>Finalización:</strong> ${endTime.toLocaleString('es-AR')}</li>
        <li><strong>Duración:</strong> ${duration} segundos</li>
        <li><strong>Total de tareas:</strong> ${this.tasks.length}</li>
        <li class="status-success"><strong>Completadas:</strong> ${completedTasks.length}</li>
        <li class="status-error"><strong>Con errores:</strong> ${errorTasks.length}</li>
        <li class="status-pending"><strong>Pendientes:</strong> ${pendingTasks.length}</li>
      </ul>
    </div>

    ${completedTasks.length > 0 ? `
    <h2 class="status-success">✅ Tareas Completadas (${completedTasks.length})</h2>
    <div class="task-list">
      ${completedTasks.map(task => `
        <div class="task-item task-completed">
          <strong>${task.name}</strong>
          ${task.details ? `<br><small>${task.details}</small>` : ''}
          <br><small>⏰ ${new Date(task.timestamp).toLocaleString('es-AR')}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${errorTasks.length > 0 ? `
    <h2 class="status-error">❌ Tareas con Errores (${errorTasks.length})</h2>
    <div class="task-list">
      ${errorTasks.map(task => `
        <div class="task-item task-error">
          <strong>${task.name}</strong>
          ${task.details ? `<br><small>${task.details}</small>` : ''}
          ${task.error ? `<br><small><strong>Error:</strong> ${task.error}</small>` : ''}
          <br><small>⏰ ${new Date(task.timestamp).toLocaleString('es-AR')}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${pendingTasks.length > 0 ? `
    <h2 class="status-pending">⏳ Tareas Pendientes (${pendingTasks.length})</h2>
    <div class="task-list">
      ${pendingTasks.map(task => `
        <div class="task-item task-pending">
          <strong>${task.name}</strong>
          ${task.details ? `<br><small>${task.details}</small>` : ''}
          <br><small>⏰ ${new Date(task.timestamp).toLocaleString('es-AR')}</small>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${this.errors.length > 0 ? `
    <h2 class="status-error">🔍 Detalles de Errores</h2>
    <div class="task-list">
      ${this.errors.map(error => `
        <div class="task-item task-error">
          <strong>Tarea:</strong> ${error.task}<br>
          <strong>Error:</strong> ${error.error}
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
  
  <div class="footer">
    <p>Este reporte fue generado automáticamente por el sistema de Sakú Store</p>
    <p>Proyecto: Sakú Lencería E-commerce</p>
  </div>
</body>
</html>
    `;

    return html;
  }

  /**
   * Envía el email de notificación
   */
  async sendNotification() {
    try {
      const transporter = this.setupEmailTransporter();
      const htmlContent = this.generateEmailContent();
      
      const mailOptions = {
        from: EMAIL_CONFIG.sender,
        to: EMAIL_CONFIG.recipient,
        subject: EMAIL_CONFIG.subject,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error.message);
      return false;
    }
  }

  /**
   * Guarda el reporte en un archivo local como respaldo
   */
  saveReportToFile() {
    try {
      const reportDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `task-report-${timestamp}.json`;
      const filepath = path.join(reportDir, filename);

      const report = {
        startTime: this.startTime,
        endTime: new Date(),
        tasks: this.tasks,
        errors: this.errors,
        summary: {
          total: this.tasks.length,
          completed: this.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
          errors: this.tasks.filter(t => t.status === TASK_STATUS.ERROR).length,
          pending: this.tasks.filter(t => t.status === TASK_STATUS.PENDING).length
        }
      };

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
      console.log(`📄 Reporte guardado en: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Error guardando reporte:', error.message);
      return null;
    }
  }

  /**
   * Finaliza el proceso y envía la notificación
   */
  async finish() {
    console.log('\n🏁 Finalizando proceso y enviando notificación...');
    
    // Guardar reporte local
    this.saveReportToFile();
    
    // Enviar email
    const emailSent = await this.sendNotification();
    
    if (emailSent) {
      console.log('✅ Proceso completado exitosamente');
    } else {
      console.log('⚠️ Proceso completado pero falló el envío del email');
    }
    
    return emailSent;
  }
}

// Exportar para uso en otros scripts
module.exports = { TaskNotifier, TASK_STATUS };

// Si se ejecuta directamente, crear una instancia de ejemplo
if (require.main === module) {
  const notifier = new TaskNotifier();
  
  // Ejemplo de uso
  notifier.addTask('Configuración inicial', TASK_STATUS.COMPLETED, 'Proyecto configurado correctamente');
  notifier.addTask('Instalación de dependencias', TASK_STATUS.COMPLETED, 'npm install ejecutado sin errores');
  notifier.addTask('Configuración de base de datos', TASK_STATUS.ERROR, 'Error de conexión', new Error('Connection timeout'));
  notifier.addTask('Deploy a producción', TASK_STATUS.PENDING, 'Esperando aprobación');
  
  notifier.finish();
}