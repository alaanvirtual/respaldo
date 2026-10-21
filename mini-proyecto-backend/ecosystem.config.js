// ecosystem.config.js - Configuración de PM2 para clúster y alta disponibilidad (Capítulo 10)
module.exports = {
  apps: [
    {
      name: 'pms-backend',
      script: 'dist/src/main.js',
      instances: 'max', // Aprovecha todos los núcleos de CPU disponibles
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
