#!/bin/bash

# Script de instalación y ejecución para Social Service (PostgreSQL)

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Iniciando setup de Social Service (PostgreSQL)...${NC}"

# 1. Instalar dependencias
echo -e "\n${BLUE}📦 Instalando dependencias con npm...${NC}"
npm install

# 2. Configurar Base de Datos (PostgreSQL)
echo -e "\n${BLUE}🐘 Configurando PostgreSQL...${NC}"

DB_NAME="social_service_pg_db"
DB_USER="social_service_pg_user"
DB_PASS="social_service_secure_pass"

# Verificar si el usuario ya existe
if sudo -u postgres psql -t -c '\du' | cut -d \| -f 1 | grep -qw "$DB_USER"; then
    echo -e "${GREEN}✓ Usuario $DB_USER ya existe.${NC}"
else
    echo -e "Creando usuario $DB_USER..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
    sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
fi

# Verificar si la BD ya existe
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✓ Base de datos $DB_NAME ya existe.${NC}"
else
    echo -e "Creando base de datos $DB_NAME..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi

# 3. Ejecutar Migraciones
echo -e "\n${BLUE}📊 Ejecutando migraciones de base de datos...${NC}"
npm run migrate:up

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migraciones ejecutadas correctamente.${NC}"
else
    echo -e "${RED}⚠️  Error en migraciones (puede que ya existan las tablas).${NC}"
fi

# 4. Iniciar Aplicación
echo -e "\n${GREEN}✅ Setup completado. Iniciando aplicación...${NC}"
echo -e "${BLUE}▶ Ejecutando: npm run dev${NC}"

npm run dev
