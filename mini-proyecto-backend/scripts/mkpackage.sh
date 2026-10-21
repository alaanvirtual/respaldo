#!/bin/bash
set -e

VER="1.0.0"
BUILD_DIR="./build"
DIST_DIR="./dist"
BINARIES_DIR="./binaries"

echo "=========================================="
echo "Iniciando empaquetado de producción v$VER"
echo "=========================================="

# Limpieza de directorios previos
rm -rf $BUILD_DIR $BINARIES_DIR
mkdir -p $BUILD_DIR $BINARIES_DIR

# Compilación de TypeScript
echo "Compilando TypeScript..."
npx tsc

# Ofuscación de código compilado
echo "Ofuscando código compilado..."
node obfuscate.js

# Copia de archivos de configuración requeridos
cp package.json package-lock.json server_config.json $BUILD_DIR/
cp -r $DIST_DIR $BUILD_DIR/dist

# Creación del paquete tarball comprimido
ARCHIVE_NAME="pms_be_$VER.tgz"
echo "Comprimiendo archivo $ARCHIVE_NAME..."
tar -czf $BINARIES_DIR/$ARCHIVE_NAME -C $BUILD_DIR .

echo "=========================================="
echo "Paquete generado exitosamente en $BINARIES_DIR/$ARCHIVE_NAME"
echo "=========================================="
