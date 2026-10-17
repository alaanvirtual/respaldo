import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQConnection } from './rabbitmq_connection';
import { TaskCreatedEvent } from './event_publisher';

export interface NotificationConsumerOptions {
  channel?: Channel;
  onProcessed?: (event: TaskCreatedEvent) => void;
  sendEmailSimulatedTimeoutMs?: number;
}

export async function startNotificationConsumer(options?: NotificationConsumerOptions): Promise<void> {
  const rabbit = RabbitMQConnection.getInstance();
  const channel = options?.channel || await rabbit.connect();

  const queueName = 'notification_service_queue';
  await channel.assertQueue(queueName, { durable: true });

  // Enlace por patrón de clave de enrutamiento (Binding)
  await channel.bindQueue(queueName, rabbit.EXCHANGE_NAME, 'task.event.*');

  // Garantizamos procesamiento uno a uno (Prefetch = 1)
  await channel.prefetch(1);

  console.log(`[NotificationWorker] Escuchando eventos en la cola '${queueName}'...`);

  await channel.consume(
    queueName,
    async (msg: ConsumeMessage | null) => {
      if (!msg) return;
      try {
        const event: TaskCreatedEvent = JSON.parse(msg.content.toString());
        console.log(`[NotificationWorker] Enviando correo a ${event.assignedToEmail} por tarea '${event.title}'`);

        // Simulación de envío de correo
        const timeout = options?.sendEmailSimulatedTimeoutMs ?? 500;
        if (timeout > 0) {
          await new Promise((res) => setTimeout(res, timeout));
        }

        if (options?.onProcessed) {
          options.onProcessed(event);
        }

        // Confirmación de recepción exitosa
        channel.ack(msg);
      } catch (err) {
        console.error('[NotificationWorker] Error al procesar mensaje:', err);
        // Rechazamos y reencolamos para reintento (nack con requeue: true)
        channel.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}
