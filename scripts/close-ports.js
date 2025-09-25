#!/usr/bin/env node

/**
 * Script para cerrar puertos de desarrollo
 * Uso: node scripts/close-ports.js [puerto1] [puerto2] ...
 * Sin argumentos: cierra puertos 3000-3010
 */

const { execSync } = require('child_process');
const os = require('os');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getProcessesOnPorts(ports) {
  const processes = [];
  
  try {
    // Obtener procesos en puertos específicos
    const netstatOutput = execSync('netstat -ano', { encoding: 'utf8' });
    const lines = netstatOutput.split('\n');
    
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        for (const port of ports) {
          if (line.includes(`:${port} `) || line.includes(`:${port}\t`)) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid)) {
              processes.push({ port, pid: parseInt(pid) });
            }
          }
        }
      }
    }
  } catch (error) {
    log(`Error obteniendo procesos: ${error.message}`, 'red');
  }
  
  return processes;
}

function killProcess(pid, port) {
  try {
    if (os.platform() === 'win32') {
      // En Windows, usar taskkill
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      // En Unix/Linux/Mac, usar kill
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    log(`✅ Puerto ${port}: Proceso PID ${pid} terminado`, 'green');
    return true;
  } catch (error) {
    log(`❌ Puerto ${port}: Error terminando proceso PID ${pid}`, 'red');
    return false;
  }
}

function main() {
  log('🔍 Cerrando puertos de desarrollo...', 'cyan');
  
  // Obtener puertos desde argumentos o usar rango por defecto
  const args = process.argv.slice(2);
  let ports;
  
  if (args.length > 0) {
    ports = args.map(arg => parseInt(arg)).filter(port => !isNaN(port));
  } else {
    // Puertos por defecto (3000-3010)
    ports = Array.from({ length: 11 }, (_, i) => 3000 + i);
  }
  
  log(`Verificando puertos: ${ports.join(', ')}`, 'blue');
  
  // Obtener procesos en los puertos
  const processes = getProcessesOnPorts(ports);
  
  if (processes.length === 0) {
    log('✅ No se encontraron procesos en los puertos especificados', 'green');
    return;
  }
  
  log(`\n📋 Procesos encontrados:`, 'yellow');
  processes.forEach(({ port, pid }) => {
    log(`   Puerto ${port}: PID ${pid}`, 'yellow');
  });
  
  log('\n🔄 Terminando procesos...', 'cyan');
  
  let successCount = 0;
  for (const { port, pid } of processes) {
    if (killProcess(pid, port)) {
      successCount++;
    }
  }
  
  log(`\n📊 Resumen:`, 'cyan');
  log(`   ✅ Procesos terminados: ${successCount}`, 'green');
  log(`   ❌ Errores: ${processes.length - successCount}`, successCount === processes.length ? 'green' : 'red');
  
  // Verificación final
  setTimeout(() => {
    log('\n🔍 Verificación final...', 'cyan');
    const remainingProcesses = getProcessesOnPorts(ports);
    
    if (remainingProcesses.length === 0) {
      log('✅ Todos los puertos están libres', 'green');
    } else {
      log('⚠️  Algunos procesos siguen activos:', 'yellow');
      remainingProcesses.forEach(({ port, pid }) => {
        log(`   Puerto ${port}: PID ${pid}`, 'yellow');
      });
    }
  }, 1000);
}

// Manejo de errores
process.on('uncaughtException', (error) => {
  log(`Error inesperado: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Promise rechazada: ${reason}`, 'red');
  process.exit(1);
});

main();