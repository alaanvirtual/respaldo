// src/storage/simple_log_engine.ts - Motor append-only con mapa hash en memoria (Bitcask pattern - Capítulo 14)
import * as fs from 'fs';
import * as path from 'path';

export class SimpleLogEngine {
  private index = new Map<string, number>();
  private fileOffset = 0;
  private fd: number;

  constructor(private filepath: string) {
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.fd = fs.openSync(filepath, 'a+');
    this.rebuildIndex();
  }

  // Reconstruye el índice en memoria al iniciar leyendo el archivo secuencialmente
  private rebuildIndex(): void {
    try {
      const stats = fs.fstatSync(this.fd);
      this.fileOffset = stats.size;

      if (this.fileOffset > 0) {
        const buffer = Buffer.alloc(this.fileOffset);
        fs.readSync(this.fd, buffer, 0, this.fileOffset, 0);
        const content = buffer.toString('utf-8');
        const lines = content.split('\n');

        let currentOffset = 0;
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.key) {
                this.index.set(parsed.key, currentOffset);
              }
            } catch {
              // Ignorar líneas corruptas o vacías
            }
          }
          currentOffset += Buffer.byteLength(line, 'utf-8') + 1;
        }
      }
    } catch {
      this.fileOffset = 0;
    }
  }

  public async set(key: string, value: string): Promise<void> {
    const entry = JSON.stringify({ key, value }) + '\n';
    const buffer = Buffer.from(entry, 'utf-8');

    // Escritura secuencial al final del archivo (append-only: O(1))
    fs.writeSync(this.fd, buffer, 0, buffer.length, this.fileOffset);

    // Actualizar índice en memoria con el offset exacto
    this.index.set(key, this.fileOffset);
    this.fileOffset += buffer.length;
  }

  public async get(key: string): Promise<string | null> {
    const offset = this.index.get(key);
    if (offset === undefined) return null;

    const buffer = Buffer.alloc(2048);
    const bytesRead = fs.readSync(this.fd, buffer, 0, buffer.length, offset);
    if (bytesRead === 0) return null;

    const line = buffer.toString('utf-8').split('\n')[0];
    try {
      const parsed = JSON.parse(line);
      return parsed.value;
    } catch {
      return null;
    }
  }

  public close(): void {
    try {
      fs.closeSync(this.fd);
    } catch {
      // Ignorar si ya está cerrado
    }
  }
}
