#!/bin/bash

# Script para cerrar puertos de desarrollo en Git Bash
# Uso: ./scripts/close-ports.sh [puerto1] [puerto2] ...
# Sin argumentos: cierra puertos 3000-3010

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🔍 Cerrando puertos de desarrollo...${NC}"

# Obtener puertos desde argumentos o usar rango por defecto
if [ $# -eq 0 ]; then
    # Puertos por defecto (3000-3010)
    ports=(3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010)
else
    ports=("$@")
fi

echo -e "${BLUE}Verificando puertos: ${ports[*]}${NC}"

# Función para obtener PID de un puerto
get_pid_for_port() {
    local port=$1
    # Usar netstat para encontrar el PID del proceso en el puerto
    netstat -ano | grep ":$port " | grep "LISTENING" | awk '{print $5}' | head -1
}

# Función para terminar proceso
kill_process() {
    local pid=$1
    local port=$2
    
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
        echo -e "${YELLOW}Terminando proceso PID $pid en puerto $port...${NC}"
        
        # Usar taskkill con sintaxis correcta para Git Bash
        if taskkill //PID "$pid" //F > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Puerto $port: Proceso PID $pid terminado${NC}"
            return 0
        else
            echo -e "${RED}❌ Puerto $port: Error terminando proceso PID $pid${NC}"
            return 1
        fi
    else
        return 1
    fi
}

# Buscar y terminar procesos
found_processes=0
killed_processes=0

for port in "${ports[@]}"; do
    pid=$(get_pid_for_port "$port")
    
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
        found_processes=$((found_processes + 1))
        echo -e "${YELLOW}📋 Puerto $port: PID $pid${NC}"
        
        if kill_process "$pid" "$port"; then
            killed_processes=$((killed_processes + 1))
        fi
    fi
done

# Resumen
echo ""
echo -e "${CYAN}📊 Resumen:${NC}"

if [ $found_processes -eq 0 ]; then
    echo -e "${GREEN}✅ No se encontraron procesos en los puertos especificados${NC}"
else
    echo -e "${GREEN}   ✅ Procesos terminados: $killed_processes${NC}"
    
    if [ $killed_processes -lt $found_processes ]; then
        echo -e "${RED}   ❌ Errores: $((found_processes - killed_processes))${NC}"
    fi
fi

# Verificación final después de 1 segundo
echo ""
echo -e "${CYAN}🔍 Verificación final...${NC}"
sleep 1

remaining=0
for port in "${ports[@]}"; do
    pid=$(get_pid_for_port "$port")
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
        remaining=$((remaining + 1))
        echo -e "${YELLOW}⚠️  Puerto $port: PID $pid aún activo${NC}"
    fi
done

if [ $remaining -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los puertos están libres${NC}"
else
    echo -e "${YELLOW}⚠️  $remaining procesos siguen activos${NC}"
fi