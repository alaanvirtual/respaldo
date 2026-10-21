#!/bin/bash
set -e

SERVER_USER="ubuntu"
SERVER_IP="203.0.113.10"
KEY_PATH="./mi_clave_ec2.pem"
REMOTE_DIR="/home/ubuntu/pms-backend"
ARCHIVE_NAME="pms_be_1.0.0.tgz"

echo "=========================================="
echo "Iniciando despliegue hacia $SERVER_IP"
echo "=========================================="

# Creación de directorio remoto y transferencia de archivos
echo "Transfiriendo paquete de aplicación..."
ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
scp -i $KEY_PATH binaries/$ARCHIVE_NAME $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# Instalación y reinicio del servicio PM2 en la máquina remota
echo "Ejecutando actualización de servicio en servidor..."
ssh -i $KEY_PATH $SERVER_USER@$SERVER_IP << 'EOF'
  cd /home/ubuntu/pms-backend
  tar -xzf pms_be_1.0.0.tgz
  npm install --only=production
  
  # Inicio o reinicio del servicio backend en PM2
  pm2 startOrRestart ecosystem.config.js --env production
  pm2 save
EOF

echo "=========================================="
echo "Despliegue finalizado exitosamente."
echo "=========================================="
