import { RabbitMQConnection } from './rabbitmq_connection';

export interface TaskCreatedEvent {
  eventId: string;
  taskId: string;
  title: string;
  projectId: string;
  assignedToEmail: string;
  createdAt: string;
}

export class EventPublisher {
  public static async publishTaskCreated(event: TaskCreatedEvent): Promise<boolean> {
    const rabbit = RabbitMQConnection.getInstance();
    const channel = await rabbit.connect();

    const routingKey = 'task.event.created';
    const payload = Buffer.from(JSON.stringify(event));

    // Publicación persistente (persistent: true)
    const published = channel.publish(
      rabbit.EXCHANGE_NAME,
      routingKey,
      payload,
      { persistent: true, contentType: 'application/json' }
    );

    console.log(`[Publisher] Evento publicado (${routingKey}): ${event.taskId}`);
    return published;
  }
}
