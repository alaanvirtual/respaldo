import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQConnection } from './rabbitmq_connection';

export interface AuditConsumerOptions {
  channel?: Channel;
  onAuditLogged?: (routingKey: string, body: string) => void;
}

export async function startAuditConsumer(options?: AuditConsumerOptions): Promise<void> {
  const rabbit = RabbitMQConnection.getInstance();
  const channel = options?.channel || await rabbit.connect();

  const queueName = 'audit_service_queue';
  await channel.assertQueue(queueName, { durable: true });

  // Escucha absolutamente todos los eventos del sistema (# wildcard)
  await channel.bindQueue(queueName, rabbit.EXCHANGE_NAME, '#');

  console.log(`[AuditWorker] Escuchando todos los eventos en la cola '${queueName}'...`);

  await channel.consume(
    queueName,
    (msg: ConsumeMessage | null) => {
      if (!msg) return;
      const routingKey = msg.fields.routingKey;
      const body = msg.content.toString();
      console.log(`[AuditWorker] [LOG - ${routingKey}]: ${body}`);

      if (options?.onAuditLogged) {
        options.onAuditLogged(routingKey, body);
      }

      channel.ack(msg);
    },
    { noAck: false }
  );
}
