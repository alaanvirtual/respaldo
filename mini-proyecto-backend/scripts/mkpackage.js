// scripts/mkpackage.js - Automatización multiplataforma de empaquetado para producción (Capítulo 10)
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const VER = '1.0.0';
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, 'build');
const distDir = path.join(rootDir, 'dist');
const binariesDir = path.join(rootDir, 'binaries');

console.log('==========================================');
console.log(`Iniciando empaquetado de producción v${VER}`);
console.log('==========================================');

// 1. Limpieza de directorios
if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true, force: true });
if (fs.existsSync(binariesDir)) fs.rmSync(binariesDir, { recursive: true, force: true });
fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(binariesDir, { recursive: true });

// 2. Compilación de TypeScript
console.log('Compilando TypeScript...');
execSync('npx tsc', { cwd: rootDir, stdio: 'inherit' });

// 3. Ofuscación de código compilado
console.log('Ofuscando código compilado...');
execSync('node obfuscate.js', { cwd: rootDir, stdio: 'inherit' });

// 4. Copia de artefactos
console.log('Copiando archivos de configuración...');
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(buildDir, 'package.json'));
fs.copyFileSync(path.join(rootDir, 'package-lock.json'), path.join(buildDir, 'package-lock.json'));
if (fs.existsSync(path.join(rootDir, 'ecosystem.config.js'))) {
  fs.copyFileSync(path.join(rootDir, 'ecosystem.config.js'), path.join(buildDir, 'ecosystem.config.js'));
}
fs.cpSync(distDir, path.join(buildDir, 'dist'), { recursive: true });

// 5. Creación de archivo tarball (.tgz)
const archiveName = `pms_be_${VER}.tgz`;
const targetArchive = path.join(binariesDir, archiveName);
console.log(`Comprimiendo archivo ${archiveName}...`);
execSync(`tar -czf "${targetArchive}" -C "${buildDir}" .`, { stdio: 'ignore' });

console.log('==========================================');
console.log(`Paquete generado exitosamente en binaries/${archiveName}`);
console.log('==========================================');
