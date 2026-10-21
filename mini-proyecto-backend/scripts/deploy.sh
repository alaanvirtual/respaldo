
set -euo pipefail

SERVER_USER="${SERVER_USER:-ubuntu}"
SERVER_IP="${SERVER_IP:-CAMBIAR_POR_IP_PUBLICA_EC2}"
KEY_PATH="${KEY_PATH:-./mi_clave_ec2.pem}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/pms-backend}"

SSH_OPTS="-i $KEY_PATH -o StrictHostKeyChecking=accept-new"

if [[ "$SERVER_IP" == "CAMBIAR_POR_IP_PUBLICA_EC2" ]]; then
  echo "ERROR: define SERVER_IP con la IP pública de tu EC2." >&2
  exit 1
fi
if [[ ! -f "$KEY_PATH" ]]; then
  echo "ERROR: no se encuentra la clave $KEY_PATH" >&2
  exit 1
fi

echo "=========================================="
echo "1/4 Generando paquete (compila + ofusca)"
echo "=========================================="
npm run package

ARCHIVE_NAME="$(basename "$(ls binaries/*.tgz | head -n 1)")"
echo "Paquete: $ARCHIVE_NAME"

echo "=========================================="
echo "2/4 Transfiriendo a $SERVER_IP"
echo "=========================================="
ssh $SSH_OPTS "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_DIR"
scp $SSH_OPTS "binaries/$ARCHIVE_NAME" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"

echo "=========================================="
echo "3/4 Instalando y reiniciando en el servidor"
echo "=========================================="
ssh $SSH_OPTS "$SERVER_USER@$SERVER_IP" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_DIR"
rm -rf dist
tar -xzf "$ARCHIVE_NAME"
rm -f "$ARCHIVE_NAME"
npm ci --omit=dev
[ -f .env ] || echo "AVISO: falta $REMOTE_DIR/.env (la app no tendrá configuración)"
pm2 startOrReload ecosystem.config.js --env production
pm2 save
EOF

echo "=========================================="
echo "4/4 Estado del servicio"
echo "=========================================="
sleep 3
ssh $SSH_OPTS "$SERVER_USER@$SERVER_IP" "pm2 status"

echo "Despliegue finalizado."
