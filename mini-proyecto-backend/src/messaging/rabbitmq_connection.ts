import amqp, { Channel, ChannelModel } from 'amqplib';

export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  public readonly EXCHANGE_NAME = 'pms_events_exchange';

  private constructor() {}

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  public async connect(url: string = 'amqp://localhost:5672'): Promise<Channel> {
    if (this.channel) return this.channel;
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      // Declaramos un intercambiador de tipo 'topic' duradero
      await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', { durable: true });
      console.log('[RabbitMQ] Conexión establecida e intercambiador declarado.');
      return this.channel;
    } catch (error) {
      console.error('[RabbitMQ] Error al conectar con el broker:', error);
      throw error;
    }
  }

  /**
   * Permite inyectar o sustituir un canal (útil para pruebas unitarias y entornos sin broker activo)
   */
  public setMockChannel(mockChannel: Channel | null): void {
    this.channel = mockChannel;
  }

  public async close(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.close();
      } catch {
        // Ignorar si el canal ya estaba cerrado
      }
      this.channel = null;
    }
    if (this.connection) {
      try {
        await this.connection.close();
      } catch {
        // Ignorar si la conexión ya estaba cerrada
      }
      this.connection = null;
    }
  }
}
