import { Server as HttpServer } from 'http';
import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { logger } from '../../infrastructure/logging/logger';

export interface WebSocketEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
}

export class AppWebSocketServer {
  private wss: WSServer | null = null;
  private clients: Set<WebSocket> = new Set();

  public init(server: HttpServer): void {
    this.wss = new WSServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.clients.add(ws);
      const clientIp = req.socket.remoteAddress;
      logger.info(`[WebSocket] Cliente conectado desde ${clientIp}. Total clientes: ${this.clients.size}`);

      // Enviar evento de bienvenida
      ws.send(
        JSON.stringify({
          type: 'SYSTEM_CONNECTED',
          payload: { message: 'Conectado al canal en tiempo real de BL FRAGANCIAS' },
          timestamp: new Date().toISOString(),
        }),
      );

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info(`[WebSocket] Cliente desconectado. Total clientes activos: ${this.clients.size}`);
      });

      ws.on('error', (error) => {
        logger.error(`[WebSocket Error] ${error.message}`);
      });
    });

    logger.info('[WebSocket] Servidor de notificaciones en vivo inicializado en ruta /ws');
  }

  public broadcast<T>(type: string, payload: T): void {
    if (!this.wss) {
      return;
    }

    const message: WebSocketEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    const serialized = JSON.stringify(message);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(serialized);
      }
    }

    logger.debug(`[WebSocket Broadcast] Evento transmitido '${type}' a ${this.clients.size} clientes.`);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsServer = new AppWebSocketServer();
