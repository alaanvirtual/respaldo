# Guía de Despliegue en Amazon Web Services (AWS) — PMS Backend

**Proyecto:** Sistema de Gestión de Proyectos (PMS Backend)  
**Capítulo de Referencia:** Capítulo 10: Construcción, Ofuscación y Despliegue de la Aplicación  
**Tecnologías de Infraestructura:** AWS EC2, PM2 Cluster, Ubuntu Server 22.04 LTS, PostgreSQL, Redis, Docker, Elastic Beanstalk.

---

## 1. Arquitectura de Despliegue en la Nube (AWS)

El backend del PMS está diseñado para operar en entornos de producción con **alta disponibilidad, tolerancia a fallos y escalabilidad vertical y horizontal**. 

Se contemplan dos metodologías principales de despliegue en AWS:
1. **Infraestructura como Servicio (IaaS) con AWS EC2 y PM2:** Despliegue sobre máquina virtual Linux con orquestación multi-proceso clúster nativo.
2. **Contenedores con Docker y AWS Elastic Beanstalk / ECS:** Empaquetado inmutable multi-etapa listo para servicios administrados.

---

## 2. Despliegue Oficial en AWS EC2 (Paso a Paso)

### 2.1. Aprovisionamiento de la Instancia EC2 en AWS Console
1. **Región:** Seleccionar una región con baja latencia (ej. `us-east-1` N. Virginia o `us-west-2` Oregon).
2. **Imagen de Sistema Operativo (AMI):** 
   * `Ubuntu Server 22.04 LTS (HVM), SSD Volume Type` (64-bit x86).
3. **Tipo de Instancia:**
   * **Desarrollo / Evaluación:** `t2.micro` (1 vCPU, 1 GB RAM — elegible para capa gratuita).
   * **Producción:** `t3.medium` (2 vCPUs, 4 GB RAM) para soporte completo de workers en clúster.
4. **Par de Claves SSH (Key Pair):**
   * Crear o descargar el archivo de clave privada (ej. `mi_clave_ec2.pem`).
   * En terminal local Linux/macOS o Git Bash en Windows, restringir permisos:
     ```bash
     chmod 400 mi_clave_ec2.pem
     ```
5. **Grupo de Seguridad (Security Group Firewall):**
   * **Regla 1 (SSH):** Puerto `22`, origen `Mi IP` (o IP administrativa segura).
   * **Regla 2 (HTTP):** Puerto `80`, origen `0.0.0.0/0` (tráfico público web).
   * **Regla 3 (HTTPS):** Puerto `443`, origen `0.0.0.0/0` (tráfico cifrado SSL/TLS).
   * **Regla 4 (Node.js API):** Puerto `3000` (o `8080`), origen `0.0.0.0/0`.
6. **Almacenamiento (EBS):**
   * Volumen raíz de `20 GB` tipo `gp3` (General Purpose SSD).

---

### 2.2. Conexión Remota y Preparación del Servidor
Conectarse a la instancia mediante SSH utilizando la IP pública asignada por AWS:

```bash
ssh -i mi_clave_ec2.pem ubuntu@<IP_PUBLICA_EC2>
```

Una vez dentro del servidor remoto, ejecutar la actualización e instalación del stack técnico:

```bash
# 1. Actualizar repositorios del sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js v20 LTS y gestores de construcción
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# 3. Instalar PostgreSQL y Redis
sudo apt install -y postgresql postgresql-contrib redis-server

# 4. Iniciar y habilitar servicios
sudo systemctl enable postgresql && sudo systemctl start postgresql
sudo systemctl enable redis-server && sudo systemctl start redis-server

# 5. Instalar PM2 globalmente para gestión de procesos en clúster
sudo npm install -g pm2
```

---

### 2.3. Configuración de Base de Datos PostgreSQL en EC2
```bash
sudo -u postgres psql << EOF
CREATE DATABASE pms_db;
CREATE USER pms_user WITH ENCRYPTED PASSWORD 'secretpassword';
GRANT ALL PRIVILEGES ON DATABASE pms_db TO pms_user;
ALTER DATABASE pms_db OWNER TO pms_user;
\q
EOF
```

---

### 2.4. Empaquetado y Despliegue Automatizado (`deploy.sh`)

El archivo `scripts/deploy.sh` automatiza la transferencia del paquete de producción compilado y ofuscado hacia AWS:

1. **En tu máquina local:** Generar el paquete comprimido de producción:
   ```powershell
   npm run package
   ```
   Esto compila TypeScript (`tsc`), ejecuta `obfuscate.js` (aplanamiento de control, inyección de código muerto y codificación Base64) y genera el archivo `binaries/pms_be_1.0.0.tgz`.

2. **Configurar los parámetros de conexión en `scripts/deploy.sh`:**
   ```bash
   SERVER_USER="ubuntu"
   SERVER_IP="<IP_PUBLICA_EC2>"
   KEY_PATH="./mi_clave_ec2.pem"
   REMOTE_DIR="/home/ubuntu/pms-backend"
   ARCHIVE_NAME="pms_be_1.0.0.tgz"
   ```

3. **Ejecutar el despliegue:**
   ```bash
   bash scripts/deploy.sh
   ```

#### Acciones que realiza `deploy.sh` en el servidor AWS:
* Crea el directorio remoto `/home/ubuntu/pms-backend`.
* Transfiere vía `scp` el artefacto `binaries/pms_be_1.0.0.tgz`.
* Descomprime los archivos en el servidor remoto.
* Ejecuta `npm install --only=production` omitiendo dependencias de desarrollo pesadas.
* Inicia o recarga el servicio sin tiempo de inactividad con **PM2**:
  ```bash
  pm2 startOrRestart ecosystem.config.js --env production
  pm2 save
  ```

---

### 2.5. Configuración de PM2 (`ecosystem.config.js`)

El archivo `ecosystem.config.js` orquesta el backend aprovechando todos los núcleos de la máquina virtual:

```javascript
module.exports = {
  apps: [
    {
      name: 'pms-backend',
      script: 'dist/src/main.js',
      instances: 'max',              // Genera un worker por núcleo disponible
      exec_mode: 'cluster',          // Balanceo de carga a nivel de kernel
      autorestart: true,             // Reinicio automático ante excepciones
      watch: false,
      max_memory_restart: '1G',      // Reinicio si supera 1 GB para evitar memory leaks
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

---

## 3. Verificación y Monitoreo en Producción

Una vez ejecutado el despliegue, verificar el estado en la consola de AWS EC2:

1. **Estado de procesos PM2:**
   ```bash
   pm2 status
   ```
   *Salida esperada:*
   ```text
   ┌────┬─────────────┬─────────────┬─────────┬─────────┬─────────┬────────┬─────┬────────┬──────────┐
   │ id │ name        │ namespace   │ version │ mode    │ pid     │ uptime │ ↺   │ status │ cpu  mem │
   ├────┼─────────────┼─────────────┼─────────┼─────────┼─────────┼────────┼─────┼────────┼──────────┤
   │ 0  │ pms-backend │ default     │ 1.0.0   │ cluster │ 95988   │ 12h    │ 0   │ online │ 0%  42mb │
   └────┴─────────────┴─────────────┴─────────┴─────────┴─────────┴────────┴─────┴────────┴──────────┘
   ```

2. **Monitoreo de logs en vivo:**
   ```bash
   pm2 logs pms-backend --lines 10
   ```

3. **Prueba de salud HTTP (Healthcheck):**
   ```bash
   curl -I http://localhost:3000/ping
   ```
   *Respuesta esperada:* `HTTP/1.1 200 OK`

---

## 4. Alternativa con Docker en AWS (Elastic Beanstalk / ECS)

Para despliegues basados en contenedores inmutables:

1. **Construcción local de la imagen:**
   ```bash
   docker build -t pms-backend:1.0.0 .
   ```
2. **Levantar stack completo con docker-compose:**
   ```bash
   docker compose up -d
   ```
3. **Publicación en AWS Elastic Container Registry (ECR):**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag pms-backend:1.0.0 <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pms-backend:1.0.0
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/pms-backend:1.0.0
   ```
