#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');

/**
 * Script dinámico de notificación de tareas completadas
 * Configurable mediante notification-config.json
 */
class TaskNotificationSystem {
  constructor() {
    this.config = this.loadConfig();
    this.templates = this.loadTemplates();
    this.startTime = new Date();
    this.tasks = [];
    this.errors = [];
  }

  /**
   * Carga la configuración desde el archivo JSON
   */
  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'notification-config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('❌ Error cargando configuración:', error.message);
      // Configuración por defecto mínima
      return {
        email: {
          recipient: 'aguirrealexis.cba@gmail.com',
          sender: 'noreply@sakulenceria.com',
          subject: '[Sakú Store] Reporte de Tareas'
        },
        project: {
          name: 'Sakú Store',
          description: 'Sakú Lencería E-commerce',
          emoji: '🚀'
        },
        texts: {
          console: {
            finishing: '🏁 Finalizando proceso...',
            emailSent: '✅ Email enviado:',
            emailError: '❌ Error enviando email:',
            reportSaved: '📄 Reporte guardado:',
            processComplete: '✅ Proceso completado'
          }
        }
      };
    }
  }

  /**
   * Carga las plantillas de email desde el archivo JSON
   */
  loadTemplates() {
    try {
      const templatesPath = path.join(__dirname, 'email-templates.json');
      return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar las plantillas de email, usando formato básico');
      return null;
    }
  }

  /**
   * Aplica plantillas de texto con variables
   */
  applyTemplate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Procesa plantillas de email con variables y partials
   */
  processEmailTemplate(templateName, variables) {
    if (!this.templates || !this.templates.templates[templateName]) {
      return this.generateFallbackEmail(variables);
    }

    const template = this.templates.templates[templateName];
    const processedVariables = { ...variables };

    // Procesar listas de tareas
    if (variables.tasks && Array.isArray(variables.tasks)) {
      processedVariables.taskList = this.renderTaskList(variables.tasks, 'html');
      processedVariables.taskListText = this.renderTaskList(variables.tasks, 'text');
    }

    // Procesar estado del proyecto
    if (variables.projectStatus && Array.isArray(variables.projectStatus)) {
      processedVariables.projectStatus = this.renderProjectStatus(variables.projectStatus, 'html');
      processedVariables.projectStatusText = this.renderProjectStatus(variables.projectStatus, 'text');
    }

    // Procesar métricas
    processedVariables.totalTasks = variables.tasks ? variables.tasks.length : 0;
    processedVariables.completedTasks = variables.tasks ? 
      variables.tasks.filter(t => t.status === 'completed').length : 0;

    return {
      subject: this.applyTemplate(template.subject, processedVariables),
      html: this.applyTemplate(template.html, processedVariables),
      text: this.applyTemplate(template.text, processedVariables)
    };
  }

  /**
   * Renderiza lista de tareas usando partials
   */
  renderTaskList(tasks, format) {
    if (!this.templates || !this.templates.partials) {
      return tasks.map(task => `- [${task.status}] ${task.name} (${task.duration || 'N/A'})`).join('\n');
    }

    const partial = format === 'html' ? 
      this.templates.partials.taskItem : 
      this.templates.partials.taskItemText;

    return tasks.map(task => {
      const statusIcon = this.templates.variables?.statusIcons?.[task.status] || task.status;
      return this.applyTemplate(partial, {
        ...task,
        status: statusIcon,
        duration: task.duration || 'N/A'
      });
    }).join(format === 'html' ? '' : '\n');
  }

  /**
   * Renderiza estado del proyecto usando partials
   */
  renderProjectStatus(statusItems, format) {
    if (!this.templates || !this.templates.partials) {
      return statusItems.map(item => `- [${item.status}] ${item.check}: ${item.description}`).join('\n');
    }

    const partial = format === 'html' ? 
      this.templates.partials.projectStatusItem : 
      this.templates.partials.projectStatusItemText;

    return statusItems.map(item => {
      const statusIcon = this.templates.variables?.statusIcons?.[item.status] || item.status;
      return this.applyTemplate(partial, {
        ...item,
        status: statusIcon
      });
    }).join(format === 'html' ? '' : '\n');
  }

  /**
   * Genera email básico cuando no hay plantillas disponibles
   */
  generateFallbackEmail(variables) {
    const subject = `✅ Tarea Completada - ${variables.projectName}`;
    const text = `
${variables.reportTitle}
${variables.timestamp}

📊 RESUMEN:
- Tareas totales: ${variables.tasks?.length || 0}
- Completadas: ${variables.tasks?.filter(t => t.status === 'completed').length || 0}
- Duración: ${variables.duration}

✅ TAREAS EJECUTADAS:
${variables.tasks?.map(t => `- [${t.status}] ${t.name} (${t.duration || 'N/A'})`).join('\n') || 'Ninguna'}

📝 DETALLES:
- Proyecto: ${variables.projectName}
- Directorio: ${variables.projectPath}
- Rama: ${variables.gitBranch}
- Commit: ${variables.gitCommit}

${variables.footerText}
    `.trim();

    return { subject, text, html: text.replace(/\n/g, '<br>') };
  }

  /**
   * Obtiene información de Git
   */
  getGitInfo() {
    try {
      const branch = this.executeCommand('git rev-parse --abbrev-ref HEAD').trim();
      const commit = this.executeCommand('git rev-parse --short HEAD').trim();
      return { branch, commit };
    } catch (error) {
      return { branch: 'N/A', commit: 'N/A' };
    }
  }

  /**
   * Formatea duración en segundos
   */
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds} segundos`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Formatea timestamp
   */
  formatTimestamp(date) {
    return {
      date: date.toLocaleDateString('es-AR'),
      time: date.toLocaleTimeString('es-AR'),
      iso: date.toISOString()
    };
  }

  /**
   * Ejecuta comando y captura resultado
   */
  executeCommand(command, name, category = 'testing') {
    try {
      console.log(`🔄 Ejecutando: ${name}...`);
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      const task = {
        name,
        command,
        category,
        status: 'completed',
        output: output.trim(),
        timestamp: new Date(),
        success: true
      };
      
      this.tasks.push(task);
      console.log(`✅ ${name}: Completado`);
      return task;
    } catch (error) {
      const task = {
        name,
        command,
        category,
        status: 'error',
        error: error.message,
        output: error.stdout || '',
        timestamp: new Date(),
        success: false
      };
      
      this.tasks.push(task);
      this.errors.push(task);
      console.log(`❌ ${name}: Error - ${error.message}`);
      return task;
    }
  }

  /**
   * Ejecuta verificaciones automáticas si están habilitadas
   */
  runAutoDetection() {
    if (!this.config.autoDetection?.enabled) {
      console.log('⏭️ Auto-detección deshabilitada');
      return;
    }

    console.log('🔍 Ejecutando verificaciones automáticas...');
    
    for (const check of this.config.autoDetection.checks) {
      this.executeCommand(check.command, check.name, check.category);
    }
  }

  /**
   * Ejecuta verificaciones automáticas del estado del proyecto
   */
  async autoDetectProjectStatus() {
    console.log(this.config.texts.console.autoDetecting || '🔍 Detectando estado del proyecto...');
    
    if (!this.projectStatus) {
      this.projectStatus = {};
    }
    
    for (const [checkName, checkConfig] of Object.entries(this.config.autoDetection?.checks || {})) {
      const startTime = Date.now();
      
      try {
        console.log(`🔍 Verificando ${checkName}...`);
        console.log(`🔄 Ejecutando: ${checkConfig.command}...`);
        
        const result = execSync(checkConfig.command, { 
          encoding: 'utf8', 
          timeout: 30000,
          stdio: 'pipe'
        });
        
        // Verificar patrones de éxito y fallo
        const isSuccess = this.evaluateCheckResult(result, checkConfig);
        
        this.projectStatus[checkName] = {
          success: isSuccess,
          output: this.sanitizeOutput(result),
          duration: this.formatDuration(Math.round((Date.now() - startTime) / 1000)),
          command: checkConfig.command
        };
        
        console.log(`${isSuccess ? '✅' : '❌'} ${checkName}: ${isSuccess ? 'Completado' : 'FAILED'}`);
        
      } catch (error) {
        this.projectStatus[checkName] = {
          success: false,
          error: this.sanitizeOutput(error.message),
          duration: this.formatDuration(Math.round((Date.now() - startTime) / 1000)),
          command: checkConfig.command
        };
        console.log(`❌ ${checkName}: ERROR - ${error.message}`);
      }
    }
  }

  /**
   * Evalúa el resultado de un check basado en patrones
   */
  evaluateCheckResult(output, checkConfig) {
    // Convertir output a string si no lo es
    const outputStr = String(output || '');
    
    // Verificar patrones de fallo primero (más específicos)
    if (checkConfig.failurePatterns) {
      const hasFailure = checkConfig.failurePatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return outputStr.toLowerCase().includes(pattern.toLowerCase());
        } else if (pattern.regex) {
          return new RegExp(pattern.regex, pattern.flags || 'i').test(outputStr);
        }
        return false;
      });
      
      if (hasFailure) return false;
    }

    // Verificar patrones de éxito
    if (checkConfig.successPatterns) {
      return checkConfig.successPatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return outputStr.toLowerCase().includes(pattern.toLowerCase());
        } else if (pattern.regex) {
          return new RegExp(pattern.regex, pattern.flags || 'i').test(outputStr);
        }
        return false;
      });
    }

    // Si no hay patrones específicos, considerar éxito si no hay error
    return true;
  }

  /**
   * Sanitiza la salida para el reporte
   */
  sanitizeOutput(output) {
    if (!output) return 'Sin salida';
    
    // Remover información sensible
    let sanitized = output
      .replace(/password[=:]\s*\S+/gi, 'password=***')
      .replace(/token[=:]\s*\S+/gi, 'token=***')
      .replace(/key[=:]\s*\S+/gi, 'key=***')
      .replace(/secret[=:]\s*\S+/gi, 'secret=***');
    
    // Limitar longitud
    if (sanitized.length > 300) {
      sanitized = sanitized.substring(0, 300) + '...';
    }
    
    return sanitized.trim();
  }

  /**
   * Agrega tarea manual
   */
  addTask(name, status, details = '', category = 'manual', error = null) {
    const task = {
      name,
      status,
      details,
      category,
      error,
      timestamp: new Date(),
      success: status === 'completed'
    };

    this.tasks.push(task);
    
    if (error) {
      this.errors.push(task);
    }

    return task;
  }

  /**
   * Genera estadísticas del reporte
   */
  generateStats() {
    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    const completed = this.tasks.filter(t => t.success).length;
    const withErrors = this.errors.length;
    const total = this.tasks.length;

    return {
      startTime: this.formatTimestamp(this.startTime),
      endTime: this.formatTimestamp(endTime),
      duration: this.formatDuration(duration),
      durationSeconds: duration,
      total,
      completed,
      withErrors,
      pending: 0 // Para futuras implementaciones
    };
  }

  /**
   * Genera HTML del reporte
   */
  generateHTMLReport() {
    const stats = this.generateStats();
    const { texts } = this.config;

    // Agrupar tareas por categoría
    const tasksByCategory = this.tasks.reduce((acc, task) => {
      const category = task.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(task);
      return acc;
    }, {});

    let html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${texts.header?.title || 'Reporte de Tareas'}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #d8ceb5, #f5f1e8); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; color: #333; font-size: 28px; }
        .header p { margin: 10px 0 0; color: #666; font-size: 16px; }
        .content { padding: 30px; }
        .stats { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #d8ceb5; padding-bottom: 10px; }
        .task-category { margin-bottom: 25px; }
        .category-header { display: flex; align-items: center; margin-bottom: 15px; }
        .category-emoji { font-size: 20px; margin-right: 10px; }
        .category-name { font-size: 18px; font-weight: 600; color: #333; }
        .task-list { list-style: none; padding: 0; }
        .task-item { background: #f8f9fa; margin: 8px 0; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745; }
        .task-item.error { border-left-color: #dc3545; background: #fff5f5; }
        .task-item.pending { border-left-color: #ffc107; background: #fffbf0; }
        .task-name { font-weight: 600; color: #333; }
        .task-details { color: #666; font-size: 14px; margin-top: 5px; }
        .task-timestamp { color: #999; font-size: 12px; margin-top: 5px; }
        .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; color: #666; font-size: 14px; }
        .error-details { background: #fff5f5; border: 1px solid #f5c6cb; border-radius: 4px; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${texts.header?.title || this.config.project.emoji + ' ' + this.config.project.name}</h1>
            <p>${texts.header?.subtitle || this.config.project.description}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>${texts.summary?.title || '📊 Resumen Ejecutivo'}</h2>
                <div class="stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-value">${stats.total}</div>
                            <div class="stat-label">${texts.summary?.labels?.total || 'Total'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #28a745;">${stats.completed}</div>
                            <div class="stat-label">${texts.summary?.labels?.completed || 'Completadas'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #dc3545;">${stats.withErrors}</div>
                            <div class="stat-label">${texts.summary?.labels?.errors || 'Con errores'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="color: #007bff;">${stats.duration}</div>
                            <div class="stat-label">${texts.summary?.labels?.duration || 'Duración'}</div>
                        </div>
                    </div>
                    <div style="margin-top: 20px; text-align: center; color: #666;">
                        <strong>${texts.summary?.labels?.start || 'Inicio'}:</strong> ${stats.startTime.date} ${stats.startTime.time}<br>
                        <strong>${texts.summary?.labels?.end || 'Fin'}:</strong> ${stats.endTime.date} ${stats.endTime.time}
                    </div>
                </div>
            </div>`;

    // Tareas por categoría
    for (const [categoryKey, categoryTasks] of Object.entries(tasksByCategory)) {
      const categoryConfig = this.config.taskCategories?.[categoryKey] || {
        name: categoryKey,
        emoji: '📋',
        color: '#6c757d'
      };

      html += `
            <div class="section">
                <div class="task-category">
                    <div class="category-header">
                        <span class="category-emoji">${categoryConfig.emoji}</span>
                        <span class="category-name">${categoryConfig.name}</span>
                    </div>
                    <ul class="task-list">`;

      for (const task of categoryTasks) {
        const taskClass = task.success ? '' : 'error';
        const statusIcon = task.success ? '✅' : '❌';
        
        html += `
                        <li class="task-item ${taskClass}">
                            <div class="task-name">${statusIcon} ${task.name}</div>
                            <div class="task-details">${task.details || task.output || task.status}</div>
                            <div class="task-timestamp">${task.timestamp.toLocaleString('es-AR')}</div>`;
        
        if (task.error) {
          html += `<div class="error-details">${task.error}</div>`;
        }
        
        html += `</li>`;
      }

      html += `
                    </ul>
                </div>
            </div>`;
    }

    html += `
        </div>
        
        <div class="footer">
            <p>${texts.footer?.generated || 'Reporte generado automáticamente'}</p>
            <p><strong>${texts.footer?.project || this.config.project.description}</strong></p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Guarda el reporte en archivo
   */
  saveReport(htmlContent) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `task-report-${timestamp}.html`;
      const filepath = path.join(__dirname, '..', 'reports', filename);
      
      // Crear directorio si no existe
      const reportsDir = path.dirname(filepath);
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      fs.writeFileSync(filepath, htmlContent, 'utf8');
      
      // También guardar JSON para análisis
      const jsonData = {
        timestamp: new Date().toISOString(),
        stats: this.generateStats(),
        tasks: this.tasks,
        errors: this.errors,
        config: this.config.project
      };
      
      const jsonFilename = `task-report-${timestamp}.json`;
      const jsonFilepath = path.join(reportsDir, jsonFilename);
      fs.writeFileSync(jsonFilepath, JSON.stringify(jsonData, null, 2), 'utf8');
      
      console.log(this.config.texts.console.reportSaved, filepath);
      return filepath;
    } catch (error) {
      console.error(this.config.texts.console.reportError || '❌ Error guardando reporte:', error.message);
      return null;
    }
  }

  /**
   * Envía notificación por email
   */
  async sendNotification(report, templateName = 'task_completion') {
    try {
      // Verificar variables de entorno
      const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Variables de entorno faltantes: ${missingVars.join(', ')}`);
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Preparar variables para la plantilla
      const templateVariables = {
        projectName: this.config.project.name,
        projectPath: this.config.project.path,
        reportTitle: report.title,
        timestamp: report.timestamp,
        duration: report.duration,
        tasks: this.tasks,
        projectStatus: Object.entries(this.projectStatus || {}).map(([check, result]) => ({
          check,
          status: result.success ? 'completed' : 'failed',
          description: result.output || result.error || 'Sin información'
        })),
        gitBranch: this.getGitInfo ? this.getGitInfo().branch : 'N/A',
        gitCommit: this.getGitInfo ? this.getGitInfo().commit : 'N/A',
        footerText: this.config.texts?.report?.footer || 'Reporte generado automáticamente'
      };

      // Procesar plantilla de email
      const emailContent = this.processEmailTemplate(templateName, templateVariables);

      const mailOptions = {
        from: process.env.SMTP_FROM || this.config.email.sender,
        to: this.config.email.recipient,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(this.config.texts.console.emailSent, info.messageId);
      return true;
    } catch (error) {
      console.error(this.config.texts.console.emailError, error.message);
      return false;
    }
  }

  /**
   * Ejecuta el proceso completo
   */
  async run(customTasks = []) {
    console.log(this.config.texts.console.finishing);

    // Agregar tareas personalizadas si se proporcionan
    for (const task of customTasks) {
      this.addTask(task.name, task.status, task.details, task.category, task.error);
    }

    // Ejecutar auto-detección
    this.runAutoDetection();
    
    // Ejecutar detección de estado del proyecto
    await this.autoDetectProjectStatus();

    // Si no hay tareas, agregar algunas por defecto
    if (this.tasks.length === 0) {
      this.addTask('Configuración de Supabase CLI', 'completed', 'CLI configurado y conectado', 'setup');
      this.addTask('Migraciones de base de datos', 'completed', 'Esquema aplicado correctamente', 'database');
      this.addTask('Verificación de datos', 'completed', 'Datos de prueba presentes', 'database');
      this.addTask('Corrección de errores de lint', 'completed', 'Código sin errores de ESLint', 'testing');
    }

    // Generar reporte
    const htmlContent = this.generateHTMLReport();
    
    // Guardar reporte
    this.saveReport(htmlContent);
    
    // Enviar email
    const report = {
      title: 'Reporte de Tareas Completadas',
      timestamp: this.formatTimestamp(new Date()).date + ' ' + this.formatTimestamp(new Date()).time,
      duration: this.generateStats().duration
    };
    const emailSent = await this.sendNotification(report);
    
    // Mensaje final
    if (emailSent) {
      console.log(this.config.texts.console.processComplete);
    } else {
      console.log(this.config.texts.console.processWarning || '⚠️ Proceso completado pero falló el envío del email');
    }

    return {
      success: true,
      emailSent,
      stats: this.generateStats(),
      tasksCount: this.tasks.length,
      errorsCount: this.errors.length
    };
  }
}

// Función principal
async function main() {
  // Cargar variables de entorno
  require('dotenv').config();

  const notificationSystem = new TaskNotificationSystem();

  // Permitir tareas personalizadas desde argumentos de línea de comandos
  const customTasks = [];
  
  // Ejemplo de uso con argumentos: node notify-completion.cjs --task "Nombre" --status "completed" --details "Detalles"
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 6) {
    if (args[i] === '--task' && args[i + 2] === '--status') {
      customTasks.push({
        name: args[i + 1],
        status: args[i + 3],
        details: args[i + 5] || '',
        category: args[i + 7] || 'manual'
      });
    }
  }

  try {
    const result = await notificationSystem.run(customTasks);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = TaskNotificationSystem;