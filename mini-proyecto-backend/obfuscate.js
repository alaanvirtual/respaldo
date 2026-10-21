// obfuscate.js - Script de automatización de ofuscación de código compilado (Capítulo 10)
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('node:fs');
const path = require('node:path');

// Configuración estricta de ofuscación para código de producción
const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: false,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.8,
  unicodeEscapeSequence: false
};

function obfuscateDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`El directorio ${dirPath} no existe. Ejecuta primero 'npm run build'.`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      obfuscateDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      const sourceCode = fs.readFileSync(fullPath, 'utf8');
      const obfuscatedResult = JavaScriptObfuscator.obfuscate(sourceCode, obfuscatorOptions);
      fs.writeFileSync(fullPath, obfuscatedResult.getObfuscatedCode(), 'utf8');
      console.log(`[Ofuscado] ${fullPath}`);
    }
  });
}

// Ejecutar sobre el directorio de salida compilado
console.log('Iniciando proceso de ofuscación sobre ./dist...');
obfuscateDirectory(path.join(__dirname, 'dist'));
console.log('Ofuscación completada exitosamente.');
